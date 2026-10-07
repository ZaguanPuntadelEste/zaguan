(()=>{
const css='.shot .slides{position:absolute;inset:0}.shot .slides img{position:absolute;inset:0;opacity:0;transition:opacity .7s ease,transform .6s ease}.shot .slides img.on{opacity:1}.shot .c-btn{position:absolute;z-index:3;top:50%;bottom:auto;transform:translateY(-50%);width:44px;height:44px;padding:0;border:1px solid rgba(255,255,255,.35);border-radius:50%;background:rgba(8,21,33,.45);color:#fff;font-size:24px;line-height:1;cursor:pointer;opacity:0;transition:opacity .2s ease,background .2s ease}.shot .c-btn:hover{background:rgba(8,21,33,.75)}.shot:hover .c-btn,.shot:focus-within .c-btn{opacity:1}@media(hover:none){.shot .c-btn{opacity:1}}.shot .c-prev{left:10px;right:auto}.shot .c-next{right:10px;left:auto}.shot .c-dots{position:absolute;z-index:3;left:0;right:0;bottom:12px;display:flex;justify-content:center;gap:0}.shot .c-dots button{position:relative;inset:auto;width:20px;height:20px;padding:0;border:0;background:none;cursor:pointer}.shot .c-dots button::after{content:"";display:block;width:8px;height:8px;margin:auto;border-radius:50%;background:rgba(255,255,255,.5)}.shot .c-dots button[aria-current=true]::after{background:#fff}.shot.is-empty .slides,.shot.is-empty .c-btn,.shot.is-empty .c-dots{display:none}';
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,MAX=6;
const probe=u=>new Promise(r=>{const i=new Image();i.onload=()=>r(u);i.onerror=()=>r(null);i.src=u});
const parse=s=>{const m=(s||'').match(/^(.*\/)([^\/]+)-(\d+)\.jpg/);return m?{dir:m[1],base:m[2]}:null};
const cards=[...document.querySelectorAll('.card .shot')];
cards.forEach(f=>{const im=f.querySelector('img');const p=im&&parse(im.getAttribute('src'));if(!p)return;probe(p.dir+p.base+'-e1-1.jpg').then(u=>{if(u){im.src=u;f.classList.remove('is-empty')}})});
const sh=[...document.querySelectorAll('[data-gallery] .shot')];if(!sh.length)return;
const d=document.createElement('dialog');d.className='lb';d.setAttribute('aria-label','Imagen ampliada');
d.innerHTML='<div class="lb-in"><img alt=""></div><button type="button" class="lb-x" aria-label="Cerrar">×</button><button type="button" class="lb-p" aria-label="Anterior">‹</button><button type="button" class="lb-n" aria-label="Siguiente">›</button>';
document.body.appendChild(d);
const im=d.querySelector('img');let list=[],i=0,lalt='';
const show=n=>{i=(n+list.length)%list.length;im.src=list[i];im.alt=lalt+' · foto '+(i+1)};
d.querySelector('.lb-x').onclick=()=>d.close();
d.querySelector('.lb-p').onclick=()=>show(i-1);
d.querySelector('.lb-n').onclick=()=>show(i+1);
d.addEventListener('click',e=>{if(e.target===d||e.target.classList.contains('lb-in'))d.close()});
d.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)});
const build=(f,urls,alt)=>{
const z=f.querySelector('button');if(!z)return;f.classList.remove('is-empty');z.innerHTML='';
const box=document.createElement('div');box.className='slides';
urls.forEach((u,k)=>{const g=document.createElement('img');g.src=u;g.alt=alt+' · foto '+(k+1);g.width=900;g.height=1200;if(k)g.loading='lazy';box.appendChild(g)});
z.appendChild(box);
const imgs=[...box.children];let n=0,t=null,moved=false;
let dots=[];
const go=k=>{n=(k+imgs.length)%imgs.length;imgs.forEach((x,j)=>x.classList.toggle('on',j===n));dots.forEach((x,j)=>x.setAttribute('aria-current',String(j===n)))};
if(imgs.length>1){
const mk=(c,l,tx)=>{const b=document.createElement('button');b.type='button';b.className='c-btn '+c;b.setAttribute('aria-label',l);b.textContent=tx;f.appendChild(b);return b};
mk('c-prev','Foto anterior','‹').onclick=()=>{go(n-1);rs()};
mk('c-next','Foto siguiente','›').onclick=()=>{go(n+1);rs()};
const dw=document.createElement('div');dw.className='c-dots';
imgs.forEach((_,j)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Ir a la foto '+(j+1));b.onclick=()=>{go(j);rs()};dw.appendChild(b);dots.push(b)});
f.appendChild(dw);
}
go(0);
const st0=()=>{if(t||reduce||imgs.length<2)return;t=setInterval(()=>go(n+1),5000)};
const sp=()=>{clearInterval(t);t=null};
const rs=()=>{sp()};
if(imgs.length>1&&!reduce){
setTimeout(st0,sh.indexOf(f)*1200);
f.addEventListener('mouseenter',sp);f.addEventListener('mouseleave',st0);f.addEventListener('focusin',sp);f.addEventListener('focusout',st0);
}
let x0=null;
f.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;moved=false;sp()},{passive:true});
f.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40){moved=true;go(dx<0?n+1:n-1)}st0()});
z.addEventListener('click',()=>{if(moved){moved=false;return}list=urls;lalt=alt;show(n);d.showModal()});
};
sh.forEach((f,s)=>{
const o=f.querySelector('img');const src=o&&o.getAttribute('src');const p=parse(src);const alt=(o&&o.alt||'Imagen').replace(/,?\s*imagen\s*\d+$/i,'');
if(!p){return}
const cands=[];for(let k=1;k<=MAX;k++)cands.push(p.dir+p.base+'-e'+(s+1)+'-'+k+'.jpg');
Promise.all(cands.map(probe)).then(r=>{let urls=r.filter(Boolean);
if(urls.length){build(f,urls,alt);return}
probe(src).then(u=>{if(u)build(f,[u],alt);else f.classList.add('is-empty')})});
});
})();
