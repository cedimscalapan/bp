/**
 * Optional cloud backup of the KaPamana save (Supabase table `player_saves`, one row per account).
 *
 * - First sign-in on a device: if the account has no cloud save, this device's save is uploaded.
 *   If both exist and this device has real progress, the player chooses which one to keep.
 * - While linked, every stored save is uploaded shortly after (debounced). Offline changes are
 *   marked "dirty" and uploaded on the next launch.
 * - On launch, a newer cloud save (another device, or an admin adjustment) replaces the local one
 *   unless this device has unsynced changes.
 * Downloaded saves always pass the app's own `parseSave` validation.
 */
import { parseSave, type Save } from '../model';
import { loadSave, onSaveStored, storeSave } from '../storage';
import { getSupabase, isSupabaseConfigured, withTimeout } from './supabase';

const META_KEY = 'kapamana.cloudSave.v1';
type Meta = { userId: string; syncedAt?: string; dirty: boolean };
type CloudRow = { save: unknown; updated_at: string };

const readMeta = (): Meta | undefined => {
  try {
    const meta = JSON.parse(localStorage.getItem(META_KEY) ?? 'null') as Meta | null;
    return meta && typeof meta.userId === 'string' ? meta : undefined;
  } catch { return undefined; }
};
const writeMeta = (meta: Meta | undefined) => { if (meta) localStorage.setItem(META_KEY, JSON.stringify(meta)); else localStorage.removeItem(META_KEY); };

let suppress = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let latest: Save | undefined;
let listening = false;
let changeNumber = 0;
let uploadQueue: Promise<void> = Promise.resolve();

export const isLinked = () => Boolean(readMeta());

async function sessionUserId(): Promise<string | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id;
}

async function fetchCloud(userId: string): Promise<CloudRow | undefined> {
  const { data, error } = await getSupabase()!.from('player_saves').select('save,updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data as CloudRow | null) ?? undefined;
}

/** Uploads a save for the signed-in, linked account. */
export async function uploadSave(save: Save): Promise<void> {
  const task = uploadQueue.catch(() => undefined).then(async () => {
    const generation = changeNumber;
    const userId = await sessionUserId();
    const meta = readMeta();
    if (!userId || !meta || meta.userId !== userId) return;
    const { data, error } = await getSupabase()!.from('player_saves')
      .upsert({ user_id: userId, save }).select('updated_at').single();
    if (error) { writeMeta({ ...meta, dirty: true }); throw error; }
    if (readMeta()?.userId === userId) writeMeta({ userId, dirty: changeNumber !== generation || (latest !== undefined && latest !== save), syncedAt: (data as { updated_at: string }).updated_at });
  });
  uploadQueue = task.catch(() => undefined);
  return task;
}

/** Starts uploading stored saves while linked. Safe to call more than once. */
export function startSaveSync(): void {
  if (!isSupabaseConfigured || listening) return;
  listening = true;
  onSaveStored(save => {
    if (suppress) return;
    const meta = readMeta();
    if (!meta) return;
    changeNumber++;
    latest = save;
    if (!meta.dirty) writeMeta({ ...meta, dirty: true });
    clearTimeout(timer);
    timer = setTimeout(() => { if (latest) void uploadSave(latest).catch(error => console.warn('Cloud save upload postponed.', error)); }, 2000);
  });
  const retry = () => { if (readMeta()?.dirty && navigator.onLine !== false) void loadSave().then(uploadSave).catch(error => console.warn('Cloud save upload postponed.', error)); };
  window.addEventListener('online', retry);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) retry(); });
}

/** Stores a save locally without queueing it for upload (it came from the cloud). */
async function storeFromCloud(save: Save) {
  suppress = true;
  try { await storeSave(save); } finally { suppress = false; }
}

const hasProgress = (s: Save) => s.xp > 0 || s.coins > 0 || Object.keys(s.completed).length > 0
  || s.learning.drawings.length > 0 || s.learning.attempts > 0 || s.learning.bookmarks.length > 0
  || s.discoveries.length > 0 || s.recaps.length > 0 || s.careBadges.length > 0
  || s.ownedCompanions.length > 0 || Object.keys(s.powerups).length > 0 || Object.keys(s.upgrades).length > 0;
export const saveSummary = (s: Save) => `${s.name} · Level ${1 + Math.floor(s.xp / 500)} · ${s.coins.toLocaleString()} coins`;

export type LinkResult =
  | { kind: 'uploaded' }
  | { kind: 'restored'; save: Save }
  | { kind: 'conflict'; cloud: Save; local: Save };

/** Call right after signing in. Links this device to the account. */
export async function linkAccount(local: Save): Promise<LinkResult> {
  const userId = await sessionUserId();
  if (!userId) throw Error('Please sign in first.');
  latest = undefined;
  const row = await fetchCloud(userId);
  writeMeta({ userId, dirty: false });
  if (!row) { await uploadSave(local); return { kind: 'uploaded' }; }
  const cloud = parseSave(JSON.stringify(row.save));
  if (!hasProgress(local)) {
    await storeFromCloud(cloud);
    writeMeta({ userId, dirty: false, syncedAt: row.updated_at });
    return { kind: 'restored', save: cloud };
  }
  return { kind: 'conflict', cloud, local };
}

/** Resolves a sign-in conflict by keeping the cloud save or this device's save. */
export async function resolveConflict(choice: 'cloud' | 'device', result: Extract<LinkResult, { kind: 'conflict' }>): Promise<Save> {
  const userId = await sessionUserId();
  if (!userId) throw Error('Please sign in first.');
  if (choice === 'device') { await uploadSave(result.local); return result.local; }
  await storeFromCloud(result.cloud);
  const row = await fetchCloud(userId);
  writeMeta({ userId, dirty: false, syncedAt: row?.updated_at });
  return result.cloud;
}

/** Launch-time sync, before the app reads its save. Never throws. */
export async function syncSaveOnLaunch(timeoutMs = 2500): Promise<void> {
  if (!isSupabaseConfigured) return;
  startSaveSync();
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  const task = (async () => {
    const meta = readMeta();
    const userId = await sessionUserId();
    if (!meta || !userId || meta.userId !== userId) return;
    if (meta.dirty) { await uploadSave(await loadSave()); return; }
    const row = await fetchCloud(userId);
    if (row && (!meta.syncedAt || row.updated_at > meta.syncedAt)) {
      await storeFromCloud(parseSave(JSON.stringify(row.save)));
      writeMeta({ userId, dirty: false, syncedAt: row.updated_at });
    }
  })().catch(error => console.warn('Cloud save sync skipped.', error));
  await withTimeout(task, timeoutMs);
}

/** Uploads pending changes, unlinks this device and signs out. Local progress is kept. */
export async function signOutCloud(current?: Save): Promise<void> {
  clearTimeout(timer);
  if (current && readMeta()?.dirty) { try { await uploadSave(current); } catch { /* keep local progress */ } }
  writeMeta(undefined);
  latest = undefined;
  await getSupabase()?.auth.signOut();
}

/** Deletes this account's cloud save, then signs out. Local progress is kept. */
export async function deleteCloudSave(): Promise<void> {
  const userId = await sessionUserId();
  if (!userId) return;
  const { error } = await getSupabase()!.from('player_saves').delete().eq('user_id', userId);
  if (error) throw error;
  writeMeta(undefined);
  latest = undefined;
  await getSupabase()!.auth.signOut();
}
