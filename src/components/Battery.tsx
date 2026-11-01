import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

type BatteryManagerLike = EventTarget & { level: number; charging: boolean; chargingTime: number; dischargingTime: number }
type BatteryState = { level: number; charging: boolean }

const EVENTS = ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'] as const

/**
 * Battery status, or null when unknown. Privacy-focused browsers (and devices without a battery) report a
 * fixed "100%, charging, chargingTime 0" placeholder instead of the real value, so that reading is treated
 * as unknown rather than shown as a wrong number.
 */
export function useBattery() {
  const [state, setState] = useState<BatteryState | null>(null)
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManagerLike> }
    if (!nav.getBattery) return
    let bm: BatteryManagerLike | undefined
    let alive = true
    const update = () => {
      if (!bm || !alive) return
      const placeholder = bm.level === 1 && bm.charging && bm.chargingTime === 0
      setState(placeholder ? null : { level: bm.level, charging: bm.charging })
    }
    nav
      .getBattery()
      .then((m) => {
        bm = m
        update()
        EVENTS.forEach((ev) => m.addEventListener(ev, update))
      })
      .catch(() => {})
    return () => {
      alive = false
      EVENTS.forEach((ev) => bm?.removeEventListener(ev, update))
    }
  }, [])
  return state
}

/** Compact status-bar style battery. Hidden when the browser can't report the real level. */
export function BatteryIndicator({ className = '' }: { className?: string }) {
  const battery = useBattery()
  if (!battery) return null
  const pct = Math.round(battery.level * 100)
  const low = !battery.charging && battery.level <= 0.2
  const fill = low ? '#f43f5e' : battery.charging ? '#22c55e' : 'rgb(var(--fg) / 0.8)'

  return (
    <div
      className={`flex items-center gap-1.5 px-1 text-muted ${className}`}
      role="img"
      aria-label={`Battery ${pct}%${battery.charging ? ', charging' : ''}`}
      title={`Battery ${pct}%${battery.charging ? ' (charging)' : ''}`}
    >
      <span className="tabular text-sm font-medium">{pct}%</span>
      <span className="relative flex items-center">
        <span className="relative h-[12px] w-[22px] rounded-[3.5px] border-[1.5px] border-fg/60 p-[1.5px]">
          <motion.span
            className="block h-full rounded-[1.5px]"
            style={{ background: fill }}
            initial={false}
            animate={{ width: `${Math.max(6, pct)}%`, opacity: low ? [1, 0.35, 1] : 1 }}
            transition={{ width: { type: 'spring', stiffness: 120, damping: 20 }, opacity: low ? { repeat: Infinity, duration: 1.4 } : {} }}
          />
        </span>
        <span className="ml-[1px] h-[5px] w-[2px] rounded-r-sm bg-fg/60" />
        {battery.charging && (
          <span className="absolute inset-0 -left-[2px] grid place-items-center">
            <Zap size={10} fill="rgb(var(--base))" stroke="rgb(var(--base))" strokeWidth={1} />
          </span>
        )}
      </span>
    </div>
  )
}