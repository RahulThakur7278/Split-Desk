# SprintDesk — Sprint Management Dashboard

SprintDesk is a modern, production-grade Kanban sprint management dashboard designed for software development teams. Built with React 19, TypeScript, Vite, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Secure login flow with session persistence (DummyJSON Auth API).
- 📋 **Kanban Board**: Drag-and-drop task management with `@dnd-kit`.
- 📊 **Analytics Dashboard**: Real-time insights with interactive `recharts` charts.
- 🔔 **Notifications**: Polling system with unread counts and animated popovers.
- 🎨 **Design System**: Fully custom, responsive, accessible UI components built with Tailwind CSS.
- 🌓 **Theming**: Dark/Light mode toggle with system preference detection.

## Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand (Global state + LocalStorage persistence)
- **Data Fetching & Server State**: TanStack Query v5 + Axios
- **Routing**: React Router v6 (with lazy loading)
- **Drag & Drop**: `@dnd-kit`
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm

### Installation

1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Demo Credentials

- **Username**: `emilys`
- **Password**: `emilyspass`

## Architecture Highlights

- **API Interceptor**: Features an intelligent Axios interceptor that queues requests during a 401 token refresh, preventing race conditions and redundant refresh calls.
- **Dnd-Kit Integration**: Robust drag-and-drop logic that handles both reordering within a column and moving across columns seamlessly.
- **Component Design**: Accessible custom components (Modal, Toast, Select) built without relying on heavy UI libraries.

## Testing

Run the test suite using Vitest:

```bash
npm run test
```

For watch mode:

```bash
npm run test:watch
```

## Linting & Type Checking

To run the linter (Oxlint) and TypeScript compiler:

```bash
npm run lint
npm run build
```
