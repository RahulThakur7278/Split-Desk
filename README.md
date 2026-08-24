# SprintDesk ⚡ — Sprint & Task Management Dashboard

SprintDesk is a modern, production-grade Kanban sprint management dashboard engineered for high-velocity software development teams. Built using React 19, TypeScript, Vite, Tailwind CSS, Zustand, and TanStack Query.

🔗 **Live Application**: [sprint-desk.vercel.app](https://vercel.com/rahulthakur7278s-projects/sprint-desk)  
📂 **GitHub Repository**: [github.com/RahulThakur7278/Sprint-Desk](https://github.com/RahulThakur7278/Sprint-Desk)

---

## 🌟 Key Features

- 🔐 **Authentication & Registration**:
  - Full **Sign In** and **Sign Up / Registration** flow with real-time field validation.
  - Live **Password Strength Indicator** (Very Weak to Strong visual meter).
  - **Remember Me** session persistence across page reloads and browser restarts.
  - **Local Account Persistence**: Newly registered accounts are saved locally so you can log out and sign back in seamlessly.
- 📋 **Interactive Kanban Board**:
  - Drag-and-drop task management powered by `@dnd-kit`.
  - Centered layout across desktop viewports with horizontal scroll support on mobile.
  - Interactive Task Drawer (viewing, editing details, posting comments, and deleting tasks).
  - Task creation modal with priority, assignee, due date, and sprint selection.
  - Move undo support via ephemeral toast actions.
- 📊 **Sprint Analytics**:
  - Real-time sprint progress charts, completion metrics, and velocity trends powered by `Recharts`.
- 📱 **Mobile-Optimized Responsive Header**:
  - Top action bar featuring Theme Toggle (Light/Dark) and Notification Bell.
  - Sleek **Right-Side Slide-Over Drawer** built with React Portals for mobile menu navigation & profile management.
- 🔔 **Toast Notification System**:
  - Global animated toast notifications for login, registration, task creation, updates, movement, and logout actions.
- 🌓 **Glassmorphism Design & Dark Mode**:
  - Modern aesthetic with ambient background glows, backdrop blurs, and seamless dark/light mode toggle.

---

## 🚀 Quick Start & Installation

Follow these steps to run SprintDesk locally on your machine:

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` (v9+) or `yarn` / `pnpm`

### 1. Clone the Repository

```bash
git clone https://github.com/RahulThakur7278/Sprint-Desk.git
cd Sprint-Desk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Local Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Demo Credentials & Auth Flow

### Pre-configured Demo Account

If you want to quickly test the application with pre-existing mock data:

- **Username**: `emilys`
- **Password**: `emilyspass`

### Registering a New Account

1. Click on **"Sign Up"** from the login page (or navigate to `/register`).
2. Fill in your **First Name**, **Last Name**, **Username**, **Email Address**, and **Password**.
3. Watch the live **Password Strength Meter** evaluate your password security.
4. Agree to the Terms and click **Create Account**.
5. You will be automatically signed in and greeted with a success notification!
6. **Log Out & Log Back In**: You can sign out anytime and log back in using your newly created credentials.

---

## 📦 Data Sources & Mock Data Usage

SprintDesk uses a combination of static mock data and live mock APIs to deliver an authentic, interactive user experience:

| Data Source | Location / Endpoint | Where & How It Is Used |
| :--- | :--- | :--- |
| **Local Mock Data** | [`public/mock-data.json`](file:///c:/Users/RAHUL%20THAKUR/Desktop/SprintDesk/public/mock-data.json) & [`mock-data.service.ts`](file:///c:/Users/RAHUL%20THAKUR/Desktop/SprintDesk/src/services/mock-data.service.ts) | • **Tasks**: Pre-populates Kanban board columns (Backlog, In Progress, Review, Done) with priorities, assignees, and due dates.<br>• **Team Members**: Provides user avatars, names, and emails for task assignees and filter dropdowns.<br>• **Sprints**: Supplies historical sprint timelines for Analytics charts and sprint selectors.<br>• **Task Comments**: Displays discussion comments inside the Task Drawer. |
| **DummyJSON Auth API** | `https://dummyjson.com/auth/*` | • **`/auth/login`**: Authenticates demo user credentials and generates access/refresh tokens.<br>• **`/auth/refresh`**: Handles silent access token renewal.<br>• **`/auth/me`**: Fetches the authenticated user profile. |
| **JSONPlaceholder API** | `https://jsonplaceholder.typicode.com/posts` | • **Real-time Notifications**: Used by `useNotifications` hook to poll background updates and animate the top header notification badge. |
| **Local Account Storage** | Browser `localStorage` (`sprintdesk_registered_users`) | • **User Registration Persistence**: Saves newly created user accounts locally so you can log out and log back in without losing custom user credentials. |

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | React 19 + Vite |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS (Glassmorphic components, responsive grid) |
| **State Management** | Zustand (Global client state + LocalStorage persistence) |
| **Data Fetching** | TanStack Query v5 + Axios |
| **Routing** | React Router v6 (`ProtectedRoute` & `PublicRoute` guards) |
| **Drag & Drop** | `@dnd-kit/core` & `@dnd-kit/sortable` |
| **Charts** | Recharts |
| **Portals & Overlays** | React DOM `createPortal` |
| **Testing** | Vitest + React Testing Library |

---

## 🧪 Testing & Validation

Run the automated unit and component test suite with Vitest:

```bash
# Run unit tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Linting & Type Checks

```bash
# Type check TypeScript code without emitting output
npx tsc --noEmit

# Run Linter
npm run lint

# Build production bundle
npm run build
```

---

## 📁 Project Structure

```text
SprintDesk/
├── public/
│   └── mock-data.json      # Initial tasks, sprints, users, and comments dataset
├── src/
│   ├── components/
│   │   ├── auth/           # ProtectedRoute and PublicRoute wrappers
│   │   ├── board/          # KanbanColumn and TaskCard components
│   │   ├── layout/         # Header, AppLayout, and Right-side Mobile Drawer
│   │   ├── notifications/  # NotificationBell and popover
│   │   └── ui/             # Reusable UI components (Modal, ToastContainer, Button, Avatar, Select)
│   ├── hooks/              # Custom React hooks (useAuth, useTasks, useToast, useNotifications)
│   ├── lib/                # Axios API client with interceptors
│   ├── pages/              # Page components (LoginPage, RegisterPage, DashboardPage, BoardPage, AnalyticsPage)
│   ├── services/           # API & Mock Data integration services (auth, task, mock-data)
│   ├── stores/             # Zustand state management (auth, board, theme, notification)
│   └── types/              # TypeScript interfaces and API schemas
└── README.md
```

---

## 🌐 Deployment

SprintDesk is deployed on Vercel:
- **Live URL**: [https://vercel.com/rahulthakur7278s-projects/sprint-desk](https://vercel.com/rahulthakur7278s-projects/sprint-desk)
