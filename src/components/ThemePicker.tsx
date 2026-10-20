import { AnimatePresence, motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { THEMES, themeForDate } from '../lib/themes'
import { useData, useUi } from '../lib/store'

export function ThemePicker() {
  const open = useUi((s) => s.themePickerOpen)
  const close = () => useUi.getState().setThemePicker(false)
  const { themeMode, setThemeMode } = useData()
  const todays = themeForDate(new Date())

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
            <h2 className="mb-1 text-3xl font-semibold">Themes</h2>
            <p className="mb-6 text-muted">Pick one, or let TabDesk surprise you with a new theme every day.</p>

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
