# Mitsuko - AI Subtitle Translator & Transcriber

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/hasferrr/mitsuko-client)
[![GPLv3 License](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://opensource.org/licenses/GPL-3.0)
![TypeScript](https://img.shields.io/badge/TypeScript-✓-blue)
![Bun](https://img.shields.io/badge/Bun-✓-000000)

<!-- <div align="center">
  <img src="https://i.imgur.com/b9gRjVi.jpeg" alt="Mitsuko Banner" width="300">
</div> -->

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

Create `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Running

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

## 🔧 Tech Stack

- **Backend**: Bun + Express
- **Frontend**: Next.js 15 (App Router)
- **State Management**: Zustand
- **UI**: Shadcn/ui + Tailwind CSS
- **Subtitle Parsing**: Custom SRT/ASS processors
- **AI Integration**: OpenAI-compatible API

## 🤝 Contributing

We welcome contributions! Please see our [Contribution Guidelines](CONTRIBUTING.md) and join our [Discord Community](https://discord.gg/8PaGWY6FdZ).

## 📜 License

GPLv3 - See [LICENSE](LICENSE)
