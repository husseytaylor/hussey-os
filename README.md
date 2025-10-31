# Hussey OS - Life Operating System

A comprehensive life dashboard application for managing tasks, goals, clients, projects, and more. Built with Next.js 15, React 19, Supabase, and modern web technologies.

## Features

### Productivity
- **Tasks Management** - Kanban board with drag & drop (To Do → In Progress → Completed)
- **Calendar Integration** - Google Calendar sync via webhook
- **Goals Tracking** - Quantifiable goals with adherence metrics and consistency tracking

### Business
- **Clients Management** - Contact information and client assets storage
- **Projects Management** - Project tracking with objectives, notes, and images
- **Analytics Dashboard** - Facebook Analytics, Zoom Summaries, and Supabase metrics

### Tools
- **Whiteboard** - Infinite canvas for mind mapping and design (powered by tldraw)
- **Password Manager** - Zero-knowledge encrypted password vault
- **Budget Tracker** - Subscription tracking and budget management

### Integrations
- **Gmail** - Email syncing via n8n webhook
- **Google Calendar** - Event management via n8n webhook
- **Facebook Analytics** - Business metrics
- **Zoom API** - Meeting summaries and analytics

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI**: Tailwind CSS V4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with MFA support
- **State Management**: Zustand
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit
- **Whiteboard**: tldraw
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- n8n instance (optional, for webhooks)

### 1. Clone and Install

```bash
cd hussey-os
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the `supabase-schema.sql` file
3. Get your project URL and anon key from Settings → API

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - Webhook Secrets (for n8n integration)
GOOGLE_CALENDAR_WEBHOOK_SECRET=your_calendar_webhook_secret
GMAIL_WEBHOOK_SECRET=your_gmail_webhook_secret

# Optional - External API Keys
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

### 5. Create Your Account

Navigate to the signup page and create your account. You'll be redirected to the dashboard after verification.

## Project Structure

```
hussey-os/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/         # Dashboard pages
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   ├── tasks/           # Task management
│   │   │   ├── calendar/        # Calendar view
│   │   │   ├── goals/           # Goals tracking
│   │   │   ├── clients/         # Client management
│   │   │   ├── projects/        # Project management
│   │   │   ├── whiteboard/      # Whiteboard tool
│   │   │   ├── passwords/       # Password manager
│   │   │   ├── budget/          # Budget tracker
│   │   │   └── analytics/       # Analytics dashboard
│   │   └── api/                 # API routes (webhooks)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   └── modules/             # Feature-specific components
│   ├── lib/
│   │   ├── supabase/            # Supabase clients
│   │   ├── encryption/          # Password encryption utilities
│   │   └── utils/               # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand stores
│   └── types/                   # TypeScript type definitions
├── public/                      # Static assets
├── supabase-schema.sql          # Database schema
└── .env.local                   # Environment variables
```

## Database Schema

The application uses the following main tables:
- `users` - User profiles
- `tasks` - Task management
- `goals` - Goal tracking
- `clients` - Client information
- `projects` - Project management
- `project_objectives` - Project objectives
- `passwords` - Encrypted passwords
- `subscriptions` - Subscription tracking
- `budgets` - Budget management
- `whiteboard_data` - Whiteboard canvas state
- `calendar_events` - Synced calendar events
- `emails` - Synced emails
- `analytics_cache` - Cached analytics data

All tables have Row Level Security (RLS) policies to ensure users can only access their own data.

## Setting Up Webhooks (Optional)

### Google Calendar Integration

1. Set up an n8n workflow that listens to Google Calendar events
2. Configure the workflow to POST to: `your-app-url/api/webhooks/calendar`
3. Add the webhook secret to your `.env.local`

### Gmail Integration

1. Set up an n8n workflow that filters emails by label
2. Configure the workflow to POST to: `your-app-url/api/webhooks/email`
3. Add the webhook secret to your `.env.local`

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Next.js setup with TypeScript
- [x] Supabase integration
- [x] Authentication system
- [x] Base layout and navigation
- [x] Database schema

### Phase 2: Tasks Module (Next)
- [ ] Task CRUD operations
- [ ] Kanban board with drag & drop
- [ ] Task completion line graph
- [ ] Task filtering and search

### Phase 3-11: Additional Modules
See the comprehensive build plan in the project documentation.

## Security Considerations

- **Password Manager**: Uses client-side encryption with zero-knowledge architecture
- **Authentication**: Supabase Auth with optional MFA
- **Database**: Row-level security policies on all tables
- **API Routes**: Webhook signature verification
- **Environment Variables**: Sensitive data stored securely

## Contributing

This is a personal project, but feel free to fork and customize for your own needs.

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub or contact the maintainer.

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
