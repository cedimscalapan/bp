# KaPamana: culture in every adventure

Status: original design plan. Introductions, discoveries, visitor-care prompts and badges, recaps and journals are implemented in version 1.7.0; see HERITAGE-IMPLEMENTATION.md for exact scope. Festivals stay in a separate future collection.

## Player experience

Each destination keeps its five short missions, with one learning purpose per mission:

1. **Meet the place:** a 30–45 word introduction and one landmark fact before the run. Always skippable and replayable.
2. **Everyday life:** collect an item linked to a verified livelihood, food or local environment. Introduce its meaning in the boarding card; never interrupt falling items with text.
3. **Living traditions:** reveal a sourced story about a practice, craft, language or community. Use a different approved story for each place rather than assigning a generic tradition to everyone.
4. **Care for our heritage:** an environmental or respectful-visitor challenge, such as avoiding litter or protecting a habitat. Teach actions through gameplay, then explain their real-world meaning.
5. **Bring the story home:** complete the run, optionally answer a one-question recap, and unlock a heritage journal page. Wrong answers offer explanation and retry; no lost lives or erased run rewards.

After every run: show one fact card (about 20–35 words), a relevant picture, and a “Read the story” button. Keep earned XP and scores separate from quiz rewards. Journal entries retain sources, audio transcripts and last review dates. Endless mode remains uninterrupted; reveal discoveries at the end.

## First content batch: all 15 places

The following are **research and design candidates**, based on the user's chosen reference images. They are not verified claims of exclusive local products or traditions. Existing shared sprites are illustrative keepsakes, not municipal emblems. Research must replace placeholders before educational publication.

| Place | Reference-led identity topic | Proposed playable connection | Cultural research to complete |
|---|---|---|---|
| Calapan City | Cathedral and city life | Find architectural details; earn a heritage page | Building history, community stories, religious visitor etiquette |
| Puerto Galera | Bay and beach | Coastal stewardship and a shell-shaped keepsake | Maritime history, livelihoods and responsible shore visits; clarify that players do not collect live shells |
| San Teodoro | Rocky river cascades | Follow a freshwater trail; avoid driftwood | Local place names, river use and community conservation |
| Baco | Mountain landscape | Earn a mountain souvenir through a trail challenge | Mountain history, access rules and community-authorized stories |
| Naujan | Lake landscape | Recognize fish and protect a wetland habitat | Fishing livelihoods, lake ecology and lakeside histories |
| Victoria | Fruit-basket monument | Match produce with the monument's shapes | Monument history, locally documented agriculture and food traditions |
| Socorro | Lakefront boardwalk | Explore the waterfront; complete habitat tasks | Lakefront livelihoods, site history and place names |
| Pola | Town plaza and coastal identity | Discover the plaza and shoreline | Town history, built heritage and fishing-community stories |
| Pinamalayan | Pot-and-rainbow landmark | Collect a clay-pot souvenir; reconstruct a journal illustration | Meaning and history of the monument; do not infer a pottery tradition from its appearance |
| Gloria | Palm-lined shore | Coconut-themed discovery and shore care | Verified agriculture, food preparation and local coastal livelihoods |
| Bansud | Banana gateway | Banana keepsakes and farm-to-market challenges | Gateway meaning, documented produce and farming stories |
| Bongabong | River and footbridge | Cross a river route and avoid debris | River livelihoods, local history and appropriate visitor behavior |
| Roxas | Cave reference | Observe formations without collecting or breaking them | Confirm the cave's name, exact location, access and heritage context |
| Mansalay | Beach and community setting | Shore stewardship and a journal discovery | Municipality-specific cultural histories; community-reviewed craft/language material if relevant |
| Bulalacao | Curving sandbar | Learn tides and island stewardship | Confirm site name, island livelihoods and locally applicable visitor rules |

## Editorial process

Use municipal tourism/cultural offices, provincial heritage staff, documented publications and local contributors. Record sources per fact rather than only per destination. Photographs supplied for art direction do not prove historical claims. Distinguish verified history, community accounts and legends. Do not invent quotations, language translations or named traditions.

The provincial website presents Mangyan communities, Halcon, tamaraw and Naujan Lake as provincial identity themes. It also describes multiple distinct Mangyan communities. These can guide research, but not justify assigning one community's language, motif or practice to another municipality or community.

For Indigenous stories, names, recordings, crafts and motifs: identify the relevant community and contributor, agree on attribution and reuse permission, and have that community review the specific content before publication. Exclude restricted knowledge and sacred objects from pickups, hazards or purchasable powers. No generic “Mangyan costume” or invented writing. Use narration by appropriately credited contributors with transcripts.

Initial reference sources:

- [Province of Oriental Mindoro](https://ormindoro.gov.ph/): provincial identity overview.
- [Provincial overview](https://ormindoro.gov.ph/about/): distinct communities and provincial context.
- [Official tourism portal](https://www.travelorientalmindoro.ph/): destination research starting point.
- [Provincial Tourism Office services](https://ormindoro.gov.ph/wp-content/uploads/2024/01/Provincial-Tourism-Office.pdf): heritage center and cultural affairs contacts/services.

## Data and implementation

Add `src/data/heritage/<destinationID>.json` with `destinationID`, `intro`, `identityTopics`, `stories`, `facts`, `traditions`, `visitorCare`, `quiz`, `sources`, `reviewedOn`, `reviewStatus`, `contributorCredits`, `mediaPermissions` and `translations`. Give every fact/story a stable ID, source IDs and locale. Only `approved` records appear in the shipped app.

Connect optional `heritageStoryId` and `learningGoal` to each level. Keep culture separate from collision/scoring logic. Add reusable `PlaceIntro`, `DiscoveryCard`, `HeritageJournal` and `RecapQuestion` components. Store read/unlocked IDs in the save with backward-compatible defaults; keep existing mission IDs and progress. Reuse the same destination data in previews, runs and journal pages.

All text and small illustrations ship offline. Offer English and Filipino first; add community languages only after reviewed translations. Optional narration downloads should disclose size and provide a text equivalent. Support text scaling, strong contrast, reduced animation and non-color-only pickup cues. Narration never competes with essential hazard sounds.

## Delivery phases and acceptance

1. **Pilot:** review Calapan City, Victoria and Naujan content; build intro, result facts and journal. Confirm short text works on 360px phones and all cards can be dismissed/reopened.
2. **Gameplay learning:** add the five-mission structure and optional recaps. Test wrong-answer retry, run rewards, old-save upgrades, pause and endless mode.
3. **Province coverage:** approve content for the remaining 12 places, then add contributor-recorded audio and reviewed translations. No unapproved placeholders reach the app.
4. **Evaluate:** ask local reviewers and sample players whether they can recall a place-specific fact, distinguish story from history, and explain respectful visitor behavior. Revise confusing content. Keep festivals as a separate later project.

Definition of done: all 15 locations have an approved introduction, five linked learning goals, at least three sourced facts, one reviewed tradition/community story where documented, a visitor-care tip, an optional recap and a journal page; content has proper credits and permissions; the app remains fully playable offline.
