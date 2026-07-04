import { create } from "zustand"
import { AdvancedSettings, BasicSettings, AutoContextMode, AutoContextPreviousMode, Translation } from "@/types/project"
import { SubOnlyTranslated, SubtitleTranslated, Parsed } from "@/types/subtitles"
import {
  updateTranslation as updateDB,
  createTranslation as createDB,
  getTranslation as getDB,
  getTranslations as getBulkDB,
  deleteTranslation as deleteDB,
  moveTranslation as moveDB,
} from "@/lib/db/translation"
import { getBasicSettings, getAdvancedSettings } from "@/lib/db/settings"
import { getProject } from "@/lib/db/project"
import { useSettingsStore } from "@/stores/settings/use-settings-store"
import { useAdvancedSettingsStore } from "@/stores/settings/use-advanced-settings-store"
import {
  DEFAULT_BASIC_SETTINGS,
  DEFAULT_ADVANCED_SETTINGS,
  DEFAULT_TRANSLATION_SETTINGS,
} from "@/constants/default"
import { GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID, GLOBAL_TRANSLATION_BASIC_SETTINGS_ID, GLOBAL_TRANSLATION_SETTINGS_ID } from "@/constants/global-settings"
import { resolveNewTranslationAutoContextMode } from "@/lib/translation/auto-context-defaults"

