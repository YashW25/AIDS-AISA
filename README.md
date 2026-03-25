# Multi-Tenant Club Management Platform

A comprehensive web platform for managing student clubs across multiple colleges with independent branding, event management, and user authentication.

## Features

- **Multi-tenant Architecture**: Single codebase serving multiple clubs with data isolation
- **Dynamic Branding**: Each club has custom colors, logos, and domains
- **Event Management**: Complete event lifecycle with registrations and certificates
- **Gallery Integration**: Google Drive folder integration for event photos
- **Multi-language Support**: English, Hindi, and Marathi translations
- **Role-based Access**: Super admin, club admin, teacher, and student roles

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Animations**: Framer Motion

## Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── integrations/   # External service integrations
├── locales/        # Translation files (en, hi, mr)
├── pages/          # Page components
└── types/          # TypeScript type definitions
```

## Environment Variables

Required environment variables are automatically configured:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Deployment

The project is configured for automatic deployment. Push changes to trigger a new build.

## License

Proprietary - All rights reserved.
