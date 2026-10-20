import { AnimatePresence, motion } from 'framer-motion'
import type { Theme } from '../lib/themes'

const PATHS = [
  { x: ['-10%', '25%', '-5%'], y: ['-10%', '15%', '30%'], d: 26 },
  { x: ['55%', '20%', '60%'], y: ['50%', '10%', '-10%'], d: 32 },
  { x: ['10%', '50%', '30%'], y: ['60%', '45%', '5%'], d: 38 },
]

export function AnimatedBackground({ theme }: { theme: Theme }) {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={theme.id}
          className="absolute inset-0"
          style={{ background: theme.base }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {theme.blobs.map((c, i) => (
            <motion.div
              key={i}
              className="absolute h-[75vmax] w-[75vmax] rounded-full will-change-transform"
              style={{
                left: 0,
                top: 0,
                background: `radial-gradient(circle, ${c} 0%, transparent 65%)`,
                opacity: theme.dark ? 0.35 : 0.6,
              }}
              animate={{ x: PATHS[i].x, y: PATHS[i].y, scale: [1, 1.15, 0.95] }}
              transition={{ duration: PATHS[i].d, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgb(var(--base) / 0.55) 100%)' }}
      />
    </div>
  )
}
