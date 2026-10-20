import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { House, Maximize, Minimize, Palette } from 'lucide-react'
import { APPS } from '../apps/registry'
import type { AppId } from '../lib/store'
import { useUi } from '../lib/store'
import { useFullscreen } from '../lib/hooks'
import type { Origin } from './Launcher'

const radius = () => Math.hypot(window.innerWidth, window.innerHeight)

const slide = {
  enter: (d: number) => ({ x: `${d * 30}%`, opacity: 0, scale: 0.96 }),
  center: { x: '0%', opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: `${d * -30}%`, opacity: 0, scale: 0.96 }),
}

export function AppShell({ id, origin, onClose, onSwitch }: { id: AppId; origin: Origin; onClose: () => void; onSwitch: (id: AppId) => void }) {
  const idx = APPS.findIndex((a) => a.id === id)
  const prevIdx = useRef(idx)
  const dir = idx === prevIdx.current ? 0 : idx > prevIdx.current ? 1 : -1
  useEffect(() => {
    prevIdx.current = idx
  }, [idx])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !document.fullscreenElement && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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

      <header className="flex items-center justify-between gap-4 px-6 pt-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="glass grid h-14 w-14 place-items-center rounded-full" aria-label="Home">
          <House size={24} />
        </motion.button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.h1
            key={app.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-3 text-3xl font-semibold"
          >
            <app.icon size={30} className="text-accent" />
            {app.name}
          </motion.h1>
        </AnimatePresence>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => useUi.getState().setThemePicker(true)} className="glass grid h-14 w-14 place-items-center rounded-full" aria-label="Themes">
            <Palette size={22} />
          </motion.button>
          {supported && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggle} className="glass grid h-14 w-14 place-items-center rounded-full" aria-label="Toggle full screen">
              {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </motion.button>
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
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

      <nav className="flex justify-center pb-5 pt-2">
        <div className="glass flex gap-2 rounded-full p-2">
          {APPS.map((a) => (
            <motion.button
              key={a.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSwitch(a.id)}
              className={`relative isolate flex h-14 items-center gap-2 rounded-full px-6 text-lg transition-colors ${a.id === id ? 'text-onaccent' : ''}`}
            >
              {a.id === id && (
                <motion.span layoutId="dock-pill" className="btn-accent absolute inset-0 -z-10 rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <a.icon size={22} />
              <span className="hidden sm:inline">{a.name}</span>
            </motion.button>
          ))}
        </div>
      </nav>
    </motion.div>
  )
}
