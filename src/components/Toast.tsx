import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useUi } from '../lib/store'

export function Toast({ onTap }: { onTap: () => void }) {
  const toast = useUi((s) => s.toast)
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => useUi.getState().showToast(null), 8000)
    return () => clearTimeout(id)
  }, [toast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.button
          key={toast}
          className="btn-accent fixed left-1/2 top-[max(1.5rem,env(safe-area-inset-top))] z-50 rounded-full px-8 py-4 text-xl font-semibold shadow-2xl"
          initial={{ y: -120, x: '-50%', scale: 0.8 }}
          animate={{ y: 0, x: '-50%', scale: [1, 1.06, 1] }}
          exit={{ y: -120, x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, scale: { repeat: Infinity, duration: 1.2 } }}
          onClick={() => {
            useUi.getState().showToast(null)
            onTap()
          }}
        >
          {toast}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
