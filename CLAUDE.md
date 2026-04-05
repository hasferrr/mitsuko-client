# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mitsuko** is an AI-powered subtitle translation and audio transcription frontend application. It connects to a separate backend (chizuru-translator) for AI processing. Key features include subtitle translation, audio transcription, context extraction, and batch processing.

## Commands

```bash
bun dev              # Start development server
bun build            # Production build (rarely used)
bun typecheck        # Type checking (use this instead of build)
bun lint             # Run ESLint
bun test             # Run all tests
bun test <file-path> # Run specific test (e.g., bun test src/lib/parser/cleaner.test.ts)
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Runtime**: Bun (not Node.js)
- **State**: Zustand (client state), TanStack Query (server state)
- **Persistence**: Dexie.js (IndexedDB) for offline-first project data
- **UI**: Radix UI primitives + Tailwind CSS
- **Auth**: Supabase Auth
- **Backend**: External API at `NEXT_PUBLIC_API_URL` (chizuru-translator)

## Architecture

### Route Groups
- `src/app/(landing)/` - Public pages (home, pricing, blog, privacy, terms, changelog)
- `src/app/(main)/` - Authenticated app (translate, transcribe, batch, project, extract-context, history, library, cloud, dashboard, tools)

### Key Directories
- `src/stores/` - Zustand stores:
  - `settings/` - Basic, Advanced, Local, Whisper, and Batch settings stores
  - `services/` - Translation, transcription, extraction service stores (use `createServiceSlice` factory)
  - `factories/` - Store factory functions (e.g., `createServiceSlice` for shared Set + AbortController pattern)
  - `utils/` - Shared store utilities (e.g., `copySettingsKeys` for settings copy/reset)
  - `data/` - Project data caches
  - `ui/` - UI state stores (history, tools, theme, session, upload, etc.)
- `src/lib/db/` - Dexie database schema, migrations, and CRUD operations
- `src/lib/subtitles/` - SRT/ASS/VTT parsers and generators
- `src/lib/parser/` - AI response parsing and cleaning
- `src/lib/api/` - Backend API integration (streaming, credit management)
- `src/lib/utils/` - Utility modules split by domain (`cn.ts`, `format.ts`, `math.ts`, `audio.ts`, `file.ts`, `async.ts`, `transcription.ts`); barrel re-exported from `src/lib/utils.ts`
- `src/components/` - Feature components organized by domain (translate, batch, transcribe)
- `src/components/ui/` - Shadcn/Radix UI primitives (auto-generated, avoid editing)
- `src/components/transcribe/` - Transcription UI split into sub-components (upload-tab, select-tab, controls, result-panel, next-actions) composed by `transcription-main.tsx`
- `src/types/` - TypeScript interfaces for Project, Translation, Transcription, etc.
- `src/constants/` - App constants and defaults
- `src/constants/model-collection.ts` - AI model definitions (free and paid models with filtering utilities)

### Project Architecture

A **Project** is the central organizational unit. It contains:

```
Project
├── translations: Translation[]      # Subtitle translation histories
├── transcriptions: Transcription[]  # Audio transcription histories (settings stored on entity)
├── extractions: Extraction[]        # Context extraction histories
└── Default Settings (per feature)
    ├── Translation: defaultTranslationBasicSettingsId + defaultTranslationAdvancedSettingsId
    ├── Extraction: defaultExtractionBasicSettingsId + defaultExtractionAdvancedSettingsId
    └── Transcription: defaultTranscriptionId (stores settings directly on transcription)
```

**Entity Relationships:**
- `Translation` - Single subtitle file translation with `basicSettingsId` and `advancedSettingsId`
- `Transcription` - Audio-to-text with word-level timestamps, segments, and settings stored directly on entity (language, selectedMode, models, customInstructions)
- `Extraction` - Context analysis from subtitles with `basicSettingsId` and `advancedSettingsId`
- `BasicSettings` - Source/target language, model selection, context document, custom instructions, few-shot config
- `AdvancedSettings` - Temperature, split size, token limits, structured output, context caching options

**Settings Inheritance:**
- Each Translation/Extraction stores its own `basicSettingsId` and `advancedSettingsId`
- Transcriptions store settings directly on the entity (no separate settings table)
- When creating a new item, which settings it inherits depends on the project's enable flags:
  - `isDefaultTranslationEnabled = true` → use project's `defaultTranslationBasicSettingsId`
  - `isDefaultTranslationEnabled = false` → use global settings (from `src/constants/global-settings.ts`)
- Same pattern applies for Extraction (`isDefaultExtractionEnabled`) and Transcription (`isDefaultTranscriptionEnabled`)

**Batch Projects:**
Projects with `isBatch: true` enable batch processing mode with:
- Multi-file upload via drag-and-drop
- Queue management with concurrent translation limits
- ZIP export for completed translations

### Settings Hierarchy

Settings exist at multiple levels:
1. **Global settings** - Default settings for all projects (stored with special IDs in `src/constants/global-settings.ts`)
2. **Project default settings** - Per-project defaults for each feature (translation, extraction, transcription)
3. **Item settings** - Individual translation/extraction settings

### API Integration

All AI processing happens in the backend (chizuru-translator). The frontend:
1. Sends requests via SSE streaming (`src/lib/api/stream.ts`)
2. Uses Supabase Auth tokens for authentication
3. Handles credit management and reservations via the API

### Database Migrations

Dexie database is at version 24. When modifying data models in `src/types/`:

1. Update the TypeScript interface
2. Increment `this.version(X)` in `src/lib/db/db.ts`
3. Add `.upgrade()` function to populate new fields with defaults
4. Update `databaseExportConstructor` in `src/lib/db/db-constructor.ts`

## Code Style

- **No semicolons** at line endings
- **No comments** in code (unless explaining non-obvious logic)
- Use named imports from React (e.g., `import { useEffect, useState } from "react"`)
- Use path alias `@/*` for imports from `src/`
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes (or directly from `@/lib/utils/cn`)
- Use `toast.error()`/`toast.success()` from `sonner` for user feedback

## Settings Access Pattern

Use store selectors with settings IDs:

```tsx
const modelDetail = useSettingsStore(state => state.getModelDetail(basicSettingsId))
const setBasicSettingsValue = useSettingsStore(state => state.setBasicSettingsValue)
// Usage: setBasicSettingsValue(basicSettingsId, "sourceLanguage", "en")
```

## Service Store Pattern

Service stores (translation, transcription, extraction) use `createServiceSlice()` factory from `src/stores/factories/create-service-slice.ts` to generate shared state:
- `is*Set: Set<string>` — tracks active operation IDs
- `abortControllerMap: Map<string, RefObject<AbortController>>` — abort handles
- `setActive(id, isActive)` — adds/removes from Set, cleans up abortControllerMap on deactivation
- `stop(id)` — removes from Set, aborts controller, cleans up map

Each store keeps backward-compatible aliases (e.g., `setIsTranslating` → `setActive`, `stopTranslation` → `stop`).

## Important Files

- `src/lib/db/db.ts` - Database schema and migrations (version 24+)
- `src/lib/db/global-settings.ts` - Global settings management
- `src/lib/db/db-io.ts` - Database import/export functionality
- `src/lib/api/stream.ts` - SSE streaming for AI responses
- `src/constants/model-collection.ts` - Available AI models (free and paid model definitions)
- `src/constants/default.ts` - Default settings values
- `src/stores/factories/create-service-slice.ts` - Service store factory
- `src/stores/utils/copy-settings.ts` - Generic settings copy/reset utility