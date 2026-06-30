(async function loadTopbar(){
  const bar = document.getElementById('topbar');
  if (!bar) return;
  const base = bar.dataset.base || '';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  try {
    const res = await fetch(base + 'links.json?t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) return;
    const data = await res.json();
    const channels = data.channels || [];
    if (channels.length === 0) { bar.style.display = 'none'; return; }
    bar.innerHTML = channels.map(channel => {
      const type = channel.type ? ` nav-${esc(channel.type)}` : '';
      const icon = getIcon(channel);
      return `<a class="${type.trim()}" href="${esc(channel.url)}" target="_blank" rel="noopener">${icon}${esc(channel.label)}</a>`;
    }).join('');
  } catch(e) {
    bar.style.display = 'none';
  }

  function getIcon(channel){
    if (channel.type === 'youtube') {
      return '<span class="youtube-logo" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M21.6 7.2s-.2-1.5-.8-2.2c-.8-.9-1.7-.9-2.1-1C15.8 3.8 12 3.8 12 3.8s-3.8 0-6.7.2c-.4.1-1.3.1-2.1 1-.6.7-.8 2.2-.8 2.2S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.2c.8.9 1.9.9 2.4 1 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-1 .6-.7.8-2.2.8-2.2s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6Z" fill="currentColor"/><path d="M9.9 14.9V8.6l5.5 3.2-5.5 3.1Z" fill="#fff"/></svg></span>';
    }
    if (channel.icon) return `<span class="icon">${esc(channel.icon)}</span>`;
    return '';
  }
})();
