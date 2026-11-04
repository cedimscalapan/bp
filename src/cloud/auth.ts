import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from './supabase';

export type AuthState =
  | { status: 'disabled' }            // no Supabase configured: offline-only build
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; session: Session };

/** Tracks the stored Supabase session. A stored session works offline, so signed-in travelers can always play. */
export function useAuthSession(): AuthState {
  const [state, setState] = useState<AuthState>(isSupabaseConfigured ? { status: 'loading' } : { status: 'disabled' });
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let active = true;
    const apply = (session: Session | null) => { if (active) setState(session ? { status: 'signed-in', session } : { status: 'signed-out' }); };
    supabase.auth.getSession().then(({ data }) => apply(data.session)).catch(() => apply(null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => apply(session));
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  return state;
}

export type SignUpResult = { kind: 'signed-in' } | { kind: 'confirm-email' };

export async function signUpTraveler(email: string, password: string, travelerName: string): Promise<SignUpResult> {
  const { data, error } = await getSupabase()!.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: travelerName.trim().slice(0, 24) || undefined } },
  });
  // New accounts are confirmed by the database (auto_confirm_email trigger), so even when Supabase still has
  // "Confirm email" switched on, or could not send the confirmation email, the traveler can sign in right away.
  const trySignIn = async () => !(await getSupabase()!.auth.signInWithPassword({ email: email.trim(), password })).error;
  if (error) {
    if (isMailerError(error) && await trySignIn()) return { kind: 'signed-in' };
    throw error;
  }
  // Supabase returns a fake user with no identities when the email is already registered (anti-enumeration).
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw Object.assign(new Error('User already registered'), { code: 'user_already_exists' });
  }
  if (data.session) return { kind: 'signed-in' };
  return (await trySignIn()) ? { kind: 'signed-in' } : { kind: 'confirm-email' };
}

/** Errors caused by Supabase failing to send (or being limited from sending) the confirmation email. */
export function isMailerError(error: unknown): boolean {
  const e = (error ?? {}) as { message?: string; code?: string };
  const message = (e.message ?? '').toLowerCase();
  return ['over_email_send_rate_limit', 'email_address_not_authorized', 'unexpected_failure'].includes(e.code ?? '')
    || message.includes('confirmation email') || message.includes('email rate limit') || message.includes('not authorized');
}

export async function signInTraveler(email: string, password: string): Promise<void> {
  const { error } = await getSupabase()!.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/** Turns Supabase / network errors into short, friendly messages for travelers. */
export function authErrorMessage(error: unknown): string {
  const e = (error ?? {}) as { message?: string; code?: string; status?: number; name?: string };
  const code = e.code ?? '';
  const message = (e.message ?? String(error ?? '')).toLowerCase();
  if (code === 'user_already_exists' || message.includes('already registered')) return 'That email already has a KaPamana account. Choose “Sign in” instead.';
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) return 'The email or password is incorrect. Please try again.';
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) return 'This account’s email is not confirmed yet. Open the confirmation email first, then sign in.';
  if (code === 'weak_password' || message.includes('password should')) return 'Please choose a stronger password: at least 8 characters, mixing letters and numbers.';
  if (code === 'email_address_invalid' || message.includes('invalid format') || message.includes('is invalid')) return 'Please enter a valid email address.';
  if (code === 'over_email_send_rate_limit' || code === 'email_address_not_authorized' || message.includes('email rate limit') || message.includes('not authorized') || message.includes('sending confirmation email')) {
    return 'New accounts are temporarily unavailable because the KaPamana server could not send a confirmation email. Please try again later or contact the KaPamana team.';
  }
  if (code === 'over_request_rate_limit' || e.status === 429) return 'Too many attempts. Please wait a minute and try again.';
  if (e.name === 'AuthRetryableFetchError' || message.includes('failed to fetch') || message.includes('network') || message.includes('load failed')) {
    return 'No internet connection. Connect to the internet to create your account or sign in.';
  }
  if (code === 'signup_disabled' || message.includes('signups not allowed')) return 'New accounts are closed right now. Please contact the KaPamana team.';
  return e.message || 'Something went wrong. Please try again.';
}
