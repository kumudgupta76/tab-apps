import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CalendarDays, ListTodo, Timer } from 'lucide-react'
import type { AppId } from '../lib/store'
import TimerApp from './TimerApp'
import CalendarApp from './CalendarApp'
import TodoApp from './TodoApp'

export interface AppDef {
  id: AppId
  name: string
  icon: LucideIcon
  Component: ComponentType
}

export const APPS: AppDef[] = [
  { id: 'timer', name: 'Timer', icon: Timer, Component: TimerApp },
  { id: 'calendar', name: 'Calendar', icon: CalendarDays, Component: CalendarApp },
  { id: 'todo', name: 'To-do', icon: ListTodo, Component: TodoApp },
]
