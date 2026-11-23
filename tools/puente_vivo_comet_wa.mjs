#!/usr/bin/env node
/**
 * Puente Continuo Comet (Puerto 9222) <-> Cloudflare D1 & Telegram (@zaguan_crm_bot)
 * 1 sola sesión WebSocket persistente sobre la pestaña activa de WhatsApp Business en Comet.
 * Detecta mensajes de texto y notas de voz (ptt) nuevas cada 20s, desencripta ptt con HKDF-SHA256 + AES-256-CBC,
 * transcribe via /api/transcribe-audio (Workers AI Whisper) y sincroniza en /api/comet/sync-event.
 */
import fs from "fs";
import crypto from "crypto";

const DEVTOOLS_PORT_FILE = "/Users/arianawajntraub/Library/Application Support/Comet/DevToolsActivePort";
const CRM_API_URL = "https://zaguan-crm-bot.943ari.workers.dev";
const POLL_MS = 20000;
const SEEN_FILE = "/tmp/zaguan_comet_puente_seen.json";

let seenIds = new Set();
try {
  if (fs.existsSync(SEEN_FILE)) {
    const arr = JSON.parse(fs.readFileSync(SEEN_FILE, "utf8"));
    if (Array.isArray(arr)) seenIds = new Set(arr.slice(-1500));
  }
} catch {}

function persistSeen() {
  try {
    fs.writeFileSync(SEEN_FILE, JSON.stringify([...seenIds].slice(-1500)), "utf8");
  } catch {}
}

async function decryptPttBuffer(directPath, mediaKeyB64) {
  const url = directPath.startsWith("http") ? directPath : `https://mmg.whatsapp.net${directPath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ptt`);
  const enc = Buffer.from(await res.arrayBuffer());
  const key = Buffer.from(crypto.hkdfSync("sha256", Buffer.from(mediaKeyB64, "base64"), Buffer.alloc(32), Buffer.from("WhatsApp Audio Keys"), 112));
  const iv = key.subarray(0, 16);
  const cipherKey = key.subarray(16, 48);
  const ciphertext = enc.subarray(0, enc.length - 10);
  const decipher = crypto.createDecipheriv("aes-256-cbc", cipherKey, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

async function transcribeViaWorker(oggBuf) {
  const res = await fetch(`${CRM_API_URL}/api/transcribe-audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio_base64: oggBuf.toString("base64"), mime: "audio/ogg" }),
  });
  const js = await res.json();
  return js?.ok ? (js.text || "").trim() : "";
}

async function syncEventToWorker(ev) {
  const res = await fetch(`${CRM_API_URL}/api/comet/sync-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ev),
  });
  return res.json().catch(() => ({ ok: false }));
}

function resolveCometWsUrl() {
  const raw = fs.readFileSync(DEVTOOLS_PORT_FILE, "utf8").trim().split("\n");
  return `ws://127.0.0.1:${raw[0]}${raw[1]}`;
}

