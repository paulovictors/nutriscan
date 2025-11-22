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

// Se a URL do ambiente for válida, usa-a. Caso contrário, usa um placeholder seguro.
// Isso impede o erro "Invalid supabaseUrl" que crasha a aplicação.
const supabaseUrl = isValidUrl(envUrl) ? envUrl : 'https://placeholder.supabase.co';
const supabaseKey = envKey && envKey.trim().length > 0 ? envKey : 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
