import { IonApp, IonContent, IonPage } from '@ionic/react';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { contentTables, tableByName, validateRow, type ContentTable, type ContentTableName } from './content-schema';
import { formToRow, previewCell, rowToForm, type FormValues } from './admin-form';
import { contentGroups, errorText, fetchAll, timeAgo, type Row, type View } from './admin-shared';
import HomeView from './HomeView';
import JsonEditor from './JsonEditor';
import { currentProfile, getSupabase, isSupabaseConfigured, type AppRole, type Profile } from '../cloud/supabase';
import { parseSave, type Save } from '../model';
import './admin.css';

const roleLabel: Record<AppRole, string> = { learner: 'traveler', editor: 'editor', admin: 'admin' };

/* ───────────────────────── Shell & sign-in ───────────────────────── */

export default function AdminPage() {
  const [profile, setProfile] = useState<Profile | null>();
  const [error, setError] = useState('');

  const load = useCallback(() => {
    currentProfile().then(p => setProfile(p ?? null)).catch(e => { setError(errorText(e)); setProfile(null); });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    load();
    const { data } = getSupabase()!.auth.onAuthStateChange(() => load());
    return () => data.subscription.unsubscribe();
  }, [load]);

  let body;
  if (!isSupabaseConfigured) body = <NotConfigured />;
  else if (profile === undefined) body = <div className="adm-center"><p>Loading…</p></div>;
  else if (profile === null) body = <SignIn initialError={error} />;
  else if (profile.role === 'learner') body = <NoAccess profile={profile} />;
  else body = <Dashboard profile={profile} />;

  return <IonApp><IonPage><IonContent fullscreen><div className="adm">{body}</div></IonContent></IonPage></IonApp>;
}

function NotConfigured() {
  return <div className="adm-center"><div className="adm-card adm-narrow">
    <h1>Admin dashboard</h1>
    <p>This build is not connected to Supabase yet. Create a <code>.env.local</code> file with:</p>
    <pre>VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=your-anon-public-key</pre>
    <p>Then rebuild the app. See <strong>SUPABASE_SETUP.md</strong> for the full steps.</p>
    <a href="/">← Back to the app</a>
  </div></div>;
}

function SignIn({ initialError }: { initialError: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    const { error: e } = await getSupabase()!.auth.signInWithPassword({ email, password });
    if (e) setError(e.message);
    setBusy(false);
  };
  return <div className="adm-center"><form className="adm-card adm-narrow adm-signin" onSubmit={submit}>
    <div className="adm-brand"><img className="adm-logo" src="/assets/kapamana-emblem.webp" alt="" /><div><strong>KaPamana Admin</strong><small>Content & data management</small></div></div>
    <label>Email<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
    {error && <p className="adm-error" role="alert">{error}</p>}
    <button className="adm-btn is-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    <a href="/">← Back to the app</a>
  </form></div>;
}

function NoAccess({ profile }: { profile: Profile }) {
  return <div className="adm-center"><div className="adm-card adm-narrow">
    <h1>No admin access</h1>
    <p>You are signed in as <strong>{profile.email}</strong> with the <strong>traveler</strong> role.</p>
    <p>An existing admin can give you the editor or admin role under <em>Users</em>. For the very first admin, run this in the Supabase SQL editor:</p>
    <pre>select public.promote_to_admin('{profile.email}');</pre>
    <div className="adm-row"><button className="adm-btn" onClick={() => void getSupabase()!.auth.signOut()}>Sign out</button><a href="/">Back to the app</a></div>
  </div></div>;
}

