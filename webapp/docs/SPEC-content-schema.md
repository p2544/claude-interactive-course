# Content Schema Spec — STAG Claude Interactive Course (v1)

ไฟล์เนื้อหาแต่ละบทเป็น JSON 1 ไฟล์ (UTF-8) ชื่อ `ch<N>.json` โครงสร้างระดับบนสุด:

```json
{
  "id": "ch2",
  "number": 2,
  "title": "Prompt Engineering",
  "subtitle": "Anatomy · XML · Role · CoT · Few-shot · Anti-patterns · Testing",
  "description": "คำอธิบายบทสั้นๆ 1-2 ประโยค",
  "sections": [ ...Section ]
}
```

## Section

ทุกตอนย่อยของบท (เช่น 2.1, 2.2, ...) ต้องมีครบทุกตอนตามเนื้อหาจริงในไฟล์ text ของบทนั้น

```json
{
  "id": "2.1",
  "title": "Prompt Engineering คืออะไร",
  "minutes": 8,
  "steps": [ ...Step ]
}
```

`steps` ต้องเรียงตามวงจรการเรียน และมี **อย่างน้อย**: learn ≥1, example ≥1, practice ≥1, quiz =1 (ก่อนสุดท้าย), apply =1 (สุดท้ายเสมอ)
ยกเว้น: ตอนที่เป็นสรุป/checklist ล้วนๆ (เช่น quick reference) อนุญาตให้มีแค่ learn + quiz + apply ได้

## Step types

### 1. learn
```json
{ "type": "learn", "title": "หัวข้อย่อย", "blocks": [ ...Block ] }
```
มีได้หลาย learn step ต่อ section — แบ่งเนื้อหายาวเป็นการ์ดละประเด็น อย่ายัดทุกอย่างใน step เดียว (เกณฑ์: blocks ไม่เกิน ~5 ต่อ step)

### 2. example — ตัวอย่างเปรียบเทียบ ดี/แย่ หรือ ก่อน/หลัง
```json
{
  "type": "example",
  "title": "...",
  "intro": "อธิบายว่ากำลังดูอะไร (optional)",
  "compare": [
    { "label": "Prompt ที่แย่", "good": false, "content": "ข้อความ/prompt ตัวอย่าง", "explanation": "ทำไมถึงแย่" },
    { "label": "Prompt ที่ดี", "good": true, "content": "...", "explanation": "ทำไมถึงดี" }
  ]
}
```
`compare` มี 2-3 items ได้ ถ้าเนื้อหาไม่มีคู่ดี/แย่ ให้ใช้ตัวอย่างเดี่ยว good:true พร้อม explanation

### 3. practice — แบบฝึกหัดลงมือทำ เลือก kind ให้เหมาะกับเนื้อหา
ทุก kind มี field ร่วม: `{ "type": "practice", "kind": "...", "title": "...", "instructions": "..." }`

**kind: "mcq-scenario"** — โจทย์สถานการณ์ เลือกคำตอบ
```json
{ "kind": "mcq-scenario", "scenario": "สถานการณ์...", "choices": [
    { "text": "...", "correct": false, "feedback": "อธิบายว่าทำไมไม่ใช่" },
    { "text": "...", "correct": true, "feedback": "ถูกต้องเพราะ..." }
] }
```

**kind: "classify"** — จับของเข้าหมวด
```json
{ "kind": "classify",
  "categories": [ { "id": "opus", "label": "Opus" }, { "id": "haiku", "label": "Haiku" } ],
  "items": [ { "text": "งานสรุปอีเมลจำนวนมาก ราคาถูก", "category": "haiku", "explanation": "..." } ] }
```
(3-8 items, 2-4 categories)

**kind: "ordering"** — เรียงลำดับขั้นตอน (แอปจะสลับให้เอง — เขียนตามลำดับที่ถูกต้อง)
```json
{ "kind": "ordering", "steps": [ "ขั้นแรก...", "ขั้นสอง...", "ขั้นสาม..." ] }
```
(3-6 ขั้น)

