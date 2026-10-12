import { createClient } from '@supabase/supabase-js';

// Support both VITE_ and NEXT_PUBLIC_ prefixes and PUBLISHABLE / ANON key names
const env = import.meta.env;

export const SUPABASE_URL =
  env.VITE_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://xyzcompany.supabase.co';

export const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

export const isSupabaseConfigured = () => {
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;
  return (
    url &&
    key &&
    !url.includes('xyzcompany') &&
    !key.includes('dummy_anon_key')
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
--- SUPABASE SQL SCHEMA FOR NETWORK TYCOON ---
Paste the following SQL into your Supabase SQL Editor to create tables & policies:

CREATE TABLE public.users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_mission_ids INT[] DEFAULT '{}',
  claimed_rewards JSONB DEFAULT '{}'::jsonb,
  total_tycoon_earned NUMERIC DEFAULT 10000,
  quiz_scores JSONB DEFAULT '[]'::jsonb,
  unlocked_badges TEXT[] DEFAULT '{NETWORK_NOVICE}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.certificates (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE,
  gpa_score NUMERIC DEFAULT 4.0,
  completed_missions_count INT DEFAULT 0
);

-- Row Level Security (RLS)
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own profile" ON public.users_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update own profile" ON public.users_profile FOR ALL USING (auth.uid() = id);

CREATE POLICY "Allow users to read own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow users to read own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
*/