function Dashboard({ profile }: { profile: Profile }) {
  const [view, setView] = useState<View>('home');
  const [openRecord, setOpenRecord] = useState<{ id: string; nonce: number }>();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (next: View) => { setView(next); setOpenRecord(undefined); setMenuOpen(false); };
  const openRecordIn = (tableName: ContentTableName, id: string) => { setView(tableName); setOpenRecord({ id, nonce: Date.now() }); setMenuOpen(false); };
  const table = tableByName(view);
  const isAdmin = profile.role === 'admin';
  const navButton = (id: View, label: string) => <button key={id} className={view === id ? 'is-active' : ''} aria-current={view === id ? 'page' : undefined} onClick={() => go(id)}>{label}</button>;
  return <div className="adm-layout">
    <aside className={`adm-sidebar${menuOpen ? ' is-open' : ''}`}>
      <div className="adm-brand"><img className="adm-logo" src="/assets/kapamana-emblem.webp" alt="" /><div><strong>KaPamana {isAdmin ? 'Admin' : 'Editor'}</strong><small>{profile.email} · {roleLabel[profile.role]}</small></div></div>
      <button className="adm-menu-toggle" onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen}>{menuOpen ? 'Close menu' : 'Menu'}</button>
      <nav aria-label="Dashboard sections">
        {navButton('home', 'Home')}
        {contentGroups.map(group => <div key={group.label} className="adm-nav-group">
          <span className="adm-nav-label">{group.label}</span>
          {group.tables.map(name => navButton(name, tableByName(name)!.label))}
        </div>)}
        <span className="adm-nav-label">{isAdmin ? 'People & system' : 'History'}</span>
        {isAdmin && navButton('players', 'Players & cloud saves')}
        {isAdmin && navButton('users', 'Users & roles')}
        {navButton('activity', 'Activity log')}
      </nav>
      <div className="adm-sidebar-foot">
        <a href="/">← Back to the app</a>
        <button className="adm-link" onClick={() => void getSupabase()!.auth.signOut()}>Sign out</button>
      </div>
    </aside>
    <main className="adm-main">
      {view === 'home' && <HomeView profile={profile} onOpen={go} onOpenRecord={openRecordIn} />}
      {view === 'users' && isAdmin && <UsersView me={profile} />}
      {view === 'players' && isAdmin && <PlayersView />}
      {view === 'activity' && <ActivityView me={profile} />}
      {table && <TableView key={`${table.table}-${openRecord?.nonce ?? 0}`} table={table} initialEditId={openRecord?.id} />}
    </main>
  </div>;
}

/* ───────────────────────── Content tables (CRUD) ───────────────────────── */

