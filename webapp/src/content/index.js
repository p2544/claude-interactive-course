// Static content loader. Everything is bundled at build time — no runtime
// network fetches. Add a new `import chN from './chN.json'` line here (and
// to the map below) once a new chapter's content file exists; toc.js's
// `available` flag controls whether it's shown to learners yet.

import ch0 from './ch0.json'
import ch1 from './ch1.json'
import ch2 from './ch2.json'
import ch3 from './ch3.json'
import ch4 from './ch4.json'
import ch5 from './ch5.json'
import ch6 from './ch6.json'
import ch7 from './ch7.json'

const contentByChapter = { ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7 }

export function getChapterContent(chId) {
  return contentByChapter[chId] || null
}
