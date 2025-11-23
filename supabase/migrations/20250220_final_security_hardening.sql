/*
  # Security Hardening & RLS Fixes
  
  ## Description
  Este script garante que o Row Level Security (RLS) esteja ATIVO em todas as tabelas e 
  recria as políticas de acesso para evitar conflitos e garantir que o usuário consiga salvar dados.

  ## Actions
  1. Ativa RLS em profiles, meals, workouts.
  2. Remove políticas antigas para evitar erros de duplicidade.
  3. Cria políticas permissivas para SELECT e INSERT para o dono dos dados.
*/

-- 1. Garantir RLS Ativo (Remove o aviso de segurança)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workouts ENABLE ROW LEVEL SECURITY;

-- 2. Limpeza de Políticas Antigas (Evita erro "policy already exists")
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON meals;

DROP POLICY IF EXISTS "Users can view own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;

-- 3. Recriação das Políticas Corretas

-- PROFILES
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- MEALS
CREATE POLICY "Users can view own meals" 
ON meals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" 
ON meals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" 
ON meals FOR DELETE 
USING (auth.uid() = user_id);

-- WORKOUTS
CREATE POLICY "Users can view own workouts" 
ON workouts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" 
ON workouts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" 
ON workouts FOR DELETE 
USING (auth.uid() = user_id);
