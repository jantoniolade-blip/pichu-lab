'use strict';

// Proxy de mismo origen para los servicios de Google Apps Script de Integer Ninja.
// Evita el acceso directo del navegador a script.google.com, que puede fallar por CORS.
// Los datos se mantienen en la hoja de cálculo del docente.
const ACTIONS = new Set(['ping', 'top', 'players', 'duels', 'score', 'duel', 'duelResult']);
const SCRIPT_ID = /^[A-Za-z0-9_-]{20,200}$/;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  let data;
  try {
    if (req.method === 'GET') {
      data = { ...req.query };
    } else {
      data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (_) {
    return res.status(400).json({ ok: false, error: 'JSON no válido' });
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ ok: false, error: 'Datos no válidos' });
  }

  const sid = data.sid;
  if (typeof sid !== 'string' || !SCRIPT_ID.test(sid)) {
    return res.status(400).json({ ok: false, error: 'URL de Apps Script no válida' });
  }
  if (typeof data.action !== 'string' || !ACTIONS.has(data.action)) {
    return res.status(400).json({ ok: false, error: 'Acción no válida' });
  }
  if (typeof data.key !== 'string' || data.key.length > 100 || !data.key) {
    return res.status(400).json({ ok: false, error: 'Falta la clave de clase' });
  }
  if (JSON.stringify(data).length > 5000) {
    return res.status(413).json({ ok: false, error: 'Solicitud demasiado grande' });
  }
  if (req.method === 'GET' && !['ping', 'top', 'players', 'duels'].includes(data.action)) {
    return res.status(405).json({ ok: false, error: 'Acción no permitida por GET' });
  }
  if (req.method === 'POST' && !['score', 'duel', 'duelResult'].includes(data.action)) {
    return res.status(405).json({ ok: false, error: 'Acción no permitida por POST' });
  }

  const payload = { ...data };
  delete payload.sid;
  const endpoint = `https://script.google.com/macros/s/${sid}/exec`;
  try {
    const options = {
      method: req.method,
      redirect: 'follow',
      signal: AbortSignal.timeout(14000),
    };
    let url = endpoint;
    if (req.method === 'GET') {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(payload)) {
        if (typeof value !== 'string' && typeof value !== 'number') {
          return res.status(400).json({ ok: false, error: 'Parámetro incorrecto' });
        }
        query.set(key, String(value));
      }
      url += '?' + query.toString();
    } else {
      options.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
      options.body = JSON.stringify(payload);
    }

    const upstream = await fetch(url, options);
    const txt = await upstream.text();
    let json;
    try { json = JSON.parse(txt); } catch (_) {
      return res.status(502).json({
        ok: false,
        error: 'Apps Script no ha devuelto JSON. Comprueba la implementación web (/exec) y que permita acceso público.',
      });
    }
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: `Apps Script devolvió HTTP ${upstream.status}` });
    }
    return res.status(200).json(json);
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: error && error.name === 'TimeoutError'
        ? 'Apps Script no ha respondido a tiempo'
        : 'No se pudo contactar con Apps Script desde el servidor',
    });
  }
};
