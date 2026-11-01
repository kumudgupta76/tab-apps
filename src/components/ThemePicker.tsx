import { AnimatePresence, motion } from 'framer-motion'
import { Check, RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { THEMES, themeForDate } from '../lib/themes'
import { useData, useUi } from '../lib/store'
import { useActiveTheme } from '../lib/hooks'

/** Switches to a random theme other than the current one. */
export function useRefreshTheme() {
  const current = useActiveTheme()
  const [spins, setSpins] = useState(0)
  const refresh = () => {
    const others = THEMES.filter((t) => t.id !== current.id)
    useData.getState().setThemeMode(others[Math.floor(Math.random() * others.length)].id)
    setSpins((s) => s + 1)
  }
  return { refresh, spins }
}

export function RefreshThemeButton({ className = '' }: { className?: string }) {
  const { refresh, spins } = useRefreshTheme()
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={refresh} className={className} aria-label="New theme" title="New theme">
      <motion.span className="grid place-items-center" animate={{ rotate: spins * 360 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
        <RefreshCw className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
      </motion.span>
    </motion.button>
  )
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className="glass flex w-full items-center justify-between gap-4 rounded-3xl px-5 py-4 text-left text-lg"
    >
      {label}
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${on ? 'btn-accent' : 'bg-fg/20'}`}>
        <motion.span
          className="absolute top-1 h-6 w-6 rounded-full bg-white shadow"
          animate={{ left: on ? 28 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </span>
    </motion.button>
  )
}

/** Settings sheet: display options and themes. */
export function ThemePicker() {
  const open = useUi((s) => s.themePickerOpen)
  const close = () => useUi.getState().setThemePicker(false)
  const { themeMode, setThemeMode, showSeconds, setShowSeconds } = useData()
  const todays = themeForDate(new Date())
  const { refresh, spins } = useRefreshTheme()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            className="glass fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88vh] max-w-4xl overflow-y-auto rounded-t-[2.5rem] bg-base/80 p-8 pb-[max(2rem,env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => (i.offset.y > 120 || i.velocity.y > 600) && close()}
          >
            <div className="mx-auto mb-6 h-1.5 w-14 rounded-full bg-fg/25" />
            <h2 className="mb-6 text-3xl font-semibold">Settings</h2>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted">Clock</h3>
            <div className="mb-8">
              <Toggle label="Show seconds" on={showSeconds} onChange={setShowSeconds} />
            </div>

            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Themes</h3>
              <motion.button whileTap={{ scale: 0.94 }} onClick={refresh} className="btn-accent flex items-center gap-2 rounded-full px-4 py-2 font-semibold">
                <motion.span animate={{ rotate: spins * 360 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }} className="grid place-items-center">
                  <RefreshCw size={18} />
                </motion.span>
                New theme
              </motion.button>
            </div>
            <p className="mb-4 text-muted">Pick one, or let TabDesk surprise you with a new theme every day.</p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setThemeMode('daily')}
              className={`glass mb-5 flex w-full items-center gap-4 rounded-3xl p-5 text-left ${themeMode === 'daily' ? 'ring-2 ring-accent' : ''}`}
            >
              <span className="btn-accent grid h-12 w-12 place-items-center rounded-2xl">
                <Sparkles />
              </span>
              <span className="flex-1">
                <span className="block text-xl font-semibold">New theme every day</span>
                <span className="text-muted">
                  Today: {todays.emoji} {todays.name}
                </span>
              </span>
              {themeMode === 'daily' && <Check className="text-accent" />}
            </motion.button>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {THEMES.map((t, i) => (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setThemeMode(t.id)}
                  className="relative overflow-hidden rounded-3xl p-4 text-left"
                  style={{ background: t.base, color: t.fg, boxShadow: themeMode === t.id ? `0 0 0 3px ${t.accent}` : undefined }}
                >
                  <div className="mb-6 flex -space-x-3">
                    {t.blobs.map((c) => (
                      <span key={c} className="h-9 w-9 rounded-full border-2" style={{ background: c, borderColor: t.base }} />
                    ))}
                  </div>
                  <div className="text-lg font-semibold">
                    {t.emoji} {t.name}
                  </div>
                  {themeMode === t.id && (
                    <motion.span layoutId="theme-check" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full" style={{ background: t.accent, color: t.onAccent }}>
                      <Check size={16} />
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
