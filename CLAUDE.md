# CLAUDE.md - AI Assistant Guide for Hussey-OS

**Last Updated:** 2025-11-17
**Version:** 1.0.0
**Project:** Hussey-OS - Life Operating System

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Directory Structure](#directory-structure)
5. [Development Workflows](#development-workflows)
6. [Code Conventions](#code-conventions)
7. [State Management (Zustand)](#state-management-zustand)
8. [Component Patterns](#component-patterns)
9. [Type System](#type-system)
10. [Database & Supabase Patterns](#database--supabase-patterns)
11. [Common Tasks & Examples](#common-tasks--examples)
12. [Best Practices](#best-practices)
13. [Testing & Deployment](#testing--deployment)

---

## Project Overview

Hussey-OS is a comprehensive life dashboard application built with Next.js 15, React 19, and Supabase. It provides a unified interface for managing tasks, goals, clients, projects, budgets, passwords, and more.

### Key Features
- **Productivity:** Tasks (Kanban), Calendar, Goals tracking
- **Business:** Clients, Projects, Analytics
- **Tools:** Whiteboard, Password Manager, Budget Tracker
- **Integrations:** Gmail, Google Calendar, Facebook Analytics, Zoom

### Project Status
- ✅ **Phase 1:** Foundation (Auth, Database, Layout)
- ✅ **Phase 2:** Tasks Module (Kanban board with drag & drop)
- ✅ **Phase 3:** Calendar & Email Integration
- ✅ **Phase 4:** Goals Tracking
- 🚧 **Phase 5+:** Additional modules in progress

---

## Tech Stack & Dependencies

### Core Framework
```json
{
  "next": "16.0.0",           // App Router, Server Components, TypeScript
  "react": "19.2.0",          // Latest React with concurrent features
  "typescript": "^5"          // Strict type checking enabled
}
```

### Backend & Database
```json
{
  "@supabase/ssr": "^0.7.0",           // SSR-safe Supabase client
  "@supabase/supabase-js": "^2.76.1"   // Supabase JavaScript client
}
```

### UI & Styling
```json
{
  "tailwindcss": "^4",                  // Tailwind CSS V4
  "@radix-ui/*": "^1-2",                // Unstyled accessible components
  "lucide-react": "^0.548.0",           // Icon library
  "class-variance-authority": "^0.7.1", // CVA for component variants
  "tailwind-merge": "^3.3.1",           // Merge Tailwind classes
  "next-themes": "^0.4.6"               // Dark mode support
}
```

### State & Data Management
```json
{
  "zustand": "^5.0.8",          // Global state management
  "react-hook-form": "^7.65.0", // Form handling
  "zod": "^4.1.12"              // Schema validation
}
```

### Feature Libraries
```json
{
  "@dnd-kit/*": "^6-10",              // Drag and drop (Kanban)
  "@tldraw/tldraw": "^4.1.1",         // Whiteboard drawing
  "react-big-calendar": "^1.19.4",    // Calendar widget
  "recharts": "^3.3.0",               // Charts & analytics
  "date-fns": "^4.1.0",               // Date utilities
  "sonner": "^2.0.7"                  // Toast notifications
}
```

---

## Architecture & Design Patterns

### 1. Next.js App Router Architecture

Hussey-OS uses Next.js 15's App Router with **route groups** for logical separation:

```
app/
├── (auth)/              # Route group - auth pages (public)
│   ├── login/
│   ├── signup/
│   └── layout.tsx       # Auth-specific layout (force-dynamic)
├── (dashboard)/         # Route group - protected pages
│   ├── dashboard/       # All dashboard routes
│   └── layout.tsx       # Server-side auth check + sidebar
└── api/                 # API routes (webhooks)
```

**Key Pattern:** Route groups `(name)` organize routes without affecting URL structure.

### 2. Server vs Client Components

**Server Components (Default):**
- Layouts that check authentication
- Pages that fetch initial data
- Static content

**Client Components (`"use client"`):**
- Interactive forms and dialogs
- Drag & drop interfaces
- Zustand store consumers
- Components using React hooks

**Example:**
```tsx
// src/app/(dashboard)/layout.tsx - SERVER COMPONENT
export default async function DashboardLayout({ children }) {
  const supabase = await createClient() // Server client
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login") // Server-side redirect

  return <SidebarProvider>...</SidebarProvider>
}
```

### 3. Authentication Flow

1. **Middleware** (`src/lib/supabase/middleware.ts`): Refreshes auth tokens
2. **Dashboard Layout** (`src/app/(dashboard)/layout.tsx`): Server-side auth check
3. **Stores**: Client-side auth check before operations
4. **RLS Policies**: Database-level security (Supabase)

### 4. Data Flow Pattern

```
User Action
  ↓
Client Component (use client)
  ↓
Zustand Store (async action)
  ↓
Supabase Client (browser)
  ↓
Database (with RLS)
  ↓
Store updates state
  ↓
Component re-renders (automatic)
```

---

## Directory Structure

```
hussey-os/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                  # Authentication route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx           # Force dynamic rendering
│   │   ├── (dashboard)/             # Protected routes group
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx         # Main dashboard
│   │   │   │   ├── tasks/page.tsx
│   │   │   │   ├── calendar/page.tsx
│   │   │   │   ├── goals/page.tsx
│   │   │   │   ├── clients/page.tsx
│   │   │   │   ├── projects/page.tsx
│   │   │   │   ├── whiteboard/page.tsx
│   │   │   │   ├── passwords/page.tsx
│   │   │   │   └── budget/page.tsx
│   │   │   └── layout.tsx           # Auth check + sidebar
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       ├── calendar/route.ts
│   │   │       └── email/route.ts
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Root redirect
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components (41+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── ...
│   │   ├── modules/                 # Feature-specific components
│   │   │   ├── tasks/
│   │   │   │   ├── kanban-board.tsx
│   │   │   │   ├── task-card.tsx
│   │   │   │   ├── task-stats.tsx
│   │   │   │   ├── task-filters.tsx
│   │   │   │   └── create-task-dialog.tsx
│   │   │   ├── goals/
│   │   │   ├── calendar/
│   │   │   ├── projects/
│   │   │   ├── budget/
│   │   │   ├── passwords/
│   │   │   └── clients/
│   │   └── dashboard/
│   │       └── app-sidebar.tsx      # Main navigation
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Browser Supabase client
│   │   │   ├── server.ts            # Server Supabase client
│   │   │   └── middleware.ts        # Auth middleware
│   │   ├── utils.ts                 # cn() utility for Tailwind
│   │   └── crypto.ts                # Encryption for passwords
│   ├── hooks/
│   │   └── use-mobile.ts            # Responsive hook (< 768px)
│   ├── stores/                      # Zustand state stores
│   │   ├── task-store.ts
│   │   ├── goal-store.ts
│   │   ├── budget-store.ts
│   │   ├── password-store.ts
│   │   ├── project-store.ts
│   │   ├── calendar-store.ts
│   │   ├── email-store.ts
│   │   ├── client-store.ts
│   │   ├── whiteboard-store.ts
│   │   └── subscription-store.ts
│   └── types/                       # TypeScript definitions
│       ├── database.types.ts        # Supabase generated types
│       ├── task.types.ts
│       ├── goal.types.ts
│       ├── budget.types.ts
│       ├── password.types.ts
│       ├── calendar.types.ts
│       ├── project.types.ts
│       ├── client.types.ts
│       ├── email.types.ts
│       ├── whiteboard.types.ts
│       └── subscription.types.ts
├── public/                          # Static assets
├── supabase-schema.sql              # Database schema
├── .env.local                       # Environment variables (gitignored)
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

### Path Alias

TypeScript is configured with `@/*` alias:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage:**
```tsx
import { Button } from "@/components/ui/button"
import { useTaskStore } from "@/stores/task-store"
import { createClient } from "@/lib/supabase/client"
```

---

## Development Workflows

### 1. Setting Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with Supabase credentials

# Run Supabase schema
# Go to Supabase SQL Editor and run supabase-schema.sql

# Start development server
npm run dev
```

### 2. Development Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

### 3. Git Workflow

```bash
# Feature branch naming
git checkout -b feature/module-name

# Commit conventions
git commit -m "feat: add task filtering"
git commit -m "fix: resolve drag & drop bug"
git commit -m "refactor: optimize task store"
git commit -m "docs: update CLAUDE.md"
```

### 4. Branch Strategy

- `main` - Production-ready code
- `claude/...` - AI assistant feature branches
- `feature/...` - Developer feature branches

---

## Code Conventions

### 1. File Naming

- **Components:** `kebab-case.tsx` (e.g., `task-card.tsx`)
- **Stores:** `kebab-case.ts` with `-store` suffix (e.g., `task-store.ts`)
- **Types:** `kebab-case.types.ts` (e.g., `task.types.ts`)
- **Utilities:** `kebab-case.ts` (e.g., `utils.ts`)

### 2. Component Structure

```tsx
// Imports grouped by category
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import { useTaskStore } from "@/stores/task-store"
import { Task } from "@/types/task.types"
import { cn } from "@/lib/utils"

// Type definitions
interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
}

// Component
export function TaskCard({ task, onEdit }: TaskCardProps) {
  // Hooks first
  const [isOpen, setIsOpen] = useState(false)

  // Store hooks
  const { updateTask, deleteTask } = useTaskStore()

  // Handlers
  const handleEdit = () => {
    onEdit?.(task)
  }

  // Render
  return (
    <Card className={cn("p-4", task.status === "completed" && "opacity-50")}>
      {/* Component content */}
    </Card>
  )
}
```

### 3. TypeScript Conventions

- **Always use explicit types** for function parameters
- **Use interfaces** for component props
- **Use types** for unions and utilities
- **Avoid `any`** - use `unknown` if necessary
- **Export types** alongside components when needed

```typescript
// Good
interface CreateTaskInput {
  title: string
  description?: string
  priority: TaskPriority
}

type TaskPriority = "low" | "medium" | "high"

// Avoid
function createTask(data: any) { ... }
```

### 4. Styling Conventions

- Use **Tailwind utility classes** for styling
- Use `cn()` for conditional classes
- Mobile-first responsive design
- Use Radix UI primitives for complex components

```tsx
<div className={cn(
  "flex items-center gap-2 p-4",
  "hover:bg-accent hover:text-accent-foreground",
  isActive && "bg-primary text-primary-foreground",
  className // Allow prop overrides last
)}>
```

### 5. Import Order

1. React & Next.js imports
2. Third-party libraries
3. UI components (`@/components/ui`)
4. Module components (`@/components/modules`)
5. Stores, types, utilities
6. Styles (if any)

---

## State Management (Zustand)

### Store Pattern

All stores follow this consistent pattern:

```typescript
// src/stores/task-store.ts
import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task.types"

interface TaskStore {
  // State
  tasks: Task[]
  loading: boolean
  error: string | null

  // Actions (async)
  fetchTasks: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<Task | null>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  // Utilities (sync)
  setTasks: (tasks: Task[]) => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  loading: false,
  error: null,

  // Async actions
  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      set({ tasks: data || [], loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createTask: async (input) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

      if (error) throw error

      // Optimistic update
      set({ tasks: [data, ...get().tasks] })
      return data
    } catch (error) {
      set({ error: error.message })
      return null
    }
  },

  // ... other actions

  setTasks: (tasks) => set({ tasks }),
}))
```

### Store Usage in Components

```tsx
"use client"

import { useEffect } from "react"
import { useTaskStore } from "@/stores/task-store"

export function TaskList() {
  // Subscribe to specific state
  const { tasks, loading, error, fetchTasks } = useTaskStore()

  // Fetch on mount
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

### Store Best Practices

1. **Always check authentication** before Supabase operations
2. **Use optimistic updates** for instant UI feedback
3. **Handle errors gracefully** with error state
4. **Keep stores focused** - one store per domain
5. **Use computed selectors** for derived state

---

## Component Patterns

### 1. Page Components (Server Components)

```tsx
// src/app/(dashboard)/dashboard/tasks/page.tsx
import { KanbanBoard } from "@/components/modules/tasks/kanban-board"
import { TaskStats } from "@/components/modules/tasks/task-stats"

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">
          Manage your tasks with kanban workflow
        </p>
      </div>

      <TaskStats />
      <KanbanBoard />
    </div>
  )
}
```

### 2. Client Components (Interactive)

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>New Task</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>{/* Form content */}</DialogContent>
      </Dialog>
    </>
  )
}
```

### 3. Form Components (React Hook Form + Zod)

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high"])
})

type TaskFormValues = z.infer<typeof taskSchema>

export function TaskForm() {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      priority: "medium"
    }
  })

  const onSubmit = async (values: TaskFormValues) => {
    // Handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### 4. Module Component Structure

Each feature module should contain:

```
components/modules/[feature]/
├── [feature]-card.tsx        # Display individual item
├── [feature]-list.tsx        # Display list/grid of items
├── [feature]-board.tsx       # Kanban/special view (if applicable)
├── [feature]-stats.tsx       # Statistics/analytics
├── [feature]-filters.tsx     # Search/filter controls
├── create-[feature]-dialog.tsx  # Creation dialog
└── edit-[feature]-dialog.tsx    # Edit dialog (or combined with create)
```

---

## Type System

### 1. Database Types

Generated from Supabase schema:

```typescript
// src/types/database.types.ts
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: "todo" | "in_progress" | "completed"
          priority: "low" | "medium" | "high" | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: "todo" | "in_progress" | "completed"
          priority?: "low" | "medium" | "high" | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          // All fields optional for updates
        }
      }
      // ... other tables
    }
  }
}
```

### 2. Domain Types

Feature-specific types for better ergonomics:

```typescript
// src/types/task.types.ts
export type TaskStatus = "todo" | "in_progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: TaskStatus
  priority?: TaskPriority
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
}
```

### 3. Component Prop Types

```typescript
interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (id: string) => void
  className?: string
}
```

---

## Database & Supabase Patterns

### 1. Client Initialization

**Browser Client:**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server Client:**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### 2. Database Query Patterns

**Select with filtering:**
```typescript
const { data, error } = await supabase
  .from("tasks")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
