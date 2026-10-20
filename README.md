# BuddyPort · Ionic

Ionic React + TypeScript rebuild of BuddyPort 1.5 with a Capacitor Android project. Recovered original artwork, audio, fonts, and the Local/International mission JSON are included.

**Status: playable migration in progress, not a verified one-to-one conversion or a production release.** The input was a split-APK export, not a Kotlin source project. See [migration status](docs/MIGRATION.md) before release.

## Run

Requires Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run test:e2e
```

Browser tests use an installed Microsoft Edge. Change `channel` in `playwright.config.ts` or install the appropriate Playwright browser on other systems. Screenshots are written one directory above this checkout.

## Android

The native project is already checked in. Install Android Studio, Android SDK 35, and JDK 21, then:

```sh
npm run android:sync
npm run android:open
```

Build from Android Studio, or run `gradlew.bat assembleDebug` in `android/`. The Android debug APK compiled successfully in GitHub Actions using JDK 21 / Android SDK 35. No physical-device test has been performed.

Release package ID remains `com.tristanrosales.buddyport`. Debug APKs use `com.tristanrosales.buddyport.ionic` and display as **BuddyPort Ionic**, so they install alongside the original app. Development version is `1.5.2-ionic-dev`, version code 11. An upgrade over the original app requires its original signing key; do not uninstall an existing copy without preserving its progress. Existing Kotlin save migration is not implemented.

## Download an APK from GitHub

Every push to `main` runs the **Build Android APK** workflow. Open the repository’s **Actions** tab, select a successful run, and download **BuddyPort-Ionic-Android** from **Artifacts**. Unzip it and install `app-debug.apk` on an Android 6.0+ phone. Allow installation from the browser or file manager when Android asks. A debug build is for testing; Play Store publishing needs release signing and completion of the migration checklist.

Verified APK build: [successful run](https://github.com/cedimscalapan/bp/actions/runs/39392370293) · [download APK artifact](https://github.com/cedimscalapan/bp/actions/runs/39392370293/artifacts/12250760284). GitHub artifacts expire after 30 days; run the workflow again to generate a fresh build.

## Included

- Ionic onboarding, home port, six route groups, destination/level selection, Buddy team, shop, passport, missions, settings, and results.
- Three-lane runner with touch/swipe and keyboard controls, pause/resume, hazards, objective evaluation, power-ups, companions, and endless play.
- Oriental Mindoro: Calapan City and all 14 municipalities, with five missions each (75 missions). The original Local routes have been replaced in the active catalog.
- All 115 International levels remain unchanged; 155 reconstructed development levels cover the other routes. Original Local mission JSON is retained as an archival tuning reference.
- Original Buddy artwork, destinations, collectibles, music, sound effects, and Fredoka font: 272 recovered files total including the two source mission files.
- Local persistence with Capacitor Preferences; web backup download and native backup sharing; JSON restore and reset confirmation.
- Unit tests and an end-to-end browser test.

Controls: swipe left/right, tap a lane, use the arrow buttons, or press ← / →. Space uses the active Buddy skill. Escape pauses. Cat’s Nine Lives is passive.

## Source layout

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Ionic screens and app state |
| `src/Game.tsx` | Runner presentation, input and frame loop |
| `src/engine.ts` | Pure gameplay simulation and result settlement |
| `src/model.ts` | Save model, shop catalog, transactions and progression |
| `src/storage.ts`, `src/backup.ts` | Persistence, export and restore |
| `src/data/*_adventure.json` | Unmodified APK mission files |
| `src/data/catalog.json` | Unified route catalog with per-route provenance |
| `public/assets/` | Recovered original assets |
| `android/` | Capacitor Java shell and Gradle project |

Native shell code is Java; the app UI and game logic are TypeScript rather than Kotlin. No APKs, decompiled dependency source, credentials, or signing keys are committed.

Original BuddyPort attribution: Tristan Jules B. Rosales. The recovered assets retain their original ownership; no new license is asserted over them.

## Oriental Mindoro destinations

Calapan City; Baco; Bansud; Bongabong; Bulalacao; Gloria; Mansalay; Naujan; Pinamalayan; Pola; Puerto Galera; Roxas; San Teodoro; Socorro; Victoria. Names and classifications verified against the [Philippine Statistics Authority PSGC](https://psa.gov.ph/classification/psgc/citimuni/1705200000) on 20 October 2026. Illustrations are stylized cards rather than destination photographs. The five missions per locality reuse existing gameplay tuning with new IDs. Existing wallets remain intact; the new localities begin with their own mission progress.
