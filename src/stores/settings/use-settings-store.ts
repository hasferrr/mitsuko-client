import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Model } from "@/types/model"
import {
  AdvancedSettingsKey,
  BasicSettingsKey,
  Settings,
  SettingsKey,
} from "@/types/project"
import { getAllSettings, getSettings, updateSettings } from "@/lib/db/settings"
import { DEFAULT_ADVANCED_SETTINGS, DEFAULT_BASIC_SETTINGS, DEFAULT_EXTRACTION_BASIC_SETTINGS } from "@/constants/default"
import { GLOBAL_EXTRACTION_SETTINGS_ID } from "@/constants/global-settings"
import { copySettingsKeys } from "@/stores/utils/copy-settings"
import { useTranslationDataStore } from "@/stores/data/use-translation-data-store"

type SettingsData = Omit<Settings, "id" | "createdAt" | "updatedAt">
type AdvancedSettingsValues = Pick<SettingsData, AdvancedSettingsKey>

const SETTINGS_KEYS = [
  "sourceLanguage",
  "targetLanguage",
  "modelDetail",
  "isUseCustomModel",
  "contextDocument",
  "customInstructions",
  "fewShot",
  "temperature",
  "splitSize",
  "startIndex",
  "endIndex",
  "isMaxCompletionTokensAuto",
  "maxCompletionTokens",
  "isUseStructuredOutput",
  "isUseFullContextMemory",
  "isBetterContextCaching",
] satisfies SettingsKey[]

