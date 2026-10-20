let ctx: AudioContext | null = null

/** Must be called from a user gesture so later alarms are allowed to play. */
export function unlockAudio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
}

export function playAlarm() {
  unlockAudio()
  if (!ctx) return
  const c = ctx
  const t0 = c.currentTime + 0.05
  ;[0, 0.22, 0.44, 1.1, 1.32, 1.54].forEach((off, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = 'sine'
    o.frequency.value = i % 3 === 2 ? 1175 : 880
    g.gain.setValueAtTime(0.0001, t0 + off)
    g.gain.exponentialRampToValueAtTime(0.35, t0 + off + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + off + 0.18)
    o.connect(g).connect(c.destination)
    o.start(t0 + off)
    o.stop(t0 + off + 0.2)
  })
}
