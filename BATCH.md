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
- [x] integrate useSettings hook
- [x] bump Dexie version and add `batches` table schema
- [x] write Dexie `.upgrade()` migration for existing data
- [x] update `Translation` data model to link back to its parent `Batch` via `batchId: string`.

## Batch Translator Component

### Batch Management
- [x] **File Handling (`handleFileDrop`):**
  - [x] When files are dropped, for each valid subtitle file:
    - [x] Create a new `Translation` entry in Dexie using a new `createTranslationForBatch` function.
    - [x] This function will associate the new `Translation` with the current `Batch` ID.
    - [x] The `basicSettingsId` and `advancedSettingsId` for the new `Translation` will be copied from the batch's default settings IDs.
    - [x] Add the new `Translation` ID to the `translations` array in the current `Batch` object.
    - [x] Update both `use-batch-store` and `use-translation-data-store` to reflect the new additions.
- [ ] **Batch Naming:**
  - [ ] Implement a debounced `onChange` handler for the batch name `<Input>`.
  - [ ] On change, call `renameBatch` from the `useBatchStore` to update the name in Dexie and Zustand.
- [ ] **File Selection for Translation:**
  - [ ] Add a `<Checkbox>` next to each file in the batch list.
  - [ ] Maintain a local state `Set<string>` to track the IDs of selected files.
  - [ ] The "Start Translation" button will only process the files selected in this set.
- [x] **State Synchronization:**
  - [x] Refactor the component to remove local `files` state.
  - [x] The list of files will be derived from `useBatchStore` (getting the array of translation IDs).
  - [x] The data for each file (title, status, progress) will be fetched from `useTranslationDataStore` and a new `use-batch-translation-store` for real-time status.
- [ ] **Deletion Logic:**
  - [ ] The 'x' button on a file will trigger a confirmation dialog.
  - [ ] On confirmation, it will call a `removeTranslationFromBatch` function.
  - [ ] This function will remove the `Translation` from Dexie (via `deleteTranslation`), and update the `translations` array in the `Batch` store.

### Batch Operations
- [ ] **Pause/Resume Functionality:**
  - [ ] Implement a global pause/resume state for the batch process (e.g., in `use-batch-translation-store`).
  - [ ] The main translation loop will check this state *between* processing files, not during a file's translation.
  - [ ] A "Pause" button will set the state to `paused`, and a "Resume" button will set it back to `running`.
- [ ] **Overall Progress Indicator:**
  - [ ] Add a `<Progress>` bar to the main header of the batch translator.
  - [ ] The value of this progress bar will be the average of the progress of all individual files in the batch.
- [ ] **Progress Calculation:**
  - [ ] The progress for each file will be tracked in the new `use-batch-translation-store`.
  - [ ] A function within the component will calculate the average progress (`total progress / number of files`) and update the UI.

### UI Enhancements
- [ ] **Drag-and-Drop Reordering:**
  - [ ] Use `@dnd-kit` to allow reordering of files in the batch list.
  - [ ] On `onDragEnd`, update the order of translation IDs in the `useBatchStore`.
  - [ ] This new order will be persisted to Dexie to be saved across sessions.
- [ ] **Delete Button (`x`):**
  - [ ] Add an 'x' icon button to each file card.
  - [ ] On click, show a confirmation `<AlertDialog>`.
  - [ ] If confirmed, execute the deletion logic defined in the "Batch Management" section.

### Batch Export Options
- [ ] **Export as ZIP Archive:**
  - [ ] Add an "Export All as ZIP" button. This will export all *completed* translations.
  - [ ] Use the `jszip` library to create a zip archive in the browser.
  - [ ] For each completed file, generate the translated subtitle content.
  - [ ] Add each generated file to the zip with a descriptive name (e.g., `original-name-translated.srt`).
  - [ ] Trigger a download of the generated zip file.
