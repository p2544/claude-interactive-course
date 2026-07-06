# App Spec — "คู่มือ Claude Interactive" (Phase 1)

Webapp สอนเนื้อหา "คู่มือ Claude ฉบับสมบูรณ์" แบบ interactive ภาษาไทย

## Stack (บังคับ)
- Vite + React 18+ (JavaScript ธรรมดา ไม่ใช้ TypeScript)
- Tailwind CSS v4 ผ่าน `@tailwindcss/vite` plugin
- react-router-dom ใช้ **HashRouter** (เพื่อ deploy static ได้ทุกที่)
- ไม่มี backend, ไม่เรียก network ใดๆ ตอน runtime — เนื้อหา import จาก JSON ใน `src/content/`
- เก็บ progress ใน localStorage
- สร้างที่ `/home/p2544/Claude-500-pages/webapp` (โฟลเดอร์มีอยู่แล้ว ว่างเปล่า)

## โครงไฟล์
```
webapp/
  index.html            (lang="th", title "คู่มือ Claude Interactive")
  vite.config.js        (base: './')
  src/
    main.jsx
    App.jsx             (HashRouter + routes)
    index.css           (@import "tailwindcss"; + font stack + dark variant config)
    content/
      toc.js            (รายการบท/สถานะ ดูด้านล่าง)
      ch0.json  ch1.json  ch2.json   (ตอนนี้ใส่ fixture ตัวอย่างสั้นๆ ไว้ก่อน — เนื้อหาจริงจะถูกวางทับทีหลัง ห้าม hardcode อะไรผูกกับ fixture)
    lib/
      progress.js       (อ่าน/เขียน localStorage, subscribe ผ่าน custom event หรือ context)
      shuffle.js        (seeded shuffle สำหรับ ordering)
    components/
      layout/  (Shell, Sidebar/TopNav, DarkModeToggle, ProgressRing)
      blocks/  (TextBlock, TableBlock, CodeBlock, Callout — renderer ตาม block type)
      steps/   (LearnStep, ExampleStep, PracticeStep, QuizStep, ApplyStep)
      practice/ (McqScenario, Classify, Ordering, FillBlank, PromptBuilder)
    pages/
      Dashboard.jsx
      ChapterPage.jsx   (/chapter/:chId — รายการ sections + ความคืบหน้า)
      SectionPage.jsx   (/chapter/:chId/:secId — ตัวเล่นบทเรียน 5 ขั้น)
```

## Content schema
อ่านจาก SPEC-content-schema.md (ไฟล์ข้างกัน) — renderer ต้องรองรับทุก step type / practice kind / block type ตามนั้นเป๊ะๆ

## toc.js
```js
export const chapters = [
  { id: 'ch0', number: 0, title: 'บทนำ', available: true },
  { id: 'ch1', number: 1, title: 'Claude Models Family', available: true },
  { id: 'ch2', number: 2, title: 'Prompt Engineering', available: true },
  { id: 'ch3', number: 3, title: '9 Features หลักของ Claude', available: false },
  { id: 'ch4', number: 4, title: 'Products ทั้งหมดของ Claude', available: false },
  { id: 'ch5', number: 5, title: 'Custom Skills', available: false },
  { id: 'ch6', number: 6, title: 'Agent SDK', available: false },
  { id: 'ch7', number: 7, title: 'Safety & Pitfalls', available: false },
]
export const extras = [
  { id: 'workflows', title: 'Workflows W1–W16', available: false },
  { id: 'cookbook', title: 'Prompt Cookbook — 90 Prompts', available: false },
  { id: 'glossary', title: 'Glossary & Cheatsheet', available: false },
]
```
บทที่ available:false แสดงเป็นการ์ด "เร็วๆ นี้" (disabled)

## หน้า Dashboard
- Header: ชื่อคอร์ส + progress รวม (ring หรือ bar: sections ที่จบ / ทั้งหมดของบทที่เปิดอยู่)
- การ์ดบท 0–7: เลขบท, ชื่อ, จำนวนตอน, progress bar ของบท, สถานะ (ล็อก/เปิด/จบ)
- กติกาปลดล็อก: บท 0 เปิดเสมอ; บทถัดไปเปิดเมื่อบทก่อนหน้าจบทุกตอน **หรือ** ผู้ใช้กด "ข้ามไปเรียนเลย" (ยืนยัน 1 ครั้ง เก็บ flag ใน progress)
- แถว "เส้นทางแนะนำ": 3 การ์ดเล็ก (มือใหม่ / Knowledge Worker / Developer) เป็นข้อมูลแนะนำลำดับการเรียน (static)
- แถว extras: การ์ด disabled "เร็วๆ นี้"

## หน้า Chapter
- ชื่อบท + คำอธิบาย + progress
- รายการ sections: id, title, เวลาโดยประมาณ (minutes), สถานะ (ยังไม่เริ่ม / กำลังเรียน / จบ + คะแนน quiz ล่าสุด)
- section ในบทเดียวกันเข้าได้อิสระ ไม่ล็อกลำดับ

