# THIRD_PARTY_ASSET_AND_LICENSE_REPORT

**Project:** `C:\projects\exalofrontendapp`  
**Companion:** `THIRD_PARTY_APPROVAL_REQUEST.md`  
**Nature:** PERMANENT CUMULATIVE governance register (not milestone-only)  
**Last updated:** 2026-09-21 (M3 Train Selection; TP-073 / TP-074)

> Manual product-owner **APPROVAL** authorizes specified product use only.  
> It does **not** establish Exalo ownership, open-source license, or completed legal terms review.

---

## L. APPROVAL STATUS / HISTORY

| Date | Event |
| --- | --- |
| 2026-09-16 | M1: TP-001 conditional; TP-003 approved for Home; visual parity. |
| 2026-09-16 | Onboarding audit: TP-058/059/060 + TP-025…030 + TP-067…069 listed; hard stop. |
| 2026-09-16 | **Product owner:** APPROVE TP-058, TP-059, TP-060, TP-025…TP-030. REJECT TP-067, TP-068, TP-069. Five-step onboarding implemented. |
| 2026-09-16 | **Global textbox parity:** shared `ExaloTextInput` focus contract. No new third-party material. Register reviewed. |
| 2026-09-16 | **School dropdown:** `ExaloSelect` shared component + School onboarding uses closed/open select (searchable). No new packages/assets. |
| 2026-09-16 | **Home landscape:** PhoneViewport uses visible window height (removed BASE_HEIGHT 844 minHeight). Home available box = surface ∩ window. No new material. |
| 2026-09-17 | **M2 Journey:** TP-070 `journey-bg.png` identified as required Lovable Journey artboard (843×1264). Copied to `assets/journey/`. Product-owner **USE APPROVED**. LICENSE REVIEW REQUIRED. |
| 2026-09-17 | **M2 Journey header:** TP-071 `journey-bg-clean.png` derived from TP-070 — baked “Maths” / “Choose your path” removed; local star-field reconstructed from TP-070 only. Runtime uses TP-071. LICENSE REVIEW REQUIRED (inherits TP-070). No new packages. |
| 2026-09-17 | **M2 Journey closure:** PRODUCT-OWNER VISUAL REVIEW **APPROVED** (Maths + English). Native device matrix remains **NOT YET DEVICE-VERIFIED** (iOS/Android × portrait/landscape). M3 not started. TP-070/TP-071 license status unchanged. |
| 2026-09-17 | **M8A Streak:** Native composable Streak screen at `/streak`. No new packages. Lucide (TP-004) not used — emoji/Text substitutes. No new visual assets/fonts. Local AsyncStorage streak engine (Lovable `lib/streak.ts` parity). Insights average/most-active/consistency remain TEMPORARY_UI_DEMO. Backend has no streak calendar API. TP-070/TP-071 unchanged. |
| 2026-09-17 | **M8A hero/icon parity gate:** Exact hero LinearGradient needs **TP-072** `expo-linear-gradient` (APPROVAL REQUIRED). Lucide icons need **TP-004 reopen** for Streak (APPROVAL REQUIRED). Interim hero uses View-layer washes only; Lucide still not installed/used. |
| 2026-09-17 | **M8A PO decision:** TP-072 **USE APPROVED**; TP-004 **REOPEN APPROVED** / **USE APPROVED** (Streak + shared UI where Lovable uses Lucide). Installed `expo-linear-gradient@57.0.2` (MIT), `lucide-react-native@1.47.0` (ISC), `react-native-svg@15.15.4` (MIT). Runtime Streak uses LinearGradient + Lucide; genuine Lovable emoji preserved. |
| 2026-09-17 | **M8A Lucide Metro fix:** `lucide-react-native@1.47.0` failed Metro/web (`exports` → `dist/esm/lucide-react-native.mjs`). Pinned **`lucide-react-native@0.575.0`** (ISC; `.js` ESM exports). `react-native-svg@15.15.4` unchanged. Web export PASS. |
| 2026-09-18 | **M8A Shields + sticky CTA:** Shields stat uses Lucide `Shield` (production adaptation; Lovable source remains emoji). Sticky CTA = Lovable `bottom-20` (80px) + `insets.bottom`. |
| 2026-09-18 | **M8 Badges:** `/badges` Achievements screen (Lovable `StreakBadges.tsx`). No new packages/assets. Reuses TP-072 + TP-004. Badge icons = genuine Lovable emoji. Static Lovable badge catalog. **Deferred:** M8A Home profile-chip narrow composition (320×568) — not final; do not regress 768×1024. |
| 2026-09-18 | **M8 Score:** `/score` Exalo Score screen (Lovable `Score.tsx`). No new packages/assets. Reuses TP-072 + TP-004 (`Target`/`Zap`/`Repeat`/`Mountain`). Static Lovable demo 62/100 + breakdown. Backend analytics not wired. Home Score hotspot unchanged (already `/score`). |
| 2026-09-21 | **M3 Train Selection:** `/train/:subject` Lovable `TrainMode` parity. Copied TP-073 `maths-train-mode.png` + TP-074 `english-train-mode.png` from Lovable. Local TEMPORARY catalogue in `src/constants/train.ts`. Topic CTA → M3 boundary placeholder (no gameplay, no `/train/start`). No new packages. LICENSE REVIEW REQUIRED. Redmi PhoneViewport letterboxing parked untouched. |

