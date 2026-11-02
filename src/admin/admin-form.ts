/** Conversions between database rows and the admin dashboard's form inputs. */
import { fromRow, type ContentField, type ContentRow, type ContentTable } from './content-schema';

export type FormValues = Record<string, string | boolean>;

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO timestamp -> value for <input type="datetime-local"> in the device's local time. */
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toFormValue(field: ContentField, value: unknown): string | boolean {
  if (field.type === 'bool') return value === true;
  if (value === null || value === undefined) return '';
  switch (field.type) {
    case 'textlist': return Array.isArray(value) ? value.join('\n') : '';
    case 'json': return JSON.stringify(value, null, 2);
    case 'datetime': return isoToLocalInput(String(value));
    case 'date': return String(value).slice(0, 10);
    default: return String(value);
  }
}

export function rowToForm(table: ContentTable, row?: Record<string, unknown>): FormValues {
  const values: FormValues = {
    __id: row ? String(row.id ?? '') : '',
    __published: row ? row.is_published !== false : true,
    __sort: row?.sort_order === undefined || row?.sort_order === null ? '' : String(row.sort_order),
  };
  for (const field of table.fields) values[field.column] = toFormValue(field, row?.[field.column]);
  return values;
}

/** Form value -> column value. Throws an Error with a readable message for malformed input. */
export function fromFormValue(field: ContentField, raw: string | boolean): unknown {
  if (field.type === 'bool') return raw === true;
  const text = typeof raw === 'string' ? raw : '';
  const trimmed = text.trim();
  // Optional lists stay arrays so app code can always iterate them.
  if (!trimmed) return field.type === 'textlist' && !field.required ? [] : null;
  switch (field.type) {
    case 'int': {
      const n = Number(trimmed);
      if (!Number.isInteger(n)) throw Error(`${field.label}: enter a whole number.`);
      return n;
    }
    case 'number': {
      const n = Number(trimmed);
      if (!Number.isFinite(n)) throw Error(`${field.label}: enter a number.`);
      return n;
    }
    case 'textlist': {
      const items = text.split('\n').map(line => line.trim()).filter(Boolean);
      return items.length || !field.required ? items : null;
    }
    case 'json':
      try { return JSON.parse(trimmed); } catch { throw Error(`${field.label}: the JSON is not valid (check quotes, commas and brackets).`); }
    case 'datetime': {
      const d = new Date(trimmed);
      if (Number.isNaN(d.getTime())) throw Error(`${field.label}: enter a valid date and time.`);
      return d.toISOString();
    }
    case 'longtext': return text.trim();
    default: return trimmed;
  }
}

export const slugify = (text: string) => text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/** Builds a database row from the form. New records get an ID from the title when none was typed. */
export function formToRow(table: ContentTable, values: FormValues, isNew: boolean): ContentRow {
  const row: ContentRow = { id: '' };
  for (const field of table.fields) row[field.column] = fromFormValue(field, values[field.column]);
  row.is_published = values.__published === true;
  const sort = String(values.__sort ?? '').trim();
  if (sort) {
    const n = Number(sort);
    if (!Number.isInteger(n)) throw Error('Sort order: enter a whole number.');
    row.sort_order = n;
  }
  if (table.rowId) {
    const record = fromRow(table, row);
    if (table.fields.filter(f => f.partOfId).some(f => !row[f.column])) throw Error('Fill in every ID field.');
    row.id = table.rowId(record);
  } else {
    const typed = String(values.__id ?? '').trim();
    const titleField = table.fields.find(f => f.key === table.titleKey);
    const title = titleField ? String(row[titleField.column] ?? '') : '';
    row.id = typed || (isNew ? `${slugify(title) || table.table}-${Math.random().toString(36).slice(2, 6)}` : '');
    if (!/^[A-Za-z0-9][A-Za-z0-9_.:/-]*$/.test(row.id)) throw Error('ID: use letters, numbers, dashes or underscores only.');
  }
  return row;
}

/** Short, readable preview of a cell for the list view. */
export function previewCell(field: ContentField, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (field.type === 'bool') return value ? 'Yes' : 'No';
  if (field.type === 'datetime') return new Date(String(value)).toLocaleString();
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`;
  if (typeof value === 'object') return 'JSON';
  const text = String(value);
  return text.length > 90 ? text.slice(0, 87) + '…' : text;
}
