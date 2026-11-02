import { IonAlert, IonButton, IonInput } from '@ionic/react';
import { useEffect, useState } from 'react';
import type { Save } from '../model';
import { currentProfile, getSupabase, isSupabaseConfigured, type Profile } from './supabase';
import { deleteCloudSave, linkAccount, resolveConflict, saveSummary, signOutCloud, startSaveSync, uploadSave, type LinkResult } from './save-sync';
import { contentStatus } from './content-sync';

const contentLine = () => contentStatus.source === 'live'
  ? `Places and stories are up to date (${new Date(contentStatus.fetchedAt ?? '').toLocaleString()}).`
  : contentStatus.source === 'cache'
    ? `Using places and stories saved on ${new Date(contentStatus.fetchedAt ?? '').toLocaleString()}. They refresh when you are online.`
    : 'Using the places and stories built into this version.';

/** Optional account: backs up the traveler's save and opens the admin dashboard for editors/admins. */
export default function CloudAccount({ save, onSaveReplaced }: { save: Save; onSaveReplaced: (save: Save) => void }) {
  const [profile, setProfile] = useState<Profile>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState<Extract<LinkResult, { kind: 'conflict' }>>();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    startSaveSync();
    let active = true;
    const load = () => currentProfile().then(p => { if (active) setProfile(p); }).catch(() => undefined);
    void load();
    const { data } = getSupabase()!.auth.onAuthStateChange(() => { void load(); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  if (!isSupabaseConfigured) return null;

  const run = async (task: () => Promise<string | void>) => {
    setBusy(true); setError(''); setMessage('');
    try { const text = await task(); if (text) setMessage(text); }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  };

  const signIn = () => void run(async () => {
    const auth = getSupabase()!.auth;
    if (mode === 'signup') {
      const { data, error: e } = await auth.signUp({ email, password });
      if (e) throw e;
      if (!data.session) return 'Check your email to confirm your account, then sign in.';
    } else {
      const { error: e } = await auth.signInWithPassword({ email, password });
      if (e) throw e;
    }
    setPassword('');
    setProfile(await currentProfile());
    const result = await linkAccount(save);
    if (result.kind === 'conflict') { setConflict(result); return; }
    if (result.kind === 'restored') { onSaveReplaced(result.save); return `Welcome back! Restored ${saveSummary(result.save)}.`; }
    return 'Signed in. Your adventure is now backed up.';
  });

  const choose = (choice: 'cloud' | 'device') => {
    const pending = conflict!;
    setConflict(undefined);
    void run(async () => {
      const kept = await resolveConflict(choice, pending);
      if (choice === 'cloud') onSaveReplaced(kept);
      return choice === 'cloud' ? `Restored ${saveSummary(kept)}.` : 'This device’s adventure is now your cloud backup.';
    });
  };

  return <section className="kp-account" aria-labelledby="kp-account-title">
    <h2 id="kp-account-title">Account & cloud backup</h2>
    <p className="kp-account-status">{contentLine()}</p>
    {profile ? <>
      <p>Signed in as <b>{profile.email}</b>{profile.role !== 'learner' && <> · <span className="kp-role">{profile.role}</span></>}. Your coins, missions, Buddies and practice back up automatically.</p>
      <div className="kp-account-actions">
        <IonButton fill="outline" disabled={busy} onClick={() => void run(async () => { await uploadSave(save); return 'Backed up just now.'; })}>Back up now</IonButton>
        {(profile.role === 'admin' || profile.role === 'editor') && <IonButton onClick={() => window.location.assign('/admin')}>Open admin dashboard</IonButton>}
        <IonButton fill="clear" disabled={busy} onClick={() => { if (window.confirm('Sign out of KaPamana? Your adventure stays saved in your account.')) void run(async () => { await signOutCloud(save); setProfile(undefined); }); }}>Sign out</IonButton>
        <IonButton fill="clear" color="danger" disabled={busy} onClick={() => {
          if (!window.confirm('Delete your cloud backup? Progress on this device is kept.')) return;
          void run(async () => { await deleteCloudSave(); setProfile(undefined); return 'Cloud backup deleted and signed out.'; });
        }}>Delete cloud backup</IonButton>
      </div>
    </> : <form className="kp-account-form" onSubmit={e => { e.preventDefault(); signIn(); }}>
      <p>Optional: sign in to back up your adventure and continue on another phone.</p>
      <IonInput label="Email" labelPlacement="stacked" fill="outline" type="email" autocomplete="email" required value={email} onIonInput={e => setEmail(e.detail.value ?? '')} />
      <IonInput label="Password" labelPlacement="stacked" fill="outline" type="password" minlength={8} required value={password} onIonInput={e => setPassword(e.detail.value ?? '')} />
      <div className="kp-account-actions">
        <IonButton type="submit" disabled={busy || !email || password.length < 8}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}</IonButton>
        <IonButton fill="clear" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'I already have an account' : 'Create an account'}</IonButton>

      </div>
    </form>}
    {message && <p className="kp-account-message" role="status">{message}</p>}
    {error && <p className="kp-account-error" role="alert">{error}</p>}
    <IonAlert isOpen={!!conflict} backdropDismiss={false} header="Which adventure should we keep?"
      message={conflict ? `Cloud: ${saveSummary(conflict.cloud)}. This phone: ${saveSummary(conflict.local)}.` : ''}
      buttons={[{ text: 'Keep this phone', handler: () => choose('device') }, { text: 'Use cloud', handler: () => choose('cloud') }]} />
  </section>;
}