---

## M3 TRAIN SELECTION — GOVERNANCE NOTE

NEWLY DISCOVERED THIRD-PARTY ITEMS: **TP-073** `maths-train-mode.png`, **TP-074** `english-train-mode.png`  
NEW PACKAGES: NONE  
NEW OPEN-SOURCE VISUAL ASSETS: NONE  
REJECTED ASSETS REUSED: NONE  

**PRODUCT-OWNER VISUAL REVIEW:** PENDING (this milestone)  
**Native device verification:** NOT YET DEVICE-VERIFIED (iOS/Android × portrait/landscape)  

**Backend / DB / `/train/start` / question-bank:** NONE (explicitly parked)  
**M4 Train Gameplay:** NOT STARTED — topic route is an M3 boundary placeholder only  

TP-073 / TP-074: introduced under the M3 milestone brief (Lovable Train Selection parity). **LICENSE REVIEW REQUIRED.** Formal product-owner **USE APPROVED** confirmation awaits visual review of this milestone.

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER: UPDATED — see TP-073 / TP-074 below and sections G / H / J.

---

## M2 JOURNEY — GOVERNANCE NOTE

NEWLY DISCOVERED THIRD-PARTY ITEM: **TP-070** `journey-bg.png`  
DERIVED ASSET: **TP-071** `journey-bg-clean.png` (from TP-070 only)  
NEW PACKAGES: NONE  
NEW OPEN-SOURCE VISUAL ASSETS: NONE  
REJECTED ASSETS REUSED: NONE (TP-067/068/069 remain unused)

**PRODUCT-OWNER VISUAL REVIEW:** APPROVED (Maths Journey + English Journey)  
**Native device verification:**  
- iOS portrait — NOT YET DEVICE-VERIFIED  
- iOS landscape — NOT YET DEVICE-VERIFIED  
- Android portrait — NOT YET DEVICE-VERIFIED  
- Android landscape — NOT YET DEVICE-VERIFIED  

**Backend / DB / question-bank:** NONE  
**M3:** STARTED / implemented (Train Selection) — see M3 governance note above  

TP-070 / TP-071: **USE APPROVED** does **not** clear license — both remain **LICENSE REVIEW REQUIRED**.  
TP-071 remains a **DERIVATIVE OF TP-070** (not Exalo-original).

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER: UPDATED — see TP-070 / TP-071 below and sections G / H / J.

---

## GLOBAL TEXTBOX FIX — GOVERNANCE NOTE

NEWLY DISCOVERED THIRD-PARTY/OPEN-SOURCE ITEMS: NONE  
NEWLY USED THIRD-PARTY/OPEN-SOURCE ITEMS: NONE  
NEW PACKAGES: NONE  

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER:  
REVIEWED — NO NEW MATERIAL INTRODUCED BY GLOBAL TEXTBOX FIX.

---

## SCHOOL DROPDOWN — GOVERNANCE NOTE

NEW THIRD-PARTY / OPEN-SOURCE MATERIAL: NONE  
NEW PACKAGES: NONE  

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER:  
REVIEWED — NO NEW MATERIAL INTRODUCED BY SCHOOL DROPDOWN CORRECTION.

---

## HOME POST-ONBOARDING CENTERING — GOVERNANCE NOTE

NEW THIRD-PARTY / OPEN-SOURCE MATERIAL: NONE  
NEW PACKAGES: NONE  

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER:  
REVIEWED — NO NEW MATERIAL INTRODUCED BY HOME CENTERING CORRECTION.

---

