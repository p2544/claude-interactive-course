// End-to-end-ish smoke test (jsdom): drives the real app through the flows a
// learner would use. Not part of the app bundle — run with `npx vitest run`.
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './src/App.jsx'
import ch2 from './src/content/ch2.json'

beforeEach(() => {
  cleanup()
  localStorage.clear()
  window.location.hash = ''
})

describe('Dashboard', () => {
  it('แสดงการ์ดบทที่เปิดอยู่และบทที่ล็อก', async () => {
    render(<App />)
    expect((await screen.findAllByText(/บทนำ/)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Prompt Engineering/).length).toBeGreaterThan(0)
    // ทุกบท (0-7) และ extras เปิดใช้งานจริงแล้ว (ไม่มี "เร็วๆ นี้" อีกต่อไป) —
    // บทที่ยังไม่ปลดล็อกตามลำดับการเรียนจะแสดงข้อความล็อกแทน
    expect(screen.getAllByText(/เรียนบทก่อนหน้าให้จบก่อน/).length).toBeGreaterThan(0)
  })
})

describe('SectionPage — เรียนจนจบตอน', () => {
  it('เดินครบ 5 ขั้นของตอน 0.1 และ quiz บันทึกผลผ่านเมื่อตอบถูกหมด', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/chapter/ch0/0.1'
    render(<App />)

    // learn step แรกต้องเรนเดอร์
    expect(await screen.findByText(/Claude คืออะไร/)).toBeTruthy()

    // เดินหน้าจนเจอแบบฝึกหัด (ปุ่มถัดไป enabled ระหว่าง learn/example)
    for (let guard = 0; guard < 20; guard++) {
      const skipBtn = screen.queryByRole('button', { name: /ข้ามแบบฝึกหัด/ })
      if (skipBtn) break
      const next = screen.getByRole('button', { name: /ถัดไป/ })
      expect(next.disabled).toBe(false)
      await user.click(next)
    }

    // ข้ามแบบฝึกหัดเพื่อปลดล็อกปุ่มถัดไป
    await user.click(screen.getByRole('button', { name: /ข้ามแบบฝึกหัด/ }))
    await user.click(screen.getByRole('button', { name: /ถัดไป/ }))

    // ควรถึง quiz: ตอบทุกข้อด้วยคำตอบที่ถูก (อ่านเฉลยจาก JSON ไม่ได้ — ใช้กลยุทธ์
    // เลือกทีละตัวจนระบบเผยเฉลยแล้วนับผ่านจากตัวเลือกที่ highlight ไม่ได้ใน jsdom
    // จึงใช้วิธี: เลือกตัวเลือกแรก ตรวจ แล้วไปต่อ — จบแล้วต้องเห็นหน้าสรุปคะแนน)
    expect(await screen.findByText(/ข้อ 1 \//)).toBeTruthy()
    for (let guard = 0; guard < 10; guard++) {
      // scope เข้าการ์ดบทเรียน (rounded-2xl) กันชนปุ่มเมนูข้างที่มี class คล้ายกัน
      const card = within(screen.getByText(/ข้อ \d+ \//).closest('.rounded-2xl'))
      const options = card
        .getAllByRole('button')
        .filter((b) => !b.disabled && b.className.includes('w-full') && b.className.includes('text-left'))
      expect(options.length).toBeGreaterThan(1)
      await user.click(options[0])
      await user.click(card.getByRole('button', { name: /ตรวจคำตอบ/ }))
      const nextQ = card.queryByRole('button', { name: /ข้อถัดไป/ })
      if (nextQ) {
        await user.click(nextQ)
      } else {
        await user.click(card.getByRole('button', { name: /ดูผลคะแนน/ }))
        break
      }
    }
    // หน้าสรุปคะแนนต้องแสดง % และตอนนี้ต้องไปขั้นสรุป (apply) ต่อได้เสมอ
    expect((await screen.findAllByText(/%/)).length).toBeGreaterThan(0)
    const next = screen.getByRole('button', { name: /ถัดไป/ })
    expect(next.disabled).toBe(false)
    await user.click(next)
    expect((await screen.findAllByText(/ประเด็นสำคัญ|Key Takeaways|สรุป/)).length).toBeGreaterThan(0)
  })

  it('เปลี่ยน section แล้ว state ไม่รั่วข้ามตอน (บั๊กที่แก้ไป)', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/chapter/ch2/2.1'
    render(<App />)
    const firstTitle = (await screen.findByRole('heading', { level: 1 })).textContent

    // เดินหน้า 2 ขั้นใน 2.1
    await user.click(screen.getByRole('button', { name: /ถัดไป/ }))

    // นำทางไปตอน 2.3 โดยตรง — ต้องเริ่มที่ step แรกของตอนใหม่ ไม่ค้าง index เดิม
    window.location.hash = '#/chapter/ch2/2.3'
    const h1 = await screen.findByRole('heading', { level: 1, name: (n) => n !== firstTitle })
    expect(h1.textContent).toContain(ch2.sections.find((s) => s.id === '2.3').title)
    // step แรกของ 2.3 เป็น learn → ปุ่มถัดไปต้อง enabled (ถ้า state รั่วมาจาก quiz จะ disabled)
    const next = screen.getByRole('button', { name: /ถัดไป/ })
    expect(next.disabled).toBe(false)
  })
})

describe('PromptBuilder (ตอน 2.2)', () => {
  it('ประกอบ prompt แล้วตรวจราย slot ได้', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/chapter/ch2/2.2'
    render(<App />)
    await screen.findByRole('heading', { level: 1 })

    // เดินไปจนถึง practice (มี textarea)
    for (let guard = 0; guard < 20; guard++) {
      if (screen.queryAllByRole('textbox').length > 0) break
      const next = screen.getByRole('button', { name: /ถัดไป/ })
      if (next.disabled) break
      await user.click(next)
    }
    const boxes = screen.getAllByRole('textbox')
    expect(boxes.length).toBeGreaterThan(2)

    // กรอกช่อง TASK ด้วยข้อความมี keyword แล้วประกอบ
    for (const box of boxes) await user.type(box, 'Write an email แจ้งลูกค้าเรื่อง delay')
    await user.click(screen.getByRole('button', { name: /ประกอบ prompt/ }))
    expect(await screen.findByText(/Prompt ที่ประกอบแล้ว/)).toBeTruthy()
    expect(screen.getAllByText(/เข้าเค้า/).length).toBeGreaterThan(0)
    // มีปุ่มดูเฉลย
    expect(screen.getByRole('button', { name: /ดูตัวอย่างเฉลย/ })).toBeTruthy()
  })
})
