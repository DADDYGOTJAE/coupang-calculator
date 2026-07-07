(async function setupLiveKitGate(){
  const list = document.querySelector('[data-live-kit-list]');
  if (!list) return;

  const params = new URLSearchParams(window.location.search);
  const queryOpens = params.get('live') === '1' || params.get('open') === '1';
  const base = rootBaseFromScript();
  const remote = await loadRemoteConfig(base);
  const isRemoteOpen = remote && remote.liveKit && remote.liveKit.open === true;
  const isOpen = queryOpens || isRemoteOpen;
  const notice = document.getElementById('liveKitNotice');
  const heroText = document.getElementById('liveKitHeroText');
  const backLink = document.querySelector('.back-link');
  const chatLink = document.querySelector('[data-live-chat]');
  const chatUrl = (remote && remote.liveKit && remote.liveKit.chatUrl) || 'https://open.kakao.com/o/pAnuH13h';

  if (isOpen) {
    if (backLink) backLink.setAttribute('href', '../?live=1');
    if (chatLink) {
      chatLink.setAttribute('href', chatUrl);
      chatLink.setAttribute('target', '_blank');
      chatLink.setAttribute('rel', 'noopener');
      chatLink.setAttribute('aria-disabled', 'false');
      chatLink.classList.remove('disabled');
      chatLink.textContent = '대디갓재 소통방 입장하기';
    }
    if (heroText) {
      heroText.textContent = '소싱부터 차별화, 기획, 제작, 등록, 광고까지 각 단계별로 보고 따라할 수 있는 자료입니다. 라이브 흐름에 맞춰 순서대로 열어보시면 됩니다.';
    }
    if (notice) {
      notice.innerHTML = '<b>라이브 참여자 공개:</b> 지금은 자료를 열람할 수 있습니다. 체크하면서 막히는 부분은 Q&A 때 바로 질문해주세요.';
    }
    list.querySelectorAll('a.kit-item').forEach(card => {
      const href = card.dataset.lockedHref || card.getAttribute('href') || '';
      const url = new URL(href, window.location.href);
      url.searchParams.set('live', '1');
      card.setAttribute('href', url.href);
      card.setAttribute('aria-disabled', 'false');
      card.classList.remove('locked');
      const lock = card.querySelector('.kit-lock');
      const meta = card.querySelector('.meta');
      if (lock) lock.textContent = '지금 공개';
      if (meta) meta.textContent = card.dataset.openMeta || '열어보기';
    });
    return;
  }

  if (chatLink) {
    chatLink.removeAttribute('href');
    chatLink.removeAttribute('target');
    chatLink.removeAttribute('rel');
    chatLink.setAttribute('aria-disabled', 'true');
    chatLink.classList.add('disabled');
    chatLink.textContent = '라이브 참여자 전용 공개';
  }

  list.querySelectorAll('a.kit-item').forEach(card => {
    card.dataset.lockedHref = card.dataset.lockedHref || card.getAttribute('href') || '';
    card.removeAttribute('href');
    card.setAttribute('aria-disabled', 'true');
    card.classList.add('locked');
    const lock = card.querySelector('.kit-lock');
    const meta = card.querySelector('.meta');
    if (lock) lock.textContent = '라이브 중 공개';
    if (meta) meta.textContent = '라이브 중 공개';
  });

  function rootBaseFromScript(){
    const script = document.currentScript;
    if (!script || !script.src) return '../';
    try {
      return new URL('../', script.src).toString();
    } catch(e) {
      return '../';
    }
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