## HOME LANDSCAPE RESPONSIVE — GOVERNANCE NOTE

NEW THIRD-PARTY / OPEN-SOURCE MATERIAL: NONE  
NEW PACKAGES: NONE  

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER:  
REVIEWED — NO NEW MATERIAL INTRODUCED BY HOME LANDSCAPE CORRECTION.

---

## M. MANUALLY APPROVED PRODUCT-USE ITEMS

### TP-003 — `exalo-home-v2.png` (Home)

| Field | Value |
| --- | --- |
| Filename | `exalo-home-v2.png` |
| Source | `C:\projects\exalo\src\assets\exalo-home-v2.png` |
| Destination | `assets/home/exalo-home-v2.png` |
| Provenance | AI-GENERATED / SYNTHETIC (XMP trainedAlgorithmicMedia; Google C2PA / SynthID) |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** — M1 Home artboard only |
| Open-source? | **No** (no OSS license established) |

### TP-058 — `onb-rocket.png`

| Field | Value |
| --- | --- |
| Source | `C:\projects\exalo\src\assets\onb-rocket.png` |
| Destination | `assets/onboarding/onb-rocket.png` |
| Screens | Email, Year |
| Provenance | UNKNOWN (Lovable asset; no AI meta found in prior audit) |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** — Lovable-faithful onboarding Email + Year |
| Open-source? | **No** |

### TP-059 — `onb-astronaut-wave.png`

| Field | Value |
| --- | --- |
| Source | `C:\projects\exalo\src\assets\onb-astronaut-wave.png` |
| Destination | `assets/onboarding/onb-astronaut-wave.png` |
| Screens | Name |
| Provenance | UNKNOWN |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** — Lovable-faithful Name |
| Open-source? | **No** |

### TP-060 — `onb-astronaut-goal.png`

| Field | Value |
| --- | --- |
| Source | `C:\projects\exalo\src\assets\onb-astronaut-goal.png` |
| Destination | `assets/onboarding/onb-astronaut-goal.png` (+ astronauts copy retained) |
| Screens | School |
| Provenance | UNKNOWN |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** — Lovable-faithful School |
| Open-source? | **No** |

### TP-025 … TP-030 — Avatars

| TP | File | Destination |
| --- | --- | --- |
| TP-025 | `avatar-1.png` | `assets/avatars/avatar-1.png` |
| TP-026 | `avatar-2.png` | `assets/avatars/avatar-2.png` |
| TP-027 | `avatar-3.png` | `assets/avatars/avatar-3.png` |
| TP-028 | `avatar-4.png` | `assets/avatars/avatar-4.png` |
| TP-029 | `avatar-5.png` | `assets/avatars/avatar-5.png` |
| TP-030 | `avatar-6.png` | `assets/avatars/avatar-6.png` |

| Field | Value |
| --- | --- |
| Source | `C:\projects\exalo\src\assets/avatar-*.png` |
| Screens | Avatar onboarding; subsequent selected-avatar display |
| Provenance | UNKNOWN |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** |
| Open-source? | **No** |
| Prior note | Not approved for M1 Home; approved 2026-09-16 for onboarding + profile display |

### TP-070 — `journey-bg.png` (Journey source artboard)

| Field | Value |
| --- | --- |
| Filename | `journey-bg.png` |
| Source | `C:\projects\exalo\src\assets\journey-bg.png` |
| Destination | `assets/journey/journey-bg.png` |
| Screens | Provenance source for Journey; **not** the active runtime artboard after TP-071 |
| Intrinsic size | 843×1264 |
| Provenance | AI-GENERATED / SYNTHETIC (XMP `trainedAlgorithmicMedia`; C2PA / SynthID signals) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** (+ AI-generated evidence) |
| License | UNKNOWN — **LICENSE REVIEW REQUIRED** |
| Manual use status | **USE APPROVED BY PRODUCT OWNER** — Journey artboard family |
| Open-source? | **No** |
| Note | Contains baked header text “Maths” / “Choose your path”; retained unchanged for provenance |

### TP-071 — `journey-bg-clean.png` (Journey runtime artboard — DERIVATIVE OF TP-070)

