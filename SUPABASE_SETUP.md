# Supabase (PostgreSQL) and the KaPamana admin dashboard

KaPamana keeps its game content in a Supabase PostgreSQL database, managed from an admin dashboard at **`/admin`** with full create, read, update and delete (CRUD).

The game stays **offline-first**. Without Supabase settings it runs exactly as before, using the content bundled in the app. With Supabase, published content is downloaded at launch (capped at 2.5 seconds), cached on the phone, and used offline afterwards.

## What is in the database

| Table | What it holds | Seeded rows |
| --- | --- | --- |
| `announcements` | **News & updates** shown on the Adventure screen (update, news, event, advisory; pin, schedule, image, link) | 1 |
| `destinations` | Every adventure stop: name, group, artwork, keepsake and its **runner missions** (levels JSON) | 69 |
| `heritage_profiles` | Heritage journals: introduction, collectibles, discoveries, visitor challenge, recap, journal story, barangay count | 15 |
| `history_questions` | Readings and quiz questions unlocked by missions 6+ | 105 |
| `investigations` | Learning Studio challenges and their tasks | 47 |
| `cultural_profiles` | Living heritage, traveler values, origins | 15 |
| `research_notes` | Attributed research leads (never quiz answers) | 15 |
| `municipal_guides` | Local tokens, passport art and story-guide sprites | 15 |
| `sources` | Citations shown under "Sources" | 69 |
| `shop_powerups`, `shop_companions` | Shop names, prices and descriptions | 7, 4 |
| `profiles` | One row per account and its role: `learner` (shown as *traveler*), `editor` or `admin` | — |
| `player_saves` | Optional cloud backup of a traveler's save (coins, XP, missions, Buddies…) | — |
| `content_audit_log` | Every content change and every admin adjustment to a player's save | — |

Every content table also has `sort_order`, `is_published` (drafts are hidden from travelers), `created_at`, `updated_at` and `updated_by`.

