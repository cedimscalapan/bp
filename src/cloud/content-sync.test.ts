import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyContentSnapshot, readCachedSnapshot, CONTENT_CACHE_KEY, type ContentSnapshot } from './content-sync';
import { contentTables, tableByName, toRow } from '../admin/content-schema';
import { bundledContent } from '../admin/seed-records';
import catalog from '../data/catalog.json';
import heritage from '../data/heritage.json';
import { powerups } from '../model';
import { announcements, activeAnnouncements, type Announcement } from './announcements';

const rowsFor = (name: string) => {
  const table = tableByName(name)!;
  return bundledContent()[table.table].map((record, index): Record<string, any> => ({ ...toRow(table, record), sort_order: index, is_published: true }));
};

beforeEach(() => { vi.spyOn(console, 'warn').mockImplementation(() => undefined); });

describe('content overlay', () => {
  it('re-applying the seeded snapshot changes nothing but missing booleans', () => {
    const snapshot: ContentSnapshot = { version: 1, fetchedAt: 'x', tables: Object.fromEntries(contentTables.map(t => [t.table, rowsFor(t.table)])) };
    const result = applyContentSnapshot(snapshot);
    expect(result.skippedRows).toBe(0);
    expect(result.tables).toHaveLength(contentTables.length);
    expect(catalog).toHaveLength(87);
    expect(heritage.profiles).toHaveLength(15);
  });

  it('applies admin edits to destinations, prices and sources in place', () => {
    const destinations = rowsFor('destinations');
    destinations[0] = { ...destinations[0], name: 'Calapan City (updated)' };
    const prices = rowsFor('shop_powerups').map(row => row.id === 'forcefield' ? { ...row, price: 180 } : row);
    applyContentSnapshot({ version: 1, fetchedAt: 'x', tables: { destinations, shop_powerups: prices, sources: rowsFor('sources').slice(0, 3) } });
    expect(catalog[0].name).toBe('Calapan City (updated)');
    expect(powerups.find(p => p.id === 'forcefield')?.price).toBe(180);
    expect(heritage.sources).toHaveLength(3);
  });

  it('never blanks a table: empty or entirely invalid tables keep current content', () => {
    const before = catalog.length;
    const broken = { ...rowsFor('destinations')[0], levels: [] };
    const result = applyContentSnapshot({ version: 1, fetchedAt: 'x', tables: { destinations: [broken], sources: [] } });
    expect(catalog).toHaveLength(before);
    expect(result.tables).toEqual([]);
    expect(result.skippedRows).toBe(1);
  });

  it('reads only well-formed cached snapshots', () => {
    const store = (value: string | null) => ({ getItem: (key: string) => (key === CONTENT_CACHE_KEY ? value : null) });
    expect(readCachedSnapshot(store(null))).toBeUndefined();
    expect(readCachedSnapshot(store('{oops'))).toBeUndefined();
    expect(readCachedSnapshot(store('{"version":2,"tables":{}}'))).toBeUndefined();
    expect(readCachedSnapshot(store('{"version":1,"fetchedAt":"t","tables":{}}'))?.fetchedAt).toBe('t');
  });
});

describe('announcements', () => {
  const make = (id: string, extra: Partial<Announcement> = {}): Announcement => ({ id, title: id, body: 'b', category: 'news', ...extra });
  it('shows current announcements with pinned ones first', () => {
    const list = [make('a'), make('future', { startsAt: '2026-12-01T00:00:00Z' }), make('expired', { endsAt: '2026-11-01T00:00:00Z' }), make('pinned', { pinned: true })];
    expect(activeAnnouncements(list, new Date('2026-11-02T08:00:00Z')).map(a => a.id)).toEqual(['pinned', 'a']);
  });
  it('are filled from the announcements table', () => {
    applyContentSnapshot({ version: 1, fetchedAt: 'x', tables: { announcements: rowsFor('announcements') } });
    expect(announcements.map(a => a.id)).toEqual(['welcome-kapamana-online']);
  });
});
