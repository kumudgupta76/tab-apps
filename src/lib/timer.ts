import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = 'countdown' | 'stopwatch' | 'pomodoro'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'
export type PomoPhase = 'focus' | 'short' | 'long'

export const POMO: Record<PomoPhase, { ms: number; label: string }> = {
  focus: { ms: 25 * 60_000, label: 'Focus' },
  short: { ms: 5 * 60_000, label: 'Short break' },
  long: { ms: 15 * 60_000, label: 'Long break' },
}

interface TimerState {
  mode: TimerMode
  status: TimerStatus
  countdownMs: number
  extraMs: number
  startedAt: number | null
  accMs: number
  laps: number[]
  phase: PomoPhase
  round: number
  setMode: (m: TimerMode) => void
  setCountdown: (ms: number) => void
  start: () => void
  pause: () => void
  reset: () => void
  addTime: (ms: number) => void
  lap: () => void
  complete: () => void
  skip: () => void
}

export const elapsedOf = (s: Pick<TimerState, 'accMs' | 'status' | 'startedAt'>, now: number) =>
  s.accMs + (s.status === 'running' && s.startedAt ? now - s.startedAt : 0)

export const durationOf = (s: Pick<TimerState, 'mode' | 'countdownMs' | 'extraMs' | 'phase'>) =>
  s.mode === 'countdown' ? s.countdownMs + s.extraMs : s.mode === 'pomodoro' ? POMO[s.phase].ms + s.extraMs : 0

const cleared = { status: 'idle' as const, startedAt: null, accMs: 0, extraMs: 0, laps: [] }

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => {
      const advancePomo = () => {
        const { phase, round } = get()
        if (phase === 'focus') {
          const r = round + 1
          set({ ...cleared, round: r, phase: r % 4 === 0 ? 'long' : 'short' })
        } else set({ ...cleared, phase: 'focus' })
      }
      return {
        mode: 'countdown',
        countdownMs: 5 * 60_000,
        phase: 'focus',
        round: 0,
        ...cleared,
        setMode: (mode) => set({ ...cleared, mode }),
        setCountdown: (ms) => set({ countdownMs: Math.max(5_000, Math.min(ms, 99 * 60_000)) }),
        start: () => {
          if (get().status === 'done') return
          set({ status: 'running', startedAt: Date.now() })
        },
        pause: () => set((s) => ({ status: 'paused', accMs: elapsedOf(s, Date.now()), startedAt: null })),
        reset: () => set({ ...cleared }),
        addTime: (ms) => set((s) => ({ extraMs: s.extraMs + ms })),
        lap: () => set((s) => ({ laps: [elapsedOf(s, Date.now()), ...s.laps] })),
        complete: () => {
          if (get().mode === 'pomodoro') advancePomo()
          else set((s) => ({ status: 'done', accMs: durationOf(s), startedAt: null }))
        },
        skip: advancePomo,
      }
    },
    { name: 'tabdesk-timer' },
  ),
)

export function formatMs(ms: number, withTenths = false) {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  const main = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  return withTenths ? `${main}.${Math.floor((ms % 1000) / 100)}` : main
}

export function timerToastMessage(mode: TimerMode, nextPhase: PomoPhase) {
  if (mode !== 'pomodoro') return "⏰ Time's up!"
  return nextPhase === 'focus' ? '🎯 Break over — time to focus' : '☕ Focus done — take a break'
}
