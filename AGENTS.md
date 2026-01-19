# Instructions

## Project overview

Mitsuko is an AI-powered subtitle translation and audio transcription platform focused on high-quality, context-aware results for professional workflows

- **Inputs**
  - Subtitle files: SRT, ASS, VTT with style preservation
  - Audio files: MP3, WAV, FLAC, AAC, OPUS (transcribed to timed text)
  - Text content: pasted text for context extraction
- **Outputs**
  - Translated subtitles: SRT, ASS, VTT
  - Transcribed subtitles: timed text from audio
  - Context documents: reusable text for series-wide consistency

- **Core features**
  - Project workspace with drag-and-drop, categorized tabs, history, import/export
  - Context-aware subtitle translation across 100+ languages
  - Batch translation with queueing, selection, drag-and-drop reordering
  - Audio-to-subtitle transcription with streaming UI
  - AI-powered context extraction to build reusable knowledge bases
  - Instruction Library: personal and public custom instructions

- **Tech stack**
  - Frontend: Next.js 16 (App Router), React 19, Tailwind, Shadcn/Radix UI, Zustand, React Query, Dexie.js (indexedDB), @dnd-kit, Bun runtime
  - Backend: separate Express.js (TypeScript, Bun) service with multi-provider AI (OpenAI, Gemini, Claude) and custom subtitle parsers
  - Payments: Midtrans/Snap, LemonSqueezy
  - Deployment: Vercel (frontend), Google Cloud Run (backend)

- **Data & auth**
  - Client-side persistence via IndexedDB using Dexie.js for offline-first project data
  - Authentication via Supabase Auth (separate from project data)

- **Developer conventions**
  - `src/app/` exclusively for routes (`page.tsx`, `layout.tsx`); reusable UI in `src/components/`
  - Focus directories: `src/app/`, `src/components/`, `src/hooks/`, `src/stores/`, `src/lib/`
  - Database layer in `src/lib/db/` with schema, migrations, and full JSON import/export
  - Subtitle utilities in `src/lib/subtitles/` for parse/merge/convert and helpers

## Global instructions

- Always use Bun as runtime and package manager
- Do not write semicolon at the end of the line
- Do not write any single comments
- Do not run to build the project, use compiler checker like `bun tsc` instead
- Do not execute `git push`

## Specific instructions

### Data Management & Migrations

Given that the application's state is persisted locally in the user's browser via IndexedDB (Dexie.js), managing data schema changes is critical. Follow these guidelines strictly.

#### Data Model Changes & Migrations

When you need to add or change a property on a core data model (e.g., adding a `language` field to the `Project` type in `src/types/project.ts`):

1.  **Update the Type Definition:** First, modify the TypeScript type in the appropriate file within `src/types/`. For example, to add `isArchived` to a project, you would edit `src/types/project.ts`.

2.  **Increment the Database Version:** Open `src/lib/db/db.ts`. Find the latest `this.version(X)` and add a new, incremented version: `this.version(X + 1)`.

3.  **Update Indexed Fields (If Necessary):** If the new property needs to be indexed for fast lookups (i.e., you will use it in a `db.table.where(...)` clause), add it to the schema definition string in `.stores({...})`. For example, `projects: '++id, name, &title, isArchived'`.

4.  **Write an Upgrade Function:** Provide an `.upgrade()` function for the new version. Inside this function, use `tx.table('tableName').toCollection().modify(...)` to iterate over existing records and add the new property with a default value. This ensures that users who have older versions of the database get their schema updated without losing data.

    **Example Migration:**
    ```typescript
    // In src/lib/db/db.ts
    this.version(13).stores({
      projects: '++id, name, &title, isArchived' // Add new field to index
    }).upgrade(async tx => {
      // Add a 'isArchived' field to all existing projects
      await tx.table('projects').toCollection().modify(project => {
        // Check if the property already exists to avoid overwriting it
        if (typeof project.isArchived === 'undefined') {
          project.isArchived = false
        }
      })
    })
    ```

5.  **Update the Database Constructor:** To ensure data integrity during database imports, you must update the `databaseExportConstructor` function in `src/lib/db/db-constructor.ts`. This function validates imported data and sets default values for any missing fields. Add the new property to the constructor logic to prevent data corruption from older export files.

    **Example Update:**
    ```typescript
    // In src/lib/db/db-constructor.ts
    // Inside the `projects` array mapping
    const project = {
      ...p,
      // ... other properties
      isArchived: typeof p.isArchived === 'boolean' ? p.isArchived : false, // Add default value
    }
    ```

#### Database Import & Export

The application supports full data portability through JSON export and import. This functionality is primarily handled by two files:

-   **`src/lib/db/db-io.ts`:** This file contains the core logic for the import/export feature.
    -   `exportDatabase()`: Serializes all tables in the Dexie.js database into a single JSON string.
    -   `importDatabase()`: Deserializes a JSON string and imports the data. It provides options to either clear all existing data before import or to merge the imported data with existing data by generating new unique IDs for the imported records.

-   **`src/lib/db/db-constructor.ts`**: This file is now crucial for ensuring data integrity during the import process. The `databaseExportConstructor` function acts as a validation and cleaning layer. It takes the raw imported JSON, iterates through each table and record, and constructs a clean, type-safe database object. It sets default values for any missing fields, ensuring that data imported from older versions of the application conforms to the current database schema. **Any change to the data models must be reflected here.**

### Accessing & Updating Basic & Advanced Settings Values

Use selector helpers exposed by each store to read state scoped by ID. Wrap them when you need derived behavior.

```tsx
const modelDetail = useSettingsStore(state => state.getModelDetail(basicSettingsId))
const isUseCustomModel = useSettingsStore(state => state.getIsUseCustomModel(basicSettingsId))
```

```tsx
const maxCompletionTokens = useAdvancedSettingsStore(state => state.getMaxCompletionTokens(advancedSettingsId))
const isMaxCompletionTokensAuto = useAdvancedSettingsStore(state => state.getIsMaxCompletionTokensAuto(advancedSettingsId))
```

Components update settings through thin wrappers around the generic store setters. This ensures the correct `basicSettingsId` or `advancedSettingsId` is always supplied and keeps UI logic clean.

```tsx
const setBasicSettingsValue = useSettingsStore((state) => state.setBasicSettingsValue)
const setSourceLanguage = (language: string) => setBasicSettingsValue(basicSettingsId, "sourceLanguage", language)
const setTargetLanguage = (language: string) => setBasicSettingsValue(basicSettingsId, "targetLanguage", language)
```

```tsx
const setAdvancedSettingsValue = useAdvancedSettingsStore((state) => state.setAdvancedSettingsValue)
const setMaxCompletionTokens = (value: number) => setAdvancedSettingsValue(advancedSettingsId, "maxCompletionTokens", value)
const setIsMaxCompletionTokensAuto = (value: boolean) => setAdvancedSettingsValue(advancedSettingsId, "isMaxCompletionTokensAuto", value)
```

This wrapper pattern is used across settings components (`translate`, `batch`, `extract-context`, etc.) to keep component code declarative while leveraging the centralized setters exposed by the stores.
As with setters, these getters ensure each component interacts only with the relevant slice of settings, avoiding accidental cross-project state leaks.

### Subtitle text encoding

- Use `createUtf8SubtitleBlob(content, type)` from `src/lib/utils.ts` for all SRT/ASS/VTT downloads
- VTT uses UTF-8 without BOM; other subtitle types use UTF-8 with BOM
- For non-subtitle exports (context `.txt`, CSV, JSON), use plain UTF-8 Blobs without BOM
