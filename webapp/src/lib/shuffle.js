// Deterministic shuffle utilities.
//
// Ordering practice must show the same shuffled order on every render for a
// given section (otherwise the layout would jump around as the user
// interacts). Math.random() is forbidden here on purpose — we derive a seed
// from the section id instead, so the same section always shuffles the same
// way, but different sections/practices look different.

function hashSeed(str) {
  // FNV-1a, good enough for a non-cryptographic shuffle seed.
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Deterministically shuffles `list` using a seed derived from `seedStr`.
 * Returns an array of { value, originalIndex } so callers can map back to
 * the source order (needed to check "is this item now in the right slot").
 */
export function seededShuffle(list, seedStr) {
  const rand = mulberry32(hashSeed(String(seedStr)))
  const arr = list.map((value, originalIndex) => ({ value, originalIndex }))
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}
