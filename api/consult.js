export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { name, contact, need } = req.body || {}
  if (![name, contact, need].every(value => typeof value === 'string' && value.trim())) return res.status(400).json({ error: '请完整填写信息' })
  const webhook = process.env.FEISHU_WEBHOOK
  if (!webhook) return res.status(503).json({ error: 'Service unavailable' })
  const text = `谷歌长尾词监控｜暖行 AI 新咨询\n称呼：${String(name).slice(0, 30)}\n联系方式：${String(contact).slice(0, 80)}\n当前困扰：${String(need).slice(0, 800)}`
  const response = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ msg_type: 'text', content: { text } }) })
  if (!response.ok) return res.status(502).json({ error: 'Notification failed' })
  return res.status(200).json({ ok: true })
}
