(async function loadLiveCountdown(){
  const root = document.getElementById('liveCountdown');
  if (!root) return;

  const base = root.dataset.base || '';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  try {
    const res = await fetch(base + 'site-config.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) return;
    const config = await res.json();
    const live = config.live || {};
    if (!live.enabled || !live.startsAt) return;

    const target = new Date(live.startsAt).getTime();
    if (!Number.isFinite(target)) return;

    root.classList.add('show');

    function draw(){
      const diff = target - Date.now();
      if (diff <= 0) {
        root.innerHTML = `
          <span class="count-label">${esc(live.title || '무료 라이브')}</span>
          <strong>${esc(live.afterText || '무료 라이브가 시작되었습니다.')}</strong>
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
        <span class="count-label">${esc(live.title || '무료 라이브까지')}</span>
        <div class="count-units" aria-label="무료 라이브 남은 시간">
          <span class="count-unit"><b>D-${days}</b><em>일</em></span>
          <span class="count-unit"><b>${pad(hours)}</b><em>시간</em></span>
          <span class="count-unit"><b>${pad(minutes)}</b><em>분</em></span>
          <span class="count-unit"><b>${pad(seconds)}</b><em>초</em></span>
        </div>
      `;
    }

    draw();
    setInterval(draw, 1000);
  } catch(e) {}
})();
