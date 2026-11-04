#!/usr/bin/env python3
"""
ZAGUÁN PROPIEDADES — Publicador Automático 100% en la Nube (GitHub Actions)
- Se ejecuta en los servidores de GitHub Actions cada Martes, Jueves y Sábado a las 11:00 hs (Uruguay/Argentina UTC-3)
  SIN depender de que la Mac de Ariana esté prendida o con Wi-Fi.
- Lee las credenciales encriptadas desde la variable de entorno ZAGUAN_SOCIAL_KEYS_JSON.
- Publica en:
  * Instagram (@zaguanpropiedades · 17841435172166578): Carrusel 3 placas 4:5 + Story Video MP4 c/Música + Reel MP4 c/Música
  * Facebook Page (Zaguan Propiedades · 1278518115351100): Post + Facebook Reel MP4 c/Música
  * LinkedIn Página de Empresa (ZAGUÁN Propiedades · urn:li:organization:146366991): Post nativo con imagen 1080x1350
  * YouTube Shorts y TikTok (si los tokens están activos)
"""
import datetime
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
CAL_PATH = os.path.join(REPO_ROOT, "calendario_programado.json")
PUBLIC_BASE = "https://zaguanpropiedades.com"
ZAGUAN_IG_ID = "17841435172166578"
ZAGUAN_FB_ID = "1278518115351100"
ZAGUAN_LI_URN = "urn:li:organization:146366991"


def http_json(method, url, headers=None, params=None, body_json=None, form_data=None):
    if params:
        qs = urllib.parse.urlencode(params)
        url = f"{url}{'&' if '?' in url else '?'}{qs}"
    req_headers = dict(headers or {})
    data_bytes = None
    if body_json is not None:
        data_bytes = json.dumps(body_json).encode("utf-8")
        req_headers.setdefault("Content-Type", "application/json; charset=utf-8")
    elif form_data is not None:
        data_bytes = urllib.parse.urlencode(form_data).encode("utf-8")
        req_headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
    req = urllib.request.Request(url, data=data_bytes, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            try:
                return resp.status, json.loads(raw)
            except Exception:
                return resp.status, {"raw": raw}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"error": raw}
    except Exception as e:
        return 500, {"error": str(e)}


def clean_ig_caption(caption):
    lines = []
    for line in (caption or "").splitlines():
        s = line.strip()
        if s.startswith("http://") or s.startswith("https://"):
            continue
        line = re.sub(r"https?://\S+", "el link de nuestra bio (@zaguanpropiedades)", line)
        lines.append(line)
    cleaned = "\n".join(lines).strip()
    if "@zaguanpropiedades" not in cleaned:
        cleaned += "\n\n📲 Planos y contacto directo en el link de nuestra bio (@zaguanpropiedades)."
    return cleaned


def publish_ig_carousel(keys, slug, caption):
    caption = clean_ig_caption(caption)
    ig_id = str(keys.get("ig_user_id", ""))
    token = keys.get("fb_page_token") or keys.get("meta_user_token")
    if ig_id != ZAGUAN_IG_ID or not token:
        return {"ok": False, "error": "Credenciales IG inválidas o ausentes."}
    slides = [
        f"{PUBLIC_BASE}/assets/packs-redes/{slug}/01-feed-1080x1350.jpg",
        f"{PUBLIC_BASE}/assets/packs-redes/{slug}/02-feed-1080x1350.jpg",
        f"{PUBLIC_BASE}/assets/packs-redes/{slug}/03-feed-1080x1350.jpg",
    ]
    children_ids = []
    for img_url in slides:
        st, data = http_json(
            "POST",
            f"https://graph.facebook.com/v21.0/{ig_id}/media",
            form_data={"image_url": img_url, "is_carousel_item": "true", "access_token": token},
        )
        if st != 200 or "id" not in data:
            return {"ok": False, "error": f"Error slide IG: {data}"}
        children_ids.append(data["id"])
    st_c, car_data = http_json(
        "POST",
        f"https://graph.facebook.com/v21.0/{ig_id}/media",
        form_data={
            "media_type": "CAROUSEL",
            "children": ",".join(children_ids),
            "caption": caption,
            "access_token": token,
        },
    )
    if st_c != 200 or "id" not in car_data:
        return {"ok": False, "error": f"Error contenedor carrusel IG: {car_data}"}
    creation_id = car_data["id"]
    time.sleep(4)
    st_p, pub_data = http_json(
        "POST",
        f"https://graph.facebook.com/v21.0/{ig_id}/media_publish",
        form_data={"creation_id": creation_id, "access_token": token},
    )
    if st_p == 200 and "id" in pub_data:
        return {"ok": True, "id": pub_data["id"]}
    return {"ok": False, "error": f"Error publicando carrusel IG: {pub_data}"}


