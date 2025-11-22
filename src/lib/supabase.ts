import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Função auxiliar para validar se a string é uma URL válida
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Verifica se as variáveis de ambiente estão configuradas corretamente
// Consideramos "não configurado" se estiver vazio, undefined ou se for o placeholder padrão
export const isSupabaseConfigured = 
  isValidUrl(envUrl) && 
  envKey && 
  envKey.trim().length > 0 && 
  !envUrl?.includes('placeholder');

// Se a URL do ambiente for válida, usa-a. Caso contrário, usa um placeholder seguro.
const supabaseUrl = isSupabaseConfigured ? envUrl : 'https://placeholder.supabase.co';
const supabaseKey = isSupabaseConfigured ? envKey : 'placeholder-key';

// Exporta o cliente. Se não estiver configurado, as chamadas falharão (o que tratamos no AppContext)
export const supabase = createClient(supabaseUrl!, supabaseKey!);
