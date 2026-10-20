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
      <RollingText text={formatMs(shown)} className="text-6xl font-light" />
      <p className="mt-2 text-lg text-muted">
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
      <div className="text-6xl font-light">{format(new Date(), 'd MMM')}</div>
      <p className="mt-2 truncate text-lg text-muted">
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
      <div className="text-6xl font-light">{open.length}</div>
      <p className="mt-2 truncate text-lg text-muted">{open.length ? open.slice(0, 2).map((t) => t.text).join(' · ') : 'All clear ✨'}</p>
    </>
  )
}

const PREVIEWS: Record<AppId, () => JSX.Element> = { timer: TimerPreview, calendar: CalendarPreview, todo: TodoPreview }

export function Launcher({ onOpen, dimmed, theme }: { onOpen: (id: AppId, o: Origin) => void; dimmed: boolean; theme: Theme }) {
  const now = new Date(useNow(1000))
  const { isFullscreen, toggle, supported } = useFullscreen()
  const themeMode = useData((s) => s.themeMode)

  return (
    <motion.main
      className="safe-pad absolute inset-0 flex flex-col"
      animate={dimmed ? { scale: 0.92, opacity: 0, filter: 'blur(8px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
      style={{ pointerEvents: dimmed ? 'none' : 'auto' }}
    >
      <div className="flex flex-1 flex-col px-8 pb-8 pt-8 landscape:px-12">
        <header className="flex items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xl text-muted">
              {greeting(now.getHours())} · {format(now, 'EEEE, d MMMM')}
            </p>
            <RollingText text={format(now, 'HH:mm')} className="text-gradient text-[clamp(5rem,14vmin,10rem)] font-extralight leading-none tracking-tight" />
          </motion.div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => useUi.getState().setThemePicker(true)}
              className="glass flex h-14 items-center gap-2 rounded-full px-5 text-lg"
            >
              <Palette size={22} />
              <span className="hidden sm:inline">
                {theme.emoji} {theme.name}
                {themeMode === 'daily' && <span className="text-muted"> · today</span>}
              </span>
            </motion.button>
            {supported && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggle} className="glass grid h-14 w-14 place-items-center rounded-full" aria-label="Toggle full screen">
                {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
              </motion.button>
            )}
          </div>
        </header>

        <div className="mt-8 grid flex-1 grid-cols-2 gap-6 landscape:grid-cols-3">
          {APPS.map((app, i) => {
            const Preview = PREVIEWS[app.id]
            const Icon = app.icon
            return (
              <motion.button
                key={app.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
                whileTap={{ scale: 0.96 }}
                onClick={(e) => onOpen(app.id, { x: e.clientX, y: e.clientY })}
                className={`glass group relative flex min-h-[12rem] flex-col justify-between overflow-hidden rounded-[2.5rem] p-8 text-left ${
                  i === 0 ? 'col-span-2 landscape:col-span-1' : ''
                }`}
              >
                <motion.div
                  className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 30, 0] }}
                  transition={{ duration: 6 + i, repeat: Infinity }}
                />
                <div className="flex items-center gap-4">
                  <span className="btn-accent grid h-16 w-16 place-items-center rounded-2xl shadow-lg">
                    <Icon size={32} />
                  </span>
                  <span className="text-3xl font-semibold">{app.name}</span>
                </div>
                <div className="relative mt-6 min-w-0">
                  <Preview />
                </div>
              </motion.button>
            )
          })}
        </div>

        {!isStandalone() && (
          <p className="mt-6 text-center text-muted">Tip: use “Add to Home Screen” / “Install app” for true full-screen mode.</p>
        )}
      </div>
    </motion.main>
  )
}