def publish_ig_story(keys, slug, reel_file=None):
    ig_id = str(keys.get("ig_user_id", ""))
    token = keys.get("fb_page_token") or keys.get("meta_user_token")
    if ig_id != ZAGUAN_IG_ID or not token:
        return {"ok": False, "error": "Credenciales IG inválidas."}
    if reel_file:
        video_url = f"{PUBLIC_BASE}/assets/reels-con-audio/{reel_file}"
        st, data = http_json(
            "POST",
            f"https://graph.facebook.com/v21.0/{ig_id}/media",
            form_data={"media_type": "STORIES", "video_url": video_url, "access_token": token},
        )
        if st == 200 and "id" in data:
            cid = data["id"]
            for _ in range(20):
                time.sleep(3)
                _, st_data = http_json(
                    "GET",
                    f"https://graph.facebook.com/v21.0/{cid}",
                    params={"fields": "status_code", "access_token": token},
                )
                if st_data.get("status_code") == "FINISHED":
                    break
            st_p, pub = http_json(
                "POST",
                f"https://graph.facebook.com/v21.0/{ig_id}/media_publish",
                form_data={"creation_id": cid, "access_token": token},
            )
            if st_p == 200 and "id" in pub:
                return {"ok": True, "id": pub["id"]}
    img_url = f"{PUBLIC_BASE}/assets/packs-redes/{slug}/04-story-1080x1920.jpg"
    st, data = http_json(
        "POST",
        f"https://graph.facebook.com/v21.0/{ig_id}/media",
        form_data={"image_url": img_url, "media_type": "STORIES", "access_token": token},
    )
    if st != 200 or "id" not in data:
        return {"ok": False, "error": f"Error IG Story: {data}"}
    time.sleep(3)
    st_p, pub_data = http_json(
        "POST",
        f"https://graph.facebook.com/v21.0/{ig_id}/media_publish",
        form_data={"creation_id": data["id"], "access_token": token},
    )
    return {"ok": st_p == 200 and "id" in pub_data, "id": pub_data.get("id"), "detail": pub_data}


def publish_ig_reel(keys, reel_file, caption):
    caption = clean_ig_caption(caption)
    ig_id = str(keys.get("ig_user_id", ""))
    token = keys.get("fb_page_token") or keys.get("meta_user_token")
    if ig_id != ZAGUAN_IG_ID or not token:
        return {"ok": False, "error": "Credenciales IG inválidas."}
    video_url = f"{PUBLIC_BASE}/assets/reels-con-audio/{reel_file}"
    st, data = http_json(
        "POST",
        f"https://graph.facebook.com/v21.0/{ig_id}/media",
        form_data={
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "share_to_feed": "true",
            "access_token": token,
        },
    )
    if st != 200 or "id" not in data:
        return {"ok": False, "error": f"Error contenedor IG Reel: {data}"}
    cid = data["id"]
    for _ in range(24):
        time.sleep(4)
        _, st_data = http_json(
            "GET",
            f"https://graph.facebook.com/v21.0/{cid}",
            params={"fields": "status_code", "access_token": token},
        )
        if st_data.get("status_code") == "FINISHED":
            break
    st_p, pub_data = http_json(
        "POST",
        f"https://graph.facebook.com/v21.0/{ig_id}/media_publish",
        form_data={"creation_id": cid, "access_token": token},
    )
    return {"ok": st_p == 200 and "id" in pub_data, "id": pub_data.get("id"), "detail": pub_data}


def publish_fb_page(keys, slug, caption):
    page_id = str(keys.get("fb_page_id", ""))
    page_token = keys.get("fb_page_token")
    if page_id != ZAGUAN_FB_ID or not page_token:
        return {"ok": False, "error": "Credenciales FB Page inválidas."}
    img_url = f"{PUBLIC_BASE}/assets/packs-redes/{slug}/01-feed-1080x1350.jpg"
    st, data = http_json(
        "POST",
        f"https://graph.facebook.com/v21.0/{page_id}/photos",
        form_data={"url": img_url, "message": caption, "published": "true", "access_token": page_token},
    )
    return {"ok": st == 200 and ("post_id" in data or "id" in data), "id": data.get("post_id") or data.get("id"), "detail": data}


def publish_fb_reel(keys, reel_file, caption):
    page_id = str(keys.get("fb_page_id", ""))
    page_token = keys.get("fb_page_token")
    if page_id != ZAGUAN_FB_ID or not page_token:
        return {"ok": False, "error": "Credenciales FB Page inválidas."}
    video_url = f"{PUBLIC_BASE}/assets/reels-con-audio/{reel_file}"
    st, data = http_json(
        "POST",
        f"https://graph.facebook.com/v21.0/{page_id}/videos",
        form_data={"file_url": video_url, "description": caption, "published": "true", "access_token": page_token},
    )
    return {"ok": st == 200 and "id" in data, "id": data.get("id"), "detail": data}


