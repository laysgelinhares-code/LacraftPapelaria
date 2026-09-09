// La Craft OS — State Sync API (Vercel serverless function)
// Guarda/baixa o estado do sistema num Redis Upstash (REST body-style).
// Env vars:
//   UPSTASH_REDIS_REST_URL  ex.: https://xxxx.upstash.io
//   UPSTASH_REDIS_REST_TOKEN
//   APP_SYNC_SECRET         (opcional) se definida, exige header x-app-secret == APP_SYNC_SECRET

const KEY = 'lacraft_os_state_v1';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-secret');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const secret = process.env.APP_SYNC_SECRET;
  if (secret && req.headers['x-app-secret'] !== secret) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const UP = process.env.UPSTASH_REDIS_REST_URL;
  const TOK = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!UP || !TOK) return res.status(500).json({ error: 'sync desconfigurado' });

  const headers = {
    Authorization: `Bearer ${TOK}`,
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'GET') {
      const r = await fetch(UP, { method: 'POST', headers, body: JSON.stringify(['GET', KEY]) });
      const j = await r.json();
      const val = j && j.result;
      if (val == null) return res.status(404).json({ error: 'sem dados ainda' });
      return res.status(200).send(val);
    }

    if (req.method === 'PUT') {
      const value = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const r = await fetch(UP, { method: 'POST', headers, body: JSON.stringify(['SET', KEY, value]) });
      const j = await r.json();
      return res.status(200).json({ ok: true, result: j.result });
    }

    return res.status(405).json({ error: 'metodo nao permitido' });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};