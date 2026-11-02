/** Pure helpers for the structured (form-based) JSON editor in the admin dashboard. */

export type JsonKind = 'string' | 'number' | 'boolean' | 'null' | 'stringList' | 'list' | 'object';

export function kindOf(value: unknown): JsonKind {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return value.length > 0 && value.every(v => typeof v === 'string') ? 'stringList' : 'list';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'string';
}

/** An empty value with the same shape as `sample` (used for "Add item"). */
export function blankLike(sample: unknown): unknown {
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === 'object') {
    return Object.fromEntries(Object.entries(sample as Record<string, unknown>).map(([k, v]) => [k, blankLike(v)]));
  }
  if (typeof sample === 'number') return 0;
  if (typeof sample === 'boolean') return false;
  if (typeof sample === 'string') return '';
  return null;
}

/** A copy of `item` with a unique-looking id and the next number, for "Duplicate". */
export function duplicateItem(item: unknown, siblings: readonly unknown[]): unknown {
  const copy = JSON.parse(JSON.stringify(item ?? null)) as unknown;
  if (copy && typeof copy === 'object' && !Array.isArray(copy)) {
    const obj = copy as Record<string, unknown>;
    if (typeof obj.id === 'string') {
      const ids = new Set(siblings.map(s => (s && typeof s === 'object' ? (s as Record<string, unknown>).id : undefined)));
      let n = 2; let id = `${obj.id}-copy`;
      while (ids.has(id)) id = `${obj.id}-copy${n++}`;
      obj.id = id;
    }
    if (typeof obj.number === 'number') {
      obj.number = Math.max(0, ...siblings.map(s => (s && typeof s === 'object' && typeof (s as Record<string, unknown>).number === 'number' ? (s as Record<string, number>).number : 0))) + 1;
    }
  }
  return copy;
}

/** A new item for a list: shaped like the last item, with the next number when items are numbered. */
export function newItemFor(list: readonly unknown[]): unknown {
  if (!list.length) return '';
  const blank = blankLike(list[list.length - 1]);
  if (blank && typeof blank === 'object' && !Array.isArray(blank) && 'number' in (blank as object)) {
    (blank as Record<string, unknown>).number = (duplicateItem(list[list.length - 1], list) as Record<string, unknown>).number;
  }
  return blank;
}

export function move<T>(list: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** "signatureItemName" → "Signature item name", "source_ids" → "Source ids". */
export function humanize(key: string): string {
  const words = key.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/\bI Ds?\b/g, m => m.replace(' ', '')).trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Short title for a list item card: first useful text field, else its position. */
export function itemTitle(item: unknown, index: number): string {
  if (typeof item === 'string') return item.slice(0, 60) || `Item ${index + 1}`;
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const obj = item as Record<string, unknown>;
    for (const key of ['title', 'name', 'label', 'heading', 'prompt', 'question', 'left', 'id']) {
      if (typeof obj[key] === 'string' && obj[key]) {
        const prefix = typeof obj.number === 'number' ? `${obj.number}. ` : '';
        return prefix + String(obj[key]).slice(0, 70);
      }
    }
  }
  return `Item ${index + 1}`;
}
