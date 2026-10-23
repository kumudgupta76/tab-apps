import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

type BatteryManagerLike = EventTarget & { level: number; charging: boolean }
type BatteryState = { level: number; charging: boolean }

export function useBattery() {
  const [state, setState] = useState<BatteryState | null>(null)
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManagerLike> }
    if (!nav.getBattery) return
    let bm: BatteryManagerLike | undefined
    let alive = true
    const update = () => bm && alive && setState({ level: bm.level, charging: bm.charging })
    nav
      .getBattery()
      .then((m) => {
        bm = m
        update()
        m.addEventListener('levelchange', update)
        m.addEventListener('chargingchange', update)
      })
      .catch(() => {})
    return () => {
      alive = false
      bm?.removeEventListener('levelchange', update)
      bm?.removeEventListener('chargingchange', update)
    }
  }, [])
  return state
}

/** Hidden where the Battery Status API is unavailable (iOS/Safari, Firefox). */
export function BatteryIndicator({ className = '' }: { className?: string }) {
  const battery = useBattery()
  if (!battery) return null
  const pct = Math.round(battery.level * 100)
  const low = !battery.charging && battery.level <= 0.2
  const fill = low ? '#f43f5e' : battery.charging ? '#22c55e' : 'rgb(var(--fg))'

  return (
    <div
      className={`glass flex h-11 items-center gap-2 rounded-full px-3 sm:h-14 sm:px-4 ${className}`}
      role="img"
      aria-label={`Battery ${pct}%${battery.charging ? ', charging' : ''}`}
      title={`Battery ${pct}%${battery.charging ? ' (charging)' : ''}`}
    >
      <span className="tabular text-sm font-medium sm:text-[1rem]">{pct}%</span>
      <span className="relative flex items-center">
        <span className="relative h-[14px] w-[26px] rounded-[4px] border-2 border-fg/70 p-[1.5px]">
          <motion.span
            className="block h-full rounded-[2px]"
            style={{ background: fill }}
            initial={false}
            animate={{ width: `${Math.max(6, pct)}%`, opacity: low ? [1, 0.35, 1] : 1 }}
            transition={{ width: { type: 'spring', stiffness: 120, damping: 20 }, opacity: low ? { repeat: Infinity, duration: 1.4 } : {} }}
          />
        </span>
        <span className="ml-[1.5px] h-[6px] w-[2.5px] rounded-r-sm bg-fg/70" />
        {battery.charging && (
          <motion.span
            className="absolute inset-0 -left-[2px] grid place-items-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            <Zap size={12} fill="rgb(var(--base))" stroke="rgb(var(--base))" strokeWidth={1} />
          </motion.span>
        )}
      </span>
    </div>
  )
}
