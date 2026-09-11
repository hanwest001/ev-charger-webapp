// Vercel 서버 함수 - 화면(브라우저)과 Vercel KV(데이터베이스) 사이를 이어주는 역할만 합니다.
// GET  /api/state?key=xxx   -> { value: "저장된 문자열" }  (없으면 { value: null })
// POST /api/state {key, value} -> { ok: true }
//
// 화면 코드(index.html)는 이 두 가지 요청만 보낼 뿐, Vercel KV를 직접 알지 못합니다.
// 나중에 KV를 다른 데이터베이스로 바꾸더라도 이 파일만 고치면 되고, 화면 코드는 그대로 둘 수 있습니다.

const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      if (!key) return res.status(400).json({ error: 'key 파라미터가 필요합니다' });
      const value = await kv.get(key);
      return res.status(200).json({ value: value == null ? null : value });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const key = body.key;
      const value = body.value;
      if (!key) return res.status(400).json({ error: 'key가 필요합니다' });
      await kv.set(key, value);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: '허용되지 않는 요청 방식입니다' });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
};
