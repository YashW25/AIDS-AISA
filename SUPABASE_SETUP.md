# Supabase Setup Guide for Club Website

This guide will help you set up a new Supabase project for the club website management system.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Supabase CLI installed (optional but recommended)

## Option 1: Using Supabase Dashboard (Recommended for Beginners)

### Step 1: Create a New Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Name**: Your club name (e.g., "AISA Website")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Select Free or Pro based on your needs
4. Click "Create new project"
5. Wait for the project to be provisioned (2-3 minutes)

### Step 2: Run the Migration

1. Once your project is ready, go to the **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the file `supabase/migrations/00000000000000_complete_setup.sql`
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click "Run" or press `Ctrl+Enter`
7. Wait for the migration to complete (may take 30-60 seconds)

### Step 3: Verify the Setup

1. Go to **Table Editor** in the left sidebar
2. You should see all the tables created:
   - clubs
   - site_settings
   - announcements
   - hero_slides
   - events
   - team_members
   - gallery
   - and many more...

### Step 4: Get Your API Keys

1. Go to **Project Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (this is your public API key)
   - **service_role** key (keep this secret! Only use server-side)

### Step 5: Configure Your Environment

1. In your project root, create or update the `.env` file:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Replace the values with your actual Supabase URL and anon key

## Option 2: Using Supabase CLI (Advanced)

### Step 1: Install Supabase CLI

```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link to Your Project

```bash
# Navigate to your project directory
cd materproject-yash

# Link to your Supabase project
supabase link --project-ref your-project-ref
```

### Step 4: Push the Migration

```bash
supabase db push
```

## Post-Setup Configuration

### 1. Create Your First Admin User

After setting up the database, you need to create an admin user:

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click "Add user" > "Create new user"
3. Enter email and password
4. Click "Create user"
5. Copy the user's UUID

Now, add admin role to this user:

1. Go to **SQL Editor**
2. Run this query (replace `USER_UUID` with the actual UUID):

```sql
-- Add super admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID', 'super_admin');
```

### 2. Configure Storage

The migration automatically creates an `images` bucket. To verify:

1. Go to **Storage** in the left sidebar
2. You should see the `images` bucket
3. The bucket is configured to:
   - Allow public access for viewing
   - Allow admins to upload/delete
   - Accept image files (jpeg, png, webp, gif)

### 3. Enable Email Authentication (Optional)

If you want users to sign up:

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email templates if needed

### 4. Configure OAuth Providers (Optional)

For social login (Google, GitHub, etc.):

1. Go to **Authentication** > **Providers**
2. Enable the providers you want
3. Follow the setup instructions for each provider

## Database Schema Overview

The database includes the following main components:

### Core Tables

- **clubs**: Multi-tenant club information
- **user_roles**: User role management (super_admin, admin, teacher, student)
- **club_admins**: Junction table for club administrators
- **user_profiles**: Extended user profile information

### Content Tables

- **announcements**: Marquee announcements
- **hero_slides**: Homepage hero slider
- **about_features**: About section features
- **stats**: Statistics/impact numbers
- **events**: Event management
- **team_members**: Team member profiles
- **gallery**: Photo gallery
- **partners**: Partner organizations
- **alumni**: Alumni profiles
- **news**: News articles
- **downloads**: Downloadable files
- **occasions**: Special occasions (farewell, etc.)

### Event Management

- **event_registrations**: User event registrations
- **payments**: Payment tracking
- **certificates**: Certificate management
- **certificate_templates**: Certificate templates
- **event_winners**: Event winner tracking

### Navigation

- **nav_items**: Dynamic navigation menu
- **custom_pages**: Custom page content

### Utilities

- **visitor_counter**: Website visitor tracking
- **contact_submissions**: Contact form submissions
- **team_categories**: Team category definitions

## Security Features

The database includes:

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (super_admin, admin, teacher, student)
- **Multi-tenant architecture** with club isolation
- **Secure functions** with SECURITY DEFINER
- **Public read access** for website content
- **Admin-only write access** for content management

## Troubleshooting

### Migration Fails

If the migration fails:

1. Check the error message in the SQL Editor
2. Make sure you're using a fresh database
3. Try running the migration in smaller chunks
4. Contact support if the issue persists

### Can't Login as Admin

If you can't access admin features:

1. Verify the user exists in Authentication > Users
2. Check if the user has a role in `user_roles` table
3. Run the admin role insert query again

### Storage Issues

If image uploads don't work:

1. Verify the `images` bucket exists in Storage
2. Check the storage policies are created
3. Ensure the user has admin role

## Next Steps

After setup:

1. ✅ Update your `.env` file with Supabase credentials
2. ✅ Create your first admin user
3. ✅ Test the connection by running the app
4. ✅ Login to the admin panel
5. ✅ Start adding content (events, team members, etc.)

## Support

For issues or questions:

- Check Supabase documentation: https://supabase.com/docs
- Review the migration file for schema details
- Check the application code for API usage examples

## Important Notes

- **Keep your service_role key secret!** Never expose it in client-side code
- **Use the anon key** for client-side operations
- **Backup your database** regularly
- **Test in development** before deploying to production
- **Monitor usage** to stay within your plan limits

---

Happy coding! 🚀
