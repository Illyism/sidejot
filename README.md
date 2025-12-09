# Sidejot

Sidejot is an AI-powered Pomodoro Planner designed to be privacy-focused, ADHD-friendly, and accessible. It helps you break down your tasks into manageable 25-minute chunks, ensuring you stay focused and productive.

## Features

- **AI-Powered Planning**: Uses Google Gemini 2.5 Flash (via OpenRouter) to break down vague goals into specific, actionable Pomodoro tasks.
- **Local-First & Private**: All data is stored locally in your browser using IndexedDB (Dexie.js).
- **Cross-Device Sync**: Supports syncing your plan across tabs and devices.
- **ADHD-Friendly UI**: Clean, distraction-free interface designed to reduce cognitive load.
- **Pomodoro Timer**: Integrated timer to keep you on track.
- **Dark/Light Mode**: Fully themeable UI using Tailwind CSS and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State Management**: Zustand
- **Database**: Dexie.js (IndexedDB)
- **AI**: Vercel AI SDK 5.0, OpenRouter
- **Package Manager**: Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- An [OpenRouter](https://openrouter.ai/) API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sidejot.git
   cd sidejot
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   You can create a `.env.local` file, but the app allows you to enter your OpenRouter API Key directly in the Settings UI for a completely client-side experience.
   
   If you want to provide a default key for development:
   ```bash
   # .env.local
   OPENROUTER_API_KEY=your_key_here
   ```

4. Run the development server:
   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## License

MIT
