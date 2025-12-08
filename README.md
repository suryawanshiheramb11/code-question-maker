# JS Question Bank + AI Parser + Chatbot

This is a responsive web application that allows users to upload JavaScript problems (PDF/Image/Text), automatically parses them using Google Gemini AI, stores them, and provides an interactive coding environment with a sandboxed test runner and an AI chatbot assistant.

## Features
- **Upload & Parse**: Drag & drop files to extract questions, solutions, and test cases using AI.
- **Question Bank**: Dashboard to view and manage parsed questions.
- **Code Editor**: Monaco-based editor with syntax highlighting.
- **Test Runner**: Secure Node.js VM sandbox to run test cases against your code.
- **AI Chatbot**: Context-aware coding assistant (Gemini 1.5) to help debug and explain solutions.
- **Responsive Design**: Built with Next.js, Tailwind CSS, and Lucide Icons.

## Setup Instructions

1. **Clone & Install**
   ```bash
   npm install
   ```
   Note: This project uses Prisma 6.0.0.

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="your_api_key_here"
   ```
   Get your API key from [Google AI Studio](https://aistudio.google.com/).

3. **Database Setup**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Usage Guide
1. **Upload**: Click "+" on the dashboard. Drag a file from `public/examples/` to test.
2. **Review**: The AI will extract fields. You can edit them before saving.
3. **Solve**: Click a question. Write code in the editor (ensure function is named `solution` or `solve`).
4. **Run**: Click "Run Tests".
5. **Chat**: Use the right panel to ask "Explain this code" or "Fix my bug".

## Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma (SQLite)
- Google Gemini API (1.5 Flash)
- Monaco Editor
- Node.js VM (Sandbox)
