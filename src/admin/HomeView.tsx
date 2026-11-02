import { useEffect, useState } from 'react';
import { contentTables, tableByName, validateRow, type ContentTableName } from './content-schema';
import { contentGroups, errorText, fetchAll, timeAgo, type Overview, type Row, type View } from './admin-shared';
import { getSupabase, type Profile } from '../cloud/supabase';

type Attention = { tone: 'problem' | 'draft' | 'schedule'; table: ContentTableName; id: string; title: string; detail: string };
type Audit = { id: number; table_name: string; record_id: string; action: string; changed_by_email: string | null; changed_at: string };
type Person = { id: string; email: string | null; display_name: string | null; role: string; created_at: string };
type Traveler = { traveler_name: string | null; xp: number | null; coins: number | null; updated_at: string };

const titleOf = (table: ContentTableName, row: Row) => {
  const t = tableByName(table)!;
  const column = t.fields.find(f => f.key === t.titleKey)?.column ?? 'id';
  return String(row[column] ?? row.id).slice(0, 80);
};

/** Home screen. Editors see content work; admins additionally see people and players. */
export default function HomeView({ profile, onOpen, onOpenRecord }: {
  profile: Profile; onOpen: (view: View) => void; onOpenRecord: (table: ContentTableName, id: string) => void;
}) {
  const isAdmin = profile.role === 'admin';
  const [overview, setOverview] = useState<Overview>();
  const [attention, setAttention] = useState<Attention[]>();
  const [recent, setRecent] = useState<Audit[]>();
  const [people, setPeople] = useState<Person[]>();
  const [travelers, setTravelers] = useState<Traveler[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = getSupabase()!;
    supabase.rpc('admin_overview').then(({ data, error: e }) => { if (e) setError(errorText(e)); else setOverview(data as Overview); });
    supabase.from('content_audit_log').select('id,table_name,record_id,action,changed_by_email,changed_at')
      .not('changed_by_email', 'is', null).order('changed_at', { ascending: false }).limit(8)
      .then(({ data }) => setRecent((data ?? []) as Audit[]));
    // Scan every table for problems the app would skip, drafts and scheduled/expired news.
    Promise.all(contentTables.map(async t => ({ t, rows: await fetchAll(t.table) }))).then(results => {
      const items: Attention[] = [];
      const now = Date.now();
      for (const { t, rows } of results) {
        for (const row of rows) {
          const problems = validateRow(t, row);
          if (problems.length) items.push({ tone: 'problem', table: t.table, id: row.id, title: titleOf(t.table, row), detail: `${t.label}: ${problems[0]}${problems.length > 1 ? ` (+${problems.length - 1} more)` : ''}` });
          else if (!row.is_published) items.push({ tone: 'draft', table: t.table, id: row.id, title: titleOf(t.table, row), detail: `${t.label}: draft, hidden from travelers` });
          if (t.table === 'announcements' && row.is_published) {
            if (row.starts_at && Date.parse(String(row.starts_at)) > now) items.push({ tone: 'schedule', table: t.table, id: row.id, title: titleOf(t.table, row), detail: `Scheduled: shows from ${new Date(String(row.starts_at)).toLocaleString()}` });
            if (row.ends_at && Date.parse(String(row.ends_at)) <= now) items.push({ tone: 'schedule', table: t.table, id: row.id, title: titleOf(t.table, row), detail: 'Expired: no longer shown. Edit or delete it.' });
          }
        }
      }
      const order = { problem: 0, draft: 1, schedule: 2 } as const;
      setAttention(items.sort((a, b) => order[a.tone] - order[b.tone]));
    }).catch(e => setError(errorText(e)));
    if (isAdmin) {
      supabase.from('profiles').select('id,email,display_name,role,created_at').order('created_at', { ascending: false })
        .then(({ data }) => setPeople((data ?? []) as Person[]));
      supabase.from('player_saves').select('traveler_name,xp,coins,updated_at').order('xp', { ascending: false }).limit(5)
        .then(({ data }) => setTravelers((data ?? []) as Traveler[]));
    }
  }, [isAdmin]);

  const counts = (t: ContentTableName) => overview?.[t] as { total: number; published: number } | undefined;
  const stat = (key: string) => (typeof overview?.[key] === 'number' ? overview[key] as number : undefined);
  const published = overview ? contentTables.reduce((sum, t) => sum + (counts(t.table)?.published ?? 0), 0) : undefined;
  const drafts = overview ? contentTables.reduce((sum, t) => sum + ((counts(t.table)?.total ?? 0) - (counts(t.table)?.published ?? 0)), 0) : undefined;
  const problems = attention?.filter(a => a.tone === 'problem').length;
  const weekAgo = Date.now() - 7 * 86400000;
  const newPeople = people?.filter(p => Date.parse(p.created_at) > weekAgo).length;
  const name = profile.display_name || profile.email?.split('@')[0] || 'there';

  return <>
    <header className="adm-head adm-home-head">
      <div>
        <span className={`adm-role is-${profile.role}`}>{isAdmin ? 'Admin dashboard' : 'Editor dashboard'}</span>
        <h1>Magandang araw, {name}!</h1>
        <p>{isAdmin
          ? 'Manage KaPamana content, travelers, roles and backups. Published changes reach phones the next time the app opens online.'
          : 'Create and update KaPamana content. Published changes reach phones the next time the app opens online.'}</p>
      </div>
    </header>
    {error && <p className="adm-error" role="alert">{error}</p>}

    <section className="adm-quick" aria-label="Quick actions">
      <button className="adm-btn is-primary" onClick={() => onOpenRecord('announcements', '')}>+ Post news</button>
      <button className="adm-btn" onClick={() => onOpen('destinations')}>Edit places & missions</button>
      <button className="adm-btn" onClick={() => onOpen('history_questions')}>Edit quiz questions</button>
      <button className="adm-btn" onClick={() => onOpen('shop_powerups')}>Shop prices</button>
      {isAdmin && <button className="adm-btn" onClick={() => onOpen('players')}>Players</button>}
      {isAdmin && <button className="adm-btn" onClick={() => onOpen('users')}>Users & roles</button>}
    </section>

    <div className="adm-stats">
      <div className="adm-stat"><strong>{published ?? '…'}</strong><span>Published records</span></div>
      <div className="adm-stat"><strong>{drafts ?? '…'}</strong><span>Drafts</span></div>
      <div className={`adm-stat${problems ? ' is-warn' : ''}`}><strong>{problems ?? '…'}</strong><span>Records with problems</span></div>
      <div className="adm-stat"><strong>{stat('changes_7d') ?? '…'}</strong><span>Changes this week</span></div>
      {isAdmin && <div className="adm-stat"><strong>{stat('users') ?? '…'}</strong><span>Accounts{newPeople ? ` · ${newPeople} new this week` : ''}</span></div>}
      {isAdmin && <div className="adm-stat"><strong>{stat('cloud_saves') ?? '…'}</strong><span>Cloud backups</span></div>}
    </div>

    <div className="adm-home-grid">
      <section className="adm-card" aria-labelledby="adm-attention">
        <h2 id="adm-attention">Needs attention</h2>
        {!attention ? <p className="adm-muted">Checking every record…</p> : !attention.length
          ? <p className="adm-good">✓ Everything is published and valid.</p>
          : <ul className="adm-list">{attention.slice(0, 12).map(a => <li key={`${a.tone}-${a.table}-${a.id}`}>
            <span className={`adm-dot is-${a.tone}`} aria-hidden="true" />
            <div><button className="adm-link" onClick={() => onOpenRecord(a.table, a.id)}>{a.title}</button><small>{a.detail}</small></div>
          </li>)}{attention.length > 12 && <li className="adm-muted">…and {attention.length - 12} more. Use the “Drafts” or “Has problems” filters in each table.</li>}</ul>}
        <p className="adm-muted adm-hint">Records with problems are skipped by the app (the built-in version is used instead) until fixed.</p>
      </section>

      <section className="adm-card" aria-labelledby="adm-recent">
        <h2 id="adm-recent">Recent changes</h2>
        {!recent ? <p className="adm-muted">Loading…</p> : !recent.length ? <p className="adm-muted">No edits yet. Your first change will appear here.</p>
          : <ul className="adm-list">{recent.map(r => <li key={r.id}>
            <span className={`adm-pill is-${r.action.toLowerCase()}`}>{r.action === 'INSERT' ? 'Added' : r.action === 'UPDATE' ? 'Edited' : 'Deleted'}</span>
            <div><span>{tableByName(r.table_name)?.label ?? (r.table_name === 'player_saves' ? 'Player save' : r.table_name === 'auth_users' ? 'Password' : r.table_name)} · <code>{r.record_id.slice(0, 40)}</code></span>
              <small>{r.changed_by_email} · {timeAgo(r.changed_at)}</small></div>
          </li>)}</ul>}
        <button className="adm-link" onClick={() => onOpen('activity')}>Open activity log →</button>
      </section>

      {isAdmin && <section className="adm-card" aria-labelledby="adm-people">
        <h2 id="adm-people">People</h2>
        {!people ? <p className="adm-muted">Loading…</p> : <>
          <p className="adm-muted">{people.length} accounts · {people.filter(p => p.role === 'admin').length} admin · {people.filter(p => p.role === 'editor').length} editor</p>
          <ul className="adm-list">{people.slice(0, 5).map(p => <li key={p.id}><span className={`adm-role is-${p.role}`}>{p.role === 'learner' ? 'traveler' : p.role}</span>
            <div><span>{p.email}</span><small>joined {timeAgo(p.created_at)}</small></div></li>)}</ul>
          <button className="adm-link" onClick={() => onOpen('users')}>Manage users & roles →</button>
        </>}
      </section>}

      {isAdmin && <section className="adm-card" aria-labelledby="adm-top">
        <h2 id="adm-top">Top travelers</h2>
        {!travelers ? <p className="adm-muted">Loading…</p> : !travelers.length ? <p className="adm-muted">No cloud backups yet.</p>
          : <ol className="adm-list adm-ranked">{travelers.map((t, i) => <li key={i}><strong>{i + 1}</strong>
            <div><span>{t.traveler_name ?? 'Traveler'}</span><small>Level {1 + Math.floor((t.xp ?? 0) / 500)} · {(t.coins ?? 0).toLocaleString()} coins · {timeAgo(t.updated_at)}</small></div></li>)}</ol>}
        <button className="adm-link" onClick={() => onOpen('players')}>Open players →</button>
      </section>}
    </div>

    <section aria-labelledby="adm-library">
      <h2 id="adm-library" className="adm-section-title">Content library</h2>
      {contentGroups.map(group => <div key={group.label} className="adm-library-group">
        <h3>{group.label}</h3>
        <div className="adm-grid">{group.tables.map(name => {
          const t = tableByName(name)!; const c = counts(name);
          return <button key={name} className="adm-card adm-tile" onClick={() => onOpen(name)}>
            <strong>{t.label}</strong><small>{t.description}</small>
            <span className="adm-tile-count">{c ? <>{c.published}<em> published</em>{c.total > c.published && <em> · {c.total - c.published} draft</em>}</> : '…'}</span>
          </button>;
        })}</div>
      </div>)}
    </section>
  </>;
}
