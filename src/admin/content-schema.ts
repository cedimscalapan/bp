/**
 * Single source of truth for every KaPamana Supabase content table.
 *
 * The same definitions drive:
 *  - the Postgres migration and seed (scripts/generate-supabase-sql.ts),
 *  - the runtime content overlay (src/cloud/content-sync.ts),
 *  - the admin dashboard forms and lists (src/admin/AdminApp.tsx).
 *
 * `key` is the property path in the app object (dot paths allowed);
 * `column` is the snake_case Postgres column. The row primary key `id` holds the
 * record's `idKey` property (e.g. `destinationID`).
 */

export type FieldType =
  | 'text' | 'longtext' | 'url' | 'int' | 'number' | 'bool'
  | 'date' | 'datetime' | 'select' | 'textlist' | 'json';

export type ContentField = {
  key: string;
  column: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  help?: string;
  /** Shown as a column in the admin list view. */
  listed?: boolean;
  /** Part of a composite row ID: editable only when creating a record. */
  partOfId?: boolean;
};

export type ContentTable = {
  table: ContentTableName;
  label: string;
  description: string;
  /** App key used as the record title in lists. */
  titleKey: string;
  /** App property that holds the record ID (default `id`). */
  idKey?: string;
  /** Help shown above the ID input. */
  idHelp?: string;
  fields: readonly ContentField[];
  /** Builds the row primary key from an app object (composite IDs only). */
  rowId?: (record: Record<string, unknown>) => string;
};

export const contentTableNames = [
  'announcements', 'destinations', 'heritage_profiles', 'history_questions', 'investigations',
  'cultural_profiles', 'research_notes', 'municipal_guides', 'sources', 'shop_powerups', 'shop_companions',
] as const;
export type ContentTableName = typeof contentTableNames[number];

const f = (key: string, label: string, type: FieldType, extra: Partial<ContentField> = {}): ContentField => ({
  key, label, type, column: extra.column ?? key.replace(/\./g, '_').replace(/IDs/g, 'Ids').replace(/ID/g, 'Id').replace(/[A-Z]/g, c => '_' + c.toLowerCase()), ...extra,
});
const sourceIDs = f('sourceIDs', 'Source IDs', 'textlist', { help: 'IDs from the Sources table, one per line.' });
const placeID = f('placeID', 'Place (destination ID)', 'text', { required: true, listed: true, help: 'e.g. oriental_mindoro_calapan_city' });
export const destinationGroups = ['Oriental Mindoro', 'North Luzon', 'South Luzon', 'Metro Manila', 'Island Voyage', 'International'] as const;

