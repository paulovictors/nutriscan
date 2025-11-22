/*
  # Enable Row Level Security (RLS) & Fix Permissions
  
  ## Query Description:
  Este script corrige os avisos de segurança "RLS Disabled" e define quem pode aceder aos dados.
  Sem isto, a aplicação pode falhar ao tentar salvar o perfil ou carregar refeições.
  
  ## Metadata:
  - Schema-Category: "Security"
  - Impact-Level: "High" (Enables data access)
  - Requires-Backup: false
  - Reversible: true
  
  ## Changes:
  1. Verifica/Adiciona coluna 'gender' em profiles.
  2. Ativa RLS em profiles, meals, workouts.
  3. Cria políticas de SELECT, INSERT, UPDATE, DELETE para o dono dos dados.
*/

-- 1. Garantir que a coluna gender existe (para evitar erros de cálculo)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE public.profiles ADD COLUMN gender text DEFAULT 'male';
    END IF;
END $$;

-- 2. Ativar RLS (Segurança a Nível de Linha)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- 3. Limpar políticas antigas para evitar duplicados
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON public.meals;

DROP POLICY IF EXISTS "Users can view own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON public.workouts;

-- 4. Criar Novas Políticas de Acesso

-- PROFILES: O utilizador só mexe no seu próprio perfil (auth.uid() == id)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- MEALS: O utilizador só mexe nas suas refeições (auth.uid() == user_id)
CREATE POLICY "Users can view own meals" ON public.meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON public.meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON public.meals
  FOR DELETE USING (auth.uid() = user_id);

-- WORKOUTS: O utilizador só mexe nos seus treinos
CREATE POLICY "Users can view own workouts" ON public.workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON public.workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
