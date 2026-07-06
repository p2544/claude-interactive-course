# เรียน Claude แบบ Interactive ด้วยตนเอง 🎓

คอร์สเรียนรู้การใช้งาน **Claude AI** แบบ interactive ภาษาไทย เรียบเรียงจากหนังสือ
"คู่มือ Claude ฉบับสมบูรณ์" (STAG Knowledge Series, 500 หน้า) — ครบทั้ง 8 บท
ตั้งแต่พื้นฐานจนถึง Production พร้อมแบบฝึกหัด quiz และ workflow ใช้งานจริง

## ใช้งานได้ 2 แบบ

### แบบที่ 1 — เปิดผ่านเว็บ (ไม่ต้องติดตั้งอะไรเลย)

เปิดเบราว์เซอร์ไปที่:

**https://p2544.github.io/claude-interactive-course/**

- ใช้ได้ทั้งคอมพิวเตอร์และมือถือ รองรับ dark mode
- ความคืบหน้าการเรียน (บทที่เรียนจบ, คะแนน quiz) เก็บใน localStorage
  ของเบราว์เซอร์เครื่องคุณเอง — ไม่มีการส่งข้อมูลไปที่ไหน
- ปุ่ม "ส่งออกความคืบหน้า" ใช้สำรอง/ย้ายความคืบหน้าข้ามเครื่องได้

### แบบที่ 2 — ดาวน์โหลดไปรันบนเครื่องตัวเอง

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 18 ขึ้นไป แล้วรัน:

```bash
git clone https://github.com/p2544/claude-interactive-course.git
cd claude-interactive-course/webapp
npm install
npm run dev        # เปิด dev server → http://localhost:5173
```

หรือ build เป็นไฟล์ static ไว้เปิดเอง/ติดตั้งบน server ของคุณ:

```bash
npm run build      # ได้ผลลัพธ์ในโฟลเดอร์ dist/
npm run preview    # ทดลองเปิดผลลัพธ์ที่ build แล้ว
```

> **หมายเหตุ:** หนังสือต้นฉบับเปิดอ่านได้จากปุ่ม "📖 คู่มือ PDF ต้นฉบับ"
> ในแอป (ไฟล์อยู่ที่ `webapp/public/manual500p.pdf`)

## มีอะไรในคอร์ส

| ส่วน | เนื้อหา |
|------|---------|
| บท 0 | บทนำ — Claude คืออะไร, Mental Model, เริ่มใช้ใน 5 นาที |
| บท 1 | Claude Models Family — เลือก model ให้เหมาะกับงาน |
| บท 2 | Prompt Engineering — Anatomy, XML, Role, CoT, Few-shot |
| บท 3 | 9 Features หลัก — Tool Use, MCP, Vision, Caching ฯลฯ |
| บท 4 | Products ทั้งหมด — Web, Desktop, Code, API, Plans |
| บท 5 | Custom Skills — SKILL.md, Domain Assistant, Enterprise |
| บท 6 | Agent SDK — สร้าง agent ของตัวเอง |
| บท 7 | Safety & Pitfalls — Hallucination, Prompt Injection, PDPA |
| Workflows | W1–W16 ทำตามได้จริงทีละขั้น พร้อม prompt สำเร็จรูป |
| Cookbook | 90 prompt templates กรอกตัวแปรแล้วใช้ได้ทันที |
| Glossary | คำศัพท์ 110+ คำ + flashcards + API cheatsheet |

ทุก section เรียนเป็นวงจร **เรียน → ดูตัวอย่าง → ฝึกทำ → quiz → นำไปใช้**
พร้อมแบบฝึกหัด 5 รูปแบบ (เลือกตอบจากสถานการณ์, จับคู่หมวด, เรียงลำดับ,
เติมคำ, ประกอบ prompt)

## สำหรับนักพัฒนา — โครงสร้างโปรเจกต์

```
webapp/
├── src/content/       # เนื้อหาบทเรียน (JSON ต่อบท) — ch0.json ... ch7.json,
│                      # workflows (wf-a/wf-b), cookbook, glossary
├── src/components/    # React components (steps, practice, blocks, layout)
├── src/pages/         # หน้าหลักของแอป (Dashboard, Chapter, Section, ...)
├── docs/              # SPEC-content-schema.md + SPEC-app.md — สัญญากลาง
│                      # ที่เนื้อหา/โค้ดต้องยึด อ่านก่อนแก้อะไร
├── tools/validate.mjs # validator เนื้อหา: node tools/validate.mjs src/content/chN.json
└── smoke.test.jsx     # npx vitest run smoke.test.jsx --environment jsdom
```

- Stack: Vite + React 19 + Tailwind CSS v4 + React Router (HashRouter) — ไม่มี backend
- เพิ่ม/แก้เนื้อหาบท: แก้ `src/content/chN.json` ตาม schema ใน
  `docs/SPEC-content-schema.md` แล้วรัน validator ให้ผ่านก่อน commit
- Deploy อัตโนมัติ: push ขึ้น `master` แล้ว GitHub Actions จะ build + deploy
  ไปยัง GitHub Pages ให้เอง (ดู `.github/workflows/deploy.yml`)

## ลิขสิทธิ์

- **โค้ดของ webapp** — เปิดให้นำไปใช้/ดัดแปลง/พัฒนาต่อได้ตามสัญญา MIT (ดูไฟล์ `LICENSE`)
- **เนื้อหาบทเรียน** (`webapp/src/content/*.json`) เรียบเรียงจากหนังสือ
  "คู่มือ Claude ฉบับสมบูรณ์" © 2026 STAG · Knowledge Series —
  ใช้เพื่อการเรียนรู้ได้ แต่การนำเนื้อหาไปเผยแพร่ซ้ำเชิงพาณิชย์
  ควรได้รับอนุญาตจากเจ้าของลิขสิทธิ์หนังสือก่อน
