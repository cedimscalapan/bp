import { describe, expect, it } from 'vitest';
import catalog from '../data/catalog.json';
import { blankLike, duplicateItem, humanize, itemTitle, kindOf, move, newItemFor } from './json-edit';

describe('structured JSON editor helpers', () => {
  it('detects the kind of each value', () => {
    expect([kindOf('a'), kindOf(1), kindOf(true), kindOf(null), kindOf(['a']), kindOf([{ a: 1 }]), kindOf([]), kindOf({})])
      .toEqual(['string', 'number', 'boolean', 'null', 'stringList', 'list', 'list', 'object']);
  });

  it('creates a blank item with the same shape, including nested objects', () => {
    expect(blankLike({ id: 'x', number: 3, mission: { type: 'collect', target: 10 }, tags: ['a'], ok: true }))
      .toEqual({ id: '', number: 0, mission: { type: '', target: 0 }, tags: [], ok: false });
  });

  it('duplicates a runner mission with a unique id and the next number', () => {
    const levels = catalog[0].levels as unknown[];
    const copy = duplicateItem(levels[levels.length - 1], levels) as Record<string, unknown>;
    const last = levels[levels.length - 1] as Record<string, unknown>;
    expect(copy.id).toBe(`${last.id}-copy`);
    expect(copy.number).toBe(levels.length + 1);
    expect(copy.title).toBe(last.title);
    expect(new Set([...levels.map(l => (l as Record<string, unknown>).id), copy.id]).size).toBe(levels.length + 1);
  });

  it('numbers new blank items after the last one', () => {
    const item = newItemFor([{ id: 'a', number: 1, title: 'A' }, { id: 'b', number: 2, title: 'B' }]) as Record<string, unknown>;
    expect(item).toEqual({ id: '', number: 3, title: '' });
    expect(newItemFor([])).toBe('');
  });

  it('moves items and ignores moves past the ends', () => {
    expect(move(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(move(['a', 'b', 'c'], 2, 3)).toEqual(['a', 'b', 'c']);
  });

  it('makes readable labels and item titles', () => {
    expect(humanize('signatureItemName')).toBe('Signature item name');
    expect(humanize('source_ids')).toBe('Source ids');
    expect(humanize('sourceIDs')).toBe('Source ids');
    expect(itemTitle({ number: 4, title: 'Harbor run' }, 3)).toBe('4. Harbor run');
    expect(itemTitle({ x: 1 }, 1)).toBe('Item 2');
  });
});
