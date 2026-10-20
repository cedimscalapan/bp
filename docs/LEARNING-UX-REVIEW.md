# Learning interface review and redesign — 1.9.0

The review covered the learning home, conversion tool, character selection, word examples, practice, saved work, reference material and mobile tracing workspace.

| Previous issue | Effect on learners | Implemented change |
| --- | --- | --- |
| Six top-level tabs with overlapping purposes | Beginners had to choose a tool before knowing where to start | One learning home prioritizes characters, then familiar words; secondary links open personal writing and saved practice |
| Conversion appeared before character learning | First-time learners saw a writing tool before a lesson | The primary route introduces the 18 base characters and opens one selected character |
| A 600×280 tracing view sat inside a long page | On phones, the drawable area was shallow and competed with navigation | Full-screen tracing removes the global navigation and uses a square coordinate system in a flexible drawing area |
| Dense explanations and source cards before interaction | Reading pushed practice below the fold | Short instructions sit beside the task; detailed references remain in an expandable reading section |
| Long character dropdown mixed base letters, vowel forms and endings | Shape differences were hard to see | Visible character grid, large preview and four vowel/ending choices |
| Six dictionary entries doubled as the exercise bank | Very few familiar words to practice | 70 Tagalog spelling exercises across six topics, with search and visible letter-by-letter tracing |
| Word tracing required handling an entire word | Too much visual complexity for a beginner | Every rendered character is tappable; guided word lessons advance one grapheme at a time, keeping its vowel sign or pamudpod attached |
| Practice was separate from the shapes being learned | Weak connection between recognition and writing | Character-recognition questions sit with the character lesson; learners can hide the tracing guide for recall practice |
| Old saved drawings used a wide coordinate space | Enlarging the canvas could distort or invalidate backups | Each new drawing records a 600-pixel canvas height; legacy drawings keep the original 280-pixel coordinate space |

Interaction details:
- Undo, clear, hide/show guide, save and save-and-next are always inside the tracing workspace.
- The pad accepts actual touch/stylus pointer input and uses the SVG screen transform to map coordinates correctly.
- Guided drawings preserve combining marks with their base letter. Practice is not graded for stroke order or handwriting accuracy.
- Duplicate saves of an unchanged drawing do not consume another saved-drawing slot.
- Local storage retains the latest 12 drawings and supports existing export/restore.
- The six sourced Hanunó’o–Filipino word pairs remain a separate dictionary. The 70 Tagalog exercises are authored script-rendering practice, not claimed Hanunó’o translations.
- Unicode, Ishida, Library of Congress and Mangyan Heritage Center references remain available without taking space from the drawing activity.

Validation: unit coverage for grapheme grouping, unsupported substitutions, guide sizing and both legacy/new backups; mobile browser checks with real touch events, guide toggling, character-by-character word lessons and reload persistence. The drawing area measured about 508 pixels high in a 390×844 viewport. Controls were also checked at 360×640 and 844×390. This is browser validation, not a physical-device usability study.