| Field | Value |
| --- | --- |
| Filename | `journey-bg-clean.png` |
| Source | **DERIVATIVE OF TP-070** `assets/journey/journey-bg.png` only |
| Destination | `assets/journey/journey-bg-clean.png` |
| Screens | Journey runtime (Maths + English) |
| Intrinsic size | 843×1264 (unchanged) |
| Modification | Baked “Maths” and “Choose your path” header removed; underlying local star-field reconstructed from TP-070 pixels only (no external imagery) |
| Provenance | Same as TP-070 (derivative; **not** Exalo-original) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** (inherits TP-070) |
| License | UNKNOWN — **LICENSE REVIEW REQUIRED** |
| Manual use status | **USE APPROVED** as narrowly scoped derivative required to make approved TP-070 subject-neutral |
| Open-source? | **No** |
| Derivation tooling | Local script `scripts/derive_journey_bg_clean.py` (Pillow); not a new visual dependency |

### TP-073 — `maths-train-mode.png` (Maths Train Selection artboard)

| Field | Value |
| --- | --- |
| Filename | `maths-train-mode.png` |
| Source | `C:\projects\exalo\src\assets\maths-train-mode.png` |
| Destination | `assets/train/maths-train-mode.png` |
| Screens | Train Selection `/train/maths` (M3) |
| Intrinsic size | 843×1264 |
| Provenance | XMP `trainedAlgorithmicMedia` + C2PA / SynthID / Google Generative AI signals (same class as TP-003 / TP-070) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** |
| License | UNKNOWN — **LICENSE REVIEW REQUIRED** |
| Manual use status | Introduced for M3 Train Selection parity per milestone brief; **formal USE APPROVED pending PO visual review** |

### TP-074 — `english-train-mode.png` (English Train Selection artboard)

| Field | Value |
| --- | --- |
| Filename | `english-train-mode.png` |
| Source | `C:\projects\exalo\src\assets\english-train-mode.png` |
| Destination | `assets/train/english-train-mode.png` |
| Screens | Train Selection `/train/english` (M3) |
| Intrinsic size | 843×1264 |
| Provenance | XMP `trainedAlgorithmicMedia` + C2PA / SynthID / Google Generative AI signals (same class as TP-003 / TP-070) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** |
| License | UNKNOWN — **LICENSE REVIEW REQUIRED** |
| Manual use status | Introduced for M3 Train Selection parity per milestone brief; **formal USE APPROVED pending PO visual review** |

### TP-001 — Fredoka

| Field | Value |
| --- | --- |
| Files | `assets/fonts/Fredoka-wdth-wght.ttf`, `assets/fonts/OFL.txt` |
| License | SIL OFL-1.1 (evidence: bundled OFL.txt) |
| Manual use status | **CONDITIONALLY APPROVED** |
| Classification | OPEN-SOURCE FONT |

---

## A. EXALO ORIGINAL ASSETS

None newly classified this milestone with deed/provenance establishing Exalo originality.

---

## B. OPEN-SOURCE SOFTWARE

Declared in `package.json` (inspect `node_modules/<pkg>/package.json` / LICENSE for evidence; do not invent).

| Package | Declared version | Role | Runtime/dev | License (declared / typical) | Approval |
| --- | --- | --- | --- | --- | --- |
| expo | ~57.0.11 | App framework | runtime | MIT (typical Expo) — LICENSE REVIEW / verify locally | Existing scaffold |
| react | 19.2.3 | UI | runtime | MIT | Existing |
| react-native | 0.86.2 | Native UI | runtime | MIT | Existing |
| expo-router | ~57.0.11 | File routing | runtime | MIT | Existing |
| expo-font | ~57.0.1 | Font loading | runtime | MIT | Existing (TP-001 companion) |
| expo-asset | ~57.0.9 | Asset loading | runtime | MIT | Existing |
| expo-constants | ~57.0.9 | Constants | runtime | MIT | Existing |
| expo-linking | ~57.0.5 | Deep links / DEV reset URL | runtime | MIT | Existing |
| expo-splash-screen | ~57.0.5 | Splash | runtime | MIT | Existing |
| expo-status-bar | ~57.0.1 | Status bar | runtime | MIT | Existing |
| @react-native-async-storage/async-storage | 2.2.0 | Local persistence | runtime | MIT | Existing |
| react-native-safe-area-context | ~5.7.0 | Safe areas | runtime | MIT | Existing |
| react-native-screens | ~4.26.0 | Native screens | runtime | MIT | Existing |
| react-native-gesture-handler | ~2.32.0 | Gestures | runtime | MIT | Existing |
| react-dom | 19.2.3 | Web | runtime | MIT | Existing |
| react-native-web | ^0.21.2 | Web | runtime | MIT | Existing |
| expo-linear-gradient | ~57.0.2 (57.0.2) | Linear gradients (M8A Streak hero/CTA) | runtime | **MIT** (`node_modules/expo-linear-gradient/package.json`) | **TP-072 USE APPROVED** |
| lucide-react-native | **0.575.0** (exact) | Lucide icons (M8A Streak / Lovable-parity UI) | runtime | **ISC** (`node_modules/lucide-react-native/package.json`) | **TP-004 REOPEN / USE APPROVED** (scoped). Replaced broken `1.47.0` Metro/web `.mjs` export. |
| react-native-svg | 15.15.4 | SVG peer for lucide-react-native | runtime | **MIT** (`node_modules/react-native-svg/package.json`) | Companion to TP-004 |
| typescript | ~6.0.3 | Types | dev | Apache-2.0 | Existing |
| @types/react | ~19.2.2 | Types | dev | MIT | Existing |

