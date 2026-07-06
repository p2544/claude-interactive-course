import { useEffect, useState } from 'react'
import { getApiKey, setApiKey, clearApiKey, sendMessage, MODELS } from '../lib/claudeClient.js'

function KeySetupForm({ onSaved }) {
  const [value, setValue] = useState('')

  function handleSave(e) {
    e.preventDefault()
    if (!value.trim()) return
    setApiKey(value.trim())
    onSaved()
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">เชื่อมต่อ API Key ของคุณเอง</h2>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li className="flex gap-2">
          <span aria-hidden="true">1️⃣</span>
          <span>
            ต้องใช้ API key ของคุณเองจาก{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener"
              className="text-indigo-600 hover:underline dark:text-violet-400"
            >
              console.anthropic.com
            </a>
          </span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true">2️⃣</span>
          <span>Key จะถูกเก็บไว้ใน localStorage ของเครื่องนี้เท่านั้น ไม่ถูกส่งไปที่อื่นนอกจาก api.anthropic.com</span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true">3️⃣</span>
          <span>การเรียกใช้แต่ละครั้งมีค่าใช้จ่ายตามราคา API ของ Anthropic — โปรดตรวจสอบราคาก่อนใช้งานจริง</span>
        </li>
      </ul>
      <form onSubmit={handleSave} className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200" htmlFor="api-key-input">
          API Key
        </label>
        <input
          id="api-key-input"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-600"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-violet-600 dark:hover:bg-violet-700"
        >
          บันทึก API Key
        </button>
      </form>
    </div>
  )
}

function ChatPanel({ onKeyCleared }) {
  const [model, setModel] = useState(MODELS[0].id)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState('')

  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem('playground-prefill')
      if (prefill) {
        setPrompt(prefill)
        sessionStorage.removeItem('playground-prefill')
      }
    } catch {
      // sessionStorage unavailable — no prefill, not fatal
    }
  }, [])

  function handleClearKey() {
    if (window.confirm('ลบ API key ที่บันทึกไว้ในเครื่องนี้?')) {
      clearApiKey()
      onKeyCleared()
    }
  }

  async function handleSend() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError('')
    setResponse('')
    try {
      const text = await sendMessage({ apiKey: getApiKey(), model, prompt })
      setResponse(text || '(ไม่มีข้อความตอบกลับ)')
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="model-select">
            Model
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleClearKey}
          className="text-xs font-medium text-rose-500 hover:underline dark:text-rose-400"
        >
          ลบ API key
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={6}
        placeholder="พิมพ์ prompt ที่ต้องการส่งให้ Claude..."
        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder:text-gray-600"
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={!prompt.trim() || loading}
        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-violet-600 dark:hover:bg-violet-700"
      >
        {loading ? 'กำลังส่ง...' : 'ส่งให้ Claude'}
      </button>

      {error && (
        <p className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700/60 dark:bg-rose-900/20 dark:text-rose-300">
          {error}
        </p>
      )}

      {response && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">คำตอบจาก Claude</p>
          <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-200">
            {response}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Playground() {
  const [hasKey, setHasKey] = useState(() => !!getApiKey())

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">Claude API Playground</h1>
        <p className="mt-1 text-sm text-indigo-100">ทดลองส่ง prompt ให้ Claude จริงๆ ด้วย API key ของคุณเอง (ฟีเจอร์เสริม ไม่บังคับ)</p>
      </header>

      {hasKey ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
          <ChatPanel onKeyCleared={() => setHasKey(false)} />
        </div>
      ) : (
        <KeySetupForm onSaved={() => setHasKey(true)} />
      )}
    </div>
  )
}