function TableView({ table, initialEditId }: { table: ContentTable; initialEditId?: string }) {
  const [rows, setRows] = useState<Row[]>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft' | 'problems'>('all');
  const [editing, setEditing] = useState<{ row?: Row } | undefined>();
  const [page, setPage] = useState(0);
  const pageSize = 25;
  const listed = table.fields.filter(f => f.listed);

  const reload = useCallback(() => { fetchAll(table.table).then(setRows).catch(e => setError(errorText(e))); }, [table.table]);
  useEffect(reload, [reload]);
  const issues = useMemo(() => new Map((rows ?? []).map(row => [row.id, validateRow(table, row)])), [rows, table]);
  const problemCount = [...issues.values()].filter(list => list.length).length;
  // Opened from Home ("Needs attention" / "Post news"): jump straight into the editor.
  const autoOpened = useRef(false);
  useEffect(() => {
    if (initialEditId === undefined || !rows || autoOpened.current) return;
    autoOpened.current = true; // only once: later reloads (after saving) must not reopen the editor
    if (initialEditId === '') setEditing({});
    else { const row = rows.find(r => r.id === initialEditId); if (row) setEditing({ row }); }
  }, [initialEditId, rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter(row => (status === 'all' || (status === 'problems' ? (issues.get(row.id)?.length ?? 0) > 0 : (status === 'published') === row.is_published))
      && (!q || row.id.toLowerCase().includes(q) || table.fields.some(f => JSON.stringify(row[f.column] ?? '').toLowerCase().includes(q))));
  }, [rows, query, status, table.fields, issues]);
  useEffect(() => setPage(0), [query, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const flash = (text: string) => { setNotice(text); setTimeout(() => setNotice(''), 3500); };

  const togglePublished = async (row: Row) => {
    const { error: e } = await getSupabase()!.from(table.table).update({ is_published: !row.is_published }).eq('id', row.id);
    if (e) setError(errorText(e)); else { flash(row.is_published ? 'Moved to drafts (hidden from travelers).' : 'Published.'); reload(); }
  };
  const remove = async (row: Row) => {
    const title = String(row[table.fields.find(f => f.key === table.titleKey)?.column ?? 'id'] ?? row.id);
    if (!window.confirm(`Delete “${title}”? This cannot be undone (it stays in the activity log).`)) return;
    const { error: e } = await getSupabase()!.from(table.table).delete().eq('id', row.id);
    if (e) setError(errorText(e)); else { flash('Deleted.'); reload(); }
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rows ?? [], null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `kapamana-${table.table}-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(a.href);
  };

  const titleColumn = table.fields.find(f => f.key === table.titleKey)!;
  return <>
    <header className="adm-head"><div><h1>{table.label}</h1><p>{table.description}</p></div>
      <div className="adm-row"><button className="adm-btn" onClick={exportJson} disabled={!rows}>Export JSON</button>
        <button className="adm-btn is-primary" onClick={() => setEditing({})}>+ New</button></div></header>
    {notice && <p className="adm-notice" role="status">{notice}</p>}
    {error && <p className="adm-error" role="alert">{error} <button className="adm-link" onClick={() => setError('')}>Dismiss</button></p>}
    {problemCount > 0 && status !== 'problems' && <p className="adm-warn">{problemCount} record{problemCount === 1 ? ' has' : 's have'} problems and {problemCount === 1 ? 'is' : 'are'} skipped by the app. <button className="adm-link" onClick={() => setStatus('problems')}>Show them</button></p>}
    <div className="adm-toolbar">
      <input type="search" placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search records" />
      <select value={status} onChange={e => setStatus(e.target.value as typeof status)} aria-label="Filter by status">
        <option value="all">All</option><option value="published">Published</option><option value="draft">Drafts</option><option value="problems">Has problems{problemCount ? ` (${problemCount})` : ''}</option>
      </select>
      <span className="adm-muted">{rows ? `${filtered.length} of ${rows.length}` : 'Loading…'}</span>
    </div>
    <div className="adm-table-wrap"><table className="adm-table">
      <thead><tr><th>{titleColumn.label}</th>{listed.filter(f => f !== titleColumn).map(f => <th key={f.column}>{f.label}</th>)}<th>Status</th><th>Updated</th><th><span className="adm-sr">Actions</span></th></tr></thead>
      <tbody>
        {visible.map(row => <tr key={row.id}>
          <td>{(issues.get(row.id)?.length ?? 0) > 0 && <span className="adm-flag" title={issues.get(row.id)!.join('\n')}>⚠ Problem</span>}
            <button className="adm-link adm-title-cell" onClick={() => setEditing({ row })}>{previewCell(titleColumn, row[titleColumn.column])}</button><small>{row.id}</small></td>
          {listed.filter(f => f !== titleColumn).map(f => <td key={f.column}>{previewCell(f, row[f.column])}</td>)}
          <td><button className={`adm-pill ${row.is_published ? 'is-on' : ''}`} onClick={() => void togglePublished(row)} title="Click to toggle">{row.is_published ? 'Published' : 'Draft'}</button></td>
          <td className="adm-muted" title={new Date(row.updated_at).toLocaleString()}>{timeAgo(row.updated_at)}</td>
          <td className="adm-actions"><button className="adm-link" onClick={() => setEditing({ row })}>Edit</button>
            <button className="adm-link" onClick={() => setEditing({ row: { ...row, id: '' } })}>Duplicate</button>
            <button className="adm-link is-danger" onClick={() => void remove(row)}>Delete</button></td>
        </tr>)}
        {rows && !visible.length && <tr><td colSpan={listed.length + 4} className="adm-empty">No records match.</td></tr>}
      </tbody>
    </table></div>
    {pages > 1 && <div className="adm-pager"><button className="adm-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
      <span>Page {page + 1} of {pages}</span><button className="adm-btn" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next</button></div>}
    {editing && <RecordEditor table={table} row={editing.row} nextSort={(rows ?? []).reduce((m, r) => Math.max(m, r.sort_order), -1) + 1}
      onClose={() => setEditing(undefined)} onSaved={msg => { setEditing(undefined); flash(msg); reload(); }} />}
  </>;
}

function RecordEditor({ table, row, nextSort, onClose, onSaved }: { table: ContentTable; row?: Row; nextSort: number; onClose: () => void; onSaved: (message: string) => void }) {
  const isNew = !row || !row.id;
  const [values, setValues] = useState<FormValues>(() => {
    const initial = rowToForm(table, row);
    if (isNew && !initial.__sort) initial.__sort = String(nextSort);
    return initial;
  });
  const [problems, setProblems] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const set = (key: string, value: string | boolean) => setValues(v => ({ ...v, [key]: value }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setProblems([]);
    let next;
    try { next = formToRow(table, values, isNew); } catch (e) { setProblems([errorText(e)]); return; }
    const issues = validateRow(table, next);
    if (issues.length) { setProblems(issues); return; }
    setBusy(true);
    const supabase = getSupabase()!;
    const { error } = isNew
      ? await supabase.from(table.table).insert(next)
      : await supabase.from(table.table).update(next).eq('id', row!.id);
    setBusy(false);
    if (error) setProblems([errorText(error)]); else onSaved(isNew ? 'Created.' : 'Saved.');
  };

  const upload = async (column: string, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5_000_000) { setProblems(['Choose an image under 5 MB.']); return; }
    setBusy(true);
    const path = `${table.table}/${Date.now()}-${file.name.replace(/[^A-Za-z0-9.]+/g, '-')}`;
    const storage = getSupabase()!.storage.from('content-media');
    const { error } = await storage.upload(path, file, { contentType: file.type });
    setBusy(false);
    if (error) { setProblems([`Upload failed: ${error.message}`]); return; }
    set(column, storage.getPublicUrl(path).data.publicUrl);
  };

  return <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="adm-editor-title" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
    <form className="adm-card adm-editor" onSubmit={save}>
      <header><div><small className="adm-muted">{table.label}</small><h2 id="adm-editor-title">{isNew ? 'New record' : `Edit ${String(row?.id)}`}</h2></div>
        <button type="button" className="adm-link" onClick={onClose} aria-label="Close editor">✕</button></header>
      <div className="adm-editor-body">
        {!table.rowId && <label className="adm-field">ID{isNew ? ' (optional — generated from the title)' : ''}{table.idHelp && <small>{table.idHelp}</small>}
          <input value={String(values.__id)} disabled={!isNew} onChange={e => set('__id', e.target.value)} placeholder="e.g. calapan-heritage-walk" /></label>}
        {table.fields.map(field => {
          const value = values[field.column];
          const label = <span className="adm-label">{field.label}{field.required && <><span className="adm-req" aria-hidden="true"> *</span><span className="adm-sr"> (required)</span></>}</span>;
          const locked = !isNew && Boolean(field.partOfId);
          let input;
          switch (field.type) {
            case 'bool': return <label key={field.column} className="adm-field adm-check"><input type="checkbox" checked={value === true} onChange={e => set(field.column, e.target.checked)} />{label}</label>;
            case 'longtext': input = <textarea rows={4} value={String(value)} onChange={e => set(field.column, e.target.value)} />; break;
            case 'textlist': input = <textarea rows={4} value={String(value)} onChange={e => set(field.column, e.target.value)} placeholder="One item per line" />; break;
            case 'json': return <div key={field.column} className="adm-field">{label}<JsonEditor label={field.label} text={String(value)} onText={text => set(field.column, text)} />{field.help && <small>{field.help}</small>}</div>;
            case 'select': input = <select value={String(value)} onChange={e => set(field.column, e.target.value)}><option value="">—</option>{field.options?.map(o => <option key={o} value={o}>{o}</option>)}</select>; break;
            case 'int': case 'number': input = <input type="number" step={field.type === 'int' ? 1 : 'any'} value={String(value)} onChange={e => set(field.column, e.target.value)} />; break;
            case 'date': input = <input type="date" value={String(value)} onChange={e => set(field.column, e.target.value)} />; break;
            case 'datetime': input = <input type="datetime-local" value={String(value)} onChange={e => set(field.column, e.target.value)} />; break;
            case 'url': input = <div className="adm-row">
              <input type="url" value={String(value)} onChange={e => set(field.column, e.target.value)} placeholder="https://" />
              {/image/i.test(field.column) && <label className="adm-btn adm-upload">Upload<input type="file" accept="image/*" onChange={e => void upload(field.column, e.target.files?.[0])} /></label>}
            </div>; break;
            default: input = <input value={String(value)} disabled={locked} onChange={e => set(field.column, e.target.value)} />;
          }
          return <label key={field.column} className="adm-field">{label}{input}{field.help && <small>{field.help}</small>}</label>;
        })}
        {table.table === 'announcements' && <AnnouncementPreview values={values} />}
        <div className="adm-row adm-meta">
          <label className="adm-field adm-check"><input type="checkbox" checked={values.__published === true} onChange={e => set('__published', e.target.checked)} />Published (visible to travelers)</label>
          <label className="adm-field adm-sort">Sort order<input type="number" step={1} value={String(values.__sort)} onChange={e => set('__sort', e.target.value)} /></label>
        </div>
      </div>
      {problems.length > 0 && <ul className="adm-error" role="alert">{problems.map(p => <li key={p}>{p}</li>)}</ul>}
      <footer><button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
        <button className="adm-btn is-primary" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Create' : 'Save changes'}</button></footer>
    </form>
  </div>;
}

/** How the news card will look on the Adventure screen. */
function AnnouncementPreview({ values }: { values: FormValues }) {
  const category = String(values.category || 'update');
  const label = { update: 'Update', news: 'Balita', event: 'Event', advisory: 'Advisory' }[category] ?? category;
  return <div className="adm-preview" aria-label="Preview">
    <small className="adm-muted">Preview on the Adventure screen</small>
    <div className={`adm-news is-${category}`}>
      {values.image_url ? <img src={String(values.image_url)} alt="" /> : null}
      <div><small>{values.pinned === true ? '📌 ' : ''}{label}</small>
        <h3>{String(values.title || 'Your title')}</h3>
        <p>{String(values.body || 'Your message to travelers.')}</p>
        {values.link_url ? <span className="adm-news-link">{String(values.link_label || 'Learn more')} ↗</span> : null}</div>
    </div>
  </div>;
}

/* ───────────────────────── Users ───────────────────────── */

function UsersView({ me }: { me: Profile }) {
  const [users, setUsers] = useState<Profile[]>();
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const reload = useCallback(() => {
    getSupabase()!.from('profiles').select('*').order('created_at').then(({ data, error: e }) => { if (e) setError(errorText(e)); else setUsers(data as Profile[]); });
  }, []);
  useEffect(reload, [reload]);
  const changeRole = async (user: Profile, role: AppRole) => {
    if (user.id === me.id && role !== 'admin' && !window.confirm('Remove your own admin access?')) return;
    const { error: e } = await getSupabase()!.from('profiles').update({ role }).eq('id', user.id);
    if (e) setError(e.message.includes('At least one admin') ? 'At least one admin must remain.' : errorText(e)); else { setError(''); reload(); }
  };
  const [notice, setNotice] = useState('');
  const setPassword = async (user: Profile) => {
    const next = window.prompt(`New password for ${user.email} (at least 8 characters). Share it with them privately.`);
    if (next === null) return;
    if (next.length < 8) { setError('The password needs at least 8 characters.'); return; }
    const { error: e } = await getSupabase()!.rpc('admin_set_password', { target_user: user.id, new_password: next });
    if (e) setError(errorText(e)); else { setError(''); setNotice(`Password updated for ${user.email}. They can sign in with it now.`); setTimeout(() => setNotice(''), 6000); }
  };
  const shown = (users ?? []).filter(u => !query || `${u.email} ${u.display_name}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <header className="adm-head"><div><h1>Users & roles</h1><p><strong>Traveler</strong>: plays and backs up progress. <strong>Editor</strong>: manages all content. <strong>Admin</strong>: content, user roles and player saves.</p></div></header>
    {notice && <p className="adm-notice" role="status">{notice}</p>}
    {error && <p className="adm-error" role="alert">{error}</p>}
    <div className="adm-toolbar"><input type="search" placeholder="Search by email or name…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search users" />
      <span className="adm-muted">{users ? `${shown.length} of ${users.length}` : 'Loading…'}</span></div>
    <div className="adm-table-wrap"><table className="adm-table">
      <thead><tr><th>Email</th><th>Name</th><th>Joined</th><th>Role</th><th><span className="adm-sr">Actions</span></th></tr></thead>
      <tbody>{shown.map(u => <tr key={u.id}><td>{u.email}{u.id === me.id && <small>you</small>}</td><td>{u.display_name ?? '—'}</td>
        <td className="adm-muted">{new Date(u.created_at).toLocaleDateString()}</td>
        <td><select value={u.role} onChange={e => void changeRole(u, e.target.value as AppRole)} aria-label={`Role for ${u.email}`}>
          <option value="learner">Traveler</option><option value="editor">Editor</option><option value="admin">Admin</option></select></td>
        <td className="adm-actions"><button className="adm-link" onClick={() => void setPassword(u)}>Set password</button></td></tr>)}</tbody>
    </table></div>
  </>;
}

/* ───────────────────────── Players & cloud saves ───────────────────────── */

type PlayerRow = { user_id: string; save: Save; traveler_name: string | null; coins: number | null; xp: number | null; updated_at: string; email?: string | null };
const level = (xp: number | null) => 1 + Math.floor((xp ?? 0) / 500);
const stars = (save: Save) => Object.values(save.completed ?? {}).reduce((a, b) => a + b, 0);

function PlayersView() {
  const [players, setPlayers] = useState<PlayerRow[]>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<PlayerRow>();
  const reload = useCallback(() => {
    const supabase = getSupabase()!;
    Promise.all([
      supabase.from('player_saves').select('user_id,save,traveler_name,coins,xp,updated_at').order('updated_at', { ascending: false }),
      supabase.from('profiles').select('id,email'),
    ]).then(([saves, profiles]) => {
      if (saves.error || profiles.error) { setError(errorText(saves.error ?? profiles.error)); return; }
      const emails = new Map((profiles.data as { id: string; email: string | null }[]).map(p => [p.id, p.email]));
      setPlayers((saves.data as PlayerRow[]).map(row => ({ ...row, email: emails.get(row.user_id) })));
    });
  }, []);
  useEffect(reload, [reload]);
  const flash = (text: string) => { setNotice(text); setTimeout(() => setNotice(''), 3500); };

  const remove = async (player: PlayerRow) => {
    if (!window.confirm(`Delete the cloud backup of “${player.traveler_name}” (${player.email ?? 'unknown email'})? Their phone keeps its progress.`)) return;
    const { error: e } = await getSupabase()!.from('player_saves').delete().eq('user_id', player.user_id);
    if (e) setError(errorText(e)); else { flash('Cloud backup deleted.'); reload(); }
  };
  const download = (player: PlayerRow) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(player.save, null, 2)], { type: 'application/json' }));
    a.download = `kapamana-save-${(player.traveler_name ?? 'traveler').replace(/[^A-Za-z0-9]+/g, '-')}.json`; a.click();
    URL.revokeObjectURL(a.href);
  };

  const shown = (players ?? []).filter(p => !query || `${p.email} ${p.traveler_name}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <header className="adm-head"><div><h1>Players & cloud saves</h1><p>Travelers who signed in to back up their adventure. Adjustments reach the player’s phone the next time the app opens online (unless the phone has newer unsynced progress).</p></div></header>
    {notice && <p className="adm-notice" role="status">{notice}</p>}
    {error && <p className="adm-error" role="alert">{error}</p>}
    <div className="adm-toolbar"><input type="search" placeholder="Search by email or traveler name…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search players" />
      <span className="adm-muted">{players ? `${shown.length} of ${players.length}` : 'Loading…'}</span></div>
    <div className="adm-table-wrap"><table className="adm-table">
      <thead><tr><th>Traveler</th><th>Level</th><th>Coins</th><th>XP</th><th>Stars</th><th>Last backup</th><th><span className="adm-sr">Actions</span></th></tr></thead>
      <tbody>{shown.map(p => <tr key={p.user_id}>
        <td><button className="adm-link adm-title-cell" onClick={() => setEditing(p)}>{p.traveler_name ?? '—'}</button><small>{p.email ?? p.user_id}</small></td>
        <td>{level(p.xp)}</td><td>{(p.coins ?? 0).toLocaleString()}</td><td>{(p.xp ?? 0).toLocaleString()}</td><td>{stars(p.save)}</td>
        <td className="adm-muted">{new Date(p.updated_at).toLocaleString()}</td>
        <td className="adm-actions"><button className="adm-link" onClick={() => setEditing(p)}>Adjust</button>
          <button className="adm-link" onClick={() => download(p)}>Download</button>
          <button className="adm-link is-danger" onClick={() => void remove(p)}>Delete</button></td>
      </tr>)}{players && !shown.length && <tr><td colSpan={7} className="adm-empty">No cloud saves yet.</td></tr>}</tbody>
    </table></div>
    {editing && <PlayerEditor player={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); flash('Player save updated.'); reload(); }} />}
  </>;
}

function PlayerEditor({ player, onClose, onSaved }: { player: PlayerRow; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(player.save.name);
  const [coins, setCoins] = useState(String(player.save.coins));
  const [xp, setXp] = useState(String(player.save.xp));
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setProblem('');
    const c = Number(coins), x = Number(xp);
    if (!name.trim() || name.trim().length > 24) { setProblem('Traveler name must be 1–24 characters.'); return; }
    if (!Number.isInteger(c) || c < 0 || !Number.isInteger(x) || x < 0) { setProblem('Coins and XP must be whole numbers, 0 or more.'); return; }
    let next: Save;
    try { next = parseSave(JSON.stringify({ ...player.save, name: name.trim(), coins: c, xp: x })); }
    catch (e) { setProblem(`This save is not valid: ${errorText(e)}`); return; }
    setBusy(true);
    const { error } = await getSupabase()!.from('player_saves').update({ save: next }).eq('user_id', player.user_id);
    setBusy(false);
    if (error) setProblem(errorText(error)); else onSaved();
  };
  return <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="adm-player-title" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
    <form className="adm-card adm-editor" onSubmit={submit}>
      <header><div><small className="adm-muted">{player.email ?? player.user_id}</small><h2 id="adm-player-title">Adjust {player.traveler_name}</h2></div>
        <button type="button" className="adm-link" onClick={onClose} aria-label="Close editor">✕</button></header>
      <div className="adm-editor-body">
        <label className="adm-field"><span className="adm-label">Traveler name</span><input value={name} maxLength={24} onChange={e => setName(e.target.value)} /></label>
        <label className="adm-field"><span className="adm-label">Travel Coins</span><input type="number" min={0} step={1} value={coins} onChange={e => setCoins(e.target.value)} /></label>
        <label className="adm-field"><span className="adm-label">Traveler XP</span><input type="number" min={0} step={1} value={xp} onChange={e => setXp(e.target.value)} /><small>Level {level(Number(xp) || 0)} · every 500 XP is one level.</small></label>
        <p className="adm-muted">Missions completed: {Object.keys(player.save.completed ?? {}).length} · Stars: {stars(player.save)} · Buddy: {player.save.buddy}. Every adjustment is recorded in the activity log.</p>
      </div>
      {problem && <p className="adm-error" role="alert">{problem}</p>}
      <footer><button type="button" className="adm-btn" onClick={onClose}>Cancel</button><button className="adm-btn is-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></footer>
    </form>
  </div>;
}

/* ───────────────────────── Activity log ───────────────────────── */

type AuditEntry = { id: number; table_name: string; record_id: string; action: string; changed_by_email: string | null; changed_at: string; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null };
const ignored = new Set(['updated_at', 'updated_by', 'created_at']);

function changedColumns(entry: AuditEntry): string[] {
  if (entry.action !== 'UPDATE' || !entry.old_data || !entry.new_data) return [];
  return Object.keys(entry.new_data).filter(k => !ignored.has(k) && JSON.stringify(entry.old_data![k]) !== JSON.stringify(entry.new_data![k]));
}

const restoreColumns = (data: Record<string, unknown>) => Object.fromEntries(Object.entries(data).filter(([k]) => !ignored.has(k) || k === 'created_at'));
const short = (value: unknown) => { const text = typeof value === 'string' ? value : JSON.stringify(value); return text === undefined ? '—' : text.length > 120 ? text.slice(0, 117) + '…' : text; };

function ActivityView({ me }: { me: Profile }) {
  const [entries, setEntries] = useState<AuditEntry[]>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [table, setTable] = useState('');
  const [mine, setMine] = useState(false);
  const [open, setOpen] = useState<number>();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let query = getSupabase()!.from('content_audit_log').select('*').order('changed_at', { ascending: false }).limit(200);
    if (table) query = query.eq('table_name', table);
    if (mine) query = query.eq('changed_by', me.id);
    query.then(({ data, error: e }) => { if (e) setError(errorText(e)); else setEntries(data as AuditEntry[]); });
  }, [table, mine, me.id, tick]);

  const restore = async (entry: AuditEntry) => {
    const t = tableByName(entry.table_name);
    if (!t || !entry.old_data) return;
    const what = entry.action === 'DELETE' ? 'bring back this deleted record' : 'put this record back the way it was before this edit';
    if (!window.confirm(`Restore: ${what}? The current version is replaced (and kept in this log).`)) return;
    const { error: e } = await getSupabase()!.from(t.table).upsert(restoreColumns(entry.old_data));
    if (e) setError(errorText(e)); else { setError(''); setNotice(`Restored ${entry.record_id}.`); setTimeout(() => setNotice(''), 4000); setTick(n => n + 1); }
  };

  return <>
    <header className="adm-head"><div><h1>Activity log</h1><p>Every add, edit and delete, newest first (latest 200). Made a mistake? Open an entry and choose <b>Restore</b>.</p></div></header>
    {notice && <p className="adm-notice" role="status">{notice}</p>}
    {error && <p className="adm-error" role="alert">{error}</p>}
    <div className="adm-toolbar"><select value={table} onChange={e => setTable(e.target.value)} aria-label="Filter by table">
      <option value="">All tables</option>{contentTables.map(t => <option key={t.table} value={t.table}>{t.label}</option>)}</select>
      <label className="adm-check-inline"><input type="checkbox" checked={mine} onChange={e => setMine(e.target.checked)} /> Only my changes</label></div>
    <ul className="adm-log">{(entries ?? []).map(entry => {
      const changed = changedColumns(entry);
      const t = tableByName(entry.table_name);
      const canRestore = Boolean(t && entry.old_data && entry.action !== 'INSERT');
      const isOpen = open === entry.id;
      return <li key={entry.id}><span className={`adm-pill is-${entry.action.toLowerCase()}`}>{entry.action === 'INSERT' ? 'Added' : entry.action === 'UPDATE' ? 'Edited' : 'Deleted'}</span>
        <div className="adm-log-body"><strong>{t?.label ?? (entry.table_name === 'player_saves' ? 'Player save' : entry.table_name === 'auth_users' ? 'Password' : entry.table_name)}</strong> · <code>{entry.record_id}</code>
          {changed.length > 0 && <small> — changed {changed.join(', ')}</small>}
          <small className="adm-muted">{new Date(entry.changed_at).toLocaleString()} · {entry.changed_by_email ?? 'Setup / system'}</small>
          {(changed.length > 0 || canRestore) && <div className="adm-row">
            {changed.length > 0 && <button className="adm-link" onClick={() => setOpen(isOpen ? undefined : entry.id)}>{isOpen ? 'Hide details' : 'Details'}</button>}
            {canRestore && <button className="adm-link" onClick={() => void restore(entry)}>{entry.action === 'DELETE' ? 'Restore deleted record' : 'Restore previous version'}</button>}
          </div>}
          {isOpen && <table className="adm-diff"><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>
            {changed.map(k => <tr key={k}><td>{k}</td><td>{short(entry.old_data?.[k])}</td><td>{short(entry.new_data?.[k])}</td></tr>)}</tbody></table>}
        </div></li>;
    })}{entries && !entries.length && <li className="adm-empty">No activity yet.</li>}</ul>
  </>;
}
