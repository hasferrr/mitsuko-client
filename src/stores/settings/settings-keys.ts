import { Settings } from "@/types/project"

type SettingsKey = keyof Omit<Settings, "id" | "createdAt" | "updatedAt">

const BASIC_SETTING_KEYS = [
  "sourceLanguage",
  "targetLanguage",
  "modelDetail",
  "isUseCustomModel",
  "contextDocument",
  "customInstructions",
  "fewShot",
] as const satisfies readonly SettingsKey[]

const ADVANCED_SETTING_KEYS = [
  "temperature",
  "splitSize",
  "startIndex",
  "endIndex",
  "isMaxCompletionTokensAuto",
  "maxCompletionTokens",
  "isUseStructuredOutput",
  "isUseFullContextMemory",
  "isBetterContextCaching",
] as const satisfies readonly SettingsKey[]

type BasicKey = (typeof BASIC_SETTING_KEYS)[number]
type AdvancedKey = (typeof ADVANCED_SETTING_KEYS)[number]
type MissingSettingsKey = Exclude<SettingsKey, BasicKey | AdvancedKey>
type OverlappingSettingsKey = Extract<BasicKey, AdvancedKey>
const _assertAllSettingsKeysPresent: MissingSettingsKey extends never ? true : never = true
const _assertNoOverlappingSettingsKeys: OverlappingSettingsKey extends never ? true : never = true
void _assertAllSettingsKeysPresent
void _assertNoOverlappingSettingsKeys

export type { AdvancedKey, BasicKey, SettingsKey }
export { ADVANCED_SETTING_KEYS, BASIC_SETTING_KEYS }
