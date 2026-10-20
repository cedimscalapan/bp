# Investigations, learning, and research status

**Current Adventure experience:** Playable investigations and their seals have been removed. Each local destination now has twelve runner missions. See `HISTORY-RUNNER-EXPANSION.md`; the investigation details below document the retired implementation.

**Current learning experience:** The scored learning-game hub and its memory, sorting, planning, and recognition/word challenges have been removed at the user’s request. Learn now offers relaxed character tracing, word tracing, writing practice, and saved drawings. Earlier records are retained for backup compatibility. The game descriptions below document the previous implementation, not currently available Learn activities.

## What is implemented

Forty-seven new, data-driven community investigations cover Calapan City and the fourteen municipalities. Content quantity follows the available evidence: places have two to four investigations according to the material available. Their tasks use seven mission families and five interaction types (chronology/process ordering, matching, evidence classification, decisions, and constrained budgets). They are playable from each destination's **Investigate this community** section. Source-linked briefings, local fictional sprites, and distinct municipal tokens support the tasks.

A correct answer to one question is insufficient: every task must be solved. Failed checks permit revision; hints expose guidance and count as assistance. Leaving explicitly records practice only. First completion earns 40 coins and 30 XP once per investigation; replays record review without repeating currency rewards. An additional investigation seal requires every investigation for the place. Existing runner missions, five-mission stamps, IDs, and previously earned progress are unchanged.

The evidence layer reuses 75 existing discoveries. It does not pretend that new historical research has been completed. Timelines link the actual existing claims for 1929, 1953, 1963, and 1998. Craft/production sequences and supplies are original teaching scenarios, not assertions about historical methods, recipes, prices, or current community regulations.

Learning adds Memory Expedition (3/5/8 sound–glyph pairs), Word Sorting Lab (2/3/4 categories with increasing item counts), and Community Planner (two or three needs and constrained budgets). An optional clock is off by default. Tap controls, native selects, and buttons work with keyboards; dragging is never required. Advanced Shape Detective distinguishes vowel forms of one character. Growing/advanced Word Builder adds distractor letters, Undo, Clear, and whole-word checking instead of revealing correctness after each letter.

## Persistence and compatibility

Existing `version: 1` saves remain readable. `Save.investigations` and `LearningProgress.records` are optional maps, created when a player uses the new activities. Existing backups need no destructive migration. New maps are validated on import; malformed counters are rejected. Records separate attempts, incorrect checks, hints, completion, unassisted completion, and review. A completed assisted session is practice, not evidence of unassisted mastery. Currency rewards cannot repeat on review.

Unassisted completion is a game metric, not a validated educational assessment. Tracing still does not automatically score handwriting. Hanunó’o script matching, the sourced small Hanunó’o lexicon, and Tagalog spelling exercises remain distinct.

## Research deliverables and blocker

- `src/data/community-library.json`: 75 claim records, 69 source records, and fifteen seven-topic dossiers.
- `docs/research/dossiers/`: readable per-place dossiers, including name/identity, settlement, administration, major history, livelihoods, culture, and environment/civics.
- `docs/research/COVERAGE.md`: all-place coverage and explicit research gaps.
- `docs/research/MISSION-MATRIX.md`: content and interaction mapping for all 47 new investigations.
- `docs/research/source-access.json`: current retrieval evidence.

Live requests to the provincial planning history, Calapan history, and Supreme Court legal source were denied by the environment HTTPS proxy with **403 Forbidden**. This is an environment network restriction, not a finding that the historical records do not exist. Research domains were saved to the environment draft, but the draft does not apply them to the running machine. No new founding date, founder, etymology, or early-settlement claim has been invented to fill this gap.

Publication dates, document pages, current access dates, and cross-source verification remain explicitly unknown for inherited sources. Previously documented legends remain oral accounts rather than verified origins. Dossiers do not equate legal municipality creation with the beginning of habitation.

After the research allowlist is applied, run `python3 scripts/verify-community-sources.py` from the repository to retrieve the used citations. It saves retrieval evidence and caches documents outside the checkout. HTTP 200 alone is not verification: an editor must read the relevant section, cross-check important claims, fill page/section and conflict notes, and only then promote content. Never automatically convert a successful download into a verified historical claim.

Rebuild inherited library/dossiers with `python3 scripts/build-community-library.py`. Rebuild investigation configuration with `python3 scripts/build-investigations.py`. These scripts do not research or authenticate claims.

## Validation and remaining work

Automated checks cover every configured task's feasibility, all-place coverage, source/claim references, invalid and over-budget submissions, no rewards for unfinished work, one-time rewards, investigation seals, and legacy/new backup round trips. Browser checks exercise complete and aborted investigations, hint/review statistics, learning interactions, gameplay, and persistence. These checks do not replace source verification or playtesting with different ages.

Remaining research: source retrieval and page-level checking; corroborated name histories; earliest documented communities; migration and settlement chronology; major local historical events; differing accounts; community review of Indigenous attribution. Do not represent the dossier headings as completed research in these areas. Difficulty and wording also need human playtesting, including early readers and keyboard/screen-reader users.

## Attributed candidate-claim integration

`src/data/research-notes.json` contains 15 attributed, unverified research leads, one per place. They appear under **Research in progress** in place introductions, journals, and investigation briefings. No candidate is eligible as an established factual quiz answer. Seven additional source-comparison inquiries ask how to investigate a conflict, hypothesis, or inference; completing them rewards reasoning rather than accepting a disputed claim. The library stores these separately as `candidateClaims`, retaining the existing 75 discovery records.

Examples include the Socorro 1962/1963 disagreement, the Bulalacao–Mait identification hypothesis, Calapan capital-transfer chronology, and limits of settlement or community-attribution inferences. Source access is still blocked; inclusion is not verification. No tourist-attraction or festival cases were imported.
