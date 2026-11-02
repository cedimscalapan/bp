import { describe, expect, it } from 'vitest';
import { contentTables, fromRow, toRow, validateRow } from './content-schema';
import { bundledContent } from './seed-records';

const content = bundledContent();
const normalize = (value: unknown, table: (typeof contentTables)[number]) => {
  const copy = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  for (const field of table.fields) if (field.type === 'bool' && copy[field.key] === undefined) copy[field.key] = false;
  return copy;
};

describe('Supabase content schema', () => {
  it.each(contentTables.map(t => [t.table, t] as const))('%s: every bundled record is valid and round-trips exactly', (_name, table) => {
    const records = content[table.table];
    expect(records.length).toBeGreaterThan(0);
    const rows = records.map(record => toRow(table, record));
    const ids = rows.map(row => row.id);
    expect(new Set(ids).size, 'duplicate primary keys').toBe(ids.length);
    for (const row of rows) expect(validateRow(table, row), row.id).toEqual([]);
    const restored = rows.map(row => fromRow(table, JSON.parse(JSON.stringify(row))));
    expect(restored).toEqual(records.map(r => normalize(r, table)));
  });

  it('maps every property of the bundled data (nothing silently dropped)', () => {
    for (const table of contentTables) {
      if (table.table === 'announcements') continue;
      const mapped = new Set([table.idKey ?? 'id', ...table.fields.map(f => f.key.split('.')[0])]);
      const seen = new Set(content[table.table].flatMap(r => Object.keys(r)));
      expect([...seen].filter(k => !mapped.has(k)), table.table).toEqual([]);
    }
  });
});
