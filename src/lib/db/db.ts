import { Project, Translation, Transcription, Extraction, ProjectOrder, BasicSettings, AdvancedSettings } from '@/types/project'
import Dexie, { Table } from 'dexie'

class MyDatabase extends Dexie {
  projects!: Table<Project, string>
  translations!: Table<Translation, string>
  transcriptions!: Table<Transcription, string>
  extractions!: Table<Extraction, string>
  projectOrders!: Table<ProjectOrder, string>
  basicSettings!: Table<BasicSettings, string>
  advancedSettings!: Table<AdvancedSettings, string>

  constructor() {
    super('myDatabase')
    this.version(6).stores({
      projects: 'id, name, createdAt, updatedAt',
      translations: 'id, projectId, title, createdAt, updatedAt',
      transcriptions: 'id, projectId, title, createdAt, updatedAt',
      extractions: 'id, projectId, episodeNumber, createdAt, updatedAt',
      projectOrders: 'id',
      basicSettings: 'id, createdAt, updatedAt',
      advancedSettings: 'id, createdAt, updatedAt',
    })
    this.version(7).stores({
      // No schema changes needed for basicSettings regarding indexing modelDetail.isPaid,
      // as Dexie doesn't directly support indexing nested properties easily in the stores() definition.
      // The structure itself allows storing the nested object.
    }).upgrade(async tx => {
      // Migrate basicSettings: add isPaid: false to modelDetail if it exists
      await tx.table('basicSettings').toCollection().modify(setting => {
        if (setting.modelDetail && typeof setting.modelDetail === 'object') {
          // Ensure isPaid is set to false, even if modelDetail already existed
          setting.modelDetail.isPaid = false
        }
      })
    })
  }
}

export const db = new MyDatabase()
