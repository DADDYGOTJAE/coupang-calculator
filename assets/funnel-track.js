(function(){
  const script = document.currentScript;
  const configPath = script && script.dataset.config ? script.dataset.config : 'hub-links.json';
  const qs = new URLSearchParams(location.search);
  const pageSource = qs.get('src') || qs.get('utm_source') || '';

  function loadConfig(){
    return fetch(configPath + '?t=' + Date.now(), { cache: 'no-cache' })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null);
  }

  function applyLinks(config){
    const links = config && config.links ? config.links : {};
    document.querySelectorAll('[data-hub-link]').forEach(link => {
      const key = link.dataset.hubLink;
      const item = links[key];
      if (!item || !item.url) return;
      link.href = item.url;
      if (!link.dataset.track) link.dataset.track = key;
      if (item.external) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      if (item.label && link.dataset.fillLabel === 'true') {
        link.textContent = item.label;
      }
    });
  }

  function setupTracking(config){
    const tracking = config && config.tracking ? config.tracking : {};
    if (!tracking.enabled || !tracking.endpoint) return;
    const endpoint = tracking.endpoint.trim();
    const defaultSource = pageSource || tracking.defaultSource || 'direct';

    document.addEventListener('click', event => {
      const link = event.target.closest('[data-track]');
      if (!link) return;
      logClick(endpoint, {
        slug: link.dataset.track || link.dataset.hubLink || '',
        label: (link.dataset.trackLabel || link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        src: defaultSource,
        target: link.href || '',
        page: location.pathname,
        query: location.search,
        referrer: document.referrer || '',
        utm_source: qs.get('utm_source') || '',
        utm_medium: qs.get('utm_medium') || '',
        utm_campaign: qs.get('utm_campaign') || ''
      });
    }, true);
  }

  function logClick(endpoint, params){
    try {
      const url = new URL(endpoint);
      Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));
      url.searchParams.set('ts', String(Date.now()));
      const img = new Image();
      img.referrerPolicy = 'no-referrer-when-downgrade';
      img.src = url.toString();
    } catch (err) {
      // Tracking should never block the user from opening the link.
    }
  }

  loadConfig().then(config => {
    if (!config) return;
    applyLinks(config);
    setupTracking(config);
  });
})();
