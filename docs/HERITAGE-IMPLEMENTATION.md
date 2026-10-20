# Applied heritage content — KaPamana 1.7.0

The research was applied at the user's explicit request without an additional factual verification or community review round. Its source/evidence labels remain intact. This is not a claim that community permissions or independent verification have been obtained.

## Shipped behavior

- All 15 destination details show a short introduction, local-life collectible connection, visitor-care challenge and source links.
- Each existing mission is linked by number to one of the destination's five discoveries. Mission titles use discovery headings. Mission IDs and difficulty definitions remain unchanged, preserving completed progress.
- After any completed run, including an unsuccessful attempt, the corresponding discovery is saved and shown with its sources. Legends and oral accounts are labeled separately.
- Destination keepsake names and images now reflect the first recommended collectible. New symbolic ticket, photo, basket, craft-panel and food-parcel icons are original vector tokens, not replicas of Indigenous patterns. Existing suitable produce artwork is reused. The second collectible remains a research alternative, rather than a second falling-item type.
- Mission four presents the place's visitor-care challenge and awards a Careful visitor badge for a successful run with no hits. The challenge is a learning prompt; the existing runner does not simulate every described real-world action such as food sorting, asking permission, or following a boardwalk.
- The optional recap permits retries, supplies the answer after a wrong choice and never removes coins, scores or travel progress. A correct answer saves a reflection badge.
- The Passport includes a journal entry for every Oriental Mindoro destination. Mission five unlocks its journal story; quizzes are not required. Previously completed missions make their discoveries available even in older saves.
- New discovery, recap and care-badge arrays persist through the existing save/backup system. Old saves receive empty defaults; existing completed missions and coins remain intact.
- Stories and questions work offline. Following an external source link requires connectivity.

## Files and editorial scope

`src/data/heritage.json` is the shipped content subset. `docs/research/` remains a dated research snapshot; its original unpublished-draft flags describe that snapshot, not the runtime publishing decision. Draft introductions were adapted into player-facing text for selected places without adding new factual claims. Internal verification gaps and editorial notes are not part of the player interface.

The 75 discoveries include ecology, civic/built history, livelihoods and oral tradition. They do not claim a unique living tradition for every municipality. No verse, Indigenous script, practitioner recording or festival content was added.

## Validation

Coverage tests ensure 15 matching destinations and five sourced discoveries per destination. Progress tests cover failed-run discoveries, repeat visits, no-hit care badges, optional recap independence, journal unlocks, old-backup defaults and malformed heritage progress. Mobile browser checks exercise an actual run, result discovery, wrong/correct recap, journal viewing and persistence. Android packaging is version 1.7.0, version code 13, with the existing install identity retained.
