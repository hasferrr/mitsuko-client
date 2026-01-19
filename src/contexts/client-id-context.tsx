"use client"

import React, { createContext, useEffect, PropsWithChildren } from 'react'
import { indexedDBStorage } from '@/lib/indexed-db-storage'
import { useClientIdStore } from '@/stores/use-client-id-store'
import { v4 as uuidv4 } from 'uuid'

const CLIENT_ID_KEY = 'client-id'

const ClientIdContext = createContext(undefined)

export const ClientIdProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const setClientId = useClientIdStore((state) => state.setClientId)

  useEffect(() => {
    const getClientId = async () => {
      const storedClientId = await indexedDBStorage.getItem(CLIENT_ID_KEY)
      if (storedClientId && storedClientId.length === 36) {
        setClientId(storedClientId)
      } else {
        const newClientId =
          typeof crypto?.randomUUID === 'function'
            ? crypto.randomUUID()
            : uuidv4()
        await indexedDBStorage.setItem(CLIENT_ID_KEY, newClientId)
        setClientId(newClientId)
      }
    }
    getClientId()
  }, [setClientId])

  return (
    <ClientIdContext.Provider value={undefined}>
      {children}
    </ClientIdContext.Provider>
  )
}
