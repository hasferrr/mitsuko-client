import { Project, Translation, Transcription, Extraction, ProjectOrder } from '@/types/project'
import Dexie, { Table } from 'dexie'

class MyDatabase extends Dexie {
  projects!: Table<Project, string>
  translations!: Table<Translation, string>
  transcriptions!: Table<Transcription, string>
  extractions!: Table<Extraction, string>
  projectOrders!: Table<ProjectOrder, string>

  constructor() {
    super('myDatabase')
    this.version(2).stores({
      projects: 'id, name, createdAt, updatedAt',
      translations: 'id, projectId, title, createdAt, updatedAt',
      transcriptions: 'id, projectId, title, createdAt, updatedAt',
      extractions: 'id, projectId, episodeNumber, createdAt, updatedAt',
      projectOrders: 'id',
    })
  }
}

export const db = new MyDatabase()
