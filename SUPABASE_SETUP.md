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

## Setup (about 10 minutes)

1. **Create a project** at [supabase.com](https://supabase.com). The free tier is enough.
2. **Create the tables.** In **SQL Editor**, run these in order:
   1. `supabase/migrations/20261102000000_kapamana_core.sql`
   2. `supabase/migrations/20261102000100_kapamana_storage.sql` (the `content-media` image bucket)
   3. `supabase/seed.sql` (all current game content; safe to run again)

   With the Supabase CLI instead: `supabase link --project-ref <ref>`, then `supabase db push`, then run `seed.sql` once.
3. **Connect the app.** Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```
   **Never** use the `service_role` key in the app. For the GitHub Actions APK, add the same two values as repository secrets (**Settings → Secrets and variables → Actions**). `.github/workflows/android-apk.yml` already passes them to the build.
4. **Create your account.** In the game open **Travel settings → Account & cloud backup → Create an account**, and confirm the email if your project requires it.
5. **Make yourself admin.** In the SQL Editor run:
   ```sql
   select public.promote_to_admin('you@example.com');
   ```
6. Open **Travel settings → Open admin dashboard** (or go to `/admin` in the browser). You can promote others under **Users & roles**.

## Using the dashboard

- **Overview:** published and draft counts per table, accounts, travelers with a cloud backup, and changes in the last 7 days.
- **Each content table:** search, filter by published or draft, **+ New**, **Edit**, **Duplicate**, **Delete**, click a status to publish or unpublish, and **Export JSON**. The forms are typed and check required fields and JSON before saving. Destinations must keep at least one runner mission with unique level IDs, and history answers must be among their options. The database checks these rules again.
- **Players & cloud saves:** see each traveler's level, coins, XP and stars. **Adjust** the name, coins or XP (the app's own save validation runs first), **Download** the save JSON, or **Delete** the cloud backup. The phone picks up an adjustment the next time the game opens online, unless it has newer unsynced progress.
- **Activity log:** the latest 200 changes, with who made them and which fields changed.

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
