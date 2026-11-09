# Chapter 1 Introduction

## Background of the Study

Oriental Mindoro comprises Calapan City and 14 municipalities (Philippine Statistics Authority [PSA], 2025). Its places, celebrations, local histories, and living traditions offer many entry points for cultural learning. A mobile application can make these subjects available during short, repeatable activities, but a digital representation must be careful about what it claims to preserve. The UNESCO Convention for the Safeguarding of the Intangible Cultural Heritage describes festive events, oral traditions, knowledge, and skills as living heritage recognized by communities themselves. It places respect for the communities concerned alongside education and awareness raising (UNESCO, 2003). A game can support awareness; it cannot replace the people who practice, interpret, and transmit a tradition.

The Hanunóo writing tradition illustrates both the opportunity and the responsibility. The Library of Congress describes distinct Mangyan communities and identifies Hanunóo and Buhid writing traditions in Mindoro (Library of Congress, n.d.). The National Commission for Culture and the Arts (NCCA, n.d.) relates the ambahan tradition to Hanunóo Mangyan cultural practice. Unicode documents the Hanunóo characters and their vowel signs (Unicode Consortium, 2025). These sources support an introductory character lesson, but a software-generated spelling is not a translation into the Hanunóo language, and a tracing exercise is not an assessment of culturally accepted handwriting.

KaPamana was developed to connect place-based learning with an accessible mobile game. A traveler chooses a Buddy, opens an adventure, completes a three-lane runner mission, reads a place-based discovery, and records progress in a passport. A learning area introduces Hanunóo characters, word spelling practice, finger tracing, and a saved image that the user can share through the device. The project also contains an editor and administrator interface for maintaining content and a Supabase-backed account save with local storage for continued use when connectivity is interrupted. The app is an independent educational prototype, not an official government or community archive.

The current repository grew from a migration of BuddyPort game materials into an Ionic React and Capacitor implementation. Recovered game concepts and assets are attributed to their original source in the repository; the Oriental Mindoro routes, learning functions, and festival-inspired material were developed for KaPamana. This distinction matters because a technical migration does not prove that every original game behavior has been reproduced, and generated festival artwork should not be presented as documentary photography. The present study therefore describes the implemented system and the evidence available for it, without claiming measured educational impact or formal cultural validation that has not been conducted.

## Statement of the Problem

The central problem is how to design and implement a mobile application that introduces Oriental Mindoro heritage through interactive play and practice while keeping cultural claims, player progress, and system behavior understandable and reliable. Specifically, this study addresses the following questions:

1. How can the app organize place-based and festival-inspired content for Calapan City and the 14 municipalities in short, understandable activities?
2. How can a selected Buddy remain the playable character while destination or festival characters serve as guides?
3. How can mission results, discoveries, rewards, and passport records give the traveler coherent feedback and maintain progress across sessions?
4. How can the learning area introduce Hanunóo characters, script spelling practice, tracing, and image sharing without presenting transliteration as translation or claiming to judge authentic handwriting?
5. How can the app retain progress locally, synchronize an account-linked copy when available, and restrict access to each traveler's data?
6. What implementation checks can establish that the current build works, and what additional evaluation is needed before educational or cultural effectiveness can be claimed?

## Objectives of the Study

The general objective is to develop and document KaPamana, a mobile application for interactive learning about Oriental Mindoro's culture and heritage, with game, learning, passport, and data-management features that can be demonstrated and tested.

The specific objectives are to:

1. provide a structured Oriental Mindoro adventure covering the province's 15 local government units, with missions linked to sourced place information;
2. provide festival-inspired routes with runner objectives, route artwork, keepsakes, guide characters, and passport progress while retaining the traveler's chosen Buddy as the runner;
3. implement mission feedback through objectives, scores, rewards, stars, discoveries, and saved progress;
4. implement an introductory Hanunóo learning area with character lessons, limited vocabulary, spelling conversion, tracing, saved drawings, and a complete story-image export;
5. provide local persistence and account-linked cloud backup with conflict handling and role-based protection of content and player saves; and
6. verify the build and core functions using repeatable checks, and specify a responsible protocol for later usability and cultural-content evaluation.

## Conceptual Framework

