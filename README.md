# Mitsuko - AI Subtitle Translator & Transcriber

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/hasferrr/mitsuko-client)
[![GPLv3 License](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://opensource.org/licenses/GPL-3.0)
![TypeScript](https://img.shields.io/badge/TypeScript-✓-blue)
![Bun](https://img.shields.io/badge/Bun-✓-000000)

## 📖 Description

**Mitsuko** is an AI-powered subtitle translation and audio transcription system that provides high-quality, context-aware translations. This all-in-one solution offers:

- 🎭 Context-aware subtitle translation between 100+ languages
- 🔊 Audio-to-text transcription with perfect timing alignment
- 📜 Native support for SRT/ASS subtitle formats
- 🧠 AI-powered context analysis from previous episodes
- 🔧 Advanced customization options for professional results

Originally designed for anime translations, Mitsuko combines linguistic accuracy with technical precision, preserving subtitle styling and timing while delivering natural-sounding translations.

## 🌟 Features

### Subtitle Translation

- **Context-aware AI translations** using previous episode context
- Supports **SRT & ASS formats** with style preservation
- **100+ language support** including Japanese, Chinese, English, Indonesian
- **Custom model integration** (OpenAI-compatible APIs)
- Advanced controls:
  - Temperature adjustment
  - Split size configuration
  - Structured JSON output
  - Full context memory mode

### Audio Transcription

- Generate **perfectly timed subtitles** from audio
- Real-time transcription streaming
- Export to subtitle or text
- Audio format support: MP3, WAV, FLAC, AAC, OPUS, etc

### Context Extraction

- **AI-powered context analysis** from subtitle content
- Extracts character relationships, settings, and plot elements
- Creates reusable context documents for series consistency
- Episode-based context tracking for improved translation quality
- Supports continuation and batch processing modes

### Project Management

- **Organized project workspace** with drag-and-drop functionality
- Categorized tabs for translations, transcriptions, and extractions
- Complete project history and version tracking
- Export and import capabilities for project data

## 🚀 Quick Start

Prerequisites

- Node.js 22+
- Bun 1.2+

Backend Setup

```bash
git clone https://github.com/hasferrr/chizuru-translator.git
cd chizuru-translator
bun install
```

Frontend Setup

```bash
git clone https://github.com/hasferrr/mitsuko-client.git
cd mitsuko-client
bun install
```

Create and configure `.env.local`

```bash
cp .env.example .env.local
```

Run the project

```bash
# In separate terminals
cd chizuru-translator && bun dev    # Backend
cd mitsuko-client && bun dev        # Frontend
```

## 🛠 Usage

### Subtitle Translation

1. Upload SRT/ASS file
2. Set source/target languages
3. Add context document (optional)
4. Configure advanced settings
5. Start translation
6. Export translated file

### Audio Transcription

1. Upload audio file
2. Select language (auto-detect supported)
3. Start transcription
4. Edit results
5. Export subtitle/text

### Context Extraction

1. Upload subtitle file or paste content
2. Set episode number for tracking
3. Add previous context (optional)
4. Configure extraction settings
5. Generate context document
6. Use for future translations

## 🔧 Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript 5.8+
- **State Management**: Zustand for client-side state
- **UI Components**: Radix UI with Tailwind CSS
- **Data Persistence**: Dexie (IndexedDB wrapper)
- **Server State**: TanStack React Query
- **Authentication**: Supabase Auth
- **Payment**: Midtrans/Snap integration
- **Drag & Drop**: @dnd-kit for project management

### Backend

- **Runtime**: Bun + Express
- **Subtitle Parsing**: Custom SRT/ASS processors
- **AI Integration**: Multi-provider support (OpenAI, Gemini, Claude)

### Advanced Features

- **Context Memory Modes**: Full, Balanced, and Minimal context strategies
- **Advanced Reasoning**: Multi-step AI thinking process for complex translations
- **Credit System**: Usage-based pricing with real-time credit tracking
- **Concurrent Processing**: Handle multiple files simultaneously
- **Custom Models**: Support for self-hosted AI models (OpenAI compatible)

## 🤝 Contributing

We welcome contributions! Please see our [Contribution Guidelines](CONTRIBUTING.md) and join our [Discord Community](https://discord.gg/8PaGWY6FdZ).

## 📜 License

GPLv3 - See [LICENSE](LICENSE)
