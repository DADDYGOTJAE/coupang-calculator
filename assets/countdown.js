(async function loadLiveCountdown(){
  const root = document.getElementById('liveCountdown');
  if (!root) return;

  const base = root.dataset.base || '';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const DEFAULT_CONFIG = {
    live: {
      enabled: true,
      title: '무료 라이브까지',
      startsAt: '2026-07-28T19:30:00+09:00',
      afterText: '무료 라이브 일정 조율중입니다.',
      waitingRoomLabel: '무료 라이브 대기방 입장',
      waitingRoomUrl: 'https://m.site.naver.com/281tU'
    }
  };
  let countdownTimer = null;

  startCountdown(DEFAULT_CONFIG);

  try {
    const res = await fetch(base + 'site-config.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) return;
    let config = await res.json();
    startCountdown(config);

    const remote = await loadRemoteConfig(base);
    if (remote && window.GotjaeRemoteConfig) {
      config = window.GotjaeRemoteConfig.mergeDeep(config, remote);
      startCountdown(config);
    }
  } catch(e) {}

  function startCountdown(config){
    const live = config.live || {};
    if (!live.enabled || !live.startsAt) {
      root.classList.remove('show');
      if (countdownTimer) clearInterval(countdownTimer);
      countdownTimer = null;
      return;
    }

    const target = new Date(live.startsAt).getTime();
    if (!Number.isFinite(target)) return;

    root.classList.add('show');
    const waitingRoomUrl = live.waitingRoomUrl || 'https://m.site.naver.com/281tU';
    const waitingRoomLabel = live.waitingRoomLabel || '무료 라이브 대기방 입장';
    const action = waitingRoomUrl ? `<a class="count-action" href="${esc(waitingRoomUrl)}" target="_blank" rel="noopener">${esc(waitingRoomLabel)}</a>` : '';

    function draw(){
      const diff = target - Date.now();
      if (diff <= 0) {
        root.innerHTML = `
          <div class="count-copy">
            <span class="count-label">${esc(live.title || '무료 라이브')}</span>
            <strong>${esc(live.afterText || '무료 라이브가 시작되었습니다.')}</strong>
          </div>
          ${action}
        `;
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = n => String(n).padStart(2, '0');

      root.innerHTML = `
        <div class="count-copy">
          <span class="count-label">${esc(live.title || '무료 라이브까지')}</span>
          <div class="count-units" aria-label="무료 라이브 남은 시간">
            <span class="count-unit"><b>D-${days}</b><em>일</em></span>
            <span class="count-unit"><b>${pad(hours)}</b><em>시간</em></span>
            <span class="count-unit"><b>${pad(minutes)}</b><em>분</em></span>
            <span class="count-unit"><b>${pad(seconds)}</b><em>초</em></span>
          </div>
        </div>
        ${action}
      `;
    }

    draw();
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(draw, 1000);
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
