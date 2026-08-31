import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const globalRef = globalThis as typeof globalThis & {
  __mediclaimAppDataSupabaseClient?: SupabaseClient;
};

function isDummySupabaseValue(value?: string) {
  if (!value) return true;
  return /dummy|your-|replace/i.test(value);
}

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || isDummySupabaseValue(url) || isDummySupabaseValue(key)) {
    return null;
  }

  if (!globalRef.__mediclaimAppDataSupabaseClient) {
    try {
      globalRef.__mediclaimAppDataSupabaseClient = createClient(url, key);
    } catch {
      return null;
    }
  }

  return globalRef.__mediclaimAppDataSupabaseClient;
}

export function isSupabaseConfigured() {
  return getSupabaseClient() !== null;
}
