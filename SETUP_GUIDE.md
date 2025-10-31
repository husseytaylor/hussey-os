# Hussey OS Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** in the left sidebar
4. Copy the contents of `supabase-schema.sql` and paste into the SQL Editor
5. Click **Run** to create all tables and policies
6. Go to **Settings → API** to get your credentials

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you'll be redirected to the login page.

### 5. Create Your Account

1. Click "Sign up" on the login page
2. Enter your details
3. Check your email for the verification link
4. After verification, log in to access your dashboard

## What's Included in Phase 1

### ✅ Completed Features

- **Authentication System**
  - Email/password login and signup
  - Supabase authentication with email verification
  - Protected routes with middleware
  - Automatic redirects for authenticated/unauthenticated users

- **Dashboard Layout**
  - Modern sidebar navigation
  - Responsive design
  - User profile dropdown
  - Navigation to all planned modules

- **Database Schema**
  - All tables created with proper relationships
  - Row Level Security (RLS) policies configured
  - Automatic timestamp triggers
  - Storage bucket for client assets

- **Tech Stack Setup**
  - Next.js 15 with App Router
  - React 19
  - TypeScript
  - Tailwind CSS V4
  - shadcn/ui components
  - Supabase integration

### 📋 Planned Modules (Navigation Ready)

The sidebar includes navigation to these modules which will be built in upcoming phases:

1. **Tasks** - Kanban board with drag & drop
2. **Calendar** - Google Calendar integration
3. **Goals** - Quantifiable goal tracking
4. **Clients** - Client management system
5. **Projects** - Project tracking with objectives
6. **Analytics** - Business metrics dashboard
7. **Whiteboard** - Infinite canvas for mind mapping
8. **Passwords** - Encrypted password manager
9. **Budget** - Subscription and budget tracking

## Next Steps

### Option 1: Continue Development Yourself

Follow the comprehensive build plan in the README.md to implement each module. Start with Phase 2 (Tasks Module).

### Option 2: Professional Assistance

I can continue building out the remaining modules. Each phase includes:
- Full CRUD operations
- Beautiful UI components
- Real-time updates
- Mobile responsive design

## Troubleshooting

### Build Errors

If you encounter build errors related to Supabase, make sure your `.env.local` file has valid URLs:
- The URL should start with `https://`
- The anon key should be a valid JWT token

### Authentication Issues

1. Make sure you've run the `supabase-schema.sql` in your Supabase project
2. Check that email verification is not required in Supabase settings (or check your email)
3. Verify your environment variables are correct

### Port Already in Use

If port 3000 is in use, you can specify a different port:
```bash
npm run dev -- -p 3001
```

## Project Structure

```
hussey-os/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, signup)
│   │   ├── (dashboard)/      # Dashboard pages
│   │   ├── api/              # API routes (for webhooks)
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page (redirects)
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   └── dashboard/        # Dashboard components
│   ├── lib/
│   │   ├── supabase/         # Supabase client configs
│   │   └── utils/            # Utility functions
│   └── types/                # TypeScript types
├── public/                   # Static assets
├── supabase-schema.sql       # Database schema
├── .env.local                # Your environment variables
└── .env.example              # Template for environment variables
```

## Database Tables

Your Supabase database now includes:

- `users` - User profiles (auto-populated on signup)
- `tasks` - Task management
- `goals` - Goal tracking with metrics
- `clients` - Client information
- `projects` - Project details
- `project_objectives` - Project objectives with notes
- `passwords` - Encrypted password vault
- `subscriptions` - Subscription tracking
- `budgets` - Budget categories
- `whiteboard_data` - Whiteboard canvas saves
- `calendar_events` - Synced calendar events
- `emails` - Synced email data
- `analytics_cache` - Cached external API data

## Security Features

- **Row Level Security**: Every table has RLS policies ensuring users only access their own data
- **Authentication**: Supabase Auth with email verification
- **Zero-Knowledge Encryption**: Password manager will use client-side encryption
- **Environment Variables**: Sensitive keys stored securely
- **Webhook Verification**: API endpoints verify webhook signatures

## Optional Integrations

These can be set up later when you implement the respective modules:

### Google Calendar (Tasks Module)
- Set up n8n workflow for calendar sync
- Add webhook URL to environment variables

### Gmail (Calendar Module)
- Configure n8n for email filtering
- Add webhook URL to environment variables

### Analytics APIs (Analytics Module)
- Facebook Analytics API token
- Zoom API credentials

## Support

For issues or questions:
1. Check this guide first
2. Review the main README.md
3. Check the Supabase dashboard for database issues
4. Verify environment variables are set correctly

---

Happy building! 🚀
