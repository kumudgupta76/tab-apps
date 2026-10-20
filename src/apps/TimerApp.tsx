import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flag, Minus, Pause, Play, Plus, RotateCcw, SkipForward } from 'lucide-react'
import { useNow } from '../lib/hooks'
import { unlockAudio } from '../lib/audio'
import type { TimerMode } from '../lib/timer'
import { durationOf, elapsedOf, formatMs, POMO, useTimer } from '../lib/timer'
import { RollingText } from '../components/RollingText'

const MODES: { id: TimerMode; label: string }[] = [
  { id: 'countdown', label: 'Timer' },
  { id: 'stopwatch', label: 'Stopwatch' },
  { id: 'pomodoro', label: 'Pomodoro' },
]
const PRESETS = [1, 3, 5, 10, 15, 25, 30, 45, 60]
const R = 90
const C = 2 * Math.PI * R

function RoundButton({ onClick, children, label, big }: { onClick: () => void; children: ReactNode; label: string; big?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      aria-label={label}
      className={`${big ? 'btn-accent h-24 w-24 shadow-xl' : 'glass h-16 w-16'} grid place-items-center rounded-full`}
    >
      {children}
    </motion.button>
  )
}

export default function TimerApp() {
  const s = useTimer()
  const now = useNow(s.status === 'running' ? 100 : 1000)
  const elapsed = elapsedOf(s, now)
  const duration = durationOf(s)
  const isStopwatch = s.mode === 'stopwatch'
  const shown = isStopwatch ? elapsed : Math.max(0, duration - elapsed)
  const fraction = isStopwatch ? (elapsed % 60_000) / 60_000 : duration ? Math.min(1, elapsed / duration) : 0
  const ring = isStopwatch ? fraction : 1 - fraction
  const angle = ring * 2 * Math.PI - Math.PI / 2
  const done = s.status === 'done'
  const idle = s.status === 'idle'

  const startPause = () => {
    unlockAudio()
    if (done) s.reset()
    else if (s.status === 'running') s.pause()
    else s.start()
  }

  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-y-auto px-6 py-4 landscape:flex-row landscape:justify-center landscape:gap-16">
      <div className="flex flex-col items-center gap-6">
        <div className="glass relative flex rounded-full p-1.5">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => s.setMode(m.id)} className={`relative isolate rounded-full px-6 py-3 text-lg transition-colors ${s.mode === m.id ? 'text-onaccent' : ''}`}>
              {s.mode === m.id && <motion.span layoutId="mode-pill" className="btn-accent absolute inset-0 -z-10 rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              {m.label}
            </button>
          ))}
        </div>

        <motion.div
          className="relative aspect-square w-[min(60vh,78vw)] landscape:w-[min(62vh,45vw)]"
          animate={done ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={done ? { repeat: Infinity, duration: 0.9 } : {}}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-0 overflow-visible">
            <defs>
              <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" style={{ stopColor: 'rgb(var(--accent))' }} />
                <stop offset="100%" style={{ stopColor: 'rgb(var(--accent2))' }} />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="100" cy="100" r={R} fill="none" strokeWidth="10" className="stroke-fg/10" />
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i / 60) * 2 * Math.PI
              const r1 = i % 5 === 0 ? 72 : 76
              return (
                <line
                  key={i}
                  x1={100 + Math.sin(a) * r1}
                  y1={100 - Math.cos(a) * r1}
                  x2={100 + Math.sin(a) * 79}
                  y2={100 - Math.cos(a) * 79}
                  strokeWidth={i % 5 === 0 ? 1.4 : 0.7}
                  className="stroke-fg/25"
                />
              )
            })}
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="url(#ring)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - ring)}
              transform="rotate(-90 100 100)"
              filter="url(#glow)"
              style={{ transition: s.status === 'running' ? 'stroke-dashoffset 0.1s linear' : 'stroke-dashoffset 0.6s cubic-bezier(.65,0,.35,1)' }}
            />
            {ring > 0.001 && <circle cx={100 + Math.cos(angle) * R} cy={100 + Math.sin(angle) * R} r="7" className="fill-fg" filter="url(#glow)" />}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p key={done ? 'done' : s.mode === 'pomodoro' ? s.phase : s.mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-2 text-xl uppercase tracking-[0.3em] text-muted">
                {done ? "Time's up" : s.mode === 'pomodoro' ? POMO[s.phase].label : s.mode === 'stopwatch' ? 'Stopwatch' : 'Countdown'}
              </motion.p>
            </AnimatePresence>
            <div className="flex items-baseline">
              <RollingText text={formatMs(shown)} className="text-[clamp(3.5rem,11vmin,7.5rem)] font-extralight leading-none" />
              {isStopwatch && <span className="tabular ml-1 text-4xl font-extralight text-muted">.{Math.floor((elapsed % 1000) / 100)}</span>}
            </div>
            {s.mode === 'pomodoro' && (
              <div className="mt-4 flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <motion.span key={i} className="h-3 w-3 rounded-full" animate={{ backgroundColor: i < s.round % 4 ? 'rgb(var(--accent))' : 'rgb(var(--fg) / 0.2)', scale: i === s.round % 4 && s.phase === 'focus' ? [1, 1.4, 1] : 1 }} transition={{ repeat: Infinity, duration: 1.6 }} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex items-center gap-6">
          <RoundButton onClick={s.reset} label="Reset">
            <RotateCcw />
          </RoundButton>
          <RoundButton onClick={startPause} label="Start or pause" big>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={done ? 'r' : s.status === 'running' ? 'p' : 's'} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}>
                {done ? <RotateCcw size={40} /> : s.status === 'running' ? <Pause size={40} /> : <Play size={40} className="ml-1" />}
              </motion.span>
            </AnimatePresence>
          </RoundButton>
          {isStopwatch ? (
            <RoundButton onClick={() => s.status === 'running' && s.lap()} label="Lap">
              <Flag />
            </RoundButton>
          ) : s.mode === 'pomodoro' ? (
            <RoundButton onClick={s.skip} label="Skip phase">
              <SkipForward />
            </RoundButton>
          ) : (
            <RoundButton onClick={() => (idle ? s.setCountdown(s.countdownMs + 60_000) : s.addTime(60_000))} label="Add a minute">
              <span className="text-lg font-semibold">+1m</span>
            </RoundButton>
          )}
        </div>

        <AnimatePresence mode="wait">
          {s.mode === 'countdown' && idle && (
            <motion.div key="presets" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex w-full flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <RoundButton onClick={() => s.setCountdown(s.countdownMs - 60_000)} label="Minus a minute">
                  <Minus />
                </RoundButton>
                <span className="tabular w-28 text-center text-2xl">{Math.round(s.countdownMs / 60_000)} min</span>
                <RoundButton onClick={() => s.setCountdown(s.countdownMs + 60_000)} label="Plus a minute">
                  <Plus />
                </RoundButton>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {PRESETS.map((m, i) => (
                  <motion.button
                    key={m}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => s.setCountdown(m * 60_000)}
                    className={`rounded-full px-5 py-3 text-lg ${s.countdownMs === m * 60_000 ? 'btn-accent' : 'glass'}`}
                  >
                    {m}m
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {isStopwatch && s.laps.length > 0 && (
            <motion.ul key="laps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass no-scrollbar max-h-56 w-full overflow-y-auto rounded-3xl p-3">
              <AnimatePresence initial={false}>
                {s.laps.map((t, i) => (
                  <motion.li key={s.laps.length - i} layout initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="tabular flex justify-between rounded-2xl px-4 py-3 text-lg">
                    <span className="text-muted">Lap {s.laps.length - i}</span>
                    <span>+{formatMs(t - (s.laps[i + 1] ?? 0), true)}</span>
                    <span>{formatMs(t, true)}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
          {s.mode === 'pomodoro' && (
            <motion.p key="pomo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-lg text-muted">
              Round {(s.round % 4) + 1} of 4 · {s.round} focus sessions done
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
