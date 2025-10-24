# Open WebUI Clone

A full-featured web interface for AI interactions, inspired by Open WebUI. Built with Next.js, React, and Tailwind CSS.

## Features

- 🎨 Modern, responsive UI with dark mode
- 💬 Multiple chat sessions with history
- 📝 Markdown rendering with syntax highlighting
- 💾 Local storage for chat persistence
- ⚡ Real-time streaming responses
- 🔄 Edit and rename chats
- 🗑️ Delete conversations
- 📱 Mobile-friendly design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your Anthropic API key:
```bash
cp .env.example .env
# Edit .env and add your API key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

Deploy to Vercel:
```bash
vercel deploy --prod
```

Make sure to set the `ANTHROPIC_API_KEY` environment variable in your Vercel project settings.

## Tech Stack

- **Framework**: Next.js 14
- **UI**: React 18, Tailwind CSS
- **Markdown**: react-markdown with syntax highlighting
- **API**: Anthropic Claude API
- **Storage**: Browser localStorage

## License

MIT