interface SettingsStore {
  data: Record<string, Settings>
  loadSettings: () => Promise<void>
  upsertData: (id: string, value: Settings) => void
  mutateData: <K extends keyof Settings>(id: string, key: K, value: Settings[K]) => void
  saveData: (id: string) => Promise<void>
  getSettings: (id: string) => Settings | null
  getSourceLanguage: (id: string) => string
  getTargetLanguage: (id: string) => string
  getModelDetail: (id: string) => Model | null
  getIsUseCustomModel: (id: string) => boolean
  getContextDocument: (id: string) => string
  getCustomInstructions: (id: string) => string
  getFewShot: (id: string) => Settings["fewShot"]
  getFewShotIsEnabled: (id: string) => boolean
  getFewShotValue: (id: string) => string
  getFewShotLinkedId: (id: string) => string
  getFewShotType: (id: string) => "manual" | "linked"
  getFewShotStartIndex: (id: string) => number | undefined
  getFewShotEndIndex: (id: string) => number | undefined
  getTemperature: (id: string) => number
  getMaxCompletionTokens: (id: string) => number
  getIsMaxCompletionTokensAuto: (id: string) => boolean
  getSplitSize: (id: string) => number
  getStartIndex: (id: string) => number
  getEndIndex: (id: string) => number
  getIsUseStructuredOutput: (id: string) => boolean
  getIsUseFullContextMemory: (id: string) => boolean
  getIsBetterContextCaching: (id: string) => boolean
  resetBasicSettings: (id: string) => void
  resetAdvancedSettings: (id: string) => void
  resetSettings: (id: string) => Promise<void>
  setBasicSettingsValue: <K extends BasicSettingsKey>(id: string, key: K, value: Settings[K]) => void
  setAdvancedSettingsValue: <K extends AdvancedSettingsKey>(id: string, key: K, value: Settings[K]) => void
  setIsFewShotEnabled: (id: string, value: boolean) => void
  setFewShotValue: (id: string, value: string) => void
  setFewShotLinkedId: (id: string, value: string) => void
  setFewShotType: (id: string, value: "manual" | "linked") => void
  setFewShotStartIndex: (id: string, value: number) => void
  setFewShotEndIndex: (id: string, value: number) => void
  resetIndex: (id: string, start: number | null, end: number | null) => void
  applyModelDefaults: <T extends Partial<SettingsData>>(settings: T, model: Model | null) => T
  copySettingsKeys: (fromId: string, toId: string, keys: SettingsKey[]) => Promise<void>
  resetSettingsFrom: (fromId: string, toId: string) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      data: {},
      loadSettings: async () => {
        try {
          const settings = await getAllSettings()
          set(state => ({ data: { ...state.data, ...Object.fromEntries(settings.map(item => [item.id, item])) } }))
        } catch (error) {
          console.error("Failed to load settings", error)
        }
      },
      upsertData: (id, value) => set(state => ({ data: { ...state.data, [id]: value } })),
      mutateData: (id, key, value) => set(state => {
        const current = state.data[id]
        return current ? { data: { ...state.data, [id]: { ...current, [key]: value } } } : state
      }),
      saveData: async id => {
        const current = get().data[id]
        if (!current) return
        try {
          await updateSettings(id, current)
        } catch (error) {
          console.error("Failed to save settings data:", error)
        }
      },
      getSettings: id => get().data[id] ?? null,
      getSourceLanguage: id => get().data[id]?.sourceLanguage ?? DEFAULT_BASIC_SETTINGS.sourceLanguage,
      getTargetLanguage: id => get().data[id]?.targetLanguage ?? DEFAULT_BASIC_SETTINGS.targetLanguage,
      getModelDetail: id => get().data[id]?.modelDetail ?? DEFAULT_BASIC_SETTINGS.modelDetail,
      getIsUseCustomModel: id => get().data[id]?.isUseCustomModel ?? DEFAULT_BASIC_SETTINGS.isUseCustomModel,
      getContextDocument: id => get().data[id]?.contextDocument ?? DEFAULT_BASIC_SETTINGS.contextDocument,
      getCustomInstructions: id => get().data[id]?.customInstructions ?? DEFAULT_BASIC_SETTINGS.customInstructions,
      getFewShot: id => get().data[id]?.fewShot ?? DEFAULT_BASIC_SETTINGS.fewShot,
      getFewShotIsEnabled: id => get().getFewShot(id).isEnabled,
      getFewShotValue: id => get().getFewShot(id).value,
      getFewShotLinkedId: id => get().getFewShot(id).linkedId,
      getFewShotType: id => get().getFewShot(id).type,
      getFewShotStartIndex: id => get().getFewShot(id).fewShotStartIndex,
      getFewShotEndIndex: id => get().getFewShot(id).fewShotEndIndex,
      getTemperature: id => get().data[id]?.temperature ?? DEFAULT_ADVANCED_SETTINGS.temperature,
      getMaxCompletionTokens: id => get().data[id]?.maxCompletionTokens ?? DEFAULT_ADVANCED_SETTINGS.maxCompletionTokens,
      getIsMaxCompletionTokensAuto: id => get().data[id]?.isMaxCompletionTokensAuto ?? DEFAULT_ADVANCED_SETTINGS.isMaxCompletionTokensAuto,
      getSplitSize: id => get().data[id]?.splitSize ?? DEFAULT_ADVANCED_SETTINGS.splitSize,
      getStartIndex: id => get().data[id]?.startIndex ?? DEFAULT_ADVANCED_SETTINGS.startIndex,
      getEndIndex: id => get().data[id]?.endIndex ?? DEFAULT_ADVANCED_SETTINGS.endIndex,
      getIsUseStructuredOutput: id => get().data[id]?.isUseStructuredOutput ?? DEFAULT_ADVANCED_SETTINGS.isUseStructuredOutput,
      getIsUseFullContextMemory: id => get().data[id]?.isUseFullContextMemory ?? DEFAULT_ADVANCED_SETTINGS.isUseFullContextMemory,
      getIsBetterContextCaching: id => get().data[id]?.isBetterContextCaching ?? DEFAULT_ADVANCED_SETTINGS.isBetterContextCaching,
      resetBasicSettings: id => {
        const current = get().data[id]
        if (!current) return
        const defaults = id === GLOBAL_EXTRACTION_SETTINGS_ID ? DEFAULT_EXTRACTION_BASIC_SETTINGS : DEFAULT_BASIC_SETTINGS
        get().upsertData(id, { ...current, ...defaults })
        void get().saveData(id)
      },
      resetAdvancedSettings: id => {
        const current = get().data[id]
        if (!current) return
        const base: AdvancedSettingsValues = {
          ...DEFAULT_ADVANCED_SETTINGS,
          isUseStructuredOutput: current.isUseCustomModel ? true : current.modelDetail?.structuredOutput ?? true,
        }
        get().upsertData(id, { ...current, ...get().applyModelDefaults(base, current.modelDetail) })
        void get().saveData(id)
      },
      resetSettings: async id => {
        const current = get().data[id]
        if (!current) return
        const basic = id === GLOBAL_EXTRACTION_SETTINGS_ID ? DEFAULT_EXTRACTION_BASIC_SETTINGS : DEFAULT_BASIC_SETTINGS
        const advanced = get().applyModelDefaults({
          ...DEFAULT_ADVANCED_SETTINGS,
          isUseStructuredOutput: basic.isUseCustomModel ? true : basic.modelDetail?.structuredOutput ?? true,
        }, basic.modelDetail)
        get().upsertData(id, { ...current, ...basic, ...advanced })
        await get().saveData(id)
      },
      setBasicSettingsValue: (id, key, value) => {
        get().mutateData(id, key, value)
        void get().saveData(id)
      },
      setAdvancedSettingsValue: (id, key, value) => {
        get().mutateData(id, key, value)
        void get().saveData(id)
      },
      setIsFewShotEnabled: (id, isEnabled) => {
        get().mutateData(id, "fewShot", { ...get().getFewShot(id), isEnabled })
        void get().saveData(id)
      },
      setFewShotValue: (id, value) => {
        get().mutateData(id, "fewShot", { ...get().getFewShot(id), value })
        void get().saveData(id)
      },
      setFewShotLinkedId: (id, linkedId) => {
        get().mutateData(id, "fewShot", { ...get().getFewShot(id), linkedId })
        void get().saveData(id)
      },
      setFewShotType: (id, type) => {
        get().mutateData(id, "fewShot", { ...get().getFewShot(id), type })
        void get().saveData(id)
      },
      setFewShotStartIndex: (id, fewShotStartIndex) => {
        get().mutateData(id, "fewShot", { ...get().getFewShot(id), fewShotStartIndex })
        void get().saveData(id)
      },
      setFewShotEndIndex: (id, fewShotEndIndex) => {
        get().mutateData(id, "fewShot", { ...get().getFewShot(id), fewShotEndIndex })
        void get().saveData(id)
      },
      resetIndex: (id, start, end) => {
        const subtitles = useTranslationDataStore.getState().data[id]?.subtitles ?? []
        get().mutateData(id, "startIndex", start || 1)
        get().mutateData(id, "endIndex", end || subtitles.length || 100000)
        void get().saveData(id)
      },
      applyModelDefaults: (settings, model) => ({
        ...settings,
        ...(model?.default?.maxCompletionTokens === undefined ? {} : { maxCompletionTokens: model.default.maxCompletionTokens }),
        ...(model?.default?.isMaxCompletionTokensAuto === undefined ? {} : { isMaxCompletionTokensAuto: model.default.isMaxCompletionTokensAuto }),
        ...(model?.default?.isUseStructuredOutput === undefined ? {} : { isUseStructuredOutput: model.default.isUseStructuredOutput }),
      }) as typeof settings,
      copySettingsKeys: (fromId, toId, keys) => copySettingsKeys<Settings>({
        fromId,
        toId,
        keys,
        getData: () => get().data,
        upsertData: get().upsertData,
        fetchFromDb: getSettings,
        saveData: get().saveData,
        setData: set,
      }),
      resetSettingsFrom: (fromId, toId) => get().copySettingsKeys(
        fromId,
        toId,
        SETTINGS_KEYS,
      ),
    }),
    { name: "settings-storage", partialize: () => ({}) },
  ),
)
