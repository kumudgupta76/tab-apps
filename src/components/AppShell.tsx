import { type MouseEvent, type TouchEvent, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { House, Maximize, Minimize, Palette } from 'lucide-react'
import { APPS } from '../apps/registry'
import type { AppId } from '../lib/store'
import { useUi } from '../lib/store'
import { useFullscreen } from '../lib/hooks'
import type { Origin } from './Launcher'
import { BatteryIndicator } from './Battery'

const radius = () => Math.hypot(window.innerWidth, window.innerHeight)
const SWIPE_PX = 70

const slide = {
  enter: (d: number) => ({ x: `${d * 30}%`, opacity: 0, scale: 0.96 }),
  center: { x: '0%', opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: `${d * -30}%`, opacity: 0, scale: 0.96 }),
}

/** Elements with their own horizontal gestures (or text entry) opt out with data-noswipe. */
const ignores = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.('[data-noswipe], input, textarea, select')

const btn = 'glass grid h-11 w-11 place-items-center rounded-full sm:h-14 sm:w-14'

export function AppShell({ id, origin, onClose, onSwitch }: { id: AppId; origin: Origin; onClose: () => void; onSwitch: (id: AppId) => void }) {
  const idx = APPS.findIndex((a) => a.id === id)
  const prevIdx = useRef(idx)
  const lastDir = useRef(0)
  if (idx !== prevIdx.current) lastDir.current = idx > prevIdx.current ? 1 : -1
  const dir = lastDir.current
  useEffect(() => {
    prevIdx.current = idx
  }, [idx])

  const go = useCallback((step: number) => {
    lastDir.current = step
    onSwitch(APPS[(idx + step + APPS.length) % APPS.length].id)
  }, [idx, onSwitch])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ignores(e.target)) return
      if (e.key === 'Escape' && !document.fullscreenElement) onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, go])

  // Touch events keep firing while the browser scrolls (pointer events get cancelled), so use them for swipes.
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const begin = (x: number, y: number, target: EventTarget | null) => {
    start.current = ignores(target) ? null : { x, y }
  }
  const end = (x: number, y: number) => {
    const s = start.current
    start.current = null
    if (!s) return
    const dx = x - s.x
    const dy = y - s.y
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true
      setTimeout(() => (swiped.current = false), 50)
      go(dx < 0 ? 1 : -1)
    }
  }
  const gestures = {
    onTouchStart: (e: TouchEvent) => e.touches.length === 1 && begin(e.touches[0].clientX, e.touches[0].clientY, e.target),
    onTouchEnd: (e: TouchEvent) => end(e.changedTouches[0].clientX, e.changedTouches[0].clientY),
    onMouseDown: (e: MouseEvent) => begin(e.clientX, e.clientY, e.target),
    onMouseUp: (e: MouseEvent) => end(e.clientX, e.clientY),
    onClickCapture: (e: MouseEvent) => {
      if (swiped.current) {
        e.stopPropagation()
        e.preventDefault()
      }
    },
  }

  const { isFullscreen, toggle, supported } = useFullscreen()
  const app = APPS[idx]
  const at = `${origin.x}px ${origin.y}px`

  return (
    <motion.div
      className="safe-pad fixed inset-0 z-20 flex flex-col"
      initial={{ clipPath: `circle(0px at ${at})` }}
      animate={{ clipPath: `circle(${radius()}px at ${at})` }}
      exit={{ clipPath: `circle(0px at ${at})` }}
      transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
    >
      <div className="absolute inset-0 -z-10 bg-base/60 backdrop-blur-xl" />

      <header className="flex items-center justify-between gap-2 px-3 pt-3 sm:gap-4 sm:px-6 sm:pt-5">
        <div className="flex flex-1 basis-0 justify-start">
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className={btn} aria-label="Home">
            <House className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>
        </div>

        <div className="flex min-w-0 flex-col items-center gap-1.5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.h1
              key={app.id}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              className="flex items-center gap-2 truncate text-xl font-semibold sm:gap-3 sm:text-3xl"
            >
              <app.icon className="h-6 w-6 shrink-0 text-accent sm:h-8 sm:w-8" />
              {app.name}
            </motion.h1>
          </AnimatePresence>
          <div className="flex gap-1.5" role="tablist" aria-label="Views">
            {APPS.map((a, i) => (
              <button
                key={a.id}
                role="tab"
                aria-selected={a.id === id}
                aria-label={a.name}
                onClick={() => i !== idx && go(i - idx)}
                className="grid h-4 place-items-center px-0.5"
              >
                <motion.span
                  className="block h-1.5 rounded-full"
                  animate={{ width: a.id === id ? 20 : 6, backgroundColor: a.id === id ? 'rgb(var(--accent))' : 'rgb(var(--fg) / 0.3)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 basis-0 justify-end gap-2 sm:gap-3">
          <BatteryIndicator />
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => useUi.getState().setThemePicker(true)} className={btn} aria-label="Themes">
            <Palette className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
          </motion.button>
          {supported && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggle} className={`${btn} hidden sm:grid`} aria-label="Toggle full screen">
              {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </motion.button>
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]" {...gestures}>
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={app.id}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="absolute inset-0"
          >
            <app.Component />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
