export function calculateAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    const objectUrl = URL.createObjectURL(file)

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl)
      resolve(audio.duration || 0)
    })

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl)
      resolve(0)
    })

    audio.src = objectUrl
  })
}
