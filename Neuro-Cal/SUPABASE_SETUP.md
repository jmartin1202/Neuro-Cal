# Supabase Integration Setup Guide

This guide will help you set up Supabase for your NeuroCal project, replacing the custom backend with Supabase's managed services.

## Prerequisites

- A Supabase account (free at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Your NeuroCal project cloned locally

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `neurocal` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually 2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-migration.sql`
3. Paste it into the SQL editor and click "Run"
4. This will create all necessary tables, indexes, and RLS policies

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:8080` (for development)
   - **Redirect URLs**: Add `http://localhost:8080/**`
3. Go to **Authentication** → **Providers**
4. Enable **Email** provider
5. Optionally enable other providers (Google, GitHub, etc.)

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to register a new user
3. Check the Supabase dashboard to see if the user was created
4. Verify that RLS policies are working correctly

## Step 7: Update Your Components

The following components have been updated to use Supabase:

- **Authentication**: `SupabaseAuthContext.tsx` replaces `AuthContext.tsx`
- **Calendar Operations**: `calendarService.ts` handles all calendar CRUD operations
- **AI Suggestions**: `aiSuggestionsService.ts` manages AI-generated suggestions

## Step 8: Deploy to Production

1. Update your production environment variables with production Supabase credentials
2. Update your Supabase project settings:
   - **Site URL**: Your production domain
   - **Redirect URLs**: Your production domain with `/**`
3. Deploy your frontend to Heroku

## Database Schema Overview

### Tables Created

1. **users** - Extended user profiles (extends Supabase auth.users)
2. **calendar_events** - Calendar events with full CRUD support
3. **ai_suggestions** - AI-generated suggestions for calendar optimization

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Real-time subscriptions**: Live updates for calendar changes
- **Automatic timestamps**: Created/updated timestamps managed automatically
- **Foreign key constraints**: Proper referential integrity
- **Indexes**: Optimized for common query patterns

## RLS Policies

All tables have Row Level Security enabled with policies that ensure:

- Users can only view their own data
- Users can only modify their own data
- No cross-user data access is possible
- Secure by default

## Real-time Features

The integration includes real-time subscriptions for:

- Calendar event changes
- AI suggestion updates
- User profile modifications

## Migration from Custom Backend

To fully migrate from your custom Express backend:

1. **Phase 1**: Use Supabase for authentication (✅ Complete)
2. **Phase 2**: Use Supabase for calendar operations (✅ Complete)
3. **Phase 3**: Use Supabase for AI suggestions (✅ Complete)
4. **Phase 4**: Remove Express backend (Optional - can keep for custom logic)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Supabase project settings include your domain
2. **RLS Policy Errors**: Check that policies are properly created
3. **Authentication Issues**: Verify environment variables are correct
4. **Real-time Not Working**: Check if you're subscribed to the correct channels

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

## Next Steps

After completing this setup:

1. Test all authentication flows
2. Verify calendar operations work correctly
3. Test real-time updates
4. Consider adding more Supabase features:
   - File storage for attachments
   - Edge functions for AI processing
   - Database backups and monitoring
   - Performance insights

## Cost Considerations

- **Free Tier**: 50,000 monthly active users, 500MB database, 2GB bandwidth
- **Pro Plan**: $25/month for higher limits
- **Enterprise**: Custom pricing for large-scale deployments

The free tier should be sufficient for development and small production deployments.
