# AISA Club Website

A student club website for AISA (Artificial Intelligence and Data Science Students Association) at ISBM College of Engineering, Pune.

## Architecture

This is a **pure frontend React + Vite** application that talks directly to **Supabase** for its database, authentication, and storage. There is no backend server in this project.

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Routing**: React Router v6
- **Database/Auth**: Supabase (external — project ID: `rxhwcphuvvwolrhyvblh`)
- **State/Queries**: TanStack React Query

## Key Files

- `src/App.tsx` — root component with all routes
- `src/integrations/supabase/client.ts` — Supabase client (reads env vars)
- `src/contexts/AuthContext.tsx` — authentication state
- `src/contexts/ClubContext.tsx` — club context (simplified)
- `src/pages/` — all page components
- `src/pages/admin/` — admin dashboard pages
- `src/hooks/` — data-fetching hooks (all use Supabase)
- `vite.config.ts` — configured for port 5000, host 0.0.0.0

## Environment Variables (Secrets)

| Secret | Purpose |
|--------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |

Note: The Supabase client strips surrounding quotes from env var values to handle Replit secret formatting.

## Running the App

```bash
npm run dev
```

Runs on port 5000. The workflow "Start application" handles this automatically.

## Database

All database tables are managed in the connected Supabase project. Migrations are in `supabase/migrations/`. The schema includes:
- Site settings, announcements, hero slides
- Events, team members, gallery, alumni
- User profiles, authentication roles
- Admin system with multi-club support
- Certificates, payments, event registrations

## Supabase Edge Functions

The following Supabase Edge Functions are deployed separately on the Supabase project:
- `drive-gallery` — Google Drive photo gallery integration
- `google-drive-api` — Google Drive API proxy
- `generate-certificate` — PDF certificate generation
- `verify-certificate` — Certificate verification
- `og-metadata` — Open Graph metadata
- `setup-admin` — Admin user management
