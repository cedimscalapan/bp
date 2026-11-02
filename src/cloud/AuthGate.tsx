import { IonAlert, IonButton, IonInput, IonSpinner } from '@ionic/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Save } from '../model';
import { authErrorMessage, isValidEmail, signInTraveler, signUpTraveler } from './auth';
import { linkAccount, resolveConflict, saveSummary, type LinkResult } from './save-sync';
import { getSupabase } from './supabase';

type Mode = 'signup' | 'signin' | 'confirm' | 'forgot' | 'linking';

/**
 * First screen of the app when the KaPamana server is configured: travelers create an account (or sign in)
 * before the welcome/onboarding screen and the game. After authentication the device is linked to the
 * account's cloud save (restoring it on a new phone, or asking which one to keep).
 */
export default function AuthGate({ save, signedIn, onReady }: {
  save: Save;
  signedIn: boolean;
  onReady: (result: { save?: Save; travelerName?: string }) => void;
}) {
  const [mode, setMode] = useState<Mode>(signedIn ? 'linking' : 'signup');
  const [name, setName] = useState(save.name !== 'Traveler' ? save.name : '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [conflict, setConflict] = useState<Extract<LinkResult, { kind: 'conflict' }>>();
  const linking = useRef(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);

  const finishLink = async () => {
    if (linking.current) return;
    linking.current = true;
    setMode('linking'); setError('');
    try {
      const result = await linkAccount(save);
      if (result.kind === 'conflict') { setConflict(result); return; }
      const { data } = await getSupabase()!.auth.getUser();
      const travelerName = (data.user?.user_metadata?.display_name as string | undefined) ?? undefined;
      onReady(result.kind === 'restored' ? { save: result.save } : { travelerName });
    } catch (e) {
      setError(authErrorMessage(e));
      linking.current = false;
    }
  };

  // Make sure an error is visible on small phone screens.
  useEffect(() => { if (error) document.querySelector('.kp-auth-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [error]);

  // A session that exists but is not linked to this device yet (e.g. after an app update) links automatically.
  useEffect(() => { if (signedIn) void finishLink(); }, [signedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Your password needs at least 8 characters.'); return; }
    if (mode === 'signup') {
      if (!name.trim()) { setError('Please enter your traveler name.'); return; }
      if (password !== confirm) { setError('The two passwords do not match.'); return; }
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const result = await signUpTraveler(email, password, name);
        if (result.kind === 'confirm-email') { setMode('confirm'); return; }
      } else {
        await signInTraveler(email, password);
      }
      await finishLink();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally { setBusy(false); }
  };

  const confirmedSignIn = async () => {
    setBusy(true); setError('');
    try { await signInTraveler(email, password); await finishLink(); }
    catch (e) { setError(authErrorMessage(e)); }
    finally { setBusy(false); }
  };

  const choose = (choice: 'cloud' | 'device') => {
    const pending = conflict!;
    setConflict(undefined);
    void resolveConflict(choice, pending)
      .then(kept => onReady(choice === 'cloud' ? { save: kept } : {}))
      .catch(e => { setError(authErrorMessage(e)); linking.current = false; });
  };

  const brand = <div className="kapamana-brand"><img src="/assets/kapamana-logo-lockup.webp" alt="KaPamana · Oriental Mindoro" /></div>;

  if (mode === 'linking') return <div className="onboarding kp-auth">
    {brand}
    {error ? <>
      <h1>Almost there</h1><p className="kp-auth-error" role="alert">{error}</p>
      <IonButton expand="block" onClick={() => void finishLink()}>Try again</IonButton>
      <IonButton expand="block" fill="clear" onClick={() => void getSupabase()!.auth.signOut().then(() => { linking.current = false; setMode('signin'); setError(''); })}>Use a different account</IonButton>
    </> : <><IonSpinner /><p>Preparing your passport…</p></>}
    <IonAlert isOpen={!!conflict} backdropDismiss={false} header="Which adventure should we keep?"
      message={conflict ? `Your account: ${saveSummary(conflict.cloud)}. This phone: ${saveSummary(conflict.local)}.` : ''}
      buttons={[{ text: 'Keep this phone', handler: () => choose('device') }, { text: 'Use my account', handler: () => choose('cloud') }]} />
  </div>;

  if (mode === 'confirm') return <div className="onboarding kp-auth">
    {brand}
    <small>ONE MORE STEP</small>
    <h1>Confirm your email</h1>
    <p>We sent a confirmation link to <b>{email}</b>.</p>
    <ol className="kp-auth-steps">
      <li>Open the email from Supabase and tap <b>Confirm your mail</b>.</li>
      <li>If your browser then shows <b>“This site can’t be reached”</b> or <b>localhost</b>, that is okay: your account is already confirmed.</li>
      <li>Come back here and tap the button below.</li>
    </ol>
    {error && <p className="kp-auth-error" role="alert">{error}</p>}
    <IonButton expand="block" disabled={busy} onClick={() => void confirmedSignIn()}>{busy ? 'Checking…' : 'I’ve confirmed — continue'}</IonButton>
    <IonButton expand="block" fill="clear" onClick={() => { setMode('signin'); setError(''); }}>Back to sign in</IonButton>
  </div>;

  if (mode === 'forgot') return <div className="onboarding kp-auth">
    {brand}
    <small>FORGOT YOUR PASSWORD?</small>
    <h1>We’ll help you back in</h1>
    <p>Ask a KaPamana admin to set a new password for <b>{email || 'your email'}</b>. They can do it in the admin dashboard under <b>Users &amp; roles → Set password</b>. Then sign in with the new password. Your adventure stays saved in your account.</p>
    <IonButton expand="block" onClick={() => { setMode('signin'); setError(''); }}>Back to sign in</IonButton>
  </div>;

  const signup = mode === 'signup';
  return <form className="onboarding kp-auth" onSubmit={e => void submit(e)} noValidate>
    {brand}
    <small>WELCOME TO KAPAMANA</small>
    <h1>{signup ? <>Create your<br />traveler account</> : <>Welcome back,<br />traveler</>}</h1>
    <p>{signup ? 'Your account keeps your coins, missions and Buddies safe, even on a new phone.' : 'Sign in to continue your adventure.'}</p>
    {!online && <p className="kp-auth-offline" role="status">You’re offline. Connect to the internet to {signup ? 'create your account' : 'sign in'}.</p>}
    {signup && <IonInput label="Traveler name" labelPlacement="stacked" maxlength={24} autocomplete="nickname" value={name} onIonInput={e => setName(e.detail.value ?? '')} />}
    <IonInput label="Email" labelPlacement="stacked" type="email" inputmode="email" autocomplete="email" value={email} onIonInput={e => setEmail(e.detail.value ?? '')} />
    <IonInput label="Password (at least 8 characters)" labelPlacement="stacked" type={showPassword ? 'text' : 'password'} autocomplete={signup ? 'new-password' : 'current-password'} value={password} onIonInput={e => setPassword(e.detail.value ?? '')} />
    {signup && <IonInput label="Confirm password" labelPlacement="stacked" type={showPassword ? 'text' : 'password'} autocomplete="new-password" value={confirm} onIonInput={e => setConfirm(e.detail.value ?? '')} />}
    <label className="kp-auth-show"><input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)} /> Show password</label>
    {error && <p className="kp-auth-error" role="alert">{error}</p>}
    <IonButton expand="block" type="submit" disabled={busy}>{busy ? <IonSpinner name="dots" /> : signup ? 'Create account →' : 'Sign in →'}</IonButton>
    <IonButton expand="block" fill="clear" onClick={() => { setMode(signup ? 'signin' : 'signup'); setError(''); }}>
      {signup ? 'I already have an account' : 'New here? Create an account'}</IonButton>
    {!signup && <IonButton expand="block" fill="clear" size="small" onClick={() => { setMode('forgot'); setError(''); }}>Forgot password?</IonButton>}
    <p className="fine">Your traveler name and progress are stored securely in your KaPamana account.</p>
  </form>;
}
