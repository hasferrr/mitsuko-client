import { CustomInstruction } from '@/types/custom-instruction'
import { db } from './db'

export const createCustomInstruction = async (data: Pick<CustomInstruction, 'name' | 'content'>): Promise<CustomInstruction> => {
  const newInstruction: CustomInstruction = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  await db.transaction('rw', [db.customInstructions, db.customInstructionOrders], async () => {
    await db.customInstructions.add(newInstruction)

    const order = await db.customInstructionOrders.get('main')
    if (!order) {
      const existing = await db.customInstructions.toArray()
      const existingIds = existing
        .filter(item => item.id !== newInstruction.id)
        .map(item => item.id)
      await db.customInstructionOrders.add({
        id: 'main',
        order: [...existingIds, newInstruction.id],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      await db.customInstructionOrders.update('main', order => {
        if (order) {
          if (!order.order.includes(newInstruction.id)) {
            order.order.push(newInstruction.id)
          }
          order.updatedAt = new Date()
        }
      })
    }
  })
  return newInstruction
}

export const getAllCustomInstructions = async (): Promise<CustomInstruction[]> => {
  const order = await db.customInstructionOrders.get('main')
  if (order?.order.length) {
    const instructions = await db.customInstructions.bulkGet(order.order)
    return instructions.filter((item): item is CustomInstruction => Boolean(item))
  }
  return db.customInstructions.toArray()
}

export const getCustomInstruction = async (id: string): Promise<CustomInstruction | undefined> => {
  return db.customInstructions.get(id)
}

export const updateCustomInstruction = async (id: string, changes: Partial<Pick<CustomInstruction, 'name' | 'content'>>): Promise<CustomInstruction> => {
  await db.customInstructions.update(id, {
    ...changes,
    updatedAt: new Date()
  })
  const updated = await db.customInstructions.get(id)
  if (!updated) throw new Error('CustomInstruction not found')
  return updated
}

export const deleteCustomInstruction = async (id: string): Promise<void> => {
  await db.transaction('rw', [db.customInstructions, db.customInstructionOrders], async () => {
    await db.customInstructions.delete(id)
    await db.customInstructionOrders.update('main', order => {
      if (order) {
        order.order = order.order.filter(orderId => orderId !== id)
        order.updatedAt = new Date()
      }
    })
  })
}

export const bulkCreateCustomInstructions = async (instructions: CustomInstruction[]): Promise<CustomInstruction[]> => {
  await db.transaction('rw', [db.customInstructions, db.customInstructionOrders], async () => {
    await db.customInstructions.bulkAdd(instructions)

    const order = await db.customInstructionOrders.get('main')
    const newIds = instructions.map(item => item.id)
    if (!order) {
      const existing = await db.customInstructions.toArray()
      const newIdSet = new Set(newIds)
      const existingIds = existing
        .filter(item => !newIdSet.has(item.id))
        .map(item => item.id)
      await db.customInstructionOrders.add({
        id: 'main',
        order: [...existingIds, ...newIds],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      await db.customInstructionOrders.update('main', order => {
        if (order) {
          const merged = [...order.order]
          for (const id of newIds) {
            if (!merged.includes(id)) {
              merged.push(id)
            }
          }
          order.order = merged
          order.updatedAt = new Date()
        }
      })
    }
  })
  return instructions
}

export const updateCustomInstructionOrder = async (newOrder: string[]): Promise<void> => {
  await db.transaction('rw', [db.customInstructions, db.customInstructionOrders], async () => {
    const existingIds = new Set(
      await db.customInstructions.toCollection().primaryKeys(),
    )
    const mergedOrder = newOrder.filter(id => existingIds.has(id))
    const orderedIds = new Set(mergedOrder)

    for (const id of existingIds) {
      if (!orderedIds.has(id)) {
        mergedOrder.push(id)
      }
    }

    const order = await db.customInstructionOrders.get('main')
    if (!order) {
      await db.customInstructionOrders.add({
        id: 'main',
        order: mergedOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      await db.customInstructionOrders.update('main', order => {
        if (order) {
          order.order = mergedOrder
          order.updatedAt = new Date()
        }
      })
    }
  })
}
