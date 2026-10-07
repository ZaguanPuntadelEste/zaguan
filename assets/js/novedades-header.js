(() => {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('menu-toggle');
  if (!header || !toggle) return;
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  const closeMenu = () => {
    header.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive: true});
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  document.querySelectorAll('#mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
})();
