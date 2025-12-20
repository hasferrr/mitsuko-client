import { BasicSettings, AdvancedSettings } from "@/types/project"

type BasicKey = keyof Omit<BasicSettings, "id" | "createdAt" | "updatedAt">

type AdvancedKey = keyof Omit<AdvancedSettings, "id" | "createdAt" | "updatedAt">

const BASIC_SETTING_KEYS = [
  "sourceLanguage",
  "targetLanguage",
  "modelDetail",
  "isUseCustomModel",
  "contextDocument",
  "customInstructions",
  "fewShot",
] as const satisfies readonly BasicKey[]

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
] as const satisfies readonly AdvancedKey[]

type MissingBasicKey = Exclude<BasicKey, (typeof BASIC_SETTING_KEYS)[number]>
const _assertAllBasicKeysPresent: MissingBasicKey extends never ? true : never = true
void _assertAllBasicKeysPresent

type MissingAdvancedKey = Exclude<AdvancedKey, (typeof ADVANCED_SETTING_KEYS)[number]>
const _assertAllAdvancedKeysPresent: MissingAdvancedKey extends never ? true : never = true
void _assertAllAdvancedKeysPresent

export type { BasicKey, AdvancedKey }
export { BASIC_SETTING_KEYS, ADVANCED_SETTING_KEYS }