```

**Insert:**
```typescript
const { data, error } = await supabase
  .from("tasks")
  .insert({ title: "New task", user_id: user.id })
  .select()
  .single()
```

**Update:**
```typescript
const { data, error } = await supabase
  .from("tasks")
  .update({ status: "completed", completed_at: new Date().toISOString() })
  .eq("id", taskId)
  .select()
```

**Delete:**
```typescript
const { error } = await supabase
  .from("tasks")
  .delete()
  .eq("id", taskId)
```

### 3. Row Level Security (RLS)

All tables have RLS policies:

```sql
-- Example: Tasks table policies
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

**Important:** Always include `user_id` in queries and inserts!

### 4. Authentication Patterns

```typescript
// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password"
})

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password"
})

// Sign out
await supabase.auth.signOut()
```

---

## Common Tasks & Examples

### 1. Adding a New Feature Module

**Step 1:** Create database table (if needed)
```sql
-- Add to supabase-schema.sql
CREATE TABLE public.new_feature (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
-- (follow pattern from tasks table)
```

**Step 2:** Define types
```typescript
// src/types/new-feature.types.ts
export interface NewFeature {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface CreateNewFeatureInput {
  title: string
}
```

**Step 3:** Create Zustand store
```typescript
// src/stores/new-feature-store.ts
import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"
import { NewFeature, CreateNewFeatureInput } from "@/types/new-feature.types"

interface NewFeatureStore {
  items: NewFeature[]
  loading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  createItem: (input: CreateNewFeatureInput) => Promise<NewFeature | null>
}

export const useNewFeatureStore = create<NewFeatureStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    // Implementation following task-store pattern
  },

  createItem: async (input) => {
    // Implementation following task-store pattern
  },
}))
```

