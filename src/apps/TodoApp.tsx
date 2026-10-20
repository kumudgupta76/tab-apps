import { type FormEvent, type PointerEvent, useEffect, useState } from 'react'
import { AnimatePresence, motion, Reorder, useDragControls, useMotionValue, useTransform } from 'framer-motion'
import { Check, GripVertical, Plus, Trash2, X } from 'lucide-react'
import type { Todo } from '../lib/store'
import { useData } from '../lib/store'

const EMOJIS = ['📌', '💼', '🛒', '🎯', '📚', '🏃', '🎨', '🌱', '✈️', '🎵']
const SWIPE = 110

function Burst() {
  return (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2
        return (
          <motion.span
            key={i}
            className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
            style={{ background: i % 2 ? 'rgb(var(--accent))' : 'rgb(var(--accent2))' }}
            initial={{ x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
            animate={{ x: `calc(-50% + ${Math.cos(a) * 34}px)`, y: `calc(-50% + ${Math.sin(a) * 34}px)`, scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )
      })}
    </>
  )
}

function Row({ todo, onToggle, onRemove, onGrip }: { todo: Todo; onToggle: () => void; onRemove: () => void; onGrip?: (e: PointerEvent) => void }) {
  const x = useMotionValue(0)
  const doneOpacity = useTransform(x, [0, SWIPE], [0, 1])
  const delOpacity = useTransform(x, [-SWIPE, 0], [1, 0])
  const [checking, setChecking] = useState(false)
  const checked = todo.done || checking

  const check = () => {
    if (checking) return
    if (todo.done) return onToggle()
    setChecking(true)
    navigator.vibrate?.(15)
    setTimeout(onToggle, 450)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <motion.div style={{ opacity: doneOpacity }} className="absolute inset-0 flex items-center bg-emerald-500 pl-7 text-white">
        <Check size={28} />
      </motion.div>
      <motion.div style={{ opacity: delOpacity }} className="absolute inset-0 flex items-center justify-end bg-rose-500 pr-7 text-white">
        <Trash2 size={26} />
      </motion.div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        style={{ x }}
        onDragEnd={(_, i) => {
          if (i.offset.x > SWIPE) check()
          else if (i.offset.x < -SWIPE) onRemove()
        }}
        className="relative touch-pan-y rounded-3xl bg-base"
      >
        <div className="glass flex items-center gap-4 rounded-3xl px-5 py-4">
          <button onClick={check} className="relative grid h-10 w-10 shrink-0 place-items-center" aria-label={checked ? 'Mark as not done' : 'Mark as done'}>
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-accent"
              animate={{ backgroundColor: checked ? 'rgb(var(--accent))' : 'rgba(0,0,0,0)', scale: checking ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.35 }}
            />
            <AnimatePresence>
              {checked && (
                <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="relative text-onaccent">
                  <Check size={22} strokeWidth={3} />
                </motion.span>
              )}
            </AnimatePresence>
            {checking && <Burst />}
          </button>
          <motion.span animate={{ opacity: checked ? 0.5 : 1 }} className={`flex-1 break-words text-xl ${checked ? 'line-through' : ''}`}>
            {todo.text}
          </motion.span>
          {onGrip ? (
            <span onPointerDown={onGrip} className="grid h-10 w-10 cursor-grab touch-none place-items-center text-muted" aria-label="Drag to reorder">
              <GripVertical />
            </span>
          ) : (
            <motion.button whileTap={{ scale: 0.8 }} onClick={onRemove} className="grid h-10 w-10 place-items-center rounded-full text-muted" aria-label="Delete">
              <X />
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function ReorderRow({ todo }: { todo: Todo }) {
  const controls = useDragControls()
  const { toggleTodo, removeTodo } = useData()
  return (
    <Reorder.Item
      value={todo}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px rgba(0,0,0,.25)' }}
      className="mb-3 rounded-3xl"
    >
      <Row todo={todo} onToggle={() => toggleTodo(todo.id)} onRemove={() => removeTodo(todo.id)} onGrip={(e) => controls.start(e)} />
    </Reorder.Item>
  )
}

export default function TodoApp() {
  const { lists, todos, addList, removeList, addTodo, toggleTodo, removeTodo, reorderTodos, clearDone } = useData()
  const [listId, setListId] = useState(lists[0]?.id ?? '')
  const [text, setText] = useState('')
  const [newList, setNewList] = useState<string | null>(null)

  useEffect(() => {
    if (!lists.some((l) => l.id === listId) && lists[0]) setListId(lists[0].id)
  }, [lists, listId])

  const mine = todos.filter((t) => t.listId === listId)
  const active = mine.filter((t) => !t.done)
  const done = mine.filter((t) => t.done)
  const pct = mine.length ? done.length / mine.length : 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !listId) return
    addTodo(listId, text.trim())
    setText('')
  }
  const submitList = (e: FormEvent) => {
    e.preventDefault()
    if (newList?.trim()) setListId(addList(newList.trim(), EMOJIS[Math.floor(Math.random() * EMOJIS.length)]))
    setNewList(null)
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-5 px-6 py-4">
      <div className="no-scrollbar -mx-2 flex shrink-0 items-center gap-3 overflow-x-auto px-2 py-1">
        {lists.map((l) => {
          const count = todos.filter((t) => t.listId === l.id && !t.done).length
          const sel = l.id === listId
          return (
            <motion.button
              key={l.id}
              layout
              whileTap={{ scale: 0.92 }}
              onClick={() => setListId(l.id)}
              className={`relative isolate flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-lg ${sel ? 'text-onaccent' : 'glass'}`}
            >
              {sel && <motion.span layoutId="list-pill" className="btn-accent absolute inset-0 -z-10 rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span>{l.emoji}</span>
              {l.name}
              <span className={`rounded-full px-2 text-sm ${sel ? 'bg-black/15' : 'bg-fg/10'}`}>{count}</span>
              {sel && lists.length > 1 && (
                <span
                  role="button"
                  aria-label="Delete list"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete list “${l.name}” and its tasks?`)) removeList(l.id)
                  }}
                  className="-mr-2 grid h-7 w-7 place-items-center rounded-full bg-black/15"
                >
                  <X size={14} />
                </span>
              )}
            </motion.button>
          )
        })}
        <AnimatePresence mode="popLayout">
          {newList === null ? (
            <motion.button key="add" layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileTap={{ scale: 0.9 }} onClick={() => setNewList('')} className="glass grid h-12 w-12 shrink-0 place-items-center rounded-full" aria-label="New list">
              <Plus />
            </motion.button>
          ) : (
            <motion.form key="form" layout onSubmit={submitList} initial={{ width: 48, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 48, opacity: 0 }}>
              <input autoFocus value={newList} onChange={(e) => setNewList(e.target.value)} onBlur={() => !newList?.trim() && setNewList(null)} placeholder="List name" className="field w-full rounded-full py-3" />
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <div className="glass shrink-0 rounded-3xl p-5">
        <div className="mb-3 flex justify-between text-lg">
          <span>{active.length ? `${active.length} to go` : mine.length ? 'All done! 🎉' : 'No tasks yet'}</span>
          <span className="tabular text-muted">
            {done.length}/{mine.length}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-fg/10">
          <motion.div className="btn-accent h-full rounded-full" animate={{ width: `${pct * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <form onSubmit={submit} className="flex shrink-0 gap-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="What needs doing?" className="field flex-1" />
        <motion.button whileTap={{ scale: 0.9 }} type="submit" className="btn-accent grid h-16 w-16 shrink-0 place-items-center rounded-full shadow-lg" aria-label="Add task">
          <Plus size={30} />
        </motion.button>
      </form>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
        {mine.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
            <motion.span className="text-7xl" animate={{ rotate: [0, -10, 10, 0], y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              ✨
            </motion.span>
            <p className="text-xl">A fresh start. Add your first task.</p>
            <p>Swipe right to complete · swipe left to delete</p>
          </motion.div>
        )}

        <Reorder.Group axis="y" values={active} onReorder={reorderTodos} as="div">
          <AnimatePresence initial={false}>
            {active.map((t) => (
              <ReorderRow key={t.id} todo={t} />
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <AnimatePresence>
          {done.length > 0 && (
            <motion.div key="done" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
              <div className="mb-3 flex items-center justify-between px-2">
                <span className="text-lg text-muted">Completed · {done.length}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => clearDone(listId)} className="rounded-full bg-fg/10 px-4 py-2">
                  Clear
                </motion.button>
              </div>
              <AnimatePresence initial={false}>
                {done.map((t) => (
                  <motion.div key={t.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="mb-3">
                    <Row todo={t} onToggle={() => toggleTodo(t.id)} onRemove={() => removeTodo(t.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
