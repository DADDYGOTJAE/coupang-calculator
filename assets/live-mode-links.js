(function setupLiveModeLinks(){
  const params = new URLSearchParams(window.location.search);
  const isOpenMode = params.get('live') === '1' || params.get('open') === '1';
  if (!isOpenMode) return;

  document.querySelectorAll('[data-live-link]').forEach(link => {
    const currentHref = link.getAttribute('href') || '';
    const url = new URL(currentHref, window.location.href);
    url.searchParams.set('live', '1');
    link.setAttribute('href', url.href);
    link.classList.remove('locked');
    link.classList.add('feature');

    const ribbon = link.querySelector('.ribbon');
    const icon = link.querySelector('.icon');
    const meta = link.querySelector('.meta');

    if (ribbon) {
      ribbon.textContent = '참여자 공개';
      ribbon.classList.remove('lock');
      ribbon.classList.add('open');
    }
    if (icon) icon.textContent = '🔓';
    if (meta) meta.textContent = '자료 열기';
  });
})();
