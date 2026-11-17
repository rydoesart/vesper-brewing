(() => {
  const header = document.querySelector('.masthead');
  const toggle = header.querySelector('.nav-toggle');
  const nav = header.querySelector('.site-nav');
  const mobile = window.matchMedia('(max-width: 650px)');

  function setOpen(open) {
    header.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? '−' : '+';
  }

  setOpen(false);
  header.classList.add('is-enhanced');
  toggle.hidden = false;
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => setOpen(false));
})();