**kind: "fill-blank"** — เติมคำในช่องว่างโดยเลือกจากตัวเลือก
```json
{ "kind": "fill-blank",
  "textParts": [ "Prompt ที่ดีต้องมี ", " ชัดเจน และระบุ ", " เสมอ" ],
  "blanks": [
    { "options": ["TASK", "ROLE", "DATA"], "answer": 0, "explanation": "..." },
    { "options": ["FORMAT", "อารมณ์", "ความยาวสูงสุด"], "answer": 0, "explanation": "..." }
  ] }
```
กติกา: `textParts.length === blanks.length + 1`

**kind: "prompt-builder"** — ประกอบ prompt จากโจทย์ (ใช้กับบท 2 เป็นหลัก)
```json
{ "kind": "prompt-builder",
  "scenario": "โจทย์: คุณต้องการให้ Claude ช่วย...",
  "slots": [
    { "id": "role", "label": "ROLE", "required": false, "placeholder": "You are a ...",
      "keywords": ["you are", "expert", "ผู้เชี่ยวชาญ"], "hint": "กำหนด expertise ที่ตรงกับงาน" },
    { "id": "task", "label": "TASK", "required": true, "placeholder": "...",
      "keywords": ["write", "analyze", "สรุป", "เขียน"], "hint": "..." }
  ],
  "modelAnswer": "ตัวอย่างเฉลย prompt เต็มๆ ที่ประกอบครบทุกส่วน"
}
```
เกณฑ์ตรวจของแอป: slot required ต้องไม่ว่าง + ถ้าผู้ใช้พิมพ์แล้วมี keyword อย่างน้อย 1 คำ (case-insensitive) ถือว่าเข้าเค้า — เลือก keywords ให้กว้างพอ (ไทย+อังกฤษ) ไม่งั้นผู้เรียนตอบถูกแต่ระบบว่าผิด

### 4. quiz — 1 อันต่อ section, 3-5 คำถาม
```json
{ "type": "quiz", "questions": [
  { "q": "...", "choices": ["ก", "ข", "ค", "ง"], "answer": 1, "explanation": "เฉลย + เหตุผล" }
] }
```
คำถามต้องทดสอบความเข้าใจหลักการ ไม่ใช่ความจำตัวเลขจุกจิก และ explanation ต้องอธิบายว่าทำไมตัวเลือกอื่นผิดด้วยถ้าชวนสับสน

### 5. apply — ปิดท้ายทุก section
```json
{ "type": "apply",
  "takeaways": [ "ประเด็นสำคัญ 3-5 ข้อ" ],
  "tryThis": "ภารกิจสั้นๆ ให้ไปลองกับ Claude จริงนอกแอป (optional)" }
```

## Block types (ใช้ใน learn)

```json
{ "type": "text", "md": "รองรับ **ตัวหนา**, `code`, บรรทัดที่ขึ้นต้น '- ' เป็น bullet, '### ' เป็นหัวข้อย่อย" }
{ "type": "table", "caption": "...", "headers": ["..."], "rows": [["..."]] }
{ "type": "code", "lang": "python", "caption": "...", "code": "..." }
{ "type": "callout", "variant": "tip|warning|info", "title": "...", "md": "..." }
```

## กติกาเนื้อหา (สำคัญมาก)

1. **ยึดเนื้อหาจากไฟล์ text ของบทเท่านั้น** — ห้ามเพิ่มข้อเท็จจริง/ตัวเลข/ชื่อรุ่นที่ไม่อยู่ในเอกสาร (แบบฝึกหัดและ quiz แต่งใหม่ได้ แต่ต้องทดสอบสิ่งที่เอกสารสอน)
2. ภาษาไทยเป็นหลัก คงศัพท์เทคนิคอังกฤษตามต้นฉบับ (เช่น prompt, context window)
3. ครอบคลุม **ทุกตอนย่อย** ที่ปรากฏในไฟล์ text (ดูหัวข้อ N.N ในเนื้อหาจริง ไม่ใช่สารบัญ)
4. ข้อความใน text block เขียนเรียบเรียงใหม่ให้อ่านลื่นเป็นการ์ดการเรียน ไม่ใช่ copy ดิบๆ ที่ตัดบรรทัดแปลกๆ จาก PDF
5. ตาราง/โค้ดตัวอย่างในเอกสาร ให้แปลงมาเป็น table/code block ให้ครบถ้วนที่สุดเท่าที่เป็นสาระสำคัญ
6. id ของ section ใช้เลขตามเอกสาร (เช่น "1.0", "1.1") — แสดงใน UI ตรงๆ