export interface TranslationDataStore {
  currentId: string | null
  data: Record<string, Translation>
  // Init
  loadGlobalTranslation: () => Promise<void>
  // CRUD methods
  createTranslationDb: (
    projectId: string,
    data: Parameters<typeof createDB>[1],
    basicSettingsData?: Partial<Omit<BasicSettings, "id" | "createdAt" | "updatedAt">>,
    advancedSettingsData?: Partial<Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Translation>
  getTranslationDb: (translationId: string, skipStoreUpdate?: boolean) => Promise<Translation | undefined>
  getTranslationsDb: (translationIds: string[]) => Promise<Translation[]>
  updateTranslationDb: (translationId: string, changes: Partial<Translation>) => Promise<Translation>
  deleteTranslationDb: (projectId: string, translationId: string) => Promise<void>
  moveTranslationDb: (sourceProjectId: string, targetProjectId: string, translationId: string) => Promise<void>
  // setters
  setCurrentId: (id: string | null) => void
  setTitle: (id: string, title: string) => void
  setSubtitles: (id: string, subtitles: SubtitleTranslated[]) => void
  setParsed: (id: string, parsed: Parsed) => void
  resetParsed: (id: string) => void
  updateSubtitle: <T extends keyof SubtitleTranslated>(id: string, index: number, field: T, value: SubtitleTranslated[T]) => void
  setResponse: (id: string, response: string) => void
  setJsonResponse: (id: string, jsonResponse: SubOnlyTranslated[]) => void
  appendJsonResponse: (id: string, arr: SubOnlyTranslated[]) => void
  setAutoContextMode: (id: string, autoContextMode: AutoContextMode) => void
  setAutoContextExtractionId: (id: string, autoContextExtractionId: string | null) => void
  setAutoContextPreviousMode: (id: string, autoContextPreviousMode: AutoContextPreviousMode) => void
  setAutoContextPreviousExtractionId: (id: string, autoContextPreviousExtractionId: string | null) => void
  // data manipulation methods
  mutateData: <T extends keyof Translation>(id: string, key: T, value: Translation[T]) => void
  mutateDataNoRender: <T extends keyof Translation>(id: string, key: T, value: Translation[T]) => void
  saveData: (id: string) => Promise<void>
  upsertData: (id: string, value: Translation) => void
  removeData: (id: string) => void
}

export const useTranslationDataStore = create<TranslationDataStore>((set, get) => ({
  currentId: null,
  data: {},
  loadGlobalTranslation: async () => {
    try {
      const globalTranslation = await getDB(GLOBAL_TRANSLATION_SETTINGS_ID)
      if (globalTranslation) {
        set(state => ({ data: { ...state.data, [GLOBAL_TRANSLATION_SETTINGS_ID]: globalTranslation } }))
      }
    } catch (error) {
      console.error("Failed to load global translation", error)
    }
  },
  // CRUD methods
  createTranslationDb: async (projectId, data, basicSettingsData, advancedSettingsData) => {
    let bsInput = basicSettingsData
    let advInput = advancedSettingsData
    const project = await getProject(projectId)
    if (!project) throw new Error('Project not found')

    if (bsInput === undefined || advInput === undefined) {
      const basicSettingsId = (project.isBatch || project.isDefaultTranslationEnabled)
        ? project.defaultTranslationBasicSettingsId
        : GLOBAL_TRANSLATION_BASIC_SETTINGS_ID
      const advancedSettingsId = (project.isBatch || project.isDefaultTranslationEnabled)
        ? project.defaultTranslationAdvancedSettingsId
        : GLOBAL_TRANSLATION_ADVANCED_SETTINGS_ID

      const bsFromDb = await getBasicSettings(basicSettingsId)
      const adsFromDb = await getAdvancedSettings(advancedSettingsId)

      const modelDetail = (bsInput?.modelDetail ?? bsFromDb?.modelDetail) ?? null
      const applyModelDefaults = useAdvancedSettingsStore.getState().applyModelDefaults

      if (bsInput === undefined) {
        if (bsFromDb) {
          bsInput = bsFromDb
        } else {
          bsInput = DEFAULT_BASIC_SETTINGS
        }
      }

      if (advInput === undefined) {
        if (adsFromDb) {
          advInput = applyModelDefaults(adsFromDb, modelDetail)
        } else {
          advInput = applyModelDefaults(DEFAULT_ADVANCED_SETTINGS, modelDetail)
        }
      }
    }

    const explicitMode = data.autoContextMode
    const templateId = project.isDefaultTranslationEnabled
      ? project.defaultTranslationId
      : GLOBAL_TRANSLATION_SETTINGS_ID
    const template = explicitMode === undefined && !project.isBatch && templateId ? await getDB(templateId) : undefined
    const autoContextMode = resolveNewTranslationAutoContextMode({
      explicitMode,
      isBatch: project.isBatch,
      templateMode: template?.autoContextMode,
    })

    const resolvedData = explicitMode === undefined || project.isBatch
      ? {
          ...data,
          autoContextMode,
          autoContextExtractionId: DEFAULT_TRANSLATION_SETTINGS.autoContextExtractionId,
          autoContextPreviousMode: DEFAULT_TRANSLATION_SETTINGS.autoContextPreviousMode,
          autoContextPreviousExtractionId: DEFAULT_TRANSLATION_SETTINGS.autoContextPreviousExtractionId,
        }
      : { ...data, autoContextMode }

    const translation = await createDB(projectId, resolvedData, bsInput ?? {}, advInput ?? {})
    set(state => ({ data: { ...state.data, [translation.id]: translation } }))

    // upsert associated settings into stores
    const settingsStore = useSettingsStore.getState()
    const advSettingsStore = useAdvancedSettingsStore.getState()
    const bs = await getBasicSettings(translation.basicSettingsId)
    if (bs) settingsStore.upsertData(bs.id, bs)
    const ads = await getAdvancedSettings(translation.advancedSettingsId)
    if (ads) advSettingsStore.upsertData(ads.id, ads)

    return translation
  },
  getTranslationDb: async (translationId, skipStoreUpdate) => {
    const translation = await getDB(translationId)
    if (translation && !skipStoreUpdate) {
      set(state => ({ data: { ...state.data, [translationId]: translation } }))
    }
    return translation
  },
  getTranslationsDb: async (translationIds) => {
    if (translationIds.length === 0) return []
    const found = await getBulkDB(translationIds)
    if (found.length) {
      set(state => ({
        data: {
          ...state.data,
          ...Object.fromEntries(found.map(t => [t.id, t]))
        }
      }))
    }
    return found
  },
  updateTranslationDb: async (translationId, changes) => {
    const translation = await updateDB(translationId, changes)
    set(state => ({ data: { ...state.data, [translationId]: translation } }))
    return translation
  },
  deleteTranslationDb: async (projectId, translationId) => {
    await deleteDB(projectId, translationId)
    set(state => {
      const newData = { ...state.data }
      delete newData[translationId]
      return { data: newData }
    })
    if (get().currentId === translationId) {
      set({ currentId: null })
    }
  },
  moveTranslationDb: async (sourceProjectId, targetProjectId, translationId) => {
    await moveDB(sourceProjectId, targetProjectId, translationId)
    const data = get().data[translationId]
    if (data) {
      set(state => ({
        data: { ...state.data, [translationId]: { ...data, projectId: targetProjectId, updatedAt: new Date() } }
      }))
    }
  },

  // setters implementation
  setCurrentId: (id) => set({ currentId: id }),
  setTitle: (id, title) => {
    get().mutateData(id, "title", title)
  },
  setSubtitles: (id, subtitles) => {
    get().mutateData(id, "subtitles", subtitles)
  },
  setParsed: (id, parsed) => {
    get().mutateData(id, "parsed", parsed)
  },
  resetParsed: (id) => {
    const initialParsed: Parsed = { ...DEFAULT_TRANSLATION_SETTINGS.parsed }
    get().mutateData(id, "parsed", initialParsed)
  },
  updateSubtitle: (id, index, field, value) => {
    const data = get().data[id]
    if (data && data.subtitles) {
      const updated = [...data.subtitles]
      updated[index - 1] = { ...updated[index - 1], [field]: value }
      get().mutateData(id, "subtitles", updated)
    }
  },
  setResponse: (id, res) => {
    const translation = get().data[id]
    if (!translation) return
    if (get().currentId === id) {
      get().mutateData(id, "response", { ...translation.response, response: res })
    } else {
      get().mutateDataNoRender(id, "response", { ...translation.response, response: res })
    }
  },
  setJsonResponse: (id, jsonRes) => {
    const translation = get().data[id]
    if (!translation) return
    get().mutateData(id, "response", { ...translation.response, jsonResponse: jsonRes })
  },
  appendJsonResponse: (id, arr) => {
    const translation = get().data[id]
    if (!translation) return
    const currentJson = translation.response.jsonResponse || []
    get().mutateData(id, "response", {
      ...translation.response,
      jsonResponse: [...currentJson, ...arr],
    })
  },
  setAutoContextMode: (id, autoContextMode) => {
    get().mutateData(id, "autoContextMode", autoContextMode)
  },
  setAutoContextExtractionId: (id, autoContextExtractionId) => {
    get().mutateData(id, "autoContextExtractionId", autoContextExtractionId)
  },
  setAutoContextPreviousMode: (id, autoContextPreviousMode) => {
    get().mutateData(id, "autoContextPreviousMode", autoContextPreviousMode)
  },
  setAutoContextPreviousExtractionId: (id, autoContextPreviousExtractionId) => {
    get().mutateData(id, "autoContextPreviousExtractionId", autoContextPreviousExtractionId)
  },
  // data manipulation methods
  mutateData: (id, key, value) => {
    set(state => {
      const data = state.data[id]
      if (!data) return state
      return {
        ...state,
        data: {
          ...state.data,
          [id]: {
            ...data,
            [key]: value
          }
        }
      }
    })
  },
  mutateDataNoRender: (id, key, value) => {
    const data = get().data[id]
    if (!data) return
    data[key] = value
  },
  saveData: async (id) => {
    const translation = get().data[id]
    if (!translation) {
      console.error("Translation not found in store")
      return
    }
    try {
      const result = await updateDB(id, translation)
      set({ data: { ...get().data, [id]: result } })
    } catch (error) {
      console.error("Failed to save translation data:", error)
    }
  },
  upsertData: (id, value) => {
    set(state => ({ data: { ...state.data, [id]: value } }))
  },
  removeData: (id) => {
    set(state => {
      const newData = { ...state.data }
      delete newData[id]
      return { data: newData }
    })
    if (get().currentId === id) {
      set({ currentId: null })
    }
  },
}))