**Step 4:** Create components
```bash
mkdir -p src/components/modules/new-feature
touch src/components/modules/new-feature/new-feature-card.tsx
touch src/components/modules/new-feature/create-new-feature-dialog.tsx
```

**Step 5:** Create page
```tsx
// src/app/(dashboard)/dashboard/new-feature/page.tsx
import { NewFeatureList } from "@/components/modules/new-feature/new-feature-list"

export default function NewFeaturePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Feature</h1>
      <NewFeatureList />
    </div>
  )
}
```

**Step 6:** Add to sidebar navigation
```tsx
// src/components/dashboard/app-sidebar.tsx
// Add to appropriate section
{
  title: "New Feature",
  url: "/dashboard/new-feature",
  icon: SomeIcon,
}
```

### 2. Adding Form Validation

```typescript
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number().min(18, "Must be 18+").optional(),
})

type FormValues = z.infer<typeof schema>
```

### 3. Implementing Drag & Drop

```tsx
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, useSortable } from "@dnd-kit/sortable"

function DraggableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id })

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {/* Content */}
    </div>
  )
}

function Board() {
  const handleDragEnd = (event: DragEndEvent) => {
    // Handle drop
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds}>
        {items.map(item => <DraggableItem key={item.id} id={item.id} />)}
      </SortableContext>
    </DndContext>
  )
}
```

