# Mitsuko - AI Subtitle Translator & Transcriber

## Instructions

You are a senior software engineer.

Your task is to develop **Mitsuko**, an AI-powered subtitle translation and audio transcription system that provides high-quality, context-aware translations. This all-in-one solution is designed for professionals and enthusiasts who require linguistic accuracy and technical precision. Use this document as your primary source of information.

---

## System Architecture

### Input Processing Pipeline

The platform accepts and processes the following source materials:

**Supported Input Formats:**
- **Subtitle Files** → `SRT`, `ASS`, and `VTT` format support with style preservation
- **Audio Files** → Transcription to timed text (MP3, WAV, FLAC, AAC, OPUS, etc.)
- **Text Content** → Pasted text for context extraction

### Generated Outputs

From each source, the system generates:
- **Translated Subtitle Files** → Context-aware translations in `SRT`, `ASS`, or `VTT` format.
- **Transcribed Subtitle Files** → Perfectly timed subtitles from audio sources.
- **Context Documents** → Reusable JSON documents containing character relationships, settings, and plot elements for series-wide consistency.

---

## Platform Features

### Project Management Interface
- **Organized Project Workspace** → Drag-and-drop functionality for managing tasks.
- **Categorized Tabs** → Separate views for translations, transcriptions, and context extractions.
- **Project History** → Complete project history and version tracking.
- **Data Portability** → Export and import capabilities for project data.

### Core Functionalities
- **Context-Aware Subtitle Translation** → Utilizes previous episode context for highly accurate translations in over 100 languages.
- **Batch Subtitle Translation** → Translate multiple subtitle files concurrently with queue management, selection, and drag-and-drop reordering.
- **Audio-to-Subtitle Transcription** → Generates perfectly timed subtitles from various audio formats.
- **AI-Powered Context Extraction** → Analyzes subtitle content to build a reusable knowledge base for consistent translations across a series.
- **My Library** → Manages a list of user's custom instructions for AI tasks.
- **Public Library** → A collection of public custom instructions.

### User Experience
- **Responsive Design** → Optimized for desktop use.
- **Authentication** → Secure sign-in via Supabase Auth.
- **Custom AI Model Integration** → Supports OpenAI-compatible APIs for custom model usage.
- **Advanced Controls** → Fine-tune AI performance with temperature adjustment, split size configuration, and structured JSON output.

---

## Technical Implementation

### Frontend Architecture
- **Framework:** Next.js 15 with App Router
- **Runtime:** Bun for enhanced performance
- **UI Framework:** React 19
- **Styling:** Tailwind CSS
- **Component Library:** Shadcn UI (built on Radix UI)
- **State Management:** Zustand for client-side state, TanStack React Query for server state.
- **Local Data Persistence:** Dexie.js (IndexedDB wrapper) for storing project data on the client.
- **Drag & Drop:** `@dnd-kit` for interactive UI.

**LLM Context:** As the AI assistant, it is crucial to follow these guidelines when working on the frontend:
- **Routing vs. Components:** The `src/app/` directory must be used *exclusively* for defining routes (`page.tsx`, `layout.tsx`). All reusable React components must be located in the `src/components/` directory.
- **Key Directories:** For any frontend task, focus your analysis on `src/app/` for page structure, `src/components/` for UI logic, `src/hooks/` for reusable logic, `src/stores/` for state management, and `src/lib/` for client-side utilities.
- **UI Enforcement:** All interactive elements and layouts must be built using Shadcn UI components to ensure a consistent design language.

### Backend Infrastructure
**Core Services:**
- **API Server:** Express.js with TypeScript
- **Runtime:** Bun native
- **AI Integration:** Multi-provider support (OpenAI, Gemini, Claude)
- **Subtitle Processing:** Custom parsers for SRT/ASS/VTT formats.

### Supporting Services
**Payment Processing:** Midtrans/Snap integration
**Deployment:**
- **Frontend:** Vercel
- **Backend:** Google Cloud Run.

---

## Project Documentation

This section provides a comprehensive guide to the project's structure, architecture, and key components.

### 1. High-Level Architecture