The system follows an input-process-output model with a feedback loop. Inputs include selected place and festival content, script references, artwork, player actions, and account data. The app transforms these through game rules, feedback, learning exercises, storage, and synchronization. Outputs include a completed mission, passport progress, saved practice, and a shareable tracing image. Test results and content review feed back into later revisions. This model describes the software workflow, not a proven causal relationship between gameplay and cultural knowledge.

**Table 1**

*Conceptual Framework*

| Element | KaPamana implementation | Expected observable output |
| --- | --- | --- |
| Inputs | Catalog records, attributed heritage text, Unicode-based character rules, generated and recovered art, touch input, optional account session | Selected destination, mission, word, or tracing target |
| Processes | Runner simulation, objective evaluation, discovery display, character rendering, drawing capture, local save, content fetch, cloud sync | Updated score and progress, rendered script, stored drawing |
| Outputs | Mission result, stars and rewards, passport record, learning progress, 1080 × 1920 story PNG | Screens and files that the user can inspect or export |
| Feedback | Unit tests, build checks, device demonstration, planned usability and cultural review | Corrections to code, wording, sources, artwork, and interaction design |

## Significance of the Study

For learners and travelers, the project provides short encounters with place information and a way to revisit discoveries. The passport and saved work make progress visible, while the story image allows a user to retain a record of practice. These are design intentions; whether they improve learning requires a separate study.

For teachers and cultural educators, KaPamana can serve as a supplementary prompt for discussion about local history, festivals, and the difference between a writing system and a language. It should be used with primary materials and, where appropriate, with instruction from community knowledge holders. For cultural communities, the project's value depends on accurate attribution, review, and respectful representation; the present build does not claim community endorsement. For local content editors, the dashboard offers a way to correct, update, draft, or remove records without releasing a new mobile build. For future developers, the repository provides an example of an offline-capable game that separates local progress, account backup, published content, and cultural learning activities.

## Scope and Delimitations

This study focuses on the current KaPamana Android-oriented application and its Oriental Mindoro learning functions. The bundled active catalog contains 64 destinations and 407 runner missions after the archived International group is filtered from the interface. Within that catalog, the Oriental Mindoro group contains 15 destinations and 180 missions; the Oriental Mindoro Festivals group contains 18 curated festival-inspired routes and 72 missions, four per route. The 18 routes are distributed across Calapan City and the 14 municipalities, with multiple routes assigned to Calapan. These numbers describe the repository snapshot reviewed for this manuscript; published server content can change independently. The festival list is a curated app catalog and is not asserted to be an exhaustive or official register of every festival in the province.

The runner uses three lanes, mission objectives, hazards, collectibles, Buddy abilities, and a result screen. Passport records include stars, stamps, and related progress. The learning area covers 18 base Hanunóo characters, limited vocabulary and practice words, mechanical rendering of supported Latin input into script characters, finger or stylus tracing, saved drawings, and image export. The converter is for script-spelling practice. It does not translate Filipino or English meaning into the Hanunóo language, infer pronunciation, prescribe stroke order, or verify handwriting authenticity. The app generates a 1080 × 1920 PNG for saving or handing to the Android share sheet; whether a social platform accepts or publishes that image depends on the installed app and the user's action.

On the configured build, a traveler creates an account or signs in before first use. Progress is written locally through Capacitor Preferences and can be synchronized to an account-linked Supabase row when a session and connection are available. Existing signed-in sessions can use cached content and local progress during a connection interruption; a new account or fresh sign-in requires connectivity. The study does not evaluate long-term retention of cultural knowledge, compare the app with classroom instruction, establish the accuracy of every festival narrative through community review, test every Android model, or claim production readiness. Generated artwork is illustrative and is not evidence of a real festival's appearance. The project has no documented participant survey, controlled learning experiment, or formal cultural consultation as of this manuscript.

## Definition of Terms

**Buddy** is the traveler's selected playable runner. A festival guide is a separate non-playable character associated with a route. **Destination** is a catalog entry that groups missions and artwork for a place or festival. **Mission** is a runner level with an objective, time or score conditions, and a result. **Passport** is the in-app record of stars, stamps, destinations, and other progress. **Discovery** is a short, attributed learning item shown in connection with a mission or journal. **Transliteration** is a rule-based rendering of written input into another script; in KaPamana it is limited spelling practice and not translation of meaning. **Tracing story** is the PNG generated from a saved drawing for download or device sharing. **Local save** is the validated progress object stored on the device. **Cloud backup** is an account-linked copy stored in Supabase. **Row-level security** refers to database rules that control which rows a user may read or change.