export const contentTables: readonly ContentTable[] = [
  {
    table: 'announcements', label: 'Announcements & updates', titleKey: 'title',
    description: 'News, updates, events and advisories shown on the Adventure (home) screen.',
    fields: [
      f('title', 'Title', 'text', { required: true, listed: true }),
      f('body', 'Message', 'longtext', { required: true }),
      f('category', 'Category', 'select', { options: ['update', 'news', 'event', 'advisory'], required: true, listed: true }),
      f('imageUrl', 'Image URL', 'url'),
      f('linkUrl', 'Link URL', 'url'),
      f('linkLabel', 'Link label', 'text'),
      f('startsAt', 'Show from', 'datetime', { help: 'Leave empty to show immediately.', listed: true }),
      f('endsAt', 'Show until', 'datetime', { help: 'Leave empty to keep showing.' }),
      f('pinned', 'Pinned to top', 'bool', { listed: true }),
    ],
  },
  {
    table: 'destinations', label: 'Destinations & missions', titleKey: 'name', idKey: 'destinationID',
    idHelp: 'e.g. oriental_mindoro_calapan_city. Level IDs inside “Runner missions” must stay unique.',
    description: 'Every adventure stop, its artwork and its runner missions (levels).',
    fields: [
      f('name', 'Name', 'text', { required: true, listed: true }),
      f('group', 'Adventure group', 'select', { column: 'adventure_group', options: destinationGroups, required: true, listed: true }),
      f('localityType', 'Locality type', 'text', { help: 'e.g. Municipality, Component city' }),
      f('image', 'Destination image', 'text', { required: true, help: 'File in /assets, e.g. destination_oriental_mindoro_calapan_city.webp, or a full https:// URL.' }),
      f('signatureItemName', 'Keepsake name', 'text', { required: true }),
      f('signatureImage', 'Keepsake image', 'text', { required: true }),
      f('levels', 'Runner missions', 'json', { required: true, help: '[{ "id", "number", "title", "mission": { "type", "target", "timeLimit" }, "lives", ... }]' }),
      f('sourceUrl', 'Source URL', 'url'),
      f('recovered', 'Recovered original route', 'bool'),
      f('custom', 'Community (custom) destination', 'bool', { listed: true }),
    ],
  },
  {
    table: 'heritage_profiles', label: 'Heritage journals', titleKey: 'name', idKey: 'destinationID',
    description: 'Place introductions, discoveries, collectibles, visitor challenge, recap and journal story for each Oriental Mindoro place.',
    fields: [
      f('name', 'Name', 'text', { required: true, listed: true }),
      f('introduction', 'Introduction', 'json', { required: true }),
      f('collectibles', 'Collectibles', 'json', { required: true }),
      f('discoveries', 'Mission discoveries', 'json', { required: true, help: 'Facts shown after missions 1–5. Missions 6+ come from History questions.' }),
      f('visitorChallenge', 'Visitor challenge', 'json', { required: true }),
      f('recap', 'Recap question', 'json', { required: true }),
      f('journal', 'Journal story', 'json', { required: true }),
      f('pickupName', 'Pickup name', 'text', { required: true }),
      f('pickupImage', 'Pickup image', 'text', { required: true }),
      f('barangayCount', 'Barangay count', 'int', { required: true, listed: true }),
      f('barangayCountAsOf', 'Barangay count as of', 'text', { required: true }),
    ],
  },
  {
    table: 'history_questions', label: 'History runner questions', titleKey: 'title',
    description: 'Readings and quiz questions unlocked by missions 6 and above.',
    fields: [
      placeID,
      f('suggestedMission', 'Mission number', 'int', { required: true, listed: true }),
      f('title', 'Title', 'text', { required: true, listed: true }),
      f('category', 'Category', 'text', { required: true }),
      f('text', 'Reading', 'longtext', { required: true }),
      f('question', 'Question', 'longtext', { required: true }),
      f('answer', 'Correct answer', 'text', { required: true }),
      f('options', 'Answer options', 'textlist', { required: true, help: 'Include the correct answer; one per line.' }),
      sourceIDs,
      f('evidenceStatus', 'Evidence status', 'text', { required: true }),
    ],
  },
  {
    table: 'investigations', label: 'Investigations', titleKey: 'title',
    description: 'Learning Studio challenges (sequence, match, classify, decision, budget).',
    fields: [
      placeID,
      f('title', 'Title', 'text', { required: true, listed: true }),
      f('family', 'Family', 'text', { required: true, listed: true }),
      f('difficulty', 'Difficulty', 'text', { required: true }),
      f('learningObjective', 'Learning objective', 'longtext', { required: true }),
      f('whyHere', 'Why here', 'longtext', { required: true }),
      f('briefing', 'Briefing', 'textlist', { required: true }),
      f('tasks', 'Tasks', 'json', { required: true, help: '[{ "id", "kind": "sequence|match|classify|decision|budget", "prompt", "explanation", ... }]' }),
      f('reward', 'Reward', 'json', { required: true, help: '{ "coins": 40, "xp": 60 }' }),
      f('unlock', 'Unlock text', 'longtext', { required: true }),
      f('success', 'Success text', 'longtext', { required: true }),
      f('failure', 'Retry text', 'longtext', { required: true }),
      f('designNote', 'Design note', 'longtext'),
      f('artworkRequirements', 'Artwork requirements', 'longtext', { required: true }),
      f('claimIDs', 'Claim IDs', 'textlist'),
      f('researchNoteIDs', 'Research note IDs', 'textlist'),
      sourceIDs,
    ],
  },
  {
    table: 'cultural_profiles', label: 'Cultural identity', titleKey: 'name', idKey: 'placeID',
    description: 'Living heritage, traveler values and origins for each place.',
    fields: [
      f('name', 'Name', 'text', { required: true, listed: true }),
      f('theme', 'Theme', 'text', { required: true, listed: true }),
      f('livingHeritage', 'Living heritage', 'longtext', { required: true }),
      f('travelerValues', 'Traveler values', 'textlist', { required: true }),
      f('origins', 'Origins', 'longtext', { required: true }),
      f('discovererStatus', 'Who first discovered it?', 'longtext', { required: true }),
      sourceIDs,
      f('evidenceStatus', 'Evidence status', 'text', { required: true }),
    ],
  },
  {
    table: 'research_notes', label: 'Research notes', titleKey: 'title',
    description: 'Attributed research leads and open questions (never used as quiz answers).',
    fields: [
      placeID,
      f('title', 'Title', 'text', { required: true, listed: true }),
      f('statement', 'Statement', 'longtext', { required: true }),
      f('evidenceLabel', 'Evidence label', 'text', { required: true }),
      f('verificationNeeded', 'What needs checking', 'longtext', { required: true }),
      sourceIDs,
      f('factQuizEligible', 'May be used in fact quizzes', 'bool'),
    ],
  },
  {
    table: 'municipal_guides', label: 'Local story guides', titleKey: 'name', idKey: 'destinationID',
    description: 'Municipal tokens, passport art and fictional story-guide sprites.',
    fields: [
      f('name', 'Place name', 'text', { required: true, listed: true }),
      f('spriteName', 'Guide name', 'text', { required: true, listed: true }),
      f('tokenName', 'Token name', 'text', { required: true }),
      f('spriteType', 'Guide type', 'text', { required: true }),
      f('palette', 'Palette', 'text', { required: true }),
      f('tokenImage', 'Token image', 'text', { required: true }),
      f('passportImage', 'Passport image', 'text', { required: true }),
      f('spriteImage', 'Guide image', 'text', { required: true }),
    ],
  },
  {
    table: 'sources', label: 'Sources & references', titleKey: 'title',
    description: 'Citations shown under “Sources” throughout the app.',
    fields: [
      f('title', 'Title', 'text', { required: true, listed: true }),
      f('publisher', 'Publisher', 'text', { required: true, listed: true }),
      f('url', 'URL', 'url', { required: true }),
    ],
  },
  {
    table: 'shop_powerups', label: 'Shop: power-ups', titleKey: 'name',
    description: 'Power-up names, prices and descriptions. The ID decides the in-game effect, so only edit existing IDs.',
    fields: [
      f('name', 'Name', 'text', { required: true, listed: true }),
      f('price', 'Price (Travel Coins)', 'int', { required: true, listed: true }),
      f('description', 'Description', 'longtext', { required: true }),
    ],
  },
  {
    table: 'shop_companions', label: 'Shop: companions', titleKey: 'name',
    description: 'Companion names, prices and descriptions. The ID decides the in-game ability, so only edit existing IDs.',
    fields: [
      f('name', 'Name', 'text', { required: true, listed: true }),
      f('price', 'Price (Travel Coins)', 'int', { required: true, listed: true }),
      f('description', 'Description', 'longtext', { required: true }),
    ],
  },
];

