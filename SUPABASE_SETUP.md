# Supabase Authentication Setup

This project uses Supabase for authentication. Follow these steps to set up your Supabase project:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account
2. Click "New Project"
3. Fill in your project details:
   - Project Name: Choose a name for your project
   - Database Password: Create a secure password
   - Region: Choose a region close to your users
   - Pricing Plan: Select Free tier to get started

## 2. Get Your API Keys

1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long JWT token)

## 3. Configure Environment Variables

1. Create a `.env.local` file in the root of your project (copy from `.env.local.example`):
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## 4. Configure Email Authentication (Optional)

By default, Supabase requires email confirmation for new signups.

### To disable email confirmation (for development):
1. Go to **Authentication** → **Providers** → **Email**
2. Turn off "Confirm email"

### To customize email templates:
1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation, invite, and password recovery emails

## 5. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   - `/signup` - Create a new account
   - `/login` - Sign in with your account

## 6. Available Routes

- `/signup` - User registration
- `/login` - User login
- `/` - Main application (protected)

## Authentication Features

- Email/Password authentication
- Session management with cookies
- Automatic session refresh
- Protected routes via middleware
- Email verification (optional)

## Next Steps

You can extend the authentication system with:
- Password reset functionality
- OAuth providers (Google, GitHub, etc.)
- User profiles
- Role-based access control
- Magic link authentication

For more information, visit the [Supabase Documentation](https://supabase.com/docs/guides/auth).
