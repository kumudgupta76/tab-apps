import { AnimatePresence, motion } from 'framer-motion'

/** Text whose characters roll vertically when they change (clock/timer digits). */
export function RollingText({ text, className = '', gradient = false }: { text: string; className?: string; gradient?: boolean }) {
  const chars = text.split('')
  // background-clip:text on a parent doesn't reach glyphs inside animated (composited) children on
  // WebKit/Android Chrome, leaving them invisible. Paint the gradient on each glyph instead, sliced so
  // the whole string still reads as one continuous gradient.
  const glyphStyle = (i: number) =>
    gradient
      ? {
          backgroundSize: `${chars.length * 100}% 100%`,
          backgroundPosition: `${chars.length > 1 ? (i / (chars.length - 1)) * 100 : 0}% 0`,
        }
      : undefined
  return (
    <span className={`tabular inline-flex ${className}`} aria-label={text}>
      {chars.map((ch, i) => (
        <span key={chars.length - i} className="relative inline-block overflow-hidden" aria-hidden>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              className={gradient ? 'text-gradient inline-block' : 'inline-block'}
              style={glyphStyle(i)}
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