**New packages this milestone:** NONE.

Exact license text: verify under each package’s LICENSE file in `node_modules` when preparing redistribution notices.

---

## C. OPEN-SOURCE VISUAL ASSETS

None (approved onboarding PNGs are **not** OSS unless evidence establishes a license).

---

## D. THIRD-PARTY LICENSED ASSETS

None with an established third-party commercial/OSS license deed for the onboarding PNGs.  
Approved items remain **THIRD-PARTY — LICENSE UNKNOWN** under product-owner use approval (section M).

---

## E. FONTS

| Font | TP | Status | License |
| --- | --- | --- | --- |
| Fredoka variable | TP-001 | CONDITIONALLY APPROVED | SIL OFL-1.1 |

---

## F. ICONS / ICON SYSTEMS

| Item | Status |
| --- | --- |
| Lucide via `lucide-react-native` (TP-004) | **REOPEN APPROVED / USE APPROVED** — M8A Streak + shared UI where Lovable uses Lucide. Installed **0.575.0** (ISC). Peer: `react-native-svg@15.15.4` MIT. (`1.47.0` unsuitable for Metro/web due to `.mjs` package exports.) **Shields stat adaptation:** Lovable source = emoji `🛡`; Expo = Lucide `Shield` 24 / stroke 2.25 / `#F8FAFC` for deterministic contrast on navy cards (not a claim that Lovable uses Lucide for this glyph). |
| Onboarding progress rocket image (TP-067) | REJECTED — Text 🚀 used |
| Envelope PNG (TP-069) | REJECTED — Text ✉ used |
| Search / check / chevron (non-Lucide contexts) | System/Text glyphs where Lucide not applicable |

---

## F2. GRADIENTS (SOFTWARE)

| Item | Status |
| --- | --- |
| `expo-linear-gradient` (TP-072) | **USE APPROVED** — M8A Streak hero/CTA (and production frontend). License MIT (package.json). |

---

## G. BACKGROUNDS / ARTBOARDS

| Asset | TP | Lovable/source | Expo dest | Screens | Provenance | License | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `exalo-home-v2.png` | TP-003 | `exalo/src/assets/exalo-home-v2.png` | `assets/home/` | Home | AI/SynthID | UNKNOWN | APPROVED Home |
| `journey-bg.png` | TP-070 | `exalo/src/assets/journey-bg.png` | `assets/journey/` | Provenance source (baked header) | AI/SynthID | UNKNOWN | **USE APPROVED** |
| `journey-bg-clean.png` | TP-071 | **Derivative of TP-070 only** | `assets/journey/` | Journey runtime | Same as TP-070 | UNKNOWN | **USE APPROVED** (derivative); **LICENSE REVIEW REQUIRED** |
| `maths-train-mode.png` | TP-073 | `exalo/src/assets/maths-train-mode.png` | `assets/train/` | Train Selection `/train/maths` | AI/SynthID | UNKNOWN | M3 introduced; **LICENSE REVIEW REQUIRED**; formal USE APPROVED pending PO visual review |
| `english-train-mode.png` | TP-074 | `exalo/src/assets/english-train-mode.png` | `assets/train/` | Train Selection `/train/english` | AI/SynthID | UNKNOWN | M3 introduced; **LICENSE REVIEW REQUIRED**; formal USE APPROVED pending PO visual review |
| Onboarding page wash | — | CSS `--gradient-bg` | StyleSheet approx. | Onboarding | System/platform recreation | N/A | System |
| `background planets.png` | — | Pack / prior | `assets/backgrounds/` | Optional SpaceBackground | UNKNOWN | UNKNOWN | Not newly expanded this milestone — **not** used as Journey / Train background |

---

