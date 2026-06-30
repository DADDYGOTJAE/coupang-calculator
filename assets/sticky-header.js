(function watchStickyHeader(){
  const root = document.documentElement;
  let compact = false;
  let ticking = false;

  function update(){
    const y = window.scrollY || 0;
    if (!compact && y > 120) compact = true;
    if (compact && y < 32) compact = false;
    root.classList.toggle('is-scrolled', compact);
    ticking = false;
  }

  function requestUpdate(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
})();
