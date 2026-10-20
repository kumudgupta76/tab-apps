import { AnimatePresence, motion } from 'framer-motion'

/** Text whose characters roll vertically when they change (clock/timer digits). */
export function RollingText({ text, className = '' }: { text: string; className?: string }) {
  const chars = text.split('')
  return (
    <span className={`tabular inline-flex ${className}`} aria-label={text}>
      {chars.map((ch, i) => (
        <span key={chars.length - i} className="relative inline-block overflow-hidden" aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              className="inline-block"
              initial={{ y: '-90%', opacity: 0, filter: 'blur(4px)' }}
              animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: '90%', opacity: 0, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}
