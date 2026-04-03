export async function copySettingsKeys<T extends { id: string }>(params: {
  fromId: string
  toId: string
  keys: (keyof T)[]
  getData: () => Record<string, T>
  upsertData: (id: string, value: T) => void
  fetchFromDb: (id: string) => Promise<T | undefined>
  saveData: (id: string) => Promise<void>
  setData: (fn: (state: { data: Record<string, T> }) => { data: Record<string, T> }) => void
}): Promise<void> {
  const { fromId, toId, keys, getData, upsertData, fetchFromDb, saveData, setData } = params
  if (!keys || keys.length === 0) return

  let from = getData()[fromId]
  if (!from) {
    try {
      const fetched = await fetchFromDb(fromId)
      if (fetched) {
        upsertData(fetched.id, fetched)
        from = fetched
      }
    } catch (e) {
      console.error("Failed to fetch source settings", fromId, e)
    }
  }
  if (!from) {
    console.error("Source settings not found in store or DB", fromId)
    return
  }

  let to = getData()[toId]
  if (!to) {
    try {
      const fetched = await fetchFromDb(toId)
      if (fetched) {
        upsertData(fetched.id, fetched)
        to = fetched
      }
    } catch (e) {
      console.error("Failed to fetch target settings", toId, e)
    }
  }
  if (!to) {
    console.error("Target settings not found in store or DB", toId)
    return
  }

  setData(state => {
    const current = state.data[toId]
    if (!current) return state
    const updated: T = { ...current }
    keys.forEach((k) => {
      updated[k] = from[k]
    })
    return {
      data: {
        ...state.data,
        [toId]: updated,
      }
    }
  })

  await saveData(toId)
}
