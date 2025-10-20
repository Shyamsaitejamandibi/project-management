# Project Management System

A full-stack project management application with Kanban boards, task management, and AI-powered insights.

## Features

- **Project Management**: Create and manage projects
- **Kanban Board**: Drag-and-drop task management
- **AI Assistant**: Project summaries and Q&A
- **Modern UI**: Built with Radix UI and Tailwind CSS

## Tech Stack

**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI, React Query, DnD Kit
**Backend**: Node.js, Express, TypeScript, MongoDB, Vercel AI SDK

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- AI Gateway API key

## Quick Start

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd project-management
cd backend && npm install
cd ../frontend && npm install
```

2. **Create environment files:**

**Backend `.env`:**

```env
MONGODB_URI=mongodb://localhost:27017/task_management
AI_GATEWAY_API_KEY=your_ai_gateway_api_key_here
PORT=3000
```

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:3000
```

3. **Start both servers:**

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Access the app at `http://localhost:5173`

## Usage

- Create projects and add tasks with drag-and-drop Kanban boards
- Use the AI assistant for project insights and summaries
- Manage tasks across different columns (To Do, In Progress, Done)

## API Endpoints

**Projects**: `GET|POST /projects`, `PATCH|DELETE /projects/:id`
**Tasks**: `GET|POST /tasks`, `PATCH|DELETE /tasks/:id`  
**AI**: `POST /projects/:projectId/ai/summarize`, `POST /projects/:projectId/ai/ask`
