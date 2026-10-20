import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { applyTheme, THEMES, themeForDate } from './themes'
import { useData, useUi } from './store'
import { durationOf, elapsedOf, timerToastMessage, useTimer } from './timer'
import { playAlarm } from './audio'

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function useActiveTheme() {
  const mode = useData((s) => s.themeMode)
  const day = format(useNow(30_000), 'yyyy-MM-dd')
  const theme = useMemo(
    () => (mode === 'daily' ? themeForDate(new Date(day + 'T00:00')) : THEMES.find((t) => t.id === mode) ?? themeForDate(new Date())),
    [mode, day],
  )
  useLayoutEffect(() => applyTheme(theme), [theme])
  return theme
}

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void> }
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }

export function useFullscreen() {
  const doc = document as FsDoc
  const read = () => !!(doc.fullscreenElement || doc.webkitFullscreenElement)
  const [isFullscreen, setFs] = useState(read)
  useEffect(() => {
    const h = () => setFs(read())
    document.addEventListener('fullscreenchange', h)
    document.addEventListener('webkitfullscreenchange', h)
    return () => {
      document.removeEventListener('fullscreenchange', h)
      document.removeEventListener('webkitfullscreenchange', h)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const toggle = useCallback(async () => {
    try {
      if (read()) await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.())
      else {
        const el = document.documentElement as FsEl
        await (el.requestFullscreen?.({ navigationUI: 'hide' }) ?? el.webkitRequestFullscreen?.())
      }
    } catch {
      /* fullscreen not allowed (e.g. iPhone Safari) */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const supported = !!(document.documentElement.requestFullscreen || (document.documentElement as FsEl).webkitRequestFullscreen)
  return { isFullscreen, toggle, supported }
}

export const isStandalone = () =>
  window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/** Keeps the tablet screen on while the app is visible. */
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    const request = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen')
      } catch {
        /* not supported or denied */
      }
    }
    void request()
    const onVis = () => document.visibilityState === 'visible' && void request()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      void lock?.release()
    }
  }, [])
}

/** Global ticker so timers fire alarms even when another tool is open. */
export function useTimerTicker() {
  useEffect(() => {
    const id = setInterval(() => {
      const s = useTimer.getState()
      if (s.status !== 'running' || s.mode === 'stopwatch') return
      if (elapsedOf(s, Date.now()) >= durationOf(s)) {
        const mode = s.mode
        s.complete()
        playAlarm()
        navigator.vibrate?.([300, 150, 300])
        useUi.getState().showToast(timerToastMessage(mode, useTimer.getState().phase))
      }
    }, 200)
    return () => clearInterval(id)
  }, [])
}
