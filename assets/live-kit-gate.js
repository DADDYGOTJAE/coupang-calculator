(function setupLiveKitGate(){
  const list = document.querySelector('[data-live-kit-list]');
  if (!list) return;

  const params = new URLSearchParams(window.location.search);
  const queryOpens = params.get('live') === '1' || params.get('open') === '1';
  const isOpen = queryOpens;
  const notice = document.getElementById('liveKitNotice');
  const heroText = document.getElementById('liveKitHeroText');
  const backLink = document.querySelector('.back-link');

  if (isOpen) {
    if (backLink) backLink.setAttribute('href', '../?live=1');
    if (heroText) {
      heroText.textContent = '소싱부터 광고까지 각 단계별로 보고 따라할 수 있는 자료입니다. 라이브 흐름에 맞춰 순서대로 열어보시면 됩니다.';
    }
    if (notice) {
      notice.innerHTML = '<b>라이브 참여자 공개:</b> 지금은 자료를 열람할 수 있습니다. 체크하면서 막히는 부분은 Q&A 때 바로 질문해주세요.';
    }
    list.querySelectorAll('a.kit-item').forEach(card => {
      const href = card.getAttribute('href') || '';
      const url = new URL(href, window.location.href);
      url.searchParams.set('live', '1');
      card.setAttribute('href', url.href);
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
