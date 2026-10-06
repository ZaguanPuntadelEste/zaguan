(function(){
  var items=[
    {
      name:'Betania IV',
      url:'/betania-iv/',
      zone:'Leandro Gómez casi Tauro · Maldonado',
      desc:'Apartamentos de 1, 2 y 3 dormitorios con terraza privada. 102 unidades.',
      price:'Desde USD 79.800',
      tags:['Venta','En pozo','Entrega oct. 2028'],
      image:null,
      alt:''
    }
  ];
  var anchor=document.querySelector('.principles-section');
  if(!anchor||!items.length)return;
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var cards=items.map(function(i){
    var media=i.image
      ?'<div class="emp-media"><img src="'+esc(i.image)+'" alt="'+esc(i.alt)+'" loading="lazy" decoding="async"><div class="emp-tags">'+i.tags.map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'</div></div>'
      :'<div class="emp-media emp-media--empty"><div class="emp-tags">'+i.tags.map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'</div>'+esc(i.name)+'</div>';
    return '<a class="emp-card" href="'+esc(i.url)+'">'+media+'<div class="emp-body"><h3>'+esc(i.name)+'</h3><p>'+esc(i.zone)+'</p><p>'+esc(i.desc)+'</p><p class="emp-price">'+esc(i.price)+'</p></div></a>';
  }).join('');
  var sec=document.createElement('section');
  sec.className='emp';
  sec.id='emprendimientos';
  sec.setAttribute('aria-labelledby','titulo-emprendimientos');
  sec.innerHTML='<div class="container"><div class="emp-head"><div><p class="eyebrow">Emprendimientos</p><h2 id="titulo-emprendimientos">Proyectos en venta.</h2></div>'+(items.length>1?'<div class="emp-nav"><button type="button" data-dir="-1" aria-label="Anterior">←</button><button type="button" data-dir="1" aria-label="Siguiente">→</button></div>':'')+'</div><div class="emp-rule"></div><div class="emp-track" tabindex="0" aria-label="Emprendimientos">'+cards+'</div><p class="emp-note">Las imágenes de los proyectos en pozo son renders ilustrativos.</p></div>';
  anchor.parentNode.insertBefore(sec,anchor);
  var track=sec.querySelector('.emp-track');
  var btns=sec.querySelectorAll('.emp-nav button');
  if(!btns.length)return;
  function upd(){btns[0].disabled=track.scrollLeft<=4;btns[1].disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-4}
  btns.forEach(function(b){b.addEventListener('click',function(){track.scrollBy({left:Number(b.dataset.dir)*(track.clientWidth*0.8),behavior:'smooth'})})});
  track.addEventListener('scroll',upd,{passive:true});
  window.addEventListener('resize',upd);
  upd();
})();