The project consists of two main parts:

- `mitsuko-client/` (This project): A Next.js 15 application responsible for the entire user interface, project management, and client-side data storage.
  - Implements authentication via Supabase Auth.
  - Manages project data locally using Dexie.js (IndexedDB).
- `chizuru-translator/`: A separate backend Express.js API server that handles the core AI-powered tasks: subtitle translation, audio transcription, and context extraction.

This separation allows for independent development and scaling. The frontend provides a rich client experience, while the backend focuses on intensive AI processing.

### 2. File and Directory Breakdown

A deep understanding of the project requires knowing the purpose of each key file and directory. The frontend follows a feature-based organization, with strict separation between routing, UI components, state management, and business logic.

#### Root Directory
- `README.md`: The main entry point for a quick project overview and setup instructions.
- `INSTRUCTIONS.md`: **(This file)** The single source of truth for the project's technical specifications and architecture. It should be the first point of reference.
- `package.json`: Defines project metadata and lists all frontend dependencies.
- `next.config.mjs`: Configuration for Next.js, including security headers and build options.
- `tailwind.config.ts`: Configuration for Tailwind CSS, defining the design system (colors, spacing, fonts).
- `tsconfig.json`: TypeScript configuration for the project.

---

#### `src/` Directory

This is the main source code folder for the Next.js application. All application code resides here. The structure is designed for scalability and clear separation of concerns.

- **`app/`**: The core of the Next.js App Router. This directory is used **exclusively** for routing and layout composition.
  - **Style:** Files here should be minimal. Page files (`page.tsx`) should ideally be single-line components that import and render a feature component from `src/components/`. Layout files (`layout.tsx`) compose the UI shell with components.
  - **Structure:**
    - `layout.tsx`: The root layout for the entire application. It sets up the HTML shell, including fonts, metadata, and global providers.
    - `globals.css`: Global styles and Tailwind CSS base layers. Defines the application's color palette and default styles.
    - `manifest.ts`, `robots.ts`, `sitemap.ts`: These files configure the application's metadata for SEO and PWA functionality.
    - **`(landing)/`**: A route group for all public-facing pages (e.g., home, pricing, terms). It has its own `layout.tsx` that defines the navigation and footer for the landing site.
      - `page.tsx`: The main landing page.
      - `pricing/page.tsx`: The pricing page.
      - `privacy/page.tsx`: The privacy policy page.
      - `terms/page.tsx`: The terms of service page.
    - **`(main)/`**: A route group for all authenticated app pages (e.g., dashboard, translate). It has its own `layout.tsx` which includes the main app sidebar and navigation.
      - `dashboard/page.tsx`: The main dashboard page after a user logs in.
      - `project/page.tsx`: Displays the contents and tasks within a single project.
      - `library/page.tsx`: Hosts the custom instruction Library, rendering `LibraryView` and its tabs.
      - `history/page.tsx`: Transcription History with redesigned UI and log viewer.
      - `tools/page.tsx`: Central hub for supplementary utilities (e.g., subtitle tools, viewers).
      - `batch/page.tsx`, `translate/page.tsx`, `transcribe/page.tsx`, `extract-context/page.tsx`: These are the main pages for the core application features.

