(function(){
  if (window.GotjaeRemoteConfig) return;

  const cache = {};

  function joinUrl(base, path){
    return new URL(path, new URL(base || './', window.location.href)).toString();
  }

  function load(base){
    const key = base || '';
    if (cache[key]) return cache[key];

    cache[key] = fetch(joinUrl(base, 'remote-config.json?t=' + Date.now()), { cache: 'no-cache' })
      .then(res => res.ok ? res.json() : null)
      .then(meta => {
        const remote = meta && (meta.remote || meta);
        if (!remote || !remote.enabled || !remote.endpoint) return null;
        return loadJsonp(remote.endpoint);
      })
      .catch(() => null);

    return cache[key];
  }

  function loadJsonp(endpoint){
    return new Promise(resolve => {
      const callback = '__gotjaeRemoteConfig_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const timeout = setTimeout(cleanup, 5000);

      function cleanup(value){
        clearTimeout(timeout);
        try { delete window[callback]; } catch(e) { window[callback] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
        resolve(value || null);
      }

      window[callback] = data => cleanup(data);

      try {
        const url = new URL(endpoint);
        url.searchParams.set('callback', callback);
        url.searchParams.set('t', String(Date.now()));
        script.src = url.toString();
        script.onerror = () => cleanup(null);
        document.head.appendChild(script);
      } catch(e) {
        cleanup(null);
      }
    });
  }

  function mergeDeep(target, source){
    const output = Array.isArray(target) ? target.slice() : { ...(target || {}) };
    if (!source || typeof source !== 'object') return output;

    Object.keys(source).forEach(key => {
      const value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        output[key] = mergeDeep(output[key], value);
      } else if (value !== undefined && value !== null && value !== '') {
        output[key] = value;
      }
    });

    return output;
  }

  function rootBaseFromCurrentScript(){
    const script = document.currentScript;
    if (!script || !script.src) return '';
    try {
      return new URL('../', script.src).toString();
    } catch(e) {
      return '';
    }
  }

  window.GotjaeRemoteConfig = {
    load,
    mergeDeep,
    rootBaseFromCurrentScript
  };
})();