# Chapter 2 Review of Related Literature and Studies

## Introduction

This chapter reviews sources that inform the app's cultural framing, script learning, game-based activities, mobile delivery, and data stewardship. The sources do not serve as evidence that KaPamana has already improved learning. They instead identify design principles, comparable systems, and limits that should shape both implementation and future evaluation.

## Local Heritage and Community Participation

The PSA's Philippine Standard Geographic Code lists Oriental Mindoro as one city, Calapan, and 14 municipalities (PSA, 2025). This provides a stable geographic frame for the place-based catalog. Administrative coverage, however, is not the same as cultural coverage: a municipality can contain multiple communities and traditions, and a named festival cannot be assumed to represent every resident. Consequently, KaPamana stores place and festival content as individually editable records, with sources and contextual notes, rather than treating province-wide identity as a single narrative.

UNESCO (2003) defines intangible cultural heritage in relation to communities' recognition and continuing practice. Its convention identifies festive events and oral traditions among its domains and describes education as one form of safeguarding. It also calls for the participation of communities in safeguarding activities. For KaPamana, this implies that an app should introduce content with attribution, distinguish educational interpretation from authoritative cultural record, and seek review from relevant local and Indigenous knowledge holders before making broad claims. The project's current source links and editor workflow support correction, but they do not substitute for that review.

The NCCA's account of Ginaw Bilog and the ambahan tradition situates script and poetry in a specific Hanunóo Mangyan cultural practice in Oriental Mindoro (NCCA, n.d.). The Library of Congress (n.d.) cautions that “Mangyan” is an umbrella term for distinct groups and documents the Hanunóo and Buhid writing traditions. Together, these sources argue against describing all Mangyan communities as having the same language or script. KaPamana therefore names the Hanunóo learning module specifically and presents it as an introduction to characters and practice, not as a complete account of Mangyan culture.

## Hanunóo Script Representation and Learning

The Unicode Consortium (2025) assigns the Hanunóo script to U+1720–U+173F. Its standard describes independent vowels, consonants with an inherent a vowel, two dependent vowel signs that also represent e/i and o/u distinctions, and a pamudpod sign used to suppress the inherent vowel. A digital lesson can render these encoded characters consistently when an appropriate font is available. KaPamana bundles a Hanunóo font and uses rule-based conversion for supported Latin input. Because the source spelling does not uniquely resolve every linguistic distinction, the interface must state the rule set and reject unsupported characters instead of presenting a guess as a translation.

Tracing can help a learner attend to a letter's shape, but a touch drawing by itself does not demonstrate literacy, pronunciation, or accepted writing practice. KaPamana's tracing guide and saved drawing are therefore practice artifacts. The app does not score handwriting authenticity or prescribe a culturally authoritative stroke order. Its limited word list is explicitly separated from open text input, and the open input is labeled spelling practice. This boundary is especially important when the user enters a Filipino or English word: the displayed script is a mechanical representation of the input, not a Hanunóo-language equivalent.

## Game-Based Learning and Feedback

Sailer and Homner's (2020) meta-analysis reports positive average effects of gamification on cognitive, motivational, and behavioral learning outcomes across the studies they reviewed, while also finding variation by design and study quality. The result supports the use of game elements as a design hypothesis, not a guarantee that any particular game teaches effectively. KaPamana combines short missions, collectibles, scores, rewards, and a passport with a question or discovery that points beyond the game action. The educational claim to be tested is whether these links help a player recall or explain the associated place information, rather than whether the runner is enjoyable alone.

Feedback has two roles in the app. Immediate gameplay feedback tells the player about a collected item, hazard, mission objective, and result. Delayed progression feedback appears as stars, stamps, discoveries, and ongoing goals. The separation matters because a high score is not itself evidence of cultural understanding. A future evaluation should therefore examine both task completion and what users understood from the reading or question linked to the run.

## Mobile Heritage Learning and Related Systems

Ruiz-Calleja and colleagues (2023) studied Casual Learn, a mobile application used in cultural-heritage learning situations. Their report shows how mobile tasks can connect encounters with heritage material and classroom activity, while noting the importance of coordinating data between settings. KaPamana shares the use of short mobile tasks but differs in implementation: it combines a runner, a persistent travel passport, script practice, and a locally usable save within a province-focused game. This comparison describes design features, not superiority or measured learning outcomes. The Casual Learn study also demonstrates a standard of evaluation that KaPamana has not yet met: observed use by teachers and learners with reported methods and outcomes.

