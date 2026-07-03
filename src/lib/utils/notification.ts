let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioContext) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    audioContext = new Ctor()
  }
  return audioContext
}

export function playNotificationSound(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === "suspended") void ctx.resume()

  const now = ctx.currentTime
  const master = ctx.createGain()
  master.gain.value = 0.18
  master.connect(ctx.destination)

  const playNote = (frequency: number, start: number, duration: number, onEnded?: () => void) => {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = "sine"
    oscillator.frequency.value = frequency
    oscillator.connect(gain)
    gain.connect(master)
    gain.gain.setValueAtTime(0, now + start)
    gain.gain.linearRampToValueAtTime(1, now + start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)
    if (onEnded) oscillator.onended = onEnded
    oscillator.start(now + start)
    oscillator.stop(now + start + duration + 0.05)
  }

  playNote(880, 0, 0.18)
  playNote(1318.51, 0.12, 0.3, () => master.disconnect())
}

export function showCompletionNotification(): void {
  if (typeof window === "undefined") return
  if (!("Notification" in window)) return
  if (Notification.permission !== "granted") return

  try {
    new Notification("Processing complete", {
      body: "All processing tasks have finished.",
      icon: "/android-chrome-192x192.png",
    })
  } catch {
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false
  if (!("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false

  const permission = await Notification.requestPermission()
  return permission === "granted"
}
