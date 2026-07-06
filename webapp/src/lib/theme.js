// Dark-mode theme persistence. Kept intentionally tiny: the actual
// "no flash of wrong theme" logic lives as an inline script in index.html
// (runs before React mounts), this module only handles runtime toggling.

const KEY = 'stag-claude-theme'

export function getStoredTheme() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function getPreferredTheme() {
  const stored = getStoredTheme()
  if (stored === 'light' || stored === 'dark') return stored
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // ignore (private browsing / storage disabled)
  }
  applyTheme(theme)
}