async function startBridge() {
  let wsUrl;
  try {
    wsUrl = resolveCometWsUrl();
  } catch (e) {
    console.error("[puente-comet] Comet DevToolsActivePort no disponible, reintentando en 20s...");
    setTimeout(startBridge, POLL_MS);
    return;
  }

  const ws = new WebSocket(wsUrl);
  let reqId = 1;
  let sessionId = null;
  let pollingTimer = null;
  let seedDone = false;
  const pending = new Map();

  function rpc(method, params = {}, sid = null) {
    return new Promise((resolve, reject) => {
      const id = reqId++;
      const payload = sid ? { id, sessionId: sid, method, params } : { id, method, params };
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`Timeout ${method}`));
        }
      }, 15000);
    });
  }

  async function pollOnce() {
    if (!sessionId || ws.readyState !== 1) return;
    try {
      const evalRes = await rpc(
        "Runtime.evaluate",
        {
          expression: `(() => {
            const ChatCol = window.require("WAWebChatCollection").ChatCollection;
            const since = Math.floor(Date.now() / 1000) - 3600;
            const items = [];
            for (const c of ChatCol.getModelsArray()) {
              if (!c.t || c.t < since) continue;
              const rawPhone = (c.contact?.phoneNumber?._serialized || c.contact?.id?._serialized || c.name || c.formattedTitle || "").replace(/\\D/g, "");
              const msgs = (c.msgs?.getModelsArray ? c.msgs.getModelsArray() : []).slice(-10);
              for (const m of msgs) {
                if (!m.t || m.t < since) continue;
                if (!["chat", "ptt", "audio"].includes(m.type)) continue;
                items.push({
                  msgKey: m.id?._serialized || (c.id?._serialized + "_" + m.t + "_" + m.type),
                  phone: rawPhone,
                  senderName: c.contact?.pushname || c.contact?.name || c.name || c.formattedTitle || ("+" + rawPhone),
                  verifiedName: c.contact?.verifiedName || "",
                  fromMe: !!m.id?.fromMe,
                  type: m.type,
                  body: m.body || "",
                  directPath: m.directPath || "",
                  mediaKey: m.mediaKey || "",
                  timestampISO: new Date(m.t * 1000).toISOString()
                });
              }
            }
            return JSON.stringify(items);
          })()`,
          returnByValue: true,
        },
        sessionId
      );

      const val = evalRes?.result?.value;
      const items = val ? JSON.parse(val) : [];
      if (!seedDone) {
        for (const it of items) seenIds.add(it.msgKey);
        persistSeen();
        seedDone = true;
        console.log(`[puente-comet] Sesión activa conectada. Baseline de ${items.length} mensajes recientes indexada.`);
        return;
      }

      for (const it of items) {
        if (seenIds.has(it.msgKey)) continue;
        seenIds.add(it.msgKey);
        persistSeen();

        let text = it.body;
        if ((it.type === "ptt" || it.type === "audio") && it.directPath && it.mediaKey) {
          try {
            const ogg = await decryptPttBuffer(it.directPath, it.mediaKey);
            const txt = await transcribeViaWorker(ogg);
            text = txt || "[Audio de WhatsApp sin transcripción legible]";
          } catch (err) {
            text = `[Audio ptt recibido · error descarga: ${err.message}]`;
          }
        }
        if (!text) continue;

        const out = await syncEventToWorker({
          phone: it.phone,
          senderName: it.senderName,
          verifiedName: it.verifiedName,
          fromMe: it.fromMe,
          type: it.type,
          text,
          msgKey: it.msgKey,
          timestampISO: it.timestampISO,
          notify_telegram: !it.fromMe,
        });
        console.log(`[puente-comet] Synced ${it.fromMe ? "OUT" : "IN"} (${it.type}) ${it.phone}:`, JSON.stringify(out));
      }
    } catch (err) {
      console.error("[puente-comet] Poll error:", err.message);
    }
  }

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    }
  };

  ws.onopen = async () => {
    try {
      const targetsRes = await rpc("Target.getTargets");
      const targets = (targetsRes.targetInfos || []).filter((t) => t.type === "page" && (t.url || "").includes("web.whatsapp.com"));
      const wa = targets.find((t) => t.title.includes("(")) || targets[targets.length - 1];
      if (!wa) throw new Error("No hay pestaña web.whatsapp.com en Comet");
      const att = await rpc("Target.attachToTarget", { targetId: wa.targetId, flatten: true });
      sessionId = att.sessionId;
      await pollOnce();
      pollingTimer = setInterval(pollOnce, POLL_MS);
    } catch (err) {
      console.error("[puente-comet] Attach error:", err.message);
      try { ws.close(); } catch {}
    }
  };

  ws.onclose = () => {
    if (pollingTimer) clearInterval(pollingTimer);
    console.log("[puente-comet] WebSocket cerrado, reconectando en 20s...");
    setTimeout(startBridge, POLL_MS);
  };

  ws.onerror = (err) => {
    console.error("[puente-comet] WS error:", err?.message || err);
  };
}

startBridge();