## H. AI-GENERATED / SYNTHETIC MATERIALS

| Item | Evidence | Status |
| --- | --- | --- |
| TP-003 `exalo-home-v2.png` | XMP + C2PA Google Generative AI / SynthID | APPROVED for Home use |
| TP-070 `journey-bg.png` | XMP `trainedAlgorithmicMedia` + C2PA / SynthID signals | **USE APPROVED**; LICENSE REVIEW REQUIRED |
| TP-071 `journey-bg-clean.png` | Derivative of TP-070 (header text removed) | **USE APPROVED** as derivative; LICENSE REVIEW REQUIRED |
| TP-073 `maths-train-mode.png` | XMP `trainedAlgorithmicMedia` + C2PA / SynthID signals | M3 introduced; LICENSE REVIEW REQUIRED; formal USE APPROVED pending |
| TP-074 `english-train-mode.png` | XMP `trainedAlgorithmicMedia` + C2PA / SynthID signals | M3 introduced; LICENSE REVIEW REQUIRED; formal USE APPROVED pending |
| TP-068 `onboarding_email_hero.png` | AI meta previously noted | **REJECTED / DO NOT USE** |

---

## I. UNKNOWN PROVENANCE

TP-058, TP-059, TP-060, TP-025…TP-030 — provenance unknown beyond Lovable repo presence; **approved for specified use**; license unknown.

---

## J. LICENSE REVIEW REQUIRED

| TP / item | Notes |
| --- | --- |
| TP-003 | Approved use; license still UNKNOWN |
| TP-070 | USE APPROVED; license UNKNOWN — LICENSE REVIEW REQUIRED |
| TP-071 | USE APPROVED (derivative of TP-070); license UNKNOWN — LICENSE REVIEW REQUIRED |
| TP-073 | M3 Train Selection maths artboard; license UNKNOWN — LICENSE REVIEW REQUIRED |
| TP-074 | M3 Train Selection english artboard; license UNKNOWN — LICENSE REVIEW REQUIRED |
| TP-058 | Approved use; license UNKNOWN |
| TP-059 | Approved use; license UNKNOWN |
| TP-060 | Approved use; license UNKNOWN |
| TP-025…030 | Approved use; license UNKNOWN |
| OSS deps | Confirm LICENSE files for redistribution notices |

---

## K. ATTRIBUTION REQUIREMENTS

| Material | Requirement |
| --- | --- |
| Fredoka TP-001 | Preserve `assets/fonts/OFL.txt` |
| TP-003 / onboarding PNGs | No OSS attribution formula established; retain embedded metadata where preserved |

---

## L. REJECTED / DEFERRED / NO-LONGER-USED ITEMS

| TP / item | Status | Notes |
| --- | --- | --- |
| TP-002 | REJECTED | — |
| TP-004 Lucide | Was REJECTED; **2026-09-17 REOPEN APPROVED** for Streak / Lovable-Lucide UI scope | `lucide-react-native` + `react-native-svg` |
| TP-005 / TP-007 packs | REJECTED AS BUNDLE | — |
| TP-006 generated pack | DEFERRED as pack | Split decisions below |
| **TP-067** `progress_rocket.png` | **REJECTED** | Removed from `NavigationAssets`; Text 🚀 in ProgressBar |
| **TP-068** `onboarding_email_hero.png` | **REJECTED / DO NOT USE** | Removed from `OnboardingAssets`; file may remain on disk unused |
| **TP-069** `envelope_icon.png` | **REJECTED** | Removed from `NavigationAssets`; Text ✉ |
| TP-008…TP-024 | Deferred / not required historically | Retained IDs |

---

## ONBOARDING MILESTONE GOVERNANCE SUMMARY

NEWLY DISCOVERED THIRD-PARTY/OPEN-SOURCE ITEMS: NONE (beyond previously audited TP IDs)

NEWLY APPROVED ITEMS: TP-058, TP-059, TP-060, TP-025, TP-026, TP-027, TP-028, TP-029, TP-030

NEWLY REJECTED ITEMS: TP-067, TP-068, TP-069

NEWLY USED ITEMS: TP-058, TP-059, TP-060, TP-025…TP-030 (onboarding runtime)

ITEMS NO LONGER USED: TP-067, TP-068, TP-069 (runtime references removed)

LICENSE REVIEW REQUIRED: TP-003, TP-058, TP-059, TP-060, TP-025…TP-030

NEW PACKAGES: NONE

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER: UPDATED AND REVIEWED
