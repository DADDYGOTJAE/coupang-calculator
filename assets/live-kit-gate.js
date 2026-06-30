(function setupLiveKitGate(){
  const list = document.querySelector('[data-live-kit-list]');
  if (!list) return;

  const params = new URLSearchParams(window.location.search);
  const storageKey = 'gotjae-live-kit-open';
  const cookieName = 'gotjaeLiveKitOpen';
  const setOpenCookie = () => { document.cookie = cookieName + '=1; max-age=86400; path=/; SameSite=Lax'; };
  const clearOpenCookie = () => { document.cookie = cookieName + '=; max-age=0; path=/; SameSite=Lax'; };
  const hasOpenCookie = () => document.cookie.split(';').some(cookie => cookie.trim() === cookieName + '=1');

  if (params.get('lock') === '1') {
    try { localStorage.removeItem(storageKey); } catch(e) {}
    clearOpenCookie();
  }

  const queryOpens = params.get('live') === '1' || params.get('open') === '1';
  if (queryOpens) {
    try { localStorage.setItem(storageKey, '1'); } catch(e) {}
    setOpenCookie();
  }

  let savedOpen = false;
  try { savedOpen = localStorage.getItem(storageKey) === '1'; } catch(e) {}
  const isOpen = queryOpens || savedOpen || hasOpenCookie();
  const notice = document.getElementById('liveKitNotice');
  const heroText = document.getElementById('liveKitHeroText');

  if (isOpen) {
    if (heroText) {
      heroText.textContent = '소싱부터 광고까지 각 단계별로 보고 따라할 수 있는 자료입니다. 라이브 흐름에 맞춰 순서대로 열어보시면 됩니다.';
    }
    if (notice) {
      notice.innerHTML = '<b>라이브 참여자 공개:</b> 지금은 자료를 열람할 수 있습니다. 체크하면서 막히는 부분은 Q&A 때 바로 질문해주세요.';
    }
    list.querySelectorAll('a.kit-item').forEach(card => {
      const href = card.getAttribute('href') || '';
      const separator = href.includes('?') ? '&' : '?';
      card.setAttribute('href', href + separator + 'live=1');
      card.classList.remove('locked');
      const lock = card.querySelector('.kit-lock');
      const meta = card.querySelector('.meta');
      if (lock) lock.textContent = '지금 공개';
      if (meta) meta.textContent = '열어보기';
    });
    return;
  }

  list.querySelectorAll('a.kit-item').forEach(card => {
    card.dataset.lockedHref = card.getAttribute('href') || '';
    card.removeAttribute('href');
    card.setAttribute('aria-disabled', 'true');
    card.classList.add('locked');
    const lock = card.querySelector('.kit-lock');
    const meta = card.querySelector('.meta');
    if (lock) lock.textContent = '라이브 중 공개';
    if (meta) meta.textContent = '라이브 중 공개';
  });
})();
