/* Shared REST transport for the browser and native Challenge protocol. */
(function (global) {
  'use strict';
  function serverUrl(value) {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      throw new Error('Bitte eine gültige http(s)-Serveradresse eingeben.');
    }
    url.pathname = url.pathname.replace(/\/+$/, '') + '/';
    return url.href;
  }

  async function request(base, path, body) {
    const url = new URL('api/' + path, serverUrl(base));
    if (global.location && global.location.protocol === 'https:' && url.protocol === 'http:') {
      throw new Error('Eine HTTPS-Seite braucht einen HTTPS-Challenge-Server. Öffne die lokale Serveradresse direkt im Browser.');
    }
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 8000);
    try {
      const response = await fetch(url.href, {
        cache: 'no-store', signal: controller.signal,
        ...(body === undefined ? {} : {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
      });
      let result;
      try { result = await response.json(); }
      catch (_) { throw new Error('Diese Adresse liefert keinen Challenge-Server.'); }
      if (!response.ok) {
        const error = new Error(result.error || ('Fehler ' + response.status));
        error.status = response.status;
        throw error;
      }
      return result;
    } finally { clearTimeout(timer); }
  }

  async function resolve(candidates) {
    let lastError;
    for (const candidate of candidates) {
      try {
        const base = serverUrl(candidate);
        const reply = await request(base, 'ping');
        if (reply.ok !== true) throw new Error('Kein Challenge-Server.');
        return base;
      } catch (error) { lastError = error; }
    }
    throw lastError || new Error('Der Challenge-Server ist nicht erreichbar.');
  }

  global.ChallengeProtocol = { serverUrl, request, resolve };
})(window);
