/**
 * Collects the content currently bundled in KaPamana so it can be exported to Supabase.
 * Used only by scripts/generate-supabase-sql.ts and tests — never imported by the app bundle.
 */
import type { ContentTableName } from './content-schema';
import catalog from '../data/catalog.json';
import heritage from '../data/heritage.json';
import runnerHistory from '../data/runner-history.json';
import investigations from '../data/investigations.json';
import culturalProfiles from '../data/cultural-profiles.json';
import researchNotes from '../data/research-notes.json';
import municipalAssets from '../data/municipal_assets.json';
import { powerups, companions } from '../model';

type AnyRecord = Record<string, unknown>;

export function bundledContent(): Record<ContentTableName, AnyRecord[]> {
  return {
    announcements: [{
      id: 'welcome-kapamana-online',
      title: 'Maligayang pagdating, Traveler!',
      body: 'KaPamana places, missions and stories can now be refreshed by the KaPamana team without a new app download. Your progress stays on this device unless you sign in to back it up.',
      category: 'update',
      pinned: true,
    }],
    destinations: catalog,
    heritage_profiles: heritage.profiles,
    history_questions: runnerHistory,
    investigations,
    cultural_profiles: culturalProfiles,
    research_notes: researchNotes,
    municipal_guides: municipalAssets,
    sources: heritage.sources,
    shop_powerups: powerups,
    shop_companions: companions,
  } as unknown as Record<ContentTableName, AnyRecord[]>;
}
