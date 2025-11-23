/*
  # Criação do Schema Completo do App de Nutrição
  
  ## Estrutura
  1. profiles (Perfil do usuário)
  2. meals (Refeições registradas)
  3. workouts (Treinos registrados)
  
  ## Segurança
  - RLS habilitado em todas as tabelas
  - Políticas para permitir que usuários vejam/editem apenas seus próprios dados
*/

-- Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  age INTEGER,
  weight_kg FLOAT,
  height_m FLOAT,
  gender TEXT,
  activity_level TEXT,
  basal_metabolic_rate FLOAT,
  daily_calorie_goal FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela de Refeições
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  image_url TEXT,
  calories INTEGER,
  macros JSONB,
  micronutrients JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tabela de Treinos
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workout_type TEXT,
  duration_min INTEGER,
  kcal_burned INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança para Perfis
CREATE POLICY "Usuários podem ver seu próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas de Segurança para Refeições
CREATE POLICY "Usuários podem ver suas refeições" 
  ON public.meals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas refeições" 
  ON public.meals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas refeições" 
  ON public.meals FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas de Segurança para Treinos
CREATE POLICY "Usuários podem ver seus treinos" 
  ON public.workouts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus treinos" 
  ON public.workouts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus treinos" 
  ON public.workouts FOR DELETE 
  USING (auth.uid() = user_id);
