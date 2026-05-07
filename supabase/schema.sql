-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/cwdcvjruaesyojiyxqll/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  sport text,
  goal text,
  gender text default 'male',
  age integer default 22,
  height_cm integer default 175,
  weight_kg numeric default 70,
  units text default 'imperial',
  target_calories integer default 2400,
  target_protein integer default 150,
  target_carbs integer default 300,
  target_fat integer default 75,
  onboarded_at timestamptz,
  created_at timestamptz default now()
);

-- Meals
create table public.meals (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  meal_type text not null,
  foods jsonb not null default '[]',
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  logged_at timestamptz not null
);

-- Workouts
create table public.workouts (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  name text not null,
  duration_min integer not null,
  distance_km numeric,
  intensity integer not null,
  notes text,
  completed_at timestamptz not null
);

-- Wellness check-ins
create table public.wellness_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  sleep_hours numeric not null,
  energy integer not null,
  soreness integer not null,
  mood integer not null,
  logged_at timestamptz not null,
  unique(user_id, date)
);

-- Row Level Security (users can only see their own data)
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.workouts enable row level security;
alter table public.wellness_checkins enable row level security;

create policy "Users own their profile" on public.profiles for all using (auth.uid() = id);
create policy "Users own their meals" on public.meals for all using (auth.uid() = user_id);
create policy "Users own their workouts" on public.workouts for all using (auth.uid() = user_id);
create policy "Users own their checkins" on public.wellness_checkins for all using (auth.uid() = user_id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