- **`components/`**: Contains all reusable React components. This is the heart of the UI.
  - **Style:** Components are built with **Shadcn UI** (`@/components/ui`) and **Tailwind CSS**. Logic is encapsulated within the component or sourced from hooks. Props interfaces are defined directly in the component file.
  - **Structure:**
    - `ui/`: The unmodified, base components generated by Shadcn UI. These should not be edited directly.
    - `ui-custom/`: Custom, composed components that build upon the base `ui/` components to create project-specific elements (e.g., `delete-dialogue.tsx`, `drag-and-drop.tsx`).
    - `[feature]/`: Components are further organized into directories named after the feature they belong to (e.g., `translate/`, `dashboard/`, `sidebar/`).
      - `translate/subtitle-translator.tsx`: A thin wrapper component that loads settings and renders `SubtitleTranslatorMain`.
      - `translate/subtitle-translator-main.tsx`: The main container component that manages all subtitle translation logic and UI.
      - `extract-context/context-extractor.tsx`: A thin wrapper component that loads settings and renders `ContextExtractorMain`.
      - `extract-context/context-extractor-main.tsx`: The main container component housing all logic and UI for context extraction.
      - `transcribe/transcription.tsx`: A thin wrapper component that loads project data and renders `TranscriptionMain`.
      - `transcribe/transcription-main.tsx`: The main container component responsible for the entire audio transcription workflow.
      - `history/history-panel.tsx`: Main history list UI with table and actions.
      - `history/history-item-details.tsx`: Dialog for viewing a single history item’s details.
      - `dashboard/welcome-view.tsx`: The main component for the dashboard, showing options to start new tasks and recent projects.
      - `sidebar/app-sidebar.tsx`: The main sidebar component for the application.
      - `auth/login.tsx`: A component handling the user authentication form and user settings display.
      - `library/library-view.tsx`: Composes the Library tabs (`My Library`, `Public Library`) as the entry point for managing instructions.
      - `library/create-edit-instruction-dialog.tsx`: Modal dialog for creating or editing a custom instruction with validation and auto-resizing textarea.
      - `library/export-instructions-controls.tsx`: Toolbar controls for batch selection and export of instructions to a downloadable JSON file.
      - `library/import-instructions-dialog.tsx`: Dialog for importing instructions from JSON with schema validation, selectable items, and ID conflict handling.
      - `library/my-library.tsx`: Implements the “My Library” view with search, CRUD, export, and publish capabilities for the user’s own instructions.
      - `library/public-library.tsx`: Implements the “Public Library” view for browsing, searching, paginating, importing, and deleting public instructions (owner-only delete).
      - `batch/batch-translator.tsx`: A wrapper component that manages batch projects and renders `BatchTranslatorMain`.
      - `batch/batch-translator-main.tsx`: The primary container for batch subtitle translation, handling file upload, selection, concurrent translation, and downloads.
      - `batch/sortable-batch-file.tsx`: A sortable list item component representing an individual subtitle file within a batch with status indicators and actions.

- **`constants/`**: Contains static, hard-coded values used throughout the application. This prevents magic strings and numbers in the codebase, making maintenance easier.
  - **Style:** Files export `const` variables.
  - **Structure:**
    - `api.ts`: Defines all API endpoints for the backend services.
    - `custom-instructions.ts`: Contains preset strings for guiding the AI's behavior in translation or transcription tasks.
    - `default.ts`: Provides default object shapes and initial values for core data types like `BasicSettings` and `Translation`.
    - `external-links.ts`: Centralizes all external URLs used in the application, such as links to social media or documentation.
    - `lang.ts`: Lists all supported language codes and their full names.
    - `limits.ts`: Defines numeric limits for application settings, such as maximum token counts or split sizes.
    - `metadata.ts`: Contains metadata for SEO, such as the site title, description, and keywords.
    - `model-collection.ts`: Defines the entire collection of AI models available, separated into free and paid tiers.
    - `model-preferences.ts`: Specifies preferred or recommended models for certain tasks (e.g., favorite, high-quality).
    - `pricing.ts`: Holds all pricing information, including subscription plans and credit pack details.

- **`contexts/`**: Holds React Context providers for sharing state that is global and doesn't change often.
  - **Style:** Uses standard React Context API. A `providers.tsx` file often composes multiple contexts to be used in the root layout.
  - **Structure:**
    - `providers.tsx`: A server component that fetches initial data (like model costs) and passes it to the client-side provider.
    - `providers-client.tsx`: The main client-side provider that wraps the entire application. It composes all other context providers and initializes global states like the theme and payment scripts.
    - `session-context.tsx`: Subscribes to Supabase authentication state changes and provides the user session data to the entire component tree.
    - `project-context.tsx`: Responsible for loading all user projects from IndexedDB when the application starts.
    - `unsaved-changes-context.tsx`: Manages a global flag (`hasChangesRef`) to detect unsaved work and warn the user with a `beforeunload` event if they try to navigate away.
    - `model-cost-context.tsx`: Provides a map of AI model names to their credit costs, fetched from the server.
    - `client-id-context.tsx`: Manages a unique, persistent client ID for the user's browser, stored in IndexedDB.

