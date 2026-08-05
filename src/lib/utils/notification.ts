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
