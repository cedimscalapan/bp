import { describe, expect, it } from 'vitest';
import { contentTables, tableByName, toRow, validateRow } from './content-schema';
import { bundledContent } from './seed-records';
import { formToRow, fromFormValue, rowToForm } from './admin-form';

const content = bundledContent();

describe('admin form conversions', () => {
  it.each(contentTables.map(t => [t.table, t] as const))('%s: editing a record without changes saves the identical row', (_name, table) => {
    for (const record of content[table.table]) {
      const row: Record<string, unknown> = { ...toRow(table, record), is_published: true, sort_order: 3 };
      const saved = formToRow(table, rowToForm(table, row), false);
      for (const field of table.fields) {
        if (field.type === 'datetime' && row[field.column]) continue; // minute precision in the form
        const expected = field.type === 'textlist' && !field.required && row[field.column] === null ? [] : row[field.column];
        expect(saved[field.column], `${row.id}.${field.column}`).toEqual(field.type === 'longtext' && expected === '' ? null : expected);
      }
      expect(saved.id).toBe(row.id);
      expect(saved.is_published).toBe(true);
      expect(saved.sort_order).toBe(3);
    }
  });

  it('creates a new announcement with a generated ID that passes validation', () => {
    const table = tableByName('announcements')!;
    const values = { ...rowToForm(table), title: 'Typhoon Advisory: Calapan', body: 'Stay safe.', category: 'advisory' };
    const row = formToRow(table, values, true);
    expect(row.id).toMatch(/^typhoon-advisory-calapan-[a-z0-9]{1,4}$/);
    expect(validateRow(table, row)).toEqual([]);
  });

  it('rejects destinations with broken runner missions', () => {
    const table = tableByName('destinations')!;
    const row = toRow(table, content.destinations[0]);
    expect(validateRow(table, { ...row, levels: [] })).toContain('Runner missions needs at least one level');
    const levels = row.levels as unknown[];
    expect(validateRow(table, { ...row, levels: [levels[0], levels[0]] })).toContain('Runner mission IDs must be unique');
    expect(validateRow(table, { ...row, adventure_group: 'Mars' })[0]).toMatch(/Adventure group/);
  });

  it('requires history answers to be among the options', () => {
    const table = tableByName('history_questions')!;
    const row = toRow(table, content.history_questions[0]);
    expect(validateRow(table, { ...row, answer: 'Not an option' })).toContain('Answer options must include the correct answer');
  });

  it('reports malformed numbers and JSON with the field name', () => {
    const table = tableByName('destinations')!;
    const levels = table.fields.find(f => f.column === 'levels')!;
    expect(() => fromFormValue(levels, '[{id:')).toThrow(/Runner missions/);
    const price = tableByName('shop_powerups')!.fields.find(f => f.column === 'price')!;
    expect(() => fromFormValue(price, '9.5')).toThrow(/whole number/);
  });
});
