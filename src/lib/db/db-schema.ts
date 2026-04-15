import { z } from "zod"

const projectSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  translations: z.array(z.string()).optional(),
  transcriptions: z.array(z.string()).optional(),
  extractions: z.array(z.string()).optional(),
  isBatch: z.boolean().optional(),
  isDefaultTranslationEnabled: z.boolean().optional(),
  isDefaultExtractionEnabled: z.boolean().optional(),
  isDefaultTranscriptionEnabled: z.boolean().optional(),
}).loose()

const childEntitySchema = z.object({
  id: z.string(),
  projectId: z.string().optional(),
}).loose()

const settingsSchema = z.object({
  id: z.string(),
}).loose()

const projectOrderSchema = z.object({
  id: z.string(),
  order: z.array(z.string()).optional(),
}).loose()

export const databaseExportSchema = z.object({
  projects: z.array(projectSchema).optional().default([]),
  translations: z.array(childEntitySchema).optional().default([]),
  transcriptions: z.array(childEntitySchema).optional().default([]),
  extractions: z.array(childEntitySchema).optional().default([]),
  projectOrders: z.array(projectOrderSchema).optional().default([]),
  basicSettings: z.array(settingsSchema).optional().default([]),
  advancedSettings: z.array(settingsSchema).optional().default([]),
}).loose()
