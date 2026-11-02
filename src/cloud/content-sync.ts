/**
 * Offline-first content overlay for KaPamana.
 *
 * The app ships with bundled content (src/data/*.json and the shop lists in model.ts). When Supabase is
 * configured, published rows replace the bundled records *before the UI modules load* (see main.tsx),
 * so values derived at import time — such as heritage profiles merged with history questions — also
 * reflect admin-managed content.
 *
 * Launch order: apply the last cached snapshot (works offline), then try a fresh download with a short
 * timeout. A late download is cached and used on the next launch. A table is only overlaid when it
 * returns at least one valid row, so an empty or unreachable database can never blank out the app.
 */
import { contentTables, fromRow, validateRow, type ContentTableName } from '../admin/content-schema';
import catalog from '../data/catalog.json';
import heritage from '../data/heritage.json';
import runnerHistory from '../data/runner-history.json';
import investigations from '../data/investigations.json';
import culturalProfiles from '../data/cultural-profiles.json';
import researchNotes from '../data/research-notes.json';
import municipalAssets from '../data/municipal_assets.json';
import { powerups, companions } from '../model';
import { announcements } from './announcements';
import { getSupabase, isSupabaseConfigured, withTimeout } from './supabase';

export const CONTENT_CACHE_KEY = 'kapamana.contentCache.v1';
export type ContentSnapshot = { version: 1; fetchedAt: string; tables: Partial<Record<ContentTableName, Record<string, unknown>[]>> };
export type ContentStatus = { source: 'bundled' | 'cache' | 'live'; fetchedAt?: string; tables: ContentTableName[]; skippedRows: number };

export const contentStatus: ContentStatus = { source: 'bundled', tables: [], skippedRows: 0 };

type AnyRecord = Record<string, unknown>;
const replace = (target: unknown[], items: AnyRecord[]) => { target.splice(0, target.length, ...items); };

const targets: Record<ContentTableName, unknown[]> = {
  announcements,
  destinations: catalog,
  heritage_profiles: heritage.profiles,
  history_questions: runnerHistory,
  investigations,
  cultural_profiles: culturalProfiles,
  research_notes: researchNotes,
  municipal_guides: municipalAssets,
  sources: heritage.sources,
  shop_powerups: powerups,
  shop_companions: companions,
};

/** Applies a snapshot to the in-memory content. Returns the tables that were overlaid. */
export function applyContentSnapshot(snapshot: ContentSnapshot): { tables: ContentTableName[]; skippedRows: number } {
  const applied: ContentTableName[] = [];
  let skippedRows = 0;
  for (const table of contentTables) {
    const rows = snapshot.tables[table.table];
    if (!Array.isArray(rows)) continue;
    const valid = rows.filter(row => {
      const problems = validateRow(table, row);
      if (problems.length) { skippedRows++; console.warn(`Skipping ${table.table}/${String(row.id)}: ${problems.join('; ')}`); }
      return problems.length === 0;
    });
    if (!valid.length) continue;
    replace(targets[table.table], valid.map(row => fromRow(table, row)));
    applied.push(table.table);
  }
  return { tables: applied, skippedRows };
}

export function readCachedSnapshot(storage: Pick<Storage, 'getItem'> = localStorage): ContentSnapshot | undefined {
  try {
    const parsed = JSON.parse(storage.getItem(CONTENT_CACHE_KEY) ?? 'null') as ContentSnapshot | null;
    return parsed && parsed.version === 1 && parsed.tables && typeof parsed.tables === 'object' ? parsed : undefined;
  } catch { return undefined; }
}

function writeCachedSnapshot(snapshot: ContentSnapshot) {
  try { localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(snapshot)); }
  catch (error) { console.warn('Content cache could not be saved.', error); }
}

const PAGE = 1000;

/** Downloads all published rows of every content table. Tables that fail are left out. */
export async function fetchContentSnapshot(): Promise<ContentSnapshot | undefined> {
  const supabase = getSupabase();
  if (!supabase) return undefined;
  const tables: ContentSnapshot['tables'] = {};
  await Promise.all(contentTables.map(async table => {
    const rows: AnyRecord[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase.from(table.table).select('*')
        .eq('is_published', true).order('sort_order').order('id').range(from, from + PAGE - 1);
      if (error) { console.warn(`Supabase ${table.table}: ${error.message}`); return; }
      rows.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
    }
    tables[table.table] = rows;
  }));
  return Object.keys(tables).length ? { version: 1, fetchedAt: new Date().toISOString(), tables } : undefined;
}

function record(source: ContentStatus['source'], result: { tables: ContentTableName[]; skippedRows: number }, fetchedAt?: string) {
  if (!result.tables.length) return;
  Object.assign(contentStatus, { source, fetchedAt, tables: result.tables, skippedRows: result.skippedRows });
}

/** Called once from main.tsx before the UI is imported. Never throws. */
export async function prepareContent(timeoutMs = 2500): Promise<void> {
  try {
    const cached = readCachedSnapshot();
    if (cached) record('cache', applyContentSnapshot(cached), cached.fetchedAt);
    if (!isSupabaseConfigured || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
    const download = fetchContentSnapshot().then(snapshot => { if (snapshot) writeCachedSnapshot(snapshot); return snapshot; })
      .catch(error => { console.warn('Content download failed; offline content in use.', error); return undefined; });
    const fresh = await withTimeout(download, timeoutMs);
    if (fresh && fresh !== 'timeout') record('live', applyContentSnapshot(fresh), fresh.fetchedAt);
  } catch (error) {
    console.warn('Content preparation failed; bundled content in use.', error);
  }
}