### 4. Responsive Design Pattern

```tsx
import { useIsMobile } from "@/hooks/use-mobile"

export function ResponsiveComponent() {
  const isMobile = useIsMobile()

  return (
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-1" : "grid-cols-3"
    )}>
      {/* Content */}
    </div>
  )
}
```

---

## Best Practices

### 1. Performance

- Use **Server Components** by default (faster initial load)
- Add `"use client"` only when needed (interactivity, hooks)
- Memoize expensive calculations with `useMemo`
- Use optimistic updates for instant UI feedback
- Implement skeleton loaders for better perceived performance

### 2. Security

- **Never expose secrets** - use environment variables
- **Always validate inputs** with Zod schemas
- **Use RLS policies** for database-level security
- **Sanitize user input** before rendering
- **Check authentication** in all store operations
- **Use zero-knowledge encryption** for passwords (lib/crypto.ts)

### 3. Type Safety

- Enable strict mode in `tsconfig.json`
- Avoid `any` - use `unknown` if type is truly unknown
- Use Zod for runtime validation + type inference
- Keep database types synced with Supabase schema
- Use `satisfies` for type-safe object literals

### 4. Code Organization

- One component per file
- Keep components under 200 lines (split if larger)
- Group related components in feature folders
- Use barrel exports (`index.ts`) sparingly
- Prefer explicit imports for better tree-shaking

