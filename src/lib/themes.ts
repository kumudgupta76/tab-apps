import { differenceInCalendarDays } from 'date-fns'

export interface Theme {
  id: string
  name: string
  emoji: string
  dark: boolean
  base: string
  blobs: [string, string, string]
  fg: string
  muted: string
  accent: string
  accent2: string
  onAccent: string
}

export const THEMES: Theme[] = [
  { id: 'aurora', name: 'Aurora', emoji: '🌌', dark: true, base: '#0b1026', blobs: ['#22d3ee', '#a78bfa', '#34d399'], fg: '#f8fafc', muted: '#94a3b8', accent: '#22d3ee', accent2: '#a78bfa', onAccent: '#0b1026' },
  { id: 'sunset', name: 'Sunset', emoji: '🌇', dark: true, base: '#1f0a1e', blobs: ['#fb7185', '#f59e0b', '#c026d3'], fg: '#fff7ed', muted: '#f0abfc', accent: '#fb923c', accent2: '#f43f5e', onAccent: '#1f0a1e' },
  { id: 'candy', name: 'Candy', emoji: '🍬', dark: false, base: '#fff1f7', blobs: ['#f9a8d4', '#c4b5fd', '#93c5fd'], fg: '#3b0764', muted: '#a21caf', accent: '#db2777', accent2: '#7c3aed', onAccent: '#ffffff' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', dark: true, base: '#031b2e', blobs: ['#0ea5e9', '#2563eb', '#14b8a6'], fg: '#f0f9ff', muted: '#7dd3fc', accent: '#38bdf8', accent2: '#2dd4bf', onAccent: '#031b2e' },
  { id: 'paper', name: 'Paper', emoji: '📜', dark: false, base: '#f5f1e8', blobs: ['#fde68a', '#fecaca', '#bfdbfe'], fg: '#1c1917', muted: '#78716c', accent: '#ea580c', accent2: '#0d9488', onAccent: '#ffffff' },
  { id: 'forest', name: 'Forest', emoji: '🌲', dark: true, base: '#07170f', blobs: ['#22c55e', '#84cc16', '#0f766e'], fg: '#f0fdf4', muted: '#86efac', accent: '#4ade80', accent2: '#a3e635', onAccent: '#07170f' },
  { id: 'citrus', name: 'Citrus', emoji: '🍋', dark: false, base: '#f7fee7', blobs: ['#bef264', '#fde047', '#6ee7b7'], fg: '#1a2e05', muted: '#4d7c0f', accent: '#65a30d', accent2: '#ca8a04', onAccent: '#ffffff' },
  { id: 'midnight', name: 'Midnight', emoji: '🌙', dark: true, base: '#05030f', blobs: ['#4f46e5', '#7e22ce', '#1d4ed8'], fg: '#eef2ff', muted: '#a5b4fc', accent: '#818cf8', accent2: '#e879f9', onAccent: '#05030f' },
]

const EPOCH = new Date(2024, 0, 1)

/** Rotates through THEMES so each calendar day gets a different theme. */
export function themeForDate(date: Date): Theme {
  const days = differenceInCalendarDays(date, EPOCH)
  return THEMES[((days % THEMES.length) + THEMES.length) % THEMES.length]
}

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

export function applyTheme(t: Theme) {
  const s = document.documentElement.style
  s.setProperty('--base', rgb(t.base))
  s.setProperty('--fg', rgb(t.fg))
  s.setProperty('--muted', rgb(t.muted))
  s.setProperty('--accent', rgb(t.accent))
  s.setProperty('--accent2', rgb(t.accent2))
  s.setProperty('--on-accent', rgb(t.onAccent))
  s.setProperty('--glass-a', t.dark ? '0.08' : '0.55')
  s.setProperty('--glass-b', t.dark ? '0.12' : '0.8')
  document.documentElement.style.colorScheme = t.dark ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.base)
}
