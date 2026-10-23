import { useCallback, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import type { AppId } from './lib/store'
import { useActiveTheme, useTimerTicker, useWakeLock } from './lib/hooks'
import { AnimatedBackground } from './components/AnimatedBackground'
import type { Origin } from './components/Launcher'
import { Launcher } from './components/Launcher'
import { AppShell } from './components/AppShell'
import { ThemePicker } from './components/ThemePicker'
import { Toast } from './components/Toast'

const center = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

export default function App() {
  const theme = useActiveTheme()
  useWakeLock()
  useTimerTicker()

  const [open, setOpen] = useState<{ id: AppId; origin: Origin } | null>(() => ({ id: 'clock', origin: center() }))
  const close = useCallback(() => setOpen(null), [])
  const show = (id: AppId) => setOpen((o) => ({ id, origin: o?.origin ?? center() }))

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 overflow-hidden text-fg">
        <AnimatedBackground theme={theme} />
        <Launcher theme={theme} dimmed={!!open} onOpen={(id, origin) => setOpen({ id, origin })} />
        <AnimatePresence initial={false}>{open && <AppShell key="shell" id={open.id} origin={open.origin} onClose={close} onSwitch={show} />}</AnimatePresence>
        <ThemePicker />
        <Toast onTap={() => show('timer')} />
      </div>
    </MotionConfig>
  )
}
