import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase connection. Configure with a `.env.local` file (see .env.example):
 *   VITE_SUPABASE_URL=https://<project>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon public key>
 * Without these values the app runs exactly as before: fully offline with the bundled content.
 * Never put the service_role key in the app — it bypasses row level security.
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured = (/^https:\/\/.+/.test(url) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url)) && anonKey.length > 20;

let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient | undefined {
  if (!isSupabaseConfigured) return undefined;
  client ??= createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'kapamana.auth.v1' },
  });
  return client;
}

export type AppRole = 'learner' | 'editor' | 'admin';
export type Profile = { id: string; email: string | null; display_name: string | null; role: AppRole; created_at: string };

export async function currentProfile(): Promise<Profile | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return undefined;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? undefined;
}

export const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T | 'timeout'> =>
  Promise.race([promise, new Promise<'timeout'>(resolve => setTimeout(() => resolve('timeout'), ms))]);
