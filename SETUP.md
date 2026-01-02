# Quick Setup Guide

## 1. Configure Supabase

### Create a Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for initialization

### Run Database Migration

1. Go to SQL Editor in your Supabase dashboard
2. Copy contents from `supabase/migrations/001_initial_schema.sql`
3. Paste and execute in SQL Editor

### Get Credentials

1. Go to Settings → API
2. Copy your Project URL
3. Copy your anon public key

### Update .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_key
```

## 2. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 3. Start Using

1. Sign up for an account
2. Add your first expense
3. Explore filtering and statistics!

## 4. Deploy to Vercel

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Go to [Vercel](https://vercel.com) and sign in.
3. Click "New Project" and import your repository.
4. Set the environment variables from your `.env.local` in the Vercel dashboard.
5. Click "Deploy". Vercel will handle the rest!

For more details, see the [Vercel Next.js documentation](https://vercel.com/docs/frameworks/nextjs).

---

**Need help?** Check the full README.md for detailed instructions.