Mobile delivery introduces both access and reliability requirements. The app's local save allows progress to be recorded before a cloud update. Bundled content and cached published records allow a returning user to continue when the network is unavailable. Capacitor's Share API delegates file sharing to apps installed on the device (Capacitor, n.d.); it does not guarantee that a specific social platform will accept or post a story. KaPamana's sharing claim is therefore limited to generating a valid image and opening the device share flow, as demonstrated in the supplied Android recording.

## Usability, Software Quality, and Data Protection

ISO 9241-210:2019 describes human-centered design activities for interactive systems across the development life cycle. Its relevance to KaPamana is practical: the intended users must be able to find a route, understand the difference between Buddy and guide, control the runner, interpret the result, and complete tracing without hidden instructions. An attractive screen is not enough; the sequence must be understandable and recoverable when a user makes an error. The present build has internal checks and a demonstration recording, but a structured usability study has not yet been reported.

ISO/IEC 25010:2023 provides a product-quality model that can guide requirements and evaluation. For this project, functional suitability, usability, reliability, performance efficiency, and security are particularly relevant. The model does not automatically assign scores to the app. Appropriate evidence would include scenario-based task completion, error rates, build and test logs, offline/online recovery checks, and role-based access tests. Supabase documentation explains that database row-level security can restrict records using the authenticated user's identity (Supabase, n.d.). In KaPamana, the intended policy is that a traveler accesses only their own save, while editors and administrators have separately governed content roles. The policy must be tested against the deployed database as well as reviewed in migration files.

## Synthesis of the Reviewed Sources

**Table 2**

*Synthesis of Reviewed Sources*

| Source | Contribution to the study | Design or evaluation implication |
| --- | --- | --- |
| PSA (2025) | Defines the province's city and municipalities | Use 15 local government units as the geographic frame; avoid claiming the catalog exhausts local culture |
| UNESCO (2003), NCCA (n.d.), Library of Congress (n.d.) | Connect living heritage to communities and place Hanunóo practice in context | Attribute content, distinguish communities, and arrange cultural review before stronger claims |
| Unicode Consortium (2025) | Defines encoded Hanunóo characters and script behavior | Render characters with a proper font; label conversion as limited spelling practice |
| Sailer and Homner (2020) | Synthesizes effects and variation in gamified learning studies | Link play to learning tasks and measure comprehension separately from game score |
| Ruiz-Calleja et al. (2023) | Demonstrates a studied mobile heritage-learning application | Evaluate KaPamana with observed users and explicit measures, rather than assuming impact |
| ISO (2019, 2023) and Supabase (n.d.) | Provides design, product-quality, and access-control guidance | Test task flows, quality characteristics, and account-level data protection |

*Note.* Implications are design guidance, not measured KaPamana outcomes.

The reviewed work supports an interactive, place-based prototype but also exposes its central gap: KaPamana's implementation is documented, while its effect on learning, its usability across users and devices, and the cultural suitability of its representations remain to be established with direct evidence. The contribution of this study is a working, inspectable system and a clear evaluation protocol for those later claims. It does not assert that KaPamana is the first or only heritage application for Oriental Mindoro.

# Chapter 3 Methodology

## Research and Development Design

This is an applied design-and-development study of a working software artifact. The completed work consists of requirements interpretation, iterative implementation, content organization, automated verification, and an Android demonstration. The current evidence is primarily technical and documentary: repository files, source-linked content records, test outputs, build output, and a supplied phone recording. No participant survey, pretest/posttest, controlled comparison, or formal cultural review is reported as completed. Accordingly, the chapter separates work already performed from the evaluation protocol proposed for a later stage.

The development cycle followed six repeated activities: inspect the existing game and its assets; define a small feature or content requirement; implement code and structured data; check the feature with tests and a build; inspect a device or browser flow; and revise text, visuals, or behavior when evidence showed a problem. This pattern is compatible with the human-centered design activities described by ISO 9241-210:2019, but the project does not claim formal conformity to that standard. Repository version history and tests provide traceability for changes.

## System Setting and Users

