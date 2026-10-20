import { type FormEvent, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addDays, addMonths, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns'
import { CalendarHeart, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import type { CalEvent } from '../lib/store'
import { EVENT_COLORS, useData } from '../lib/store'

const key = (d: Date) => format(d, 'yyyy-MM-dd')

const monthSlide = {
  enter: (d: number) => ({ x: d >= 0 ? '40%' : '-40%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (d: number) => ({ x: d >= 0 ? '-40%' : '40%', opacity: 0 }),
}

export default function CalendarApp() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState(() => new Date())
  const [dir, setDir] = useState(0)
  const { events, addEvent, removeEvent } = useData()
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [color, setColor] = useState(0)

  const go = (d: number) => {
    setDir(d)
    setMonth((m) => addMonths(m, d))
  }
  const goToday = () => {
    const t = new Date()
    setDir(t > month ? 1 : -1)
    setMonth(startOfMonth(t))
    setSelected(t)
  }
  const pick = (d: Date) => {
    if (!isSameMonth(d, month)) go(d > month ? 1 : -1)
    setSelected(d)
  }

  const days = useMemo(() => {
    const start = startOfWeek(month, { weekStartsOn: 1 })
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  }, [month])

  const byDate = useMemo(() => {
    const m = new Map<string, CalEvent[]>()
    for (const e of events) m.set(e.date, [...(m.get(e.date) ?? []), e])
    m.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)))
    return m
  }, [events])

  const dayEvents = byDate.get(key(selected)) ?? []

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addEvent({ date: key(selected), time, title: title.trim(), color })
    setTitle('')
  }

  return (
    <div className="flex h-full flex-col gap-5 px-6 py-4 landscape:flex-row">
      <section className="glass flex min-h-0 flex-[3] flex-col rounded-[2rem] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="relative h-12 flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir}>
              <motion.h2
                key={month.toISOString()}
                custom={dir}
                variants={{ enter: (d: number) => ({ y: d >= 0 ? 40 : -40, opacity: 0 }), center: { y: 0, opacity: 1 }, exit: (d: number) => ({ y: d >= 0 ? -40 : 40, opacity: 0 }) }}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute text-4xl font-semibold"
              >
                {format(month, 'MMMM')} <span className="font-light text-muted">{format(month, 'yyyy')}</span>
              </motion.h2>
            </AnimatePresence>
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={goToday} className="glass rounded-full px-5 py-3 text-lg">
              Today
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => go(-1)} className="glass grid h-12 w-12 place-items-center rounded-full" aria-label="Previous month">
              <ChevronLeft />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => go(1)} className="glass grid h-12 w-12 place-items-center rounded-full" aria-label="Next month">
              <ChevronRight />
            </motion.button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center text-sm uppercase tracking-widest text-muted">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={month.toISOString()}
              custom={dir}
              variants={monthSlide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, i) => {
                if (i.offset.x < -80 || i.velocity.x < -500) go(1)
                else if (i.offset.x > 80 || i.velocity.x > 500) go(-1)
              }}
              className="absolute inset-0 grid touch-pan-y grid-cols-7 grid-rows-6 gap-1.5"
            >
              {days.map((d) => {
                const evs = byDate.get(key(d)) ?? []
                const sel = isSameDay(d, selected)
                const inMonth = isSameMonth(d, month)
                return (
                  <motion.button
                    key={key(d)}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => pick(d)}
                    className={`relative isolate flex flex-col items-center justify-center rounded-2xl text-xl ${inMonth ? '' : 'opacity-40'} ${sel ? 'text-onaccent' : ''}`}
                  >
                    {sel && <motion.span layoutId="cal-sel" className="btn-accent absolute inset-0 -z-10 rounded-2xl shadow-lg" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                    {isToday(d) && !sel && <span className="absolute inset-1 -z-10 rounded-2xl ring-2 ring-accent" />}
                    <span className={isToday(d) ? 'font-bold' : ''}>{format(d, 'd')}</span>
                    <span className="mt-1 flex h-2 gap-1">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ background: sel ? 'rgb(var(--on-accent))' : EVENT_COLORS[e.color] }} />
                      ))}
                    </span>
                  </motion.button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="glass flex min-h-0 flex-[2] flex-col rounded-[2rem] p-6">
        <AnimatePresence mode="wait">
          <motion.div key={key(selected)} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mb-4">
            <p className="text-lg text-muted">{isToday(selected) ? 'Today' : format(selected, 'EEEE')}</p>
            <h3 className="text-4xl font-semibold">{format(selected, 'd MMMM')}</h3>
          </motion.div>
        </AnimatePresence>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {dayEvents.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full min-h-[8rem] flex-col items-center justify-center gap-3 text-muted">
                <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
                  <CalendarHeart size={48} />
                </motion.span>
                Nothing planned
              </motion.div>
            ) : (
              dayEvents.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 60 }}
                  className="mb-3 flex items-center gap-4 rounded-2xl bg-fg/5 p-4"
                >
                  <span className="h-10 w-1.5 rounded-full" style={{ background: EVENT_COLORS[e.color] }} />
                  <span className="tabular text-lg text-muted">{e.time}</span>
                  <span className="flex-1 truncate text-xl">{e.title}</span>
                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => removeEvent(e.id)} className="grid h-10 w-10 place-items-center rounded-full bg-fg/10" aria-label="Delete event">
                    <X size={18} />
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New event…" className="field" />
          <div className="flex items-center gap-3">
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="field w-36 py-3" />
            <div className="flex flex-1 gap-2">
              {EVENT_COLORS.map((c, i) => (
                <motion.button
                  type="button"
                  key={i}
                  whileTap={{ scale: 0.8 }}
                  animate={{ scale: color === i ? 1.2 : 1 }}
                  onClick={() => setColor(i)}
                  className={`h-8 w-8 rounded-full ${color === i ? 'ring-2 ring-fg ring-offset-2 ring-offset-transparent' : ''}`}
                  style={{ background: c }}
                  aria-label={`Color ${i + 1}`}
                />
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.9 }} type="submit" className="btn-accent grid h-14 w-14 place-items-center rounded-full" aria-label="Add event">
              <Plus />
            </motion.button>
          </div>
        </form>
      </section>
    </div>
  )
}