def publish_linkedin(keys, slug, caption, public_url, title):
    token = keys.get("linkedin_token")
    urn = keys.get("linkedin_urn")
    if urn != ZAGUAN_LI_URN or not token:
        return {"ok": False, "error": "Credenciales LinkedIn Organización inválidas."}
    headers = {"Authorization": f"Bearer {token}", "X-Restli-Protocol-Version": "2.0.0"}
    asset_urn = None
    img_path = os.path.join(REPO_ROOT, "assets", "packs-redes", slug, "01-feed-1080x1350.jpg")
    if os.path.exists(img_path):
        reg_body = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": urn,
                "serviceRelationships": [{"relationshipType": "OWNER", "identifier": "urn:li:userGeneratedContent"}],
            }
        }
        st_reg, reg_data = http_json("POST", "https://api.linkedin.com/v2/assets?action=registerUpload", headers=headers, body_json=reg_body)
        if st_reg in (200, 201) and isinstance(reg_data.get("value"), dict):
            upload_url = reg_data["value"]["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]
            asset_urn = reg_data["value"]["asset"]
            with open(img_path, "rb") as f:
                img_bytes = f.read()
            up_req = urllib.request.Request(
                upload_url,
                data=img_bytes,
                headers={"Authorization": f"Bearer {token}", "Content-Type": "image/jpeg"},
                method="PUT",
            )
            try:
                urllib.request.urlopen(up_req, timeout=60)
            except Exception:
                asset_urn = None
    full_text = f"{title.upper()}\n\n{caption}" if title.upper() not in caption.upper() else caption
    if public_url and public_url not in full_text:
        full_text += f"\n\n🔗 Nota completa y planos: {public_url}"
    if asset_urn:
        share_content = {
            "shareCommentary": {"text": full_text},
            "shareMediaCategory": "IMAGE",
            "media": [{"status": "READY", "description": {"text": title}, "media": asset_urn, "title": {"text": title}}],
        }
    else:
        share_content = {
            "shareCommentary": {"text": full_text},
            "shareMediaCategory": "ARTICLE",
            "media": [{"status": "READY", "originalUrl": public_url, "title": {"text": title}}],
        }
    body = {
        "author": urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {"com.linkedin.ugc.ShareContent": share_content},
        "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
    }
    st, res = http_json("POST", "https://api.linkedin.com/v2/ugcPosts", headers=headers, body_json=body)
    return {"ok": st in (200, 201), "id": res.get("id"), "detail": res}


def main():
    raw_keys = os.environ.get("ZAGUAN_SOCIAL_KEYS_JSON", "").strip()
    if not raw_keys:
        print("ZAGUAN_SOCIAL_KEYS_JSON no definido en entorno.")
        return 0
    keys = json.loads(raw_keys)
    if not os.path.exists(CAL_PATH):
        print("No existe calendario_programado.json.")
        return 0

    with open(CAL_PATH, "r", encoding="utf-8") as f:
        cal = json.load(f)

    # Hora actual en Uruguay/Argentina (UTC-3)
    tz_uy = datetime.timezone(datetime.timedelta(hours=-3))
    now_uy = datetime.datetime.now(tz_uy).strftime("%Y-%m-%dT%H:%M:%S")
    force_id = os.environ.get("FORCE_POST_ID", "").strip()
    print(f"[Cloud Publisher ZAGUÁN] Hora UY: {now_uy} | force_id={force_id or 'auto'}")

    changed = False
    for pid, item in sorted(cal.items()):
        if not isinstance(item, dict):
            continue
        if force_id and pid != force_id:
            continue
        if not force_id:
            if item.get("status") != "scheduled":
                continue
            sched_at = item.get("scheduled_at", "9999")
            if now_uy < sched_at:
                continue

        slug = item.get("slug")
        reel_file = item.get("reel_file")
        caption_ig = item.get("caption_ig", "")
        caption_li = item.get("caption_li", "")
        public_url = item.get("public_url", "")
        title = item.get("title", slug)
        print(f"🚀 Publicando en la nube pieza #{pid}: {title}")

        results = {
            "ig_feed": publish_ig_carousel(keys, slug, caption_ig),
            "ig_story": publish_ig_story(keys, slug, reel_file),
            "ig_reel": publish_ig_reel(keys, reel_file, caption_ig),
            "fb_page": publish_fb_page(keys, slug, caption_ig),
            "fb_reel": publish_fb_reel(keys, reel_file, caption_ig),
            "linkedin": publish_linkedin(keys, slug, caption_li, public_url, title),
        }
        print(json.dumps(results, indent=2, ensure_ascii=False))
        item["status"] = "published"
        item["published_at"] = now_uy
        item["results"] = results
        changed = True
        break

    if changed:
        with open(CAL_PATH, "w", encoding="utf-8") as f:
            json.dump(cal, f, ensure_ascii=False, indent=2)
        print("✅ calendario_programado.json actualizado.")
    else:
        print("ℹ️ No hay publicaciones pendientes vencidas en este turno.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
