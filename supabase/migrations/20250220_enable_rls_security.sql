/*
  # Habilitar Segurança RLS (Row Level Security)

  ## Query Description:
  Esta migração ativa a segurança RLS em todas as tabelas críticas (profiles, meals, workouts).
  Isso garante que os usuários só possam ver, inserir e deletar seus PRÓPRIOS dados.
  Resolve os avisos de segurança críticos do Supabase.

  ## Metadata:
  - Schema-Category: "Security"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Security Implications:
  - RLS Status: Enabled for all tables
  - Policy Changes: Adds policies for SELECT, INSERT, DELETE based on auth.uid()
*/

-- 1. Habilitar RLS nas tabelas (se ainda não estiver habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para Profiles
-- Permite que o usuário veja apenas o seu perfil
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

-- Permite que o usuário atualize apenas o seu perfil
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Permite que o usuário insira seu próprio perfil (necessário no cadastro)
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Políticas para Meals (Refeições)
-- Permite ver apenas suas próprias refeições
CREATE POLICY "Users can view own meals" ON meals 
  FOR SELECT USING (auth.uid() = user_id);

-- Permite inserir refeições apenas para si mesmo
CREATE POLICY "Users can insert own meals" ON meals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permite deletar apenas suas próprias refeições
CREATE POLICY "Users can delete own meals" ON meals 
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Políticas para Workouts (Treinos)
-- Permite ver apenas seus próprios treinos
CREATE POLICY "Users can view own workouts" ON workouts 
  FOR SELECT USING (auth.uid() = user_id);

-- Permite inserir treinos apenas para si mesmo
CREATE POLICY "Users can insert own workouts" ON workouts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permite deletar apenas seus próprios treinos
CREATE POLICY "Users can delete own workouts" ON workouts 
  FOR DELETE USING (auth.uid() = user_id);
