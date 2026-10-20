import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Clock, ListTodo, Timer } from 'lucide-react'
import type { AppId } from '../lib/store'
import ClockApp from './ClockApp'
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
  { id: 'clock', name: 'Clock', icon: Clock, Component: ClockApp },
  { id: 'timer', name: 'Timer', icon: Timer, Component: TimerApp },
  { id: 'calendar', name: 'Calendar', icon: CalendarDays, Component: CalendarApp },
  { id: 'todo', name: 'To-do', icon: ListTodo, Component: TodoApp },
]
