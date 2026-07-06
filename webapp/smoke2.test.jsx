// Smoke tests for the Phase 2-4 extensions (Workflows / Cookbook / Glossary /
// PDF link / export progress). Mirrors the style of smoke.test.jsx — drives
// the real app through jsdom rather than mocking pieces out.
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './src/App.jsx'

beforeEach(() => {
  cleanup()
  localStorage.clear()
  window.location.hash = ''
})

describe('Workflows', () => {
  it('แสดงการ์ด workflow จาก fixture และ callout เรื่อง W11', async () => {
    window.location.hash = '#/workflows'
    render(<App />)
    expect(await screen.findByText(/สร้าง eBook/)).toBeTruthy()
    expect(screen.getByText(/สร้าง Code Documentation/)).toBeTruthy()
    expect(screen.getAllByText(/^W1$/).length).toBeGreaterThan(0)
    // W11 ไม่ควรมีการ์ดของตัวเอง แต่ต้องมี callout อธิบายไว้
    expect(screen.queryByText(/^W11$/)).toBeNull()
    expect(screen.getByText(/W11/)).toBeTruthy()
  })
})

describe('Cookbook', () => {
  it('ค้นหา แล้วขยายการ์ดเพื่อดู PromptTemplate พร้อมปุ่มคัดลอก', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/cookbook'
    render(<App />)

    const search = await screen.findByPlaceholderText(/ค้นหา prompt/)
    await user.type(search, 'อีเมล')

    const title = await screen.findByText(/สรุปอีเมลยาวเป็นประเด็นสำคัญ/)
    expect(title).toBeTruthy()

    // ยังไม่ขยาย — ไม่ควรเห็นพรีวิว prompt
    expect(screen.queryByText(/พรีวิว prompt/)).toBeNull()

    // กดขยายการ์ด (ปุ่มที่ครอบชื่อ prompt)
    const cardButton = title.closest('button')
    await user.click(cardButton)

    expect(await screen.findByText(/พรีวิว prompt/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /คัดลอก/ })).toBeTruthy()
  })
})

describe('Glossary', () => {
  it('สลับแท็บคำศัพท์ / API Reference และพลิกการ์ด Flashcard ได้', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/glossary'
    render(<App />)

    expect(await screen.findByRole('heading', { name: /Glossary/ })).toBeTruthy()
    // แท็บคำศัพท์เป็นค่าเริ่มต้น — ต้องเห็นคำศัพท์อย่างน้อยหนึ่งคำ
    expect(await screen.findByText('Prompt')).toBeTruthy()

    // สลับไปแท็บ API Reference
    await user.click(screen.getByRole('button', { name: 'API Reference' }))
    expect(await screen.findByText(/ข\.2 Claude Models Reference/)).toBeTruthy()

    // กลับไปแท็บคำศัพท์แล้วเข้าโหมด Flashcard
    await user.click(screen.getByRole('button', { name: 'คำศัพท์' }))
    await user.click(screen.getByRole('button', { name: /โหมด Flashcard/ }))

    const hint = await screen.findByText(/แตะเพื่อดูคำอธิบาย/)
    const card = hint.closest('button')
    await user.click(card)
    // พลิกแล้ว hint ของด้านหน้าต้องหายไป (แสดงคำอธิบายแทน)
    expect(screen.queryByText(/แตะเพื่อดูคำอธิบาย/)).toBeNull()
  })
})

describe('เมนู — ลิงก์ PDF และปุ่ม export', () => {
  it('มีลิงก์เปิด PDF ต้นฉบับและปุ่มส่งออกความคืบหน้า', async () => {
    render(<App />)
    const pdfLinks = await screen.findAllByRole('link', { name: /คู่มือ PDF ต้นฉบับ/ })
    expect(pdfLinks.length).toBeGreaterThan(0)
    pdfLinks.forEach((link) => {
      expect(link.getAttribute('href').endsWith('manual500p.pdf')).toBe(true)
      expect(link.getAttribute('target')).toBe('_blank')
    })

    expect(screen.getAllByRole('button', { name: /ส่งออกความคืบหน้า/ }).length).toBeGreaterThan(0)
  })
})
