import { motion } from 'framer-motion'
import { format, isToday } from 'date-fns'
import { useData } from '../lib/store'
import { useNow } from '../lib/hooks'
import { RollingText } from '../components/RollingText'

export default function ClockApp() {
  const now = new Date(useNow(1000))
  const { showSeconds, setShowSeconds, events } = useData()
  const next = events
    .filter((e) => isToday(new Date(e.date + 'T00:00')) && e.time >= format(now, 'HH:mm'))
    .sort((a, b) => a.time.localeCompare(b.time))[0]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
      <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[clamp(1.25rem,3.5vmin,2.25rem)] text-muted">
        {format(now, 'EEEE, d MMMM yyyy')}
      </motion.p>

      <motion.div layout transition={{ type: 'spring', stiffness: 200, damping: 26 }} className="flex items-baseline">
        <RollingText
          text={format(now, 'HH:mm')}
          className={`text-gradient font-extralight leading-none tracking-tight transition-[font-size] duration-500 ${
            showSeconds ? 'text-[min(30vw,40vh)]' : 'text-[min(38vw,52vh)]'
          }`}
        />
        {showSeconds && (
          <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="ml-[1vw]">
            <RollingText text={format(now, 'ss')} className="text-[min(13vw,18vh)] font-extralight leading-none text-muted" />
          </motion.span>
        )}
      </motion.div>

      <p className="h-8 text-[clamp(1rem,2.5vmin,1.5rem)] text-muted">{next ? `Next: ${next.time} · ${next.title}` : ''}</p>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => setShowSeconds(!showSeconds)}
        role="switch"
        aria-checked={showSeconds}
        className="glass flex items-center gap-4 rounded-full py-3 pl-6 pr-3 text-lg"
      >
        Show seconds
        <span className={`relative h-8 w-14 rounded-full transition-colors ${showSeconds ? 'btn-accent' : 'bg-fg/20'}`}>
          <motion.span
            className="absolute top-1 h-6 w-6 rounded-full bg-white shadow"
            animate={{ left: showSeconds ? 28 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </span>
      </motion.button>
    </div>
  )
}
