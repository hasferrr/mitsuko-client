import { Project } from "@/types/project"
import { db } from "./db"

// Project CRUD functions
export const createProject = async (name: string): Promise<Project> => {
  return db.transaction('rw', db.projects, db.projectOrders, async () => {
    const id = crypto.randomUUID()
    const project: Project = {
      id,
      name,
      translations: [],
      transcriptions: [],
      extractions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.projects.add(project)

    // Handle project order
    const order = await db.projectOrders.get('main')
    if (!order) {
      await db.projectOrders.add({
        id: 'main',
        order: [id],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } else {
      await db.projectOrders.update('main', order => {
        if (order) {
          order.order.unshift(id)
          order.updatedAt = new Date()
        }
      })
    }

    return project
  })
}

export const getProject = async (id: string): Promise<Project | undefined> => {
  return await db.projects.get(id)
}

export const getAllProjects = async (): Promise<Project[]> => {
  const order = await db.projectOrders.get('main')
  if (order?.order.length) {
    const projects = await db.projects.bulkGet(order.order)
    return projects.filter((p): p is Project => !!p)
  }
  return db.projects
    .orderBy('createdAt')
    .reverse()
    .toArray()
}

export const updateProject = async (id: string, update: Pick<Project, "name">): Promise<Project> => {
  const changes = {
    name: update.name,
    updatedAt: new Date()
  }

  await db.projects.update(id, changes)
  return (await db.projects.get(id)) as Project
}

export const deleteProject = async (id: string): Promise<void> => {
  return db.transaction('rw', [db.projects, db.translations, db.transcriptions, db.extractions, db.projectOrders], async () => {
    const project = await db.projects.get(id)
    if (!project) return

    const projectOrders = await db.projectOrders.get('main')
    const filterOrders = async () => {
      if (!projectOrders) return
      await db.projectOrders.update('main', order => {
        if (order) {
          order.order = projectOrders.order.filter((orderId) => orderId !== id)
          order.updatedAt = new Date()
        }
      })
    }

    // Delete all related entities in single operations
    await Promise.all([
      db.translations.bulkDelete(project.translations),
      db.transcriptions.bulkDelete(project.transcriptions),
      db.extractions.bulkDelete(project.extractions),
      filterOrders(),
    ])

    await db.projects.delete(id)
  })
}
