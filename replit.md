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

All database tables are managed in the connected Supabase project. Migrations are in `supabase/migrations/`. **The primary setup script is `supabase/fix_and_seed.sql` — run this in the Supabase SQL Editor first.**

### Complete Table List (all used by the code)

| Table | Purpose |
|-------|---------|
| `site_settings` | Global site config (name, logo, social links, theme_config) |
| `hero_slides` | Home page hero carousel slides |
| `about_features` | About page feature cards |
| `stats` | Home page stat counters |
| `announcements` | Scrolling ticker announcements |
| `events` | Club events (upcoming + past) |
| `team_members` | Team page members |
| `team_categories` | Team grouping categories |
| `gallery` | Photo gallery |
| `alumni` | Alumni showcase |
| `partners` | Partner/sponsor logos |
| `occasions` | Special occasions for gallery grouping |
| `news` | Notice board items |
| `downloads` | Downloadable resources |
| `popup_announcements` | Modal announcement popups |
| `charter_settings` | Club charter/constitution |
| `custom_pages` | Admin-created dynamic pages |
| `nav_items` | Navigation menu items |
| `contact_submissions` | Contact form submissions |
| `club_admins` | Admin user management |
| `admin_profiles` | Legacy admin profiles |
| `user_profiles` | User profile data |
| `user_roles` | User permission roles |
| `event_registrations` | Event participant registrations |
| `payments` | Payment records |
| `certificates` | Issued certificates |
| `certificate_templates` | Certificate design templates |
| `event_winners` | Event competition results |
| `visitor_counter` | Site visitor count |
| `quick_links` | Quick navigation links |

### DB Setup Order
1. Run `supabase/fix_and_seed.sql` in Supabase SQL Editor (safe to re-run)
2. Go to `/admin/dashboard/setup` to seed initial content via the admin panel

### Key Column Facts (to avoid schema mismatches)
- `alumni` columns: `name, graduation_year (TEXT), branch, company, job_title, image_url, linkedin_url, testimonial, is_active, position`
- `occasions` columns: `title, description, occasion_date (DATE), category, cover_image_url, drive_folder_link, is_active, position`
- `nav_items` uses `href` (not `url`) for the path column
- `popup_announcements` uses `link_url`, `link_text` (not `button_text`, `button_link`)
- `news` includes `attachment_type`, `expire_date` columns
- `downloads` includes `category` column

## Supabase Edge Functions

The following Supabase Edge Functions are deployed separately on the Supabase project:
- `drive-gallery` — Google Drive photo gallery integration
- `google-drive-api` — Google Drive API proxy
- `generate-certificate` — PDF certificate generation
- `verify-certificate` — Certificate verification
- `og-metadata` — Open Graph metadata
- `setup-admin` — Admin user management