KaPamana is designed for Android-oriented mobile use, with a web build used for development and administration. The primary user is a traveler or learner who signs in, chooses a Buddy, plays missions, reads discoveries, uses the learning studio, and views a passport. An editor can manage published and draft content. An administrator can additionally manage roles and player-save operations. These are software roles, not research participant categories. The geographic focus of this manuscript is Calapan City and the 14 municipalities of Oriental Mindoro, as identified by PSA (2025).

## Requirements Analysis

Requirements were drawn from the app concept, the province-focused content plan, the available BuddyPort material, the team's requested features, and inspection of the current implementation. A requirement is treated as implemented only when there is corresponding code or catalog data; a desired educational result remains an evaluation question. The principal functional requirements are summarized below.

**Table 3**

*Functional Requirements*

| ID | Functional requirement | Implementation evidence |
| --- | --- | --- |
| FR01 | Let a traveler create an account or sign in before first use on a configured build | Authentication gate and Supabase Auth integration |
| FR02 | Select a Buddy and retain it as the playable runner | Buddy selection, departure state, and runner component |
| FR03 | Browse Oriental Mindoro and festival-inspired routes | Active catalog and destination screens |
| FR04 | Play objective-based runner missions and show results | Game engine, mission definitions, result settlement |
| FR05 | Record rewards, discoveries, stars, and passport progress | Validated save model, journal, and passport views |
| FR06 | Display Hanunóo lessons and limited word practice | Learning studio, bundled font, vocabulary data |
| FR07 | Render supported Latin input as script spelling practice | Rule-based converter with input limits and unsupported-character handling |
| FR08 | Trace, save, export, and share a practice image | Drawing model, 1080 × 1920 canvas export, Filesystem and Share plugins |
| FR09 | Store progress locally and synchronize an account backup | Capacitor Preferences, player save row, retry and conflict logic |
| FR10 | Allow role-governed content editing and protect player data | Admin interface, migrations, role checks, and row-level policies |

Nonfunctional requirements include readable mobile controls, clear labels for cultural claims, predictable save recovery, usable offline content after a session exists, bounded loading when the server cannot be reached, and restricted account data. These are design targets. Passing a build or unit test does not alone establish that every target is satisfied on all devices.

## System Architecture

The implementation separates interaction, game and learning logic, content, persistence, and cloud services. The mobile app uses Ionic React and TypeScript; Capacitor supplies the Android shell and native plugins. Structured JSON provides a bundled catalog and fallback content. Supabase stores published content, authentication data, and account-linked player saves. On startup, the app attempts to prepare content and synchronize a newer save before loading the game interface, but those operations are time-limited so the app can fall back to local resources.

**Table 4**

*System Architecture*

| Layer | Main components | Responsibility |
| --- | --- | --- |
| Presentation | App screens, Buddy team, passport, learning studio, admin dashboard | Navigation, readable content, touch input, feedback |
| Game and learning | Runner engine, progression model, Hanunóo converter, drawing model | Rules, objectives, rewards, script rendering, tracing |
| Bundled data | Catalog JSON, heritage records, fonts and artwork | Offline baseline and source-linked educational content |
| Device storage | Capacitor Preferences and Filesystem | Local progress, exportable backup, saved tracing image |
| Cloud service | Supabase Auth, PostgreSQL, storage, content sync, save sync | Account identity, published updates, backup, editor workflow |

### Content and Progress Flow

At launch, the app loads the local save and requests published content within a bounded waiting period. If a valid live response is available it replaces the corresponding cached or bundled content; otherwise the most recent usable local content remains. A configured build presents an account gate for a user without a linked signed-in session. When the player starts a mission, the selected Buddy is copied into the departure state; a festival guide remains a route character. The runner engine evaluates movement, collectibles, hazards, and objectives. On completion, the app records rewards and discoveries in the local save. When the account is linked and the network is available, a debounced upload sends the validated save to the traveler's `player_saves` row. If a device and the account both have progress, the user chooses which copy to keep. An offline change is marked for later upload.

### Data Design and Access Control

The bundled catalog identifies each destination and its ordered mission levels. Separate heritage records hold discoveries, journal text, questions, and sources. A player save contains the traveler's name, selected Buddy, currency, experience, completed missions, passport-related values, settings, and learning progress. Drawing strokes are stored as bounded point data rather than full image blobs in the save; the PNG is generated when requested. This keeps routine progress separate from media export. The local save is validated when parsed, including after a cloud restore.

