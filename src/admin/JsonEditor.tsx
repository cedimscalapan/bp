import { useState } from 'react';
import { duplicateItem, humanize, itemTitle, kindOf, move, newItemFor } from './json-edit';

type Change = (value: unknown) => void;

/**
 * Form-based editor for a JSON column (runner missions, tasks, journal sections…).
 * `text` is the JSON string kept by the record form; "JSON" mode edits it directly for advanced changes.
 */
export default function JsonEditor({ label, text, onText }: { label: string; text: string; onText: (text: string) => void }) {
  const parsed = parse(text);
  const [mode, setMode] = useState<'form' | 'json'>(parsed.ok ? 'form' : 'json');
  const formAvailable = parsed.ok;
  return <div className="adm-json">
    <div className="adm-json-tabs" role="tablist" aria-label={`${label} editor mode`}>
      <button type="button" role="tab" aria-selected={mode === 'form'} className={mode === 'form' ? 'is-active' : ''} disabled={!formAvailable}
        onClick={() => setMode('form')} title={formAvailable ? '' : 'Fix the JSON first'}>Form</button>
      <button type="button" role="tab" aria-selected={mode === 'json'} className={mode === 'json' ? 'is-active' : ''} onClick={() => setMode('json')}>JSON</button>
    </div>
    {mode === 'form' && parsed.ok
      ? <Node value={parsed.value} label={label} root onChange={v => onText(JSON.stringify(v, null, 2))} />
      : <textarea rows={10} className="adm-code" spellCheck={false} aria-label={`${label} (JSON)`} value={text} onChange={e => onText(e.target.value)} />}
    {mode === 'json' && !parsed.ok && text.trim() && <small className="adm-json-warn">The JSON is not valid yet, so the form view is unavailable.</small>}
  </div>;
}

const parse = (text: string): { ok: true; value: unknown } | { ok: false } => {
  if (!text.trim()) return { ok: true, value: [] };
  try { return { ok: true, value: JSON.parse(text) }; } catch { return { ok: false }; }
};

function Node({ value, label, onChange, root }: { value: unknown; label: string; onChange: Change; root?: boolean }) {
  switch (kindOf(value)) {
    case 'object': {
      const obj = value as Record<string, unknown>;
      return <div className={root ? 'adm-json-object is-root' : 'adm-json-object'}>
        {Object.entries(obj).map(([key, child]) => {
          const childKind = kindOf(child);
          const nested = childKind === 'object' || childKind === 'list';
          const update = (next: unknown) => onChange({ ...obj, [key]: next });
          return nested
            ? <fieldset key={key} className="adm-json-group"><legend>{humanize(key)}</legend><Node value={child} label={humanize(key)} onChange={update} /></fieldset>
            : <label key={key} className="adm-json-field"><span>{humanize(key)}</span><Node value={child} label={humanize(key)} onChange={update} /></label>;
        })}
      </div>;
    }
    case 'list': return <ListNode list={value as unknown[]} label={label} onChange={onChange} />;
    case 'stringList':
      return <textarea rows={Math.min(8, (value as string[]).length + 1)} aria-label={label} placeholder="One item per line"
        value={(value as string[]).join('\n')} onChange={e => onChange(e.target.value.split('\n'))}
        onBlur={e => onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />;
    case 'number':
      return <input type="number" step="any" aria-label={label} value={String(value)} onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))} />;
    case 'boolean':
      return <input type="checkbox" aria-label={label} checked={value === true} onChange={e => onChange(e.target.checked)} />;
    case 'null':
      return <input aria-label={label} placeholder="(empty)" value="" onChange={e => onChange(e.target.value)} />;
    default: {
      const text = String(value);
      return text.length > 70 || text.includes('\n')
        ? <textarea rows={3} aria-label={label} value={text} onChange={e => onChange(e.target.value)} />
        : <input aria-label={label} value={text} onChange={e => onChange(e.target.value)} />;
    }
  }
}

function ListNode({ list, label, onChange }: { list: unknown[]; label: string; onChange: Change }) {
  const [open, setOpen] = useState<number | null>(null);
  const set = (index: number, item: unknown) => onChange(list.map((x, i) => (i === index ? item : x)));
  const add = () => { onChange([...list, newItemFor(list)]); setOpen(list.length); };
  return <div className="adm-json-list">
    {list.map((item, index) => <details key={index} className="adm-json-item" open={open === index}
      onToggle={e => { const isOpen = (e.currentTarget as HTMLDetailsElement).open; if (isOpen) setOpen(index); else if (open === index) setOpen(null); }}>
      <summary><span className="adm-json-title">{itemTitle(item, index)}</span>
        <span className="adm-json-actions" onClick={e => e.preventDefault()}>
          <button type="button" aria-label={`Move ${itemTitle(item, index)} up`} disabled={index === 0} onClick={() => onChange(move(list, index, index - 1))}>↑</button>
          <button type="button" aria-label={`Move ${itemTitle(item, index)} down`} disabled={index === list.length - 1} onClick={() => onChange(move(list, index, index + 1))}>↓</button>
          <button type="button" aria-label={`Duplicate ${itemTitle(item, index)}`} onClick={() => { onChange([...list.slice(0, index + 1), duplicateItem(item, list), ...list.slice(index + 1)]); setOpen(index + 1); }}>Duplicate</button>
          <button type="button" className="is-danger" aria-label={`Remove ${itemTitle(item, index)}`} onClick={() => { if (window.confirm(`Remove “${itemTitle(item, index)}”?`)) onChange(list.filter((_, i) => i !== index)); }}>Remove</button>
        </span>
      </summary>
      {open === index && <div className="adm-json-body"><Node value={item} label={`${label} ${index + 1}`} onChange={next => set(index, next)} /></div>}
    </details>)}
    {!list.length && <p className="adm-muted">No items yet.</p>}
    <button type="button" className="adm-btn adm-json-add" onClick={add}>+ Add {list.length ? 'item' : 'first item'}</button>
  </div>;
}
