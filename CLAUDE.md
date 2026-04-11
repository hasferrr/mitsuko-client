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
bun test             # Run all tests (uses Bun's built-in test runner)
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
- `src/lib/utils/` - Utility modules split by domain (`cn.ts`, `format.ts`, `math.ts`, `audio.ts`, `file.ts`, `async.ts`, `done-tag.ts`); barrel re-exported from `src/lib/utils.ts`
- `src/lib/transcription/` - Transcription utilities: subtitle generation from word-level timestamps with CPS optimization
- `src/lib/translation/` - Translation utilities: context memory strategies (full, minimal, split) for AI completion requests
- `src/components/` - Feature components organized by domain (translate, batch, transcribe)
- `src/components/ui/` - Shadcn/Radix UI primitives (auto-generated, avoid editing)
- `src/components/transcribe/` - Transcription UI split into sub-components (upload-tab, select-tab, controls, result-panel, next-actions) composed by `transcription-main.tsx`
- `src/types/` - TypeScript interfaces for Project, Translation, Transcription, etc.
- `src/constants/` - App constants and defaults
- `src/constants/model-collection.ts` - AI model definitions (free and paid models with filtering utilities)
- `src/hooks/` - Custom hooks organized by domain:
  - `handler/` - Service operation handlers (translation, transcription, extraction)
  - `batch/` - Batch processing hooks for files, selection, and handlers
  - `project/` - Project data fetching and management
  - Root-level utilities (scroll-to-top, mobile detection, auto-scroll)

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
- **No `any` type** — use specific types, `unknown` with type guards, or proper type definitions
- Use named imports from React (e.g., `import { useEffect, useState } from "react"`)
- Use path alias `@/*` for imports from `src/`
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes (or directly from `@/lib/utils/cn`)
- Use `toast.error()`/`toast.success()` from `sonner` for user feedback
- **Tailwind v4** with CSS-based config in `src/app/globals.css` (no `tailwind.config.*`)

### Shadcn/ui Component Defaults

Do NOT re-add classes that components already provide. Key defaults:

- **Card**: `bg-card ring-1 ring-foreground/10 rounded-xl py-4 gap-4`. Has `size="sm"` (py-3, gap-3, CardContent px-3). Do NOT add `border`, `bg-card`, `rounded-lg` on Card.
- **CardHeader**: `px-4`. Card's `py-4` + `gap-4` handles vertical spacing — do NOT add `pb-*`/`py-*`.
- **CardContent**: `px-4` (group-data-[size=sm]/card:px-3). Do NOT add `p-4` (doubles padding). Use `space-y-4` on CardContent instead of `mb-*` on children.
- **CardFooter**: `p-4 border-t`. Do NOT add `pb-4` or `border-t`.
- **Button**: sizes — default(h-8), xs(h-6), sm(h-7), lg(h-9), icon(size-8), icon-lg(size-9). All sizes include `gap`. Do NOT add `mr-2` on icons inside Button; do NOT add manual `h-*`/`px-*` that override the size variant.
- **DialogContent**: `w-full max-w-[calc(100%-2rem)] p-4 gap-4 rounded-xl`. Do NOT add `w-full` or `pt-*`.
- **DialogHeader**: `gap-2`. Do NOT add `pb-*`.
- **DialogFooter**: `flex flex-col-reverse gap-2 border-t bg-muted/50 p-4 -mx-4 -mb-4 rounded-b-xl sm:flex-row sm:justify-end`. Do NOT add `flex`, `border-t`, `pt-4`, `sm:justify-between`.
- **Input**: `h-8 px-2.5 py-1`. Do NOT add `h-8` explicitly. Title inputs default to h-8 (not h-12).
- **SelectTrigger**: `h-8` (default), `h-7` (sm). Do NOT add `h-8` or `h-10`.
- **Textarea**: `w-full min-h-16 px-2.5 py-2 field-sizing-content`. Do NOT add `w-full`.
- **TabsTrigger**: includes `inline-flex items-center gap-1.5`. Do NOT add `mr-2` on icons or `flex items-center`.
- **DropdownMenuItem**: includes `gap-1.5`. Do NOT add `mr-2` on icons.

### Design Tokens

Use semantic tokens instead of hardcoded colors:
- `text-foreground` not `text-gray-900 dark:text-white` or `text-gray-800 dark:text-gray-200`
- `text-muted-foreground` not `text-gray-500 dark:text-gray-400` or `text-gray-600 dark:text-gray-400` or `text-gray-700 dark:text-gray-300`
- `text-card-foreground` not `text-gray-900 dark:text-white` (only inside Card component)
- `hover:text-foreground` not `hover:text-gray-900 dark:hover:text-white`
- `border-border` not `border-gray-200 dark:border-gray-800`
- `divide-border` not `divide-gray-200 dark:divide-gray-800`
- `bg-muted/50` not `bg-gray-50 dark:bg-gray-900/30`
- `text-destructive` not `text-red-500` (for error/error contexts)
- `bg-primary text-primary-foreground` not `bg-blue-500 text-white` (brand blue = primary)
- `bg-primary/10 text-primary` not `bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`
- `bg-primary/10` not `bg-blue-50 dark:bg-blue-900/20` (brand blue hover states)
- **Keep original background colors** — only replace borders and text colors with tokens, NOT background colors. This especially applies to landing pages and custom containers:
  - Landing sections use deliberate bg colors (e.g. `bg-white dark:bg-[#111111]`, `bg-gray-50/70 dark:bg-[#121212]`) that differ from `--card`/`--muted` CSS variables. Replacing them with `bg-card` or `bg-muted` shifts the visual tone (e.g. `bg-card` in dark mode is `oklch(0.205 0 0)` ≈ #222, not #111).
  - Landing pages have specific visual design with precise dark-mode values — these are intentional, not accidental hardcoding. Treat them as design choices, not tech debt.
  - Inside Card components, `bg-card` is already provided by the component — do NOT add it manually. But outside Card, keep the author's original bg value.

### Spacing Conventions

- Page wrappers: `py-6 px-4 max-w-5xl mx-auto`
- Use `space-y-4` on CardContent instead of `mb-*` on individual children
- When parent has `gap-*`, child `mb-*`/`mt-*` is redundant — remove it
- `gap-1.5` is the standard small gap (not `gap-[6px]`)

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