Supabase migration files define the database schema, storage configuration, content roles, and row-level policies. Published records are intended for travelers; draft editing is restricted to editor and administrator roles. A traveler should read or write only their own player save. The service-role secret is not stored in the mobile client. These controls are architectural safeguards, but a deployment-specific security review is still required before production use. The same caution applies to password recovery and account management: the configured project has administrative flows that should be rehearsed and governed by the institution.

## Content Development and Cultural Safeguards

The community adventure covers the province's 15 local government units. Its place information is organized around history, barangay count, ways of living, traditions, and environment, with discoveries and journal material linked to sources. The festival group contains 18 curated routes with four runner missions each, background and item art, guide sprites, and icons. The catalog is a game-content set rather than an official festival inventory. Festival artwork is generated illustration and should be labeled as such when shown outside the game. Descriptions of practices should identify the community or source to which they belong; a local origin story should not be presented as a verified historical event.

The Hanunóo module uses Unicode-backed glyphs and a bundled font for introductory lessons. Its converter follows documented mechanical rules, limits input length, and does not infer vocabulary meaning. The word list is limited and attributed in the app; open word entry is a separate spelling activity. Tracing stores points and target text, supports undo and clear, and exports a complete portrait PNG. The export can be saved on the device or passed to the system share sheet. No automatic publication to Facebook or Instagram is performed by KaPamana.

Before a final public or educational release, the team should invite relevant cultural and language knowledge holders to review names, summaries, script examples, imagery, and permissions for any community-specific material. Review records should note the reviewer, the item reviewed, requested correction, permission scope, and revision. These steps are recommended future work and are not represented as completed consultations in this manuscript.

## Implementation Procedure

The project used the following implementation sequence, with iterations when a feature failed a check:

1. Establish the Ionic React and Capacitor application, data models, recovered assets, and source attribution.
2. Organize the province and festival routes into stable identifiers, missions, artwork paths, and source-linked learning records.
3. Implement Buddy selection, runner rules, mission results, passport progress, and local save validation.
4. Implement Hanunóo lessons, converter rules, word practice, tracing, saved drawings, and image export.
5. Add Supabase content tables, account authentication, player-save synchronization, editor and administrator roles, and row-level policies.
6. Verify the TypeScript build and unit tests, inspect mobile flows, and document limitations that automated tests do not resolve.

The production build command checks TypeScript, bundles the app, and verifies that the game and admin entries include their stylesheets. Unit tests exercise game rules, model behavior, learning rules, content handling, and other deterministic modules. The Android screen recording supplied by the team shows account access, a Calapan runner mission, result and journal views, Buddy selection, tracing, saved image, and the Android share sheet. It is useful demonstration evidence but is not a controlled usability or learning study.

## Verification Results and Current Limits

The following checks were executed against the repository snapshot on 9 November 2026. They establish the status of these particular checks, not universal correctness.

**Table 5**

*Verification Results*

| Check | Observed result | Interpretation |
| --- | --- | --- |
| Production build | Passed TypeScript check, Vite build, and game/admin stylesheet check | Build artifacts can be produced from the current source |
| Unit tests | 14 test files passed; 115 tests passed | Covered deterministic behaviors passed on this run |
| Bundled catalog inspection | 64 active destinations; 407 missions; 15 Oriental Mindoro destinations with 180 missions; 18 festival routes with 72 missions | Counts are reproducible from `src/data/catalog.json` and the active-group filter |
| Browser end-to-end suite | Attempted; first three tests timed out before their expected legacy onboarding controls appeared | Existing test scripts are not current with the account-first gate; the suite is not a passing verification result |
| Supabase deployment and cross-device restore | Not reverified during this documentation run | Migration and sync code exist, but live behavior requires a separate signed-in test |
| Cultural and educational effectiveness | No participant or community-review result available | No learning gain or cultural-accuracy outcome is claimed |

The browser failures were not interpreted as proof that the feature under test failed. The captured page showed the new account-creation gate, while the tests waited for controls from the older onboarding flow. The test fixtures must be updated to use a dedicated test account and then rerun. A test timeout remains an unresolved verification gap until that work is complete.

## Proposed Usability and Cultural Evaluation

A later evaluation should follow an approved protocol and use consented participants appropriate to the intended users. The team should record participant criteria, recruitment, sample size, age range, devices, connection conditions, consent procedure, and any required institutional approval before collecting responses. None of these values is invented here. If minors participate, guardian consent and school requirements must be addressed. Cultural-content review should be conducted separately with appropriately identified knowledge holders, with permission to use their comments and a process to correct or withdraw contested material.

