# 💰 Expense Tracker

A modern, responsive expense management web application built with Next.js, Supabase, and shadcn/ui.

## Features

- 🔐 **Authentication** - Secure login and signup with Supabase
- 💳 **Expense Management** - Add, edit, and delete expenses
- 📊 **Dashboard** - View statistics and insights
- 🔍 **Advanced Filtering** - Filter by category, date range, and search
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- ✨ **Smooth Animations** - Minimalist design with elegant transitions

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Database & Auth**: Supabase
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup

1. **Clone the repository** (if applicable) or navigate to the project directory:

   ```bash
   cd /Users/admin/Projects/expenses
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Supabase**:

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Run the database migration:

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

   c. Update `.env.local` with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_public_key
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign up** for a new account or **log in** if you already have one
2. **Add expenses** using the "Add Expense" button
3. **Filter expenses** by category, date range, or search
4. **Edit or delete** expenses using the action buttons in the table
5. **View statistics** on the dashboard cards

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   └── page.tsx         # Home page (redirects to dashboard)
├── components/
│   ├── dashboard/       # Dashboard components
│   ├── expenses/        # Expense management components
│   ├── layout/          # Layout components
│   └── ui/              # shadcn/ui components
└── lib/
    ├── actions/         # Server actions
    ├── supabase/        # Supabase clients
    └── types/           # TypeScript types
```

## Database Schema

### Categories Table

- Default categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Other
- Each category has an icon and color

### Expenses Table

- Fields: amount, category, date, description
- Row Level Security (RLS) enabled
- Users can only access their own expenses

## Deployment (Vercel)

You can easily deploy this app to [Vercel](https://vercel.com):

1. **Push your code to GitHub, GitLab, or Bitbucket.**
2. **Sign in to Vercel** and click "New Project".
3. **Import your repository.**
4. **Set environment variables** in the Vercel dashboard (copy from your `.env.local`).
5. **Click Deploy.**

Vercel will automatically detect your Next.js app and handle the build and deployment process.

- For more details, see the [Vercel Next.js documentation](https://vercel.com/docs/frameworks/nextjs).
- Make sure your Supabase project is accessible from the deployed environment.

## License

MIT