- **`hooks/`**: Houses reusable React hooks that encapsulate complex or shared logic.
  - **Style:** Custom hooks are prefixed with `use`. They abstract side effects and stateful logic that can be shared across multiple components.
  - **Structure:**
    - `use-settings.tsx`: A hook that simplifies the management of basic and advanced settings for a given task (translation, extraction, etc.). It ensures the correct settings are loaded and updated in the Zustand stores.
    - `use-snap-payment.tsx`: Encapsulates the logic for interacting with the Midtrans Snap payment gateway, including initiating the payment popup and handling callbacks.
    - `use-auto-scroll.ts`: A simple hook that automatically scrolls a text area to the bottom when its content changes, useful for displaying real-time logs or streaming responses.
    - `use-email-link.ts`: A hook to safely display a `mailto:` link, revealing the email address only upon user interaction to prevent scraping.
    - `use-mobile.tsx`: A hook that detects if the user is on a mobile device based on screen width.

- **`lib/`**: Contains utility functions, helper scripts, and the core application logic that is not tied to a specific component. This is where the bulk of the "heavy lifting" happens.
  - **Style:** Files primarily export functions.
  - **Structure:**
    - `utils.ts`: A collection of general-purpose utility functions used across the application, such as `cn` for merging class names, `sleep` for adding delays, and `minMax` for clamping numbers.
    - `supabase.ts`: Initializes and exports the Supabase client for authentication and database interactions.
    - `indexed-db-storage.ts`: Implements a `StateStorage` interface for Zustand, allowing state to be persisted in IndexedDB for more robust client-side storage.
    - `context-memory.ts`: A utility for formatting context data into a consistent JSON structure before sending it to the AI.
    - **`api/`**: Contains functions for making requests to the backend server. Each file typically corresponds to a specific API resource.
      - `stream.ts`: A crucial utility for handling streaming API responses from the backend, which is essential for real-time updates during AI processing.
      - `user-credit.ts`: Fetches the current user's credit balance.
      - `transaction.ts`: Fetches the user's transaction history.
      - `subtitle-log.ts`: Sends subtitle data to the server for logging and analysis.
      - `transcription-log.ts`: Sends transcription data to the server for logging and analysis.
      - `get-model-cost-data.ts`: Retrieves the current pricing for various AI models.
      - `feedback.ts`: Submits user feedback to the backend.
      - `create-snap-payment.ts`: Initiates a payment process with the Midtrans payment gateway.
      - `credit-batch.ts`: Fetches information about credit batches granted to a user.
      - `credit-reservations.ts`: Manages temporary holds of credits during processing.
      - `custom-instruction.ts`: Handles CRUD operations for public and private custom instructions (publish, fetch, delete).
    - **`db/`**: The entire client-side database layer, built with **Dexie.js**.
      - `db.ts`: Defines the Dexie database schema, including all tables, their versions, and migration logic.
      - `project.ts`, `translation.ts`, `transcription.ts`, `extraction.ts`, `settings.ts`: These files contain all the CRUD (Create, Read, Update, Delete) operations for their respective data models. They use Dexie transactions to ensure data integrity.
      - `custom-instruction.ts`: Contains all CRUD operations for custom instructions stored in Dexie, mirroring logic in `use-custom-instruction-store`.
      - `db-io.ts`: Implements the logic for exporting and importing the entire database as a JSON file.
      - `db-constructor.ts`: Validates and cleans data during the import process, setting default values for missing fields to ensure compatibility with the current schema.
    - **`parser/`**: Contains logic for parsing and cleaning data, especially AI model responses.
      - `parser.ts`: Core functions for parsing JSON responses from the AI, extracting thinking steps, and cleaning up the final output.
      - `cleaner.ts`: Provides helper functions to clean up raw string responses from the AI, such as removing markdown wrappers.
      - `repairer.ts`: A robust utility to fix malformed or incomplete JSON strings returned by the AI, ensuring they can be parsed correctly.
    - **`subtitles/`**: Houses advanced logic for creating, parsing, and manipulating subtitle data structures.
      - `parse-subtitle.ts`: The main entry point for parsing subtitle files, which detects the format (SRT, ASS, or VTT) and uses the appropriate parser.
      - `merge-subtitle.ts`: The main entry point for generating a subtitle file string from subtitle data structures (SRT, ASS, or VTT).
      - `is.ts`: Contains simple functions to check if a file content is SRT, ASS, or VTT.
      - `timestamp.ts`: Provides utilities for handling subtitle timestamps, such as converting them to strings or shifting them.
      - **`srt/`**: Contains the specific logic for handling SRT files.
        - `parse.ts`: Parses a raw SRT file string into a structured `Subtitle[]` array.
        - `generate.ts`: Generates a valid SRT file string from a `Subtitle[]` array.
      - **`ass/`**: Contains the specific logic for handling ASS files.
        - `parse.ts`: Parses a raw ASS file string, separating it into header, events, and footer.
        - `merge.ts`: Reconstructs an ASS file string from its component parts.
        - `helper.ts`: Contains helper functions for ASS parsing and reconstruction.
      - **`vtt/`**: Contains the specific logic for handling VTT (WebVTT) files.
        - `parse.ts`: Parses a raw VTT file string into a structured `Subtitle[]` array.
        - `generate.ts`: Generates a valid VTT file string from a `Subtitle[]` array.
      - **`utils/`**: Contains utility functions for working with subtitle data.
        - `combine-subtitle.ts`: Merges original and translated text into a single subtitle entry with various formatting options.
        - `count-untranslated.ts`: Counts the number of untranslated lines in a subtitle project.
        - `merge-intervals-w-gap.ts`: Merges numeric intervals that are close to each other, useful for batching translation tasks.
        - `remove-content-between.ts`: Removes text between specified delimiters.
        - `remove-line-breaks.ts`: Removes line breaks from subtitle text.

