import { z } from "zod"
const entitySchema = z.object({ id: z.string() }).loose()
const childEntitySchema = entitySchema.extend({
  projectId: z.string().optional(),
  settingsId: z.string().optional(),
}).loose()
const projectSchema = entitySchema.extend({
  name: z.string().optional(),
  translations: z.array(z.string()).optional(),
  transcriptions: z.array(z.string()).optional(),
  extractions: z.array(z.string()).optional(),
  defaultTranslationSettingsId: z.string().optional(),
  defaultTranslationBasicSettingsId: z.string().optional(),
  defaultTranslationAdvancedSettingsId: z.string().optional(),
  defaultTranslationId: z.string().optional(),
  defaultExtractionSettingsId: z.string().optional(),
  defaultExtractionBasicSettingsId: z.string().optional(),
  defaultExtractionAdvancedSettingsId: z.string().optional(),
  defaultTranscriptionId: z.string().optional(),
  isBatch: z.boolean().optional(),
  lastBatchOperationMode: z.enum(["translation", "transcription", "extraction"]).optional(),
  isDefaultTranslationEnabled: z.boolean().optional(),
  isDefaultExtractionEnabled: z.boolean().optional(),
  isDefaultTranscriptionEnabled: z.boolean().optional(),
  isArchived: z.boolean().optional(),
}).loose()
const extractionSchema = childEntitySchema.extend({
  status: z.enum(["idle", "running", "completed", "failed", "stopped"]).optional(),
  ownerTranslationId: z.string().nullable().optional(),
  completedAt: z.union([z.string(), z.date()]).nullable().optional(),
}).loose()
const projectOrderSchema = entitySchema.extend({ order: z.array(z.string()).optional() }).loose()

export const databaseExportSchema = z.object({
  formatVersion: z.literal(2).optional(),
  projects: z.array(projectSchema).optional().default([]),
  translations: z.array(childEntitySchema).optional().default([]),
  transcriptions: z.array(childEntitySchema).optional().default([]),
  extractions: z.array(extractionSchema).optional().default([]),
  projectOrders: z.array(projectOrderSchema).optional().default([]),
  settings: z.array(entitySchema).optional(),
  basicSettings: z.array(entitySchema).optional(),
  advancedSettings: z.array(entitySchema).optional(),
}).loose()
  .refine(
    data => data.formatVersion === 2 ? Array.isArray(data.settings) : true,
    { message: "Format version 2 requires settings" },
  )