### 5. Error Handling

```typescript
try {
  const result = await someAsyncOperation()
  toast.success("Operation successful")
} catch (error) {
  console.error("Operation failed:", error)
  toast.error(error instanceof Error ? error.message : "Something went wrong")
  set({ error: error.message })
}
```

### 6. Accessibility

- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Include ARIA labels for icon-only buttons
- Ensure keyboard navigation works
- Use Radix UI primitives (built-in a11y)
- Test with screen readers

### 7. Testing Strategy

- **Unit tests:** Utility functions (lib/)
- **Integration tests:** Store operations
- **E2E tests:** Critical user flows (auth, task creation)
- **Manual testing:** UI/UX flows before deployment

---

## Testing & Deployment

### Development Testing

```bash
# Run dev server
npm run dev

# Test in browser
# - Create test account
# - Test all CRUD operations
# - Check responsive design (DevTools)
# - Test error scenarios
```

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Check for:
# - No TypeScript errors
# - No console warnings
# - All pages load correctly
# - Environment variables set
```

### Deployment (Vercel Recommended)

1. **Connect GitHub repository** to Vercel
2. **Set environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. **Deploy:** Automatic on push to main branch
4. **Monitor:** Check Vercel Analytics and Logs

### Environment Variables

Required:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Optional:
```bash
GOOGLE_CALENDAR_WEBHOOK_SECRET=secret
GMAIL_WEBHOOK_SECRET=secret
FACEBOOK_ACCESS_TOKEN=token
ZOOM_API_KEY=key
ZOOM_API_SECRET=secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run linter

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "message"  # Commit with message
git push                 # Push to remote
```

### File Locations

- **Pages:** `src/app/(dashboard)/dashboard/[feature]/page.tsx`
- **Components:** `src/components/modules/[feature]/`
- **Stores:** `src/stores/[feature]-store.ts`
- **Types:** `src/types/[feature].types.ts`
- **UI Components:** `src/components/ui/`

### Useful Utilities

```typescript
// Tailwind class merger
import { cn } from "@/lib/utils"
cn("base-class", condition && "conditional-class")

// Mobile detection
import { useIsMobile } from "@/hooks/use-mobile"
const isMobile = useIsMobile() // boolean

// Encryption (passwords)
import { encryptData, decryptData } from "@/lib/crypto"
const encrypted = await encryptData(data, masterPassword)
const decrypted = await decryptData(encrypted, iv, salt, masterPassword)
```

### Common Patterns

```typescript
// Supabase query
const { data, error } = await supabase
  .from("table")
  .select("*")
  .eq("user_id", user.id)

// Toast notification
import { toast } from "sonner"
toast.success("Success!")
toast.error("Error!")

// Date formatting
import { format } from "date-fns"
format(new Date(), "MMM d, yyyy")
```

---

## Additional Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://radix-ui.com/primitives/docs/overview/introduction
- **Zustand:** https://github.com/pmndrs/zustand
- **shadcn/ui:** https://ui.shadcn.com

---

**Last Updated:** 2025-11-17
**Maintained By:** Hussey-OS Development Team

For questions or improvements to this guide, please open an issue or submit a PR.