export const tableByName = (name: string) => contentTables.find(t => t.table === name);

export type ContentRow = Record<string, unknown> & { id: string; sort_order?: number; is_published?: boolean; updated_at?: string };

const getPath = (obj: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((value, part) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined), obj);

const setPath = (obj: Record<string, unknown>, path: string, value: unknown) => {
  const parts = path.split('.');
  let target = obj;
  for (const part of parts.slice(0, -1)) {
    if (!target[part] || typeof target[part] !== 'object') target[part] = {};
    target = target[part] as Record<string, unknown>;
  }
  target[parts[parts.length - 1]] = value;
};

/** App object -> database row (without system columns). Missing booleans become false. */
export function toRow(table: ContentTable, record: Record<string, unknown>): ContentRow {
  const row: ContentRow = { id: table.rowId ? table.rowId(record) : String(record[table.idKey ?? 'id']) };
  for (const field of table.fields) {
    const value = getPath(record, field.key);
    row[field.column] = value === undefined ? (field.type === 'bool' ? false : null) : value;
  }
  return row;
}

/** Database row -> app object. Null columns are omitted so optional properties stay absent. */
export function fromRow(table: ContentTable, row: Record<string, unknown>): Record<string, unknown> {
  const record: Record<string, unknown> = table.rowId ? {} : { [table.idKey ?? 'id']: row.id };
  for (const field of table.fields) {
    const value = row[field.column];
    if (value === null || value === undefined) continue;
    setPath(record, field.key, field.type === 'number' || field.type === 'int' ? Number(value) : value);
  }
  return record;
}

