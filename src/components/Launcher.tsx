import { motion } from 'framer-motion'
import { format, isToday } from 'date-fns'
import { Maximize, Minimize, Palette } from 'lucide-react'
import { APPS } from '../apps/registry'
import type { AppId } from '../lib/store'
import { useData, useUi } from '../lib/store'
import { isStandalone, useFullscreen, useNow } from '../lib/hooks'
import type { Theme } from '../lib/themes'
import { durationOf, elapsedOf, formatMs, POMO, useTimer } from '../lib/timer'
import { RollingText } from './RollingText'
import { BatteryIndicator } from './Battery'

export type Origin = { x: number; y: number }

function greeting(h: number) {
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function TimerPreview() {
  const s = useTimer()
  const now = useNow(s.status === 'running' ? 250 : 5000)
  const elapsed = elapsedOf(s, now)
  const shown = s.mode === 'stopwatch' ? elapsed : Math.max(0, durationOf(s) - elapsed)
  const label =
    s.status === 'idle' ? 'Ready' : s.status === 'done' ? "Time's up!" : s.status === 'paused' ? 'Paused' : s.mode === 'pomodoro' ? POMO[s.phase].label : 'Running'
  return (
    <>
      <RollingText text={formatMs(shown)} className="text-5xl font-light sm:text-6xl" />
      <p className="mt-2 text-[1rem] text-muted sm:text-lg">
        {label} · {s.mode}
      </p>
    </>
  )
}

function CalendarPreview() {
  const events = useData((s) => s.events)
  const today = events.filter((e) => isToday(new Date(e.date + 'T00:00'))).sort((a, b) => a.time.localeCompare(b.time))
  return (
    <>
      <div className="text-5xl font-light sm:text-6xl">{format(new Date(), 'd MMM')}</div>
      <p className="mt-2 truncate text-[1rem] text-muted sm:text-lg">
        {today.length ? `${today.length} today · next: ${today[0].time} ${today[0].title}` : 'Nothing planned today'}
      </p>
    </>
  )
}

function TodoPreview() {
  const todos = useData((s) => s.todos)
  const open = todos.filter((t) => !t.done)
  return (
    <>
      <div className="text-5xl font-light sm:text-6xl">{open.length}</div>
      <p className="mt-2 truncate text-[1rem] text-muted sm:text-lg">{open.length ? open.slice(0, 2).map((t) => t.text).join(' · ') : 'All clear ✨'}</p>
    </>
  )
}

const PREVIEWS: Partial<Record<AppId, () => JSX.Element>> = { timer: TimerPreview, calendar: CalendarPreview, todo: TodoPreview }
const CARD_APPS = APPS.filter((a) => PREVIEWS[a.id])

export function Launcher({ onOpen, dimmed, theme }: { onOpen: (id: AppId, o: Origin) => void; dimmed: boolean; theme: Theme }) {
  const now = new Date(useNow(1000))
  const { isFullscreen, toggle, supported } = useFullscreen()
  const themeMode = useData((s) => s.themeMode)
  const showSeconds = useData((s) => s.showSeconds)

  return (
    <motion.main
      className="safe-pad absolute inset-0 flex flex-col"
      animate={dimmed ? { scale: 0.92, opacity: 0, filter: 'blur(8px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
      style={{ pointerEvents: dimmed ? 'none' : 'auto' }}
    >
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-4 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-8 landscape:sm:px-12">
        <header className="flex items-start justify-between gap-3 sm:gap-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
            <p className="truncate text-[1rem] text-muted sm:text-xl">
              {greeting(now.getHours())} · {format(now, 'EEEE, d MMMM')}
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={(e) => onOpen('clock', { x: e.clientX, y: e.clientY })}
              className="flex items-baseline text-left"
              aria-label="Open full-screen clock"
            >
              <RollingText text={format(now, 'HH:mm')} className="text-gradient text-[clamp(3.5rem,14vmin,10rem)] font-extralight leading-none tracking-tight" />
              {showSeconds && <RollingText text={format(now, 'ss')} className="ml-2 text-[clamp(1.5rem,6vmin,4.5rem)] font-extralight leading-none text-muted" />}
            </motion.button>
          </motion.div>
          <div className="flex shrink-0 gap-2 sm:gap-3">
            <BatteryIndicator />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => useUi.getState().setThemePicker(true)}
              className="glass flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-lg sm:h-14 sm:px-5"
              aria-label="Themes"
            >
              <Palette size={22} />
              <span className="hidden md:inline">
                {theme.emoji} {theme.name}
                {themeMode === 'daily' && <span className="text-muted"> · today</span>}
              </span>
            </motion.button>
            {supported && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggle} className="glass hidden h-14 w-14 place-items-center rounded-full sm:grid" aria-label="Toggle full screen">
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </motion.button>
            )}
          </div>
        </header>

        <div className="mt-5 grid flex-1 grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 landscape:grid-cols-3">
          {CARD_APPS.map((app, i) => {
            const Preview = PREVIEWS[app.id]!
            const Icon = app.icon
            return (
              <motion.button
                key={app.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => onOpen(app.id, { x: e.clientX, y: e.clientY })}
                className={`glass group relative flex min-h-[9rem] flex-col justify-between overflow-hidden rounded-[2rem] p-5 text-left sm:min-h-[12rem] sm:rounded-[2.5rem] sm:p-8 ${
                  i === 0 ? 'sm:col-span-2 landscape:col-span-1' : ''
                }`}
              >
                <motion.div
                  className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 30, 0] }}
                  transition={{ duration: 6 + i, repeat: Infinity }}
                />
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="btn-accent grid h-12 w-12 place-items-center rounded-2xl shadow-lg sm:h-16 sm:w-16">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </span>
                  <span className="text-2xl font-semibold sm:text-3xl">{app.name}</span>
                </div>
                <div className="relative mt-4 min-w-0 sm:mt-6">
                  <Preview />
                </div>
              </motion.button>
            )
          })}
        </div>

        {!isStandalone() && (
          <p className="mt-6 hidden text-center text-muted sm:block">Tip: use “Add to Home Screen” / “Install app” for true full-screen mode.</p>
        )}
      </div>
    </motion.main>
  )
}
