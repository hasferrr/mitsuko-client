import { ProductId } from '@/types/product'
import { SnapPaymentResult } from '@/types/snap'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SnapData = SnapPaymentResult & { expiresAt: string }
type SnapDataWithDate = SnapPaymentResult & { expiresAt: Date }
type UserId = string

interface SnapStore {
  snapData: Record<UserId, Record<ProductId, SnapData | undefined>>
  getSnapData: (userId: UserId, productId: ProductId) => SnapDataWithDate | undefined
  setSnapData: (userId: UserId, productId: ProductId, value: SnapPaymentResult) => void
  removeSnapData: (userId: UserId, productId: ProductId) => void
  clearSnapData: () => void
}

export const useSnapStore = create<SnapStore>()(
  persist(
    (set, get) => ({
      snapData: {},
      getSnapData: (userId: UserId, productId: ProductId) => {
        const data = get().snapData[userId]?.[productId]
        if (!data) return undefined
        return {
          ...data,
          expiresAt: typeof data.expiresAt === 'string'
            ? new Date(data.expiresAt)
            : data.expiresAt
        }
      },
      setSnapData: (userId: UserId, productId: ProductId, value: SnapPaymentResult) => set({
        snapData: {
          [userId]: {
            ...get().snapData[userId],
            [productId]: {
              ...value,
              expiresAt: (new Date(Date.now() + 23 * 60 * 60 * 1000)).toISOString()
            }
          }
        }
      }),
      removeSnapData: (userId: UserId, productId: ProductId) => set({
        snapData: {
          [userId]: {
            ...get().snapData[userId],
            [productId]: undefined
          }
        }
      }),
      clearSnapData: () => set({ snapData: {} }),
    }),
    {
      name: 'snap-store',
    }
  )
)
