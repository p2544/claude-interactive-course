// Thin client for the optional "ลองกับ Claude จริง" Playground feature.
// The user's own API key is stored in localStorage on this device only and
// used exclusively to call api.anthropic.com directly from the browser —
// nothing is proxied through any other server.

const KEY = 'stag-claude-api-key'

export function getApiKey() {
  try {
    return localStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}

export function setApiKey(key) {
  try {
    localStorage.setItem(KEY, key)
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function clearApiKey() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (เร็ว ประหยัด)' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 (สมดุล)' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8 (ความสามารถสูงสุด)' },
]

function statusMessage(status) {
  if (status === 401) return 'API key ไม่ถูกต้องหรือหมดอายุ กรุณาตรวจสอบอีกครั้งที่ console.anthropic.com'
  if (status === 403) return 'ไม่มีสิทธิ์เรียกใช้งานนี้ด้วย API key ปัจจุบัน'
  if (status === 429) return 'ถูกจำกัดอัตราการใช้งาน (rate limit) กรุณารอสักครู่แล้วลองใหม่'
  if (status >= 500) return 'เซิร์ฟเวอร์ของ Claude มีปัญหาชั่วคราว กรุณาลองใหม่อีกครั้ง'
  return `เกิดข้อผิดพลาด (HTTP ${status})`
}

/** POST /v1/messages directly to api.anthropic.com with the caller's own key. */
export async function sendMessage({ apiKey, model, prompt }) {
  let res
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  } catch {
    throw new Error('เชื่อมต่อ api.anthropic.com ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่')
  }

  if (!res.ok) {
    let detail = ''
    try {
      const data = await res.json()
      detail = data?.error?.message || ''
    } catch {
      // response body wasn't JSON — ignore
    }
    const base = statusMessage(res.status)
    throw new Error(detail ? `${base} — ${detail}` : base)
  }

  const data = await res.json()
  const blocks = Array.isArray(data?.content) ? data.content : []
  return blocks
    .filter((b) => b?.type === 'text')
    .map((b) => b.text)
    .join('\n')
}
