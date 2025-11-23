/*
  # Fix Database Schema
  
  ## Query Description:
  1. Adiciona colunas faltantes (calories, macros, micronutrients) à tabela meals se não existirem.
  2. Garante que a tabela workouts existe com as colunas corretas.
  3. Reforça as políticas de segurança (RLS).
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
*/

-- Garantir tabela meals com colunas corretas
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT,
    image_url TEXT,
    calories INTEGER DEFAULT 0,
    macros JSONB DEFAULT '{"protein": 0, "carbs": 0, "fat": 0}'::jsonb,
    micronutrients JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar colunas manualmente caso a tabela já exista sem elas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meals' AND column_name = 'calories') THEN
        ALTER TABLE public.meals ADD COLUMN calories INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meals' AND column_name = 'macros') THEN
        ALTER TABLE public.meals ADD COLUMN macros JSONB DEFAULT '{"protein": 0, "carbs": 0, "fat": 0}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meals' AND column_name = 'micronutrients') THEN
        ALTER TABLE public.meals ADD COLUMN micronutrients JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Garantir tabela workouts
CREATE TABLE IF NOT EXISTS public.workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workout_type TEXT NOT NULL,
    duration_min INTEGER NOT NULL,
    kcal_burned INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Recriar políticas para garantir acesso correto
DROP POLICY IF EXISTS "Users can view their own meals" ON public.meals;
CREATE POLICY "Users can view their own meals" ON public.meals FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own meals" ON public.meals;
CREATE POLICY "Users can insert their own meals" ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own workouts" ON public.workouts;
CREATE POLICY "Users can view their own workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workouts" ON public.workouts;
CREATE POLICY "Users can insert their own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