## หน้า Section (หัวใจของแอป)
- Stepper ด้านบน: ไอคอน 5 ขั้น (เรียนรู้ / ตัวอย่าง / ลงมือทำ / ทดสอบ / สรุป) — step ปัจจุบัน highlight, step ที่ผ่านแล้วติ๊ก
- ปุ่ม ก่อนหน้า/ถัดไป; learn/example เลื่อนผ่านได้เลย; practice ต้อง "ตรวจคำตอบ" ก่อน (แต่มีปุ่ม "ข้ามแบบฝึกหัด" ได้); quiz ต้องตอบครบทุกข้อ
- Quiz: ตอบทีละข้อ เลือกแล้วเฉลยทันที (ถูก=เขียว ผิด=แดง+โชว์ข้อถูก) พร้อม explanation แล้วปุ่มข้อถัดไป จบแล้วสรุปคะแนน
  - ≥70% = ผ่าน → บันทึก section completed + คะแนน
  - <70% = ปุ่ม "ลองใหม่" (สุ่มลำดับคำถามใหม่) — ยังไปขั้น apply ต่อได้แต่ section ไม่นับจบ
- Apply: takeaways + tryThis + ปุ่ม "ตอนถัดไป →" (หรือ "กลับหน้าบท" ถ้าเป็นตอนสุดท้าย)
- จำ step ล่าสุดของแต่ละ section ไว้ (เข้ามาใหม่ต่อจากเดิม ถามก่อนว่า "เรียนต่อ" หรือ "เริ่มใหม่")

## Practice components (เกณฑ์ตรวจ)
- **McqScenario**: เลือก 1 → ตรวจ → โชว์ feedback ของตัวเลือกที่เลือก + ไฮไลต์ข้อถูก
- **Classify**: แต่ละ item มี dropdown/ปุ่มเลือกหมวด (ไม่ต้อง drag-drop จริง — ใช้ tap-to-assign เพื่อให้ใช้บนมือถือได้) → ตรวจ → ถูก/ผิดรายข้อ + explanation
- **Ordering**: รายการที่ถูกสลับ (ใช้ shuffle แบบ deterministic seed จาก section id — ห้าม Math.random ใน render) มีปุ่ม ↑↓ ย้ายลำดับ → ตรวจ → ไฮไลต์ตำแหน่งถูก/ผิด + เฉลยลำดับที่ถูก
- **FillBlank**: แต่ละช่องเป็น select inline ในประโยค → ตรวจรายช่อง + explanation
- **PromptBuilder**: textarea ต่อ slot (label + hint + placeholder) + ปุ่ม "ประกอบ prompt" → แสดง prompt ที่ประกอบแล้ว + ผลตรวจราย slot (required ว่าง = แดง, มี keyword = เขียว "เข้าเค้า", ไม่มี = เหลือง "ลองเทียบกับเฉลย") + ปุ่มเปิดดู modelAnswer + ปุ่ม copy prompt
- ทุก practice หลังตรวจแล้วมีปุ่ม "ลองใหม่" (reset)

## Progress (lib/progress.js)
localStorage key: `stag-claude-progress-v1`
```json
{ "sections": { "2.1": { "completed": true, "bestScore": 80, "lastStep": 3 } },
  "unlockOverrides": ["ch2"], "lastVisited": { "chId": "ch2", "secId": "2.1" } }
```
- expose: getProgress(), markQuiz(secId, scorePct), setLastStep(secId, i), overrideUnlock(chId), chapterStats(chapter), resetAll()
- มีปุ่ม "ล้างความคืบหน้า" ในเมนู (confirm ก่อน)

## Design
- โทน: การ์ดสะอาด มุมโค้ง (rounded-2xl), เงานุ่ม, spacing โปร่ง, accent สี indigo/violet gradient; แต่ละบทมีสี accent ของตัวเอง (กำหนดใน toc.js เช่น ch0=slate, ch1=blue, ch2=violet)
- Font: `font-family: 'Noto Sans Thai', 'Sarabun', system-ui, sans-serif` (ไม่โหลดฟอนต์จาก CDN — ใช้ font ระบบ ถ้าไม่มีก็ fallback)
- Dark mode: toggle ใน header, ใช้ Tailwind v4 `@custom-variant dark` + class `dark` บน `<html>`, จำค่าใน localStorage, default ตาม prefers-color-scheme — ทุกหน้าต้องดูดีทั้ง 2 โหมด
- Responsive: mobile-first, sidebar ยุบเป็น bottom/top nav บนจอเล็ก, ทุก practice ใช้ได้ด้วยนิ้ว
- ภาษา UI: ไทยทั้งหมด
- ห้ามใช้ external CDN/รูปจากเน็ต — self-contained 100%

## คุณภาพ
- `npm run build` ต้องผ่านไม่มี error/warning สำคัญ
- ใส่ fixture content สั้นๆ (1 section ต่อบท ครบทุก step type + ทุก practice kind อย่างน้อยที่ ch2) เพื่อ dev/ทดสอบ renderer ได้ทันที
- โค้ดอ่านง่าย แยก component ชัด ไม่ต้องมี test framework ใน phase นี้
