# Runner-first community adventures

Every Oriental Mindoro locality now has twelve runner missions, for 180 local missions. The original five IDs, definitions, and completions are retained. Missions 6–12 add name/identity, early communities and settlement, historical milestones, community memory, regional-history context, living heritage/practical skills, and identity/traveler values. The seven additions vary stars, keepsakes with survival, score, hazard dodging, and a damage-limited capstone. They use the existing local sprite, token, and stamp artwork.

The playable investigation menu, investigation modal, and investigation seals were removed from Adventure and Passport. Archived research/configuration and old investigation progress remain readable for compatibility, but are not active game activities. Learn remains the relaxed tracing/practice experience. The airplane artwork on the home travel-crew card is replaced by `travel_jeepney.webp`.

## Historical limits

Content is drawn from the existing attributed discoveries and research notes. Name stories are not converted into proven etymologies. A municipal creation, town-seat transfer, or cityhood date is not described as the first habitation of a place. Where the available material does not establish an origin, founder, earliest settlement, or major event chronology, the briefing states the gap. No sole discoverer or exact settlement date is invented. The Mait identification remains a hypothesis; reported administrative-date conflicts remain visible.

These are additional historical teaching routes, not a claim that 105 new primary-source facts were discovered. Earlier network restrictions on source verification remain unresolved. The regional-context route compares the already cited 1929, 1953, 1963 and 1998 milestones. Festivals and sightseeing itineraries are excluded.

Generate the new configuration and briefings with `python3 scripts/expand-history-runners.py`. The generator truncates local configurations to their original five before re-appending the same seven new IDs, so it can be run repeatedly without duplicating missions. `src/data/runner-history.json` stores the mission-specific text, evidence status, sources, and questions.

## Progress compatibility

Existing `version: 1` backups remain supported. A separate `runnerCampaignVersion: 2` marker identifies the expanded campaign. When an older save lacks the marker, earned Oriental Mindoro level-five stamps are recorded in `legacyStamps`; those stamps and journals remain earned. The new runners unlock sequentially after the preserved missions, so players who completed five can continue at six. New players earn stamps and journal completion after all twelve runners. Old investigation records are retained without appearing in Adventure.

Validation covers all 180 configurations through deterministic careful-play simulations without paid upgrades, all briefing/question/source links, ten unique sequential IDs per locality, old-stamp migration, and the sixth mission’s unlock behavior. Human playtesting is still needed to assess fun, difficulty, and reading level.

## Cultural identity and origins

Each place has a source-linked cultural profile in `cultural-profiles.json`, shown in its introduction and journal. The profile distinguishes documented skills from original traveler values; no claim is made that every resident holds identical beliefs or practices. Indigenous community attribution and reuse permissions remain explicit. Earlier communities and settlement records are presented without inventing a sole discoverer. The source material used here does not establish a single discoverer for any of the fifteen places; this is a limitation of the available evidence, not proof that no other records exist.
