-- Copie e cole este código no Editor SQL do Supabase para configurar o banco de dados

-- 1. Habilitar extensão para IDs únicos
create extension if not exists "uuid-ossp";

-- 2. Tabela de Perfis de Usuário
create table public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  age integer,
  weight_kg float,
  height_m float,
  activity_level text,
  basal_metabolic_rate float,
  daily_calorie_goal float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Refeições
create table public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text,
  image_url text,
  total_kcal float,
  macros jsonb,
  micronutrients jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Treinos
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  workout_type text,
  duration_min integer,
  kcal_burned float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Segurança (Row Level Security)
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.workouts enable row level security;

-- Políticas de Acesso (Cada usuário só vê os seus dados)
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own meals" on public.meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on public.meals for insert with check (auth.uid() = user_id);

create policy "Users can view own workouts" on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert own workouts" on public.workouts for insert with check (auth.uid() = user_id);
