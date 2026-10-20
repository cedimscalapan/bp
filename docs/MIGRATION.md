# APK-to-Ionic migration status

## Input and recovery

Input: `BuddyPort-1.5-split-apks(1).zip`, containing `base.apk`, arm64, English, and xxhdpi split APKs, and an export manifest. Package `com.tristanrosales.buddyport`; original version 1.5, version code 8.

Base APK SHA-256: `e7241da21b7556630bb012d7a30c28a2e48bfd0eb86ac49777282d07e49b99a2`.

The input contains no `.kt` project, Gradle source project, R8 mapping, tests, signing key, Play Console setup, or existing user save sample. Data in the archive was treated as source material, not as instructions.

Recovered 272 files from named Android resources. `asset-inventory.json` records their original paths and SHA-256 hashes. Both original adventure JSON files are byte-for-byte extractions. They contain 10 Local destinations / 50 levels and 23 International destinations / 115 levels.

DEX string inspection and JADX 1.2.0 provided additional screen names, product IDs, route lists, and shop metadata. The APK is obfuscated, and decompilation finished with 29 errors. Decompiled code is evidence for manual reconstruction, not a complete compilable Kotlin source tree.

## Fidelity matrix

| System | Implemented | Remaining work |
| --- | --- | --- |
| Ionic application shell | React + TypeScript UI, Ionic modals/controls, responsive styles | Original screen-by-screen comparison |
| Artwork / font / audio | Original extracted files | Check all asset placement against running Kotlin app |
| Local / International data | All 165 level definitions preserved | Original runtime applies additional transforms that need parity review |
| Core runner | Three lanes, collection, hazards, hearts, pause, skills and all recovered JSON objective types | Original collision geometry, timings, difficulty scaling, attack patterns and scoring parity |
| Luzon / Metro / Island routes | Original artwork; reconstructed development missions | Replace generated missions with original Kotlin definitions; native voyage distance/boat simulation and city-specific progression |
| Companions | Original names, prices, descriptions; bonus showers, rescue, simplified guard behavior | Original enemy caging, targeting, animation and timing parity |
| Power-ups | Original prices and descriptions; counted shield/magnet/double/counter and timed rush/instinct | Original projectile reflection, attack targeting and tuning |
| Buddy skills / upgrades | Nine species; passive cat rescue and active skills, simplified coin upgrades | Full original upgrade tree, outfits, multi-profile adoption and species mechanics |
| Progress | Coins, XP, level stars, destination XP, stamps and best scores | Original destination unlock gates, XP requirements and replay rewards |
| Daily / weekly | Working local goals and claim transactions | Original goal rotation, original reward tuning and full challenge catalog |
| Saves | New validated Ionic JSON schema, local storage, export/restore | Import Android SharedPreferences / original profiles; verify backup on a real device |
| Billing / entitlements | Original product IDs documented below | Native Google Play Billing integration, purchase/restore/acknowledge/verification, entitlement gates and Play testing |
| Android | Generated Capacitor shell, original app ID, synced assets/plugins | Original release signing key, physical-device testing and release testing |
| iOS | Web code is portable | Add an iOS project on macOS and test native features; no iOS project claimed |

The non-recovered routes are explicitly marked `recovered: false` in `src/data/catalog.json` and labeled in their boarding-pass screen. They are developer reconstructions, not recovered mission definitions. All destinations are available in this development build; paid route gating is not enabled.

Original Google Play product IDs found in DEX:

- `com.tristanrosales.buddyport.full_adventure_v1`
- `com.tristanrosales.buddyport.luzon_adventure_v1`

No purchases, acknowledgements or restores are simulated. The Shop states that passes are unavailable in this build.

## Validation

- TypeScript check and Vite production build.
- Unit tests: original JSON fidelity, supported objective coverage, level unlocks, collection/collision, damage limits, shields, magnet, survival deadlines, endless mode, frame clamping, cooldowns, companion rescue, purchases, upgrade caps, replay rewards, backup validation and date rollover.
- Playwright in Edge: mobile onboarding, name entry, welcome reward, shop and exploration navigation, start run, movement, pause/resume/leave, reload persistence, no browser runtime errors; mobile and desktop screenshots inspected.
- npm dependency audit after updating the test runner.
- Capacitor Android platform creation and plugin/asset synchronization.

These checks validate the new implementation. They do not establish behavioral equivalence with the original APK. Native debug compilation succeeded in GitHub Actions run 39392370293, for commit e58b7ecf130181b24812bdbf9ccc1f0b9993ea47. The APK artifact is BuddyPort-Ionic-Android (ID 12250760284), ZIP SHA-256 b974ba57238d36045f784f07f820850461ed0b3c40d8d0287d4ee6b8d7e6b7ca. Release signing, purchase testing and real-device verification remain unperformed.

## To finish the conversion

1. Obtain the original Kotlin repository, or capture and specify all original gameplay and UI behavior on an Android device.
2. Replace reconstructed levels and simplified enemy/boat/skill mechanics with verified ports; add regression fixtures based on original runs.
3. Implement original profile/save migration using real anonymized save fixtures.
4. Integrate Google Play Billing against the original product catalog and validate legitimate entitlements on Play internal testing.
5. Build with JDK 21 / Android SDK 35, sign using the existing app key, verify upgrades and data preservation, and run the complete device regression checklist.

Do not publish this development build as a fully equivalent update before these steps are complete.