> Shop item and buddy **IDs** decide in-game effects, so edit the names, prices and descriptions of existing IDs. A new power-up ID needs code support and artwork (`/assets/powerup_<id>.webp`).
> Image fields accept a file name from `public/assets` or a full `https://` URL (for example one uploaded with the dashboard's **Upload** button).

## Who can do what (row level security)

| Who | Can do |
| --- | --- |
| Anyone (not signed in) | Read **published** content |
| Traveler | The above, plus read and write **their own** cloud save and profile name |
| Editor | Full CRUD on all content, including drafts. Read the activity log |
| Admin | Everything an editor can, plus **Players & cloud saves** (view, adjust, delete) and **Users & roles** |

Nobody can promote themselves, the last admin can't be demoted, and every admin change to a player's save is logged. `supabase/tests/rls-test.sql` checks all of this (`npm run db:test`).

## The live project

| | |
| --- | --- |
| Organization | **CEDIMS** (free plan) |
| Project | **kapamana** · ref `pkosielivjvkgiialjda` · region `ap-southeast-1` (Singapore) |
| API URL | `https://pkosielivjvkgiialjda.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/pkosielivjvkgiialjda |

The schema, security policies, storage bucket and all content are already applied. The app is connected through the committed `.env` file, which holds the URL and the **publishable** key; both are public by design. Every build, including the GitHub Actions APK, uses it automatically. To point a local build at a different project, create a git-ignored `.env.local`. **Never** put the `service_role`/secret key in the app.

### Accounts come first

When the app opens, travelers **create an account or sign in before anything else**. Only then do they see the welcome screen (choose a Buddy) and the game. The session is kept on the phone, so reopening the app (even offline) goes straight to the game. Signing out returns to the account screen. On a new phone, signing in restores the adventure.

**Required project setting: turn off "Confirm email".** In the dashboard open **Authentication → Sign In / Providers → Email** and switch **Confirm email** off, then **Save**.
Why: Supabase's built-in mailer only delivers to members of your Supabase organization and only a few emails per hour. While confirmation is on, sign-ups from any other address fail (`email_address_not_authorized`), and the confirmation link lands on `http://localhost:3000` (the default Site URL). With confirmation off, sign-up logs the traveler in immediately: no email, no link, no localhost page.
If you ever want confirmation emails, first set up custom SMTP (**Authentication → Emails → SMTP Settings**) and set **Authentication → URL Configuration → Site URL** to a real web page. The app already handles that mode: it shows a "Confirm your email" screen that explains the link and continues after confirmation.

**Forgot password:** emailed reset links have the same mailer limits, so password resets go through an admin. In the admin dashboard choose **Users & roles → Set password** (`public.admin_set_password`, admin-only and recorded in the activity log), then share the new password with the traveler privately.

### First admin (one time)

1. Open the game. The first screen asks you to **create your traveler account**.
2. In the dashboard **SQL Editor** run:
   ```sql
   select public.promote_to_admin('you@example.com');
   ```
3. **Travel settings → Open admin dashboard** (or open `/admin` in a browser running the web build). Promote others under **Users & roles**.

### Setting up another project from scratch

Run, in order, in the SQL Editor (or `supabase db push` with the CLI):
1. `supabase/migrations/20261102000000_kapamana_core.sql`
2. `supabase/migrations/20261102000100_kapamana_storage.sql`
3. `supabase/seed-from-github.sql` (10 KB; the database downloads the game JSON from this repo at a pinned commit) **or** `supabase/seed.sql` (570 KB, self-contained). Both produce identical rows.

## Using the dashboards

Open **Travel settings → Open admin dashboard** in the app, or `/admin` in a browser running the web build. What you see depends on your role.

| | Editor dashboard | Admin dashboard |
| --- | --- | --- |
| **Home** | Quick actions (**+ Post news**, places & missions, quiz questions, shop prices); stats; **Needs attention** (records with problems, drafts, scheduled or expired news, each one click from its editor); **Recent changes** | Everything editors see, plus **People** (accounts, roles, new sign-ups) and **Top travelers** |
| **Content** | Menu grouped by purpose: News · Places & missions · Learning · Shop · References. Each table can search, filter (Published / Drafts / **Has problems**), add, edit, duplicate, delete, publish or unpublish, and export JSON | Same |
| **Editing** | Typed forms. Structured data (runner missions, tasks, journals, rewards) opens as a **form**: cards for each item with **Add**, **Duplicate**, **↑ ↓**, **Remove**, plus a **JSON** tab for advanced edits. News shows a **live preview** | Same |
| **History** | **Activity log**: who changed what, **Details** (before/after per field), **Restore previous version** or **Restore deleted record**, and **Only my changes** | Same, plus player-save adjustments and password resets |
| **People** | — | **Players & cloud saves** (adjust coins/XP/name, download, delete) and **Users & roles** (traveler/editor/admin, **Set password**) |

Records with problems (for example a quiz answer that isn't one of its options) are flagged everywhere and **skipped by the app** until fixed, so the built-in version is shown instead. Players never see broken content.

## How cloud saves work

- Signing in on a phone with no cloud backup uploads that phone's save.
- Signing in on a fresh phone restores the cloud save. If both have progress, the traveler chooses which to keep.
- While signed in, every save uploads about 2 seconds after it changes. Offline changes upload on the next launch.
- **Sign out** keeps the progress on the phone. **Delete cloud backup** removes only the copy in the cloud.

## For developers

- `src/admin/content-schema.ts` is the single source of truth, used by the SQL generator, the content overlay and the dashboard forms. After changing it run `npm run db:generate`. For a live database, write a new incremental migration.
- `src/main.tsx` applies database content (`src/cloud/content-sync.ts`) and pulls a newer cloud save (`src/cloud/save-sync.ts`) **before** importing the game, so data derived at import time reflects the database. `/admin` loads `src/admin/admin-main.tsx` instead.
- A table is replaced only when it returns at least one valid row, so an empty or unreachable database never blanks the game.
- Tests: `npm test` covers schema round-trip, form conversions, overlay and announcements. `npm run db:test` runs the migration, seed and security rules on a real Postgres (set `PGHOST`, `PGUSER`, …).
