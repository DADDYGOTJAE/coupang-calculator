(async function setupLiveModeLinks(){
  const params = new URLSearchParams(window.location.search);
  const queryOpens = params.get('live') === '1' || params.get('open') === '1';

  if (queryOpens) {
    applyOpenMode();
    return;
  }

  const remote = await loadRemoteConfig('');
  const isRemoteOpen = remote && remote.liveKit && remote.liveKit.open === true;
  if (!isRemoteOpen) return;

  applyOpenMode();

  function applyOpenMode(){
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
  }

  function loadRemoteConfig(basePath){
    return loadRemoteHelper(basePath)
      .then(helper => helper ? helper.load(basePath) : null)
      .catch(() => null);
  }

  function loadRemoteHelper(basePath){
    if (window.GotjaeRemoteConfig) return Promise.resolve(window.GotjaeRemoteConfig);
    return new Promise(resolve => {
      const script = document.createElement('script');
      script.src = new URL('assets/remote-config.js?t=' + Date.now(), new URL(basePath || './', window.location.href)).toString();
      script.onload = () => resolve(window.GotjaeRemoteConfig || null);
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }
})();
