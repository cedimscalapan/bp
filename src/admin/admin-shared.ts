import type { ContentTableName } from './content-schema';
import { getSupabase } from '../cloud/supabase';

export type Row = Record<string, unknown> & { id: string; is_published: boolean; sort_order: number; updated_at: string };
export type View = 'home' | 'users' | 'players' | 'activity' | ContentTableName;
export type Overview = Record<string, { total: number; published: number } | number>;

/** Content tables grouped by purpose for the dashboard menu and home screen. */
export const contentGroups: readonly { label: string; tables: readonly ContentTableName[] }[] = [
  { label: 'News', tables: ['announcements'] },
  { label: 'Places & missions', tables: ['destinations', 'heritage_profiles', 'municipal_guides'] },
  { label: 'Learning', tables: ['history_questions', 'investigations', 'cultural_profiles', 'research_notes'] },
  { label: 'Shop', tables: ['shop_powerups', 'shop_companions'] },
  { label: 'References', tables: ['sources'] },
];

export const errorText = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: unknown }).message);
    if (/row-level security|permission denied|42501/i.test(message)) return 'You do not have permission for this action.';
    if (/duplicate key/i.test(message)) return 'A record with this ID already exists. Choose another ID.';
    return message;
  }
  return 'Something went wrong. Please try again.';
};

export async function fetchAll(table: string): Promise<Row[]> {
  const supabase = getSupabase()!;
  const rows: Row[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select('*').order('sort_order').order('id').range(from, from + 999);
    if (error) throw error;
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < 1000) return rows;
  }
}

export const timeAgo = (iso: string, now = Date.now()) => {
  const minutes = Math.round((now - Date.parse(iso)) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 30 ? `${days} d ago` : new Date(iso).toLocaleDateString();
};
