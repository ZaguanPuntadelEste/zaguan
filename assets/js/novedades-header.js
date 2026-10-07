(() => {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  if (header && toggle) {
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
    const close = () => { header.classList.remove('menu-open'); document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menú'); };
    update(); window.addEventListener('scroll',update,{passive:true});
    toggle.addEventListener('click',() => { const open=header.classList.toggle('menu-open'); document.body.classList.toggle('menu-open',open); toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú'); });
    document.querySelectorAll('#mobile-menu a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    window.addEventListener('resize',()=>{if(window.innerWidth>900)close();});
  }
  const path=location.pathname;
  const origin=path.includes('avances-obra')?'la nota de avances de obra de Betania IV':path.includes('apartamentos-en-pozo')?'la nota del proyecto Betania IV y su financiación hasta en 24 cuotas':'la portada de Novedades del Este';
  document.querySelectorAll('a').forEach(a=>{
    const href=a.getAttribute('href')||'';
    if(href==='/#contacto'||href==='#contacto'||href==='/whatsapp/'||a.dataset.cta==='betania-contacto'){
      const msg='Hola, leí '+origin+' en ZAGUÁN. Quiero conocer las unidades y condiciones de compra de Betania IV.';
      a.href='https://wa.me/59898712064?text='+encodeURIComponent(msg);
      a.textContent='Contactanos por WhatsApp'; a.target='_blank'; a.rel='noopener noreferrer';
      if(a.dataset.cta)a.dataset.cta='betania-whatsapp';
    }
  });
  document.querySelectorAll('.breadcrumbs a[href="#novedades"]').forEach(a=>{a.href='/novedades-del-este/';});
  document.querySelectorAll('.main-nav,.mobile-menu-inner').forEach(nav=>{
    if(nav.querySelector('a[href="/novedades-del-este/"]'))return;
    const link=document.createElement('a');link.href='/novedades-del-este/';link.textContent='Novedades del Este';
    const first=nav.querySelector('a');if(first)first.insertAdjacentElement('afterend',link);else nav.prepend(link);
  });
  document.querySelectorAll('.footer-links').forEach(nav=>{
    if(!nav.querySelector('a[href="/novedades-del-este/"]')){const a=document.createElement('a');a.href='/novedades-del-este/';a.textContent='Novedades del Este';nav.prepend(a);}
  });
  const style=document.createElement('style');
  style.textContent='.article-body figure{overflow:hidden;border-radius:18px;transition:box-shadow 250ms ease}.article-body figure img{transition:transform 350ms ease}.article-body figure:hover{box-shadow:0 12px 30px rgba(8,21,33,.12)}.article-body figure:hover img{transform:scale(1.02)}.site-header .main-nav{gap:16px}.site-header .main-nav a{font-size:9px}@media(prefers-reduced-motion:reduce){.article-body figure:hover img{transform:none}}';
  document.head.appendChild(style);
  document.querySelectorAll('[data-novedades-gallery]').forEach(g=>{
    let urls;try{urls=JSON.parse(g.dataset.images);}catch{return;}
    const img=g.querySelector('img');const link=g.querySelector('.news-cover');if(!img||!urls.length)return;
    let n=0,x=null,moved=false;
    const go=step=>{n=(n+step+urls.length)%urls.length;img.src=urls[n];};
    g.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.direction))));
    if(link){
      link.addEventListener('touchstart',e=>{x=e.touches[0].clientX;moved=false;},{passive:true});
      link.addEventListener('touchend',e=>{if(x===null)return;const dx=e.changedTouches[0].clientX-x;x=null;if(Math.abs(dx)>40){moved=true;go(dx<0?1:-1);}},{passive:true});
      link.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false;}});
    }
    g.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(1);}if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}});
  });
  document.querySelectorAll('a[href^="https://wa.me/59898712064"]').forEach(a=>a.addEventListener('click',()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:'whatsapp_context_click',page_path:location.pathname,source_context:origin,destination:'whatsapp'});}));
})();
