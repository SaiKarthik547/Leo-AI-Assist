# Leo-AI-Assist
My personal AI assistant

## Features

- 🤖 **AI Chat Interface**: Powered by free models through OpenRouter API
- 💬 **Conversation History**: Save and manage chat sessions
- 🎤 **Voice Input/Output**: Speech recognition and text-to-speech
- 📁 **File Upload**: Upload and analyze files with AI
- 🔐 **User Authentication**: Secure user management with Supabase
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Free Models Configuration

This project uses **only free models** through OpenRouter API. No paid models or credit cards required!

### Available Free Models:
- **Meta Llama 3.1 8B** (Default) - Great for general use and coding
- **Microsoft Phi-3 Mini** - Fast and efficient responses
- **Google Gemma 2B** - Lightweight and quick
- **Mistral 7B** - Good balance of performance and speed

See [FREE_MODELS_README.md](./FREE_MODELS_README.md) for detailed configuration information.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and add environment variables
4. Configure OpenRouter API key (free tier)
5. Deploy to your preferred platform

## Environment Variables

Required environment variables:
- `OPENROUTER_API_KEY` - Your OpenRouter API key (free tier)

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database + Edge Functions)
- **AI**: OpenRouter API with free models
- **Authentication**: Supabase Auth

## License

MIT License
