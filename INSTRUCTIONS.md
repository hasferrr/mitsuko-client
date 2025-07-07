# Mitsuko - AI Subtitle Translator & Transcriber

## Instructions

You are a senior software engineer.

Your task is to develop **Mitsuko**, an AI-powered subtitle translation and audio transcription system that provides high-quality, context-aware translations. This all-in-one solution is designed for professionals and enthusiasts who require linguistic accuracy and technical precision. Use this document as your primary source of information.

---

## System Architecture

### Input Processing Pipeline

The platform accepts and processes the following source materials:

**Supported Input Formats:**
- **Subtitle Files** → `SRT` and `ASS` format support with style preservation
- **Audio Files** → Transcription to timed text (MP3, WAV, FLAC, AAC, OPUS, etc.)
- **Text Content** → Pasted text for context extraction

### Generated Outputs

From each source, the system generates:
- **Translated Subtitle Files** → Context-aware translations in `SRT` or `ASS` format.
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
- **Audio-to-Subtitle Transcription** → Generates perfectly timed subtitles from various audio formats.
- **AI-Powered Context Extraction** → Analyzes subtitle content to build a reusable knowledge base for consistent translations across a series.

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
- **Subtitle Processing:** Custom parsers for SRT/ASS formats.

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
    - `(landing)/`: A route group for all public-facing pages (e.g., pricing, terms). It has its own `layout.tsx`.
    - `(main)/`: A route group for all authenticated app pages (e.g., dashboard, translate). It has its own `layout.tsx` which includes the main app sidebar and navigation.
    - `globals.css`: Global styles and Tailwind CSS base layers.
    - `layout.tsx`: The root layout for the entire application.

- **`components/`**: Contains all reusable React components. This is the heart of the UI.
  - **Style:** Components are built with **Shadcn UI** (`@/components/ui`) and **Tailwind CSS**. Logic is encapsulated within the component or sourced from hooks. Props interfaces are defined directly in the component file.
  - **Structure:**
    - `ui/`: The unmodified, base components generated by Shadcn UI. These should not be edited directly.
    - `ui-custom/`: Custom, composed components that build upon the base `ui/` components to create project-specific elements (e.g., `delete-dialogue.tsx`).
    - `[feature]/`: Components are further organized into directories named after the feature they belong to (e.g., `translate/`, `dashboard/`, `sidebar/`).
      - `subtitle-translator.tsx`: A "smart" container component that manages state and logic for the entire translation page.
      - `login.tsx`: A component handling the user authentication form.

- **`constants/`**: Contains static, hard-coded values used throughout the application.
  - **Style:** Files export `const` variables. This prevents magic strings and numbers in the codebase.
  - **Structure:**
    - `api.ts`: API endpoints.
    - `lang.ts`: Language codes and names.
    - `limits.ts`: Numeric limits for settings (e.g., `MAX_COMPLETION_TOKENS_MAX`).
    - `default.ts`: Default object shapes for core types like settings.

- **`contexts/`**: Holds React Context providers for sharing state that is global and doesn't change often.
  - **Style:** Uses standard React Context API. A `providers.tsx` file often composes multiple contexts to be used in the root layout.
  - `session-context.tsx`: Provides Supabase session data to the component tree.
  - `unsaved-changes-context.tsx`: Manages a global flag for unsaved work to warn the user before navigation.

- **`hooks/`**: Houses reusable React hooks.
  - **Style:** Custom hooks are prefixed with `use`. They encapsulate complex logic, side effects, or stateful logic that can be shared across multiple components.
  - `use-settings.tsx`: A hook to manage and abstract settings logic.
  - `use-snap-payment.tsx`: A hook to handle the payment integration logic.

- **`lib/`**: Contains utility functions, helper scripts, and the core application logic that is not tied to a specific component.
  - **Style:** Files export functions. This is where the bulk of the "heavy lifting" happens.
  - **Structure:**
    - `api/`: Functions for making server-side requests to the backend (e.g., `create-snap-payment.ts`, `user-credit.ts`).
    - `db/`: The entire client-side database layer, built with **Dexie.js**.
      - `db.ts`: The Dexie database definition, outlining tables and schema.
      - `translation.ts`, `project.ts`: Contain all CRUD (Create, Read, Update, Delete) operations for their respective data models, using Dexie transactions for data integrity.
    - `parser/`: Logic for parsing and cleaning subtitle file content.
    - `subtitles/`: Advanced logic for manipulating subtitle data structures (merging, splitting, etc.).
    - `utils.ts`: General-purpose utility functions (e.g., `cn` for classnames, `sleep`).

- **`stores/`**: Contains **Zustand** store definitions for managing global, mutable client-side state.
  - **Style:** Uses the `create<T>()(...)` pattern. State is kept minimal. Actions are co-located with the state. Asynchronous actions (API calls) are handled directly within the store.
  - **Structure:**
    - `[domain]/`: Stores are organized into subdirectories by their domain (`data`, `services`, `settings`).
      - `data/use-translation-data-store.ts`: Holds the actual data for translation projects.
      - `services/use-translation-store.ts`: Manages the *process* of translation (API calls, loading states, abort controllers).
      - `settings/use-settings-store.ts`: Manages user-configurable settings.

- **`types/`**: Contains shared TypeScript type definitions and interfaces used across the application.
  - **Style:** Uses `interface` for objects and `type` for unions or other complex types. Files are named after the data model they describe.
  - `project.ts`: Defines the core data models like `Project`, `Translation`, `BasicSettings`.
  - `subtitles.ts`: Defines the various shapes of subtitle data.

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
2.  Populate `.env.local` with the necessary credentials. Based on the tech stack, these will likely include:
    - `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for public Supabase operations.
    - `NEXT_PUBLIC_BACKEND_API_URL`: The URL for the `chizuru-translator` backend server.

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

1.  **Increment the Database Version:** Open `src/lib/db/db.ts`. Find the latest `this.version(X)` and add a new, incremented version: `this.version(X + 1)`.

2.  **Update Indexed Fields (If Necessary):** If the new property needs to be indexed for fast lookups (i.e., you will use it in a `db.table.where(...)` clause), add it to the schema definition string in `.stores({...})`.

3.  **Write an Upgrade Function:** Provide an `.upgrade()` function for the new version. Inside this function, use `tx.table('tableName').toCollection().modify(...)` to iterate over existing records and add the new property with a default value. This ensures that users who have older versions of the database get their schema updated without losing data.

    **Example Migration:**
    ```typescript
    // In src/lib/db/db.ts
    this.version(13).stores({
      // No change if the new field is not indexed
    }).upgrade(async tx => {
      // Add a 'isArchived' field to all existing projects
      await tx.table('projects').toCollection().modify(project => {
        if (typeof project.isArchived === 'undefined') {
          project.isArchived = false;
        }
      });
    });
    ```

#### Database Import & Export
The application supports full data portability through JSON export and import.

-   **`src/lib/db/db-io.ts`:** This file contains the core logic for this feature.
    -   `exportDatabase()`: Serializes all tables in the database into a single JSON string.
    -   `importDatabase()`: Deserializes a JSON string and imports the data. It handles two scenarios: clearing existing data or merging imported data by generating new unique IDs.

-   **`src/lib/db/db-constructor.ts`**: This file is crucial for ensuring data integrity during import. The `databaseExportConstructor` function validates the incoming JSON, cleans it, and sets default values for any missing fields, preventing data corruption. When adding new properties to data models, ensure they are also accounted for in this constructor.