- **`stores/`**: Contains **Zustand** store definitions for managing global, mutable client-side state. Zustand is used for state that is accessed and modified by multiple components across the application.

  - **Style:** Uses the `create<T>()(...)` pattern. State is kept minimal. Actions are co-located with the state. Asynchronous actions (API calls) are handled directly within the store. Stores that need to persist across sessions use the `persist` middleware.

  - **Structure:**
    Stores are organized into subdirectories by their domain: `data` for core application data, `services` for managing API calls and processes, and `settings` for user-configurable options.

    -   **`data/`**: Stores that hold the primary data structures of the application, often mirroring the database schema.
        -   `use-project-store.ts`: Manages the list of all projects (including **Batch** projects where `isBatch` is `true`), the currently selected project, and performs CRUD operations on projects.
        -   `use-translation-data-store.ts`: Holds the in-memory data for individual translation tasks, including subtitles and results. It interfaces with Dexie.js for persistence.
        -   `use-transcription-data-store.ts`: Manages data for audio transcription tasks.
        -   `use-extraction-data-store.ts`: Manages data for context extraction tasks.
        -   `use-custom-instruction-store.ts`: Manages the list of custom instructions.

    -   **`services/`**: Stores responsible for managing the state of ongoing processes, especially API interactions.
        -   `use-translation-store.ts`: Handles the state of the translation process itself, including loading states (`isTranslatingSet`) and abort controllers for network requests.
        -   `use-transcription-store.ts`: Manages the transcription process, including file handling, loading states, and abort controllers.
        -   `use-extraction-store.ts`: Manages the context extraction process, loading states, and abort controllers.
        -   `use-extraction-input-store.ts`: Manages the state of file inputs for batch context extraction.

    -   **`settings/`**: Stores that manage user-defined settings, both for the application and for specific tasks.
        -   `use-settings-store.ts`: Manages basic settings for translation/extraction tasks (e.g., languages, model selection).
        -   `use-advanced-settings-store.ts`: Manages advanced AI parameters (e.g., temperature, token limits).
        -   `use-local-settings-store.ts`: Manages local, device-specific settings like API keys, persisted in `localStorage`.

    -   **Root-level stores**:
        -   `use-session-store.ts`: Holds the current user's authentication session from Supabase.
        -   `use-theme-store.ts`: Manages the application's theme (dark/light mode).
        -   `use-history-store.ts`: Persists a history of completed translations to IndexedDB.
        -   `use-snap-store.ts`: Manages payment transaction data from Midtrans/Snap.
        -   `use-client-id-store.ts`: Stores a unique client ID for the session.

  - **How to Add or Modify State:**
    When you need to add a new piece of client-side state, follow these steps:
    1.  **Identify the Right Store:** Determine which existing store is the best fit for the new state. Does it relate to `data`, `services`, or `settings`? If it doesn't fit anywhere, create a new store in the appropriate directory.
    2.  **Update the Interface:** Add the new state property and any associated actions (setter functions) to the store's TypeScript interface.
    3.  **Update the `create` Function:** In the `create<T>()(...)` call, add the new state property to the initial state object. Then, implement the action function(s) you defined in the interface.
    4.  **Keep Actions Co-located:** The function to update a piece of state should always live within the same store as the state itself. This makes the state logic predictable and easy to find.
    5.  **Handle Persistence (If Needed):** If the state needs to persist between user sessions, ensure the `persist` middleware is configured for the store. For sensitive data, use `indexedDBStorage`; for non-sensitive, local settings, `localStorage` is acceptable.

