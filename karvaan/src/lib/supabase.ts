import { createClient } from '@supabase/supabase-js';
import { storage } from '@/lib/storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl && __DEV__) {
  console.error('🚨 [Supabase] supabaseUrl is missing! Check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL is set.');
}

const mmkvStorage = {
  getItem: (key: string) => {
    try {
      const value = storage.getString(key);
      return value ?? null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
