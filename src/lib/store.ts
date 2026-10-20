import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export type AppId = 'clock' | 'timer' | 'calendar' | 'todo'

export interface Todo { id: string; text: string; done: boolean; listId: string }
export interface TodoList { id: string; name: string; emoji: string }
export interface CalEvent { id: string; date: string; time: string; title: string; color: number }

export const EVENT_COLORS = ['rgb(var(--accent))', 'rgb(var(--accent2))', '#f43f5e', '#f59e0b', '#10b981']

interface DataState {
  themeMode: string // 'daily' or a theme id
  showSeconds: boolean
  lists: TodoList[]
  todos: Todo[]
  events: CalEvent[]
  setThemeMode: (m: string) => void
  setShowSeconds: (v: boolean) => void
  addList: (name: string, emoji: string) => string
  removeList: (id: string) => void
  addTodo: (listId: string, text: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  reorderTodos: (ordered: Todo[]) => void
  clearDone: (listId: string) => void
  addEvent: (e: Omit<CalEvent, 'id'>) => void
  removeEvent: (id: string) => void
}

export const useData = create<DataState>()(
  persist(
    (set) => ({
      themeMode: 'daily',
      showSeconds: true,
      lists: [
        { id: 'today', name: 'Today', emoji: '☀️' },
        { id: 'home', name: 'Home', emoji: '🏠' },
      ],
      todos: [],
      events: [],
      setThemeMode: (themeMode) => set({ themeMode }),
      setShowSeconds: (showSeconds) => set({ showSeconds }),
      addList: (name, emoji) => {
        const id = uid()
        set((s) => ({ lists: [...s.lists, { id, name, emoji }] }))
        return id
      },
      removeList: (id) =>
        set((s) => ({ lists: s.lists.filter((l) => l.id !== id), todos: s.todos.filter((t) => t.listId !== id) })),
      addTodo: (listId, text) => set((s) => ({ todos: [{ id: uid(), text, done: false, listId }, ...s.todos] })),
      toggleTodo: (id) => set((s) => ({ todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      removeTodo: (id) => set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      reorderTodos: (ordered) =>
        set((s) => {
          const ids = new Set(ordered.map((t) => t.id))
          return { todos: [...ordered, ...s.todos.filter((t) => !ids.has(t.id))] }
        }),
      clearDone: (listId) => set((s) => ({ todos: s.todos.filter((t) => !(t.listId === listId && t.done)) })),
      addEvent: (e) => set((s) => ({ events: [...s.events, { ...e, id: uid() }] })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'tabdesk-data' },
  ),
)

interface UiState {
  themePickerOpen: boolean
  toast: string | null
  setThemePicker: (open: boolean) => void
  showToast: (msg: string | null) => void
}

export const useUi = create<UiState>()((set) => ({
  themePickerOpen: false,
  toast: null,
  setThemePicker: (themePickerOpen) => set({ themePickerOpen }),
  showToast: (toast) => set({ toast }),
}))