/** Returns a list of problems; an empty list means the row is safe to show in the app. */
export function validateRow(table: ContentTable, row: Record<string, unknown>): string[] {
  const problems: string[] = [];
  if (!row.id || typeof row.id !== 'string') problems.push('Missing ID');
  for (const field of table.fields) {
    const value = row[field.column];
    const empty = value === null || value === undefined || value === '';
    if (empty) { if (field.required) problems.push(`${field.label} is required`); continue; }
    switch (field.type) {
      case 'int': if (!Number.isInteger(Number(value))) problems.push(`${field.label} must be a whole number`); break;
      case 'number': if (!Number.isFinite(Number(value))) problems.push(`${field.label} must be a number`); break;
      case 'bool': if (typeof value !== 'boolean') problems.push(`${field.label} must be true/false`); break;
      case 'textlist': if (!Array.isArray(value) || value.some(v => typeof v !== 'string')) problems.push(`${field.label} must be a list of text`); break;
      case 'select': if (field.options && !field.options.includes(String(value))) problems.push(`${field.label} must be one of ${field.options.join(', ')}`); break;
      case 'json': if (typeof value !== 'object') problems.push(`${field.label} must be JSON`); break;
      case 'url': if (!/^https?:\/\//i.test(String(value))) problems.push(`${field.label} must start with http:// or https://`); break;
      default: if (typeof value !== 'string') problems.push(`${field.label} must be text`);
    }
  }
  if (table.table === 'destinations' && Array.isArray(row.levels)) {
    const levels = row.levels as Record<string, unknown>[];
    if (!levels.length) problems.push('Runner missions needs at least one level');
    if (levels.some(l => !l || typeof l.id !== 'string' || typeof l.number !== 'number' || !l.mission || typeof l.mission !== 'object')) problems.push('Each runner mission needs an id, number and mission');
    if (new Set(levels.map(l => l?.id)).size !== levels.length) problems.push('Runner mission IDs must be unique');
  }
  if (table.table === 'history_questions' && Array.isArray(row.options) && typeof row.answer === 'string' && !(row.options as string[]).includes(row.answer)) {
    problems.push('Answer options must include the correct answer');
  }
  return problems;
}

export const sqlType = (type: FieldType): string => ({
  text: 'text', longtext: 'text', url: 'text', select: 'text', int: 'integer', number: 'double precision',
  bool: 'boolean', date: 'date', datetime: 'timestamptz', textlist: 'text[]', json: 'jsonb',
} as const)[type];
