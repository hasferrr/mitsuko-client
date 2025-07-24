# Batch Translator TODO

## Notes

PLEASE READ THESE INSTRUCTIONS BEFORE YOU START WORKING ON THE BATCH TRANSLATOR COMPONENT:
- When a file is selected, dropped, or deleted, save it as a Translation data store for each subtitle, add its ID to `string[] // Array of Translation IDs` on the Batch store.
- When a file is reordered, update the `string[] // Array of Translation IDs` on the Batch store.
- Translation `basicSettings` and `advancedSettings` are the same as the batch's `defaultBasicSettingsId` and `defaultAdvancedSettingsId` for all translations in a batch.

## Store

- [x] create batch type
  ```ts
  export interface Batch {
    id: string
    name: string
    translations: string[] // Array of Translation IDs
    defaultBasicSettingsId: string
    defaultAdvancedSettingsId: string
    createdAt: Date
    updatedAt: Date
  }
  ```
- [x] create batch store
- [x] create batch dexie db migration
- [ ] integrate useSettings hook
- [x] bump Dexie version and add `batches` table schema
- [x] write Dexie `.upgrade()` migration for existing data
- [x] update `Translation` data model to link back to its parent `Batch` via `batchId: string`.

## Batch Translator Component

### Batch Management
- [ ] `handleFileDrop` when a file is selected, save it as a Translation data store for each subtitle, add its ID to `string[] // Array of Translation IDs` on the Batch store
- [ ] implement batch name input
- [ ] add checkbox to select which Translations to translate
- [ ] sync local `files` state with data from `use-batch-store` & `use-translation-data-store`
- [ ] ensure deletion updates both Dexie and Zustand stores consistently

### Batch Operations
- [ ] add pause/resume functionality for batch translation
- [ ] add batch progress indicator showing overall completion
- [ ] calculate and display overall batch progress (average of translation progresses)

### UI Enhancements
- [ ] create drag-and-drop reordering for batch files
- [ ] add `x` button to delete the subtitle from the Translation data store and `string[] // Array of Translation IDs` batch store

### Batch Export Options
- [ ] add option to export all files in a zip archive
