# Hanunóo learning studio

International is excluded from the active app catalog, home routes, Explore chips, passport and best-run display. Existing backup data remains readable.

Learn is a primary navigation item. Shop remains accessible through Companions → Visit Buddy Shop. Home also links to the learning studio.

Included offline:
- Six sourced Hanunóo / Filipino starter word pairs; exact single-word lookup in either direction and bookmarks. This is a limited dictionary, not a general translator.
- Eighteen Hanunóo base characters from the Unicode chart, rendered using bundled Noto Sans Hanunoo (SIL OFL; license beside font).
- Finger/stylus character tracing and Latin-spelling vocabulary tracing. The app does not invent script spellings, prescribe stroke order or assess handwriting authenticity.
- Vocabulary practice with answer feedback and persistent practice counts.
- Latest twelve saved drawings; at most 80 strokes and 1,500 normalized points per drawing. No raster blobs are stored in progress.

Word basis: PhilEd Data / Firth toolkit's parallel Hanunoo and Tagalog vocabulary table. Source spelling is preserved; Tagalog entries supply Filipino glosses. Sources are linked inside the learning section. Language/speaker variants can be added as separately attributed entries later.

Learning progress shares the existing Capacitor Preferences save. Export/restore includes words, counts and drawings; old backups receive empty learning progress. Reset clears it with the rest of app progress. No accounts, cloud service, speech synthesis or network translation API are used. Clearing data or uninstalling requires a backup to recover progress.

## Sulat and Matuto source integration

Sulat → Conversion rules cites the Unicode Consortium chart and Richard Ishida's orthography notes. Matuto → Sources & reading provides all four user-requested references, including the Library of Congress background guide and Mangyan Heritage Center library page. Brief original summaries identify each reference's role. Source pages, poems, chart images and recordings are not bundled or reproduced.

The local Sulat converter mechanically renders Latin input with modern conventions: inherent a, shared i/e and u/o signs, standalone/consecutive vowels, ng and pamudpod for consonants without a following vowel. It preserves spaces, digits and ordinary punctuation and rejects unsupported characters rather than guessing substitutions. It does not translate a language or infer pronunciation; output cannot uniquely recover e/i or o/u. Input is capped at 40 characters so trace targets remain within existing backup bounds.

Script tracing now includes vowel combinations and consonant endings. Starter words can be traced in script or Latin spelling. A Sulat result can be sent directly to tracing and saved as a drawing in existing local progress. Existing saved drawings and backups remain compatible. Library links require internet; bundled rules, glyphs, conversion and practice work offline.

## Guided learning redesign (1.9.0)

The learning home now starts with characters, then 70 Tagalog spelling exercises. Each word can be practiced one script character at a time or as a whole word. Base character lessons show vowel forms and pamudpod, with a recognition question nearby. Conversion and saved work are secondary destinations; source reading is expandable.

Tracing opens full screen with a flexible drawing area, large guide, guide visibility toggle, undo, clear, save and save-and-next. New drawings store a square 600×600 logical space; existing 600×280 drawings are restored at their original dimensions. Both formats share the latest-12 local drawing limit and export/restore support.

See LEARNING-UX-REVIEW.md for the critique, changes and validation.
