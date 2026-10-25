// Hamburger toggle for the header links and search on narrow screens, see .strictNavToggle in custom.css
(function () {
  function init() {
    var header = document.querySelector('.fixedHeaderContainer header');
    var container = document.querySelector('.fixedHeaderContainer');
    if (!header || document.querySelector('.strictNavToggle')) return;
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'strictNavToggle';
    toggle.setAttribute('aria-label', 'Menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    header.appendChild(toggle);
    function setOpen(open) {
      container.classList.toggle('strictNavOpen', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    toggle.addEventListener('click', function () {
      setOpen(!container.classList.contains('strictNavOpen'));
    });
    container.addEventListener('click', function (e) {
      if (e.target.closest('.nav-site a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!container.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