The suggested usability tasks are: create or sign in to a test account; select a Buddy; find a specified Oriental Mindoro route; start and complete a mission; locate the related discovery and passport progress; enter a practice word; trace and save one character; export the story PNG; and restore the account on a second device if that scenario is included. The observer should record task completion, time, assistance, error or confusion points, and recovery. A short post-task interview should ask what the user believed the spelling converter did and whether any image or description appeared to claim more cultural authority than it had. These questions test a critical interpretation risk, not only button usability.

Software-quality evaluation can organize results under selected ISO/IEC 25010:2023 characteristics: functional suitability, usability, reliability, performance efficiency, and security. Examples include whether mission state survives a restart, how the app responds to a lost connection, whether the shared PNG includes its complete border and footer, whether a traveler can read another traveler's save, and whether a draft is hidden from ordinary users. Report raw observations and failed cases, not only an average score. Any learning study should define a separate knowledge measure and comparison design before claiming improvement. The team should analyze results with methods suited to its approved sample and report uncertainty and limitations.

## Ethical, Privacy, and Reproducibility Considerations

Demonstrations and tests should use dedicated accounts without exposing passwords or private email addresses. Exported drawings and player saves belong to the user and should not be collected for research without consent. The app's generated festival illustrations should remain distinguishable from photographs. Recovered BuddyPort assets retain their original attribution in the repository. Indigenous-language material should be cited carefully and corrected when a competent reviewer identifies an error. The study should not equate a script exercise with fluency or treat a shared image as evidence that a user posted to a social platform.

The repository contains the catalog, game and learning code, SQL migrations, tests, and Android build workflow needed to inspect the implementation. The commands `npm run build` and `npm test` reproduce the completed build and unit checks in a suitable environment. The browser suite presently needs an account-aware fixture. The chapters describe the source snapshot and the date of verification; later content edits, app versions, or database migrations require renewed checks.

# References

Capacitor. (n.d.). Share API. https://capacitorjs.com/docs/apis/share

International Organization for Standardization. (2019). ISO 9241-210:2019 Ergonomics of human-system interaction Part 210 Human-centred design for interactive systems. https://www.iso.org/standard/77520.html

International Organization for Standardization and International Electrotechnical Commission. (2023). ISO/IEC 25010:2023 Systems and software engineering Systems and software Quality Requirements and Evaluation Product quality model. https://www.iso.org/standard/78176.html

Library of Congress. (n.d.). Background information on the Mangyan. Mangyan Bamboo Collection from Mindoro, Philippines. https://guides.loc.gov/mangyan-bamboo-collection/background

National Commission for Culture and the Arts. (n.d.). Ginaw Bilog and the ambahan tradition. https://ncca.gov.ph/about-culture-and-arts/in-focus/ginaw-bilog-and-the-ambahan-tradition/

Philippine Statistics Authority. (2025). Province of Oriental Mindoro. Philippine Standard Geographic Code. https://psa.gov.ph/classification/psgc/citimuni/1705200000

Ruiz-Calleja, A., Bote-Lorenzo, M. L., Asensio-Pérez, J. I., Villagrá-Sobrino, S. L., Alonso-Prieto, V., Gómez-Sánchez, E., García-Zarza, P., Serrano-Iglesias, S., & Vega-Gorgojo, G. (2023). Orchestrating ubiquitous learning situations about cultural heritage with Casual Learn mobile application. International Journal of Human-Computer Studies, 170, 102959. https://doi.org/10.1016/j.ijhcs.2022.102959

Sailer, M., & Homner, L. (2020). The gamification of learning: A meta-analysis. Educational Psychology Review, 32, 77–112. https://doi.org/10.1007/s10648-019-09498-w

Supabase. (n.d.). Row Level Security. https://supabase.com/docs/guides/database/postgres/row-level-security

UNESCO. (2003). Convention for the Safeguarding of the Intangible Cultural Heritage. https://ich.unesco.org/convention

Unicode Consortium. (2025). The Unicode Standard version 17.0 Hanunoo U+1720–U+173F. https://unicode.org/charts/PDF/U1720.pdf

KaPamana development team. (2026). KaPamana source repository and project documentation. https://github.com/cedimscalapan/bp
