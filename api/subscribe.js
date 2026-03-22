export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY   // ← chave segura no servidor
    },
    body: JSON.stringify({
      email,
      listIds: [parseInt(process.env.BREVO_LIST_ID)],
      updateEnabled: true,
      attributes: {
        SOURCE: 'Venom Landing Page',
        SIGNUP_DATE: new Date().toISOString().split('T')[0]
      }
    })
  });

  if (response.ok || response.status === 204) {
    return res.status(200).json({ ok: true });
  }

  const err = await response.json();
  if (err.code === 'duplicate_parameter') {
    return res.status(200).json({ ok: true });
  }

  return res.status(500).json({ error: err.message });
}