- **`static/`**: Contains static assets that are served directly, such as images and fonts. These files are not processed by the build pipeline.

- **`types/`**: Contains shared TypeScript type definitions and interfaces used across the application.
  - **Style:** Uses `interface` for object shapes and `type` for unions or other complex types. Files are named after the data model they describe.
  - **Structure:**
    - `project.ts`: Defines the core data models for the application, such as `Project` (with an `isBatch` boolean that marks a Batch Translation project), `Translation`, `Transcription`, `Extraction`, `BasicSettings`, and `AdvancedSettings`.
    - `public-custom-instruction.ts`: Defines the `PublicCustomInstruction` type used by the public instruction sharing feature.
    - `subtitles.ts`: Defines the various shapes of subtitle data, including `Subtitle`, `SubtitleTranslated`, `Timestamp`, and `Parsed` (which holds format-specific data like ASS headers).
    - `model.ts`: Defines the `Model` interface, which describes the properties of an AI model, and the `ModelProvider` type.
    - `completion.ts`: Defines the type for context completion messages sent to the AI.
    - `model-cost.ts`: Defines the types for model pricing information.
    - `pricing.ts`: Defines types related to currency and credit packs.
    - `product.ts`: Defines the `ProductId` type for identifying products in the payment system.
    - `request.ts`: Defines the `RequestType` for API calls (e.g., `free`, `paid`).
    - `snap.ts`: Contains types for interacting with the Midtrans Snap payment gateway.
    - `transaction.ts`: Defines the `Transaction` type for recording credit usage.
    - `transcription-log.ts`: Defines types for transcription logging entries.
    - `user.ts`: Defines the `UserCreditData` type.
    - `custom-instruction.ts`: Defines the CustomInstruction interface.

**LLM Context for Frontend:** When creating new features, follow this structure strictly. For example, a new "Analytics" page would involve:
1. Adding a new route in `src/app/(main)/analytics/page.tsx`.
2. Creating a primary component in `src/components/analytics/analytics-view.tsx`.
3. Adding a new Zustand store for analytics data in `src/stores/data/use-analytics-data-store.ts`.
4. Defining database logic in `src/lib/db/analytics.ts`.
5. Adding any new types in `src/types/analytics.ts`.

---

### 3. Environment Variables

To run the project, you must configure environment variables.

1.  Create a `.env.local` file by copying from `.env.example`.
2.  Populate `.env.local` with the necessary credentials.

### 4. Database & Data Persistence

The application uses a hybrid data storage approach:

-   **Client-Side (Primary):** Project data, including uploaded files, settings, and generated results, is stored in the user's browser using **IndexedDB**. The **Dexie.js** library is used as a wrapper to manage the database schema, tables, and queries. This allows for a robust offline-first experience and keeps user project data private to their own machine.
-   **Server-Side (Authentication):** User authentication and user profiles are managed by **Supabase Auth**. This is separate from the project data storage.

This design ensures user data privacy and reduces server-side storage costs, while still providing secure authentication.

### 5. Core Component Interaction & Data Flow

The platform's functionality relies on a clear interaction model between the frontend and backend.

1.  **User Action (Frontend):** A user creates a new project and uploads a source file (e.g., an `.srt` subtitle file) into the `mitsuko-client` interface. The file is read into memory and stored in IndexedDB via Dexie.js.
2.  **API Request (Frontend → Backend):** The user configures the translation settings (languages, context, etc.) and clicks "Start". The frontend makes a secure API call to the `chizuru-translator` backend. The request payload includes the file content and all user-defined parameters.
3.  **AI Processing (Backend):** The backend server receives the request.
    - It parses the subtitle file.
    - It constructs a prompt using the content and any provided context documents.
    - It sends the prompt to the selected AI provider (e.g., Gemini, OpenAI).
4.  **AI Generation (AI → Backend):** The AI service processes the prompt and streams the translated content back to the backend server.
5.  **Response Stream (Backend → Frontend):** The backend streams the results back to the `mitsuko-client` frontend in real-time.
6.  **Data Persistence (Frontend):** The frontend receives the translated data and updates the corresponding project in IndexedDB. The UI reacts to the data changes, showing the translated output.
7.  **Export (Frontend):** The user can then export the final, translated subtitle file directly from the browser.

This workflow is optimized for handling large files and long-running AI tasks by using streaming and local data persistence, providing a responsive and powerful user experience.

### 6. Data Management & Migrations

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
          project.isArchived = false;
        }
      });
    });
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
    };
    ```

#### Database Import & Export
The application supports full data portability through JSON export and import. This functionality is primarily handled by two files:

-   **`src/lib/db/db-io.ts`:** This file contains the core logic for the import/export feature.
    -   `exportDatabase()`: Serializes all tables in the Dexie.js database into a single JSON string.
    -   `importDatabase()`: Deserializes a JSON string and imports the data. It provides options to either clear all existing data before import or to merge the imported data with existing data by generating new unique IDs for the imported records.

-   **`src/lib/db/db-constructor.ts`**: This file is now crucial for ensuring data integrity during the import process. The `databaseExportConstructor` function acts as a validation and cleaning layer. It takes the raw imported JSON, iterates through each table and record, and constructs a clean, type-safe database object. It sets default values for any missing fields, ensuring that data imported from older versions of the application conforms to the current database schema. **Any change to the data models must be reflected here.**

### 7. Dependencies

 The project relies on a number of key dependencies to function. This is not an exhaustive list, but it highlights the most important libraries and their roles.

 -   **`next`**: The core React framework for building the application.
 -   **`react`** / **`react-dom`**: The UI library and DOM renderer.
 -   **`tailwindcss`**, **`tailwind-merge`**, **`tailwindcss-animate`**: Styling utilities and animations.
 -   **`@radix-ui/react-*`**: Accessible UI primitives. Shadcn-generated components live in `src/components/ui`.
 -   **`zustand`** and **`@tanstack/react-query`**: Client and server state management.
 -   **`dexie`**: IndexedDB wrapper for robust client-side persistence.
 -   **`@dnd-kit/*`**: Drag-and-drop utilities for interactive lists.
 -   **`@supabase/supabase-js`**: Authentication and Supabase client.
 -   **`lucide-react`**, **`sonner`**, **`next-themes`**, **`vaul`**, **`react-day-picker`**: Icons, toasts, theming, drawers, and date picker.
 -   **`react-markdown`** + **`rehype-raw`**, **`recharts`**, **`framer-motion`**, **`jszip`**, **`sharp`**: Rendering, charts, animations, archiving, and image processing.
 -   **Runtime: Bun**
