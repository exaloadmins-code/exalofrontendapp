# THIRD_PARTY_ASSET_AND_LICENSE_REPORT

**Project:** `C:\projects\exalofrontendapp`  
**Companion:** `THIRD_PARTY_APPROVAL_REQUEST.md`  
**Nature:** PERMANENT CUMULATIVE governance register (not milestone-only)  
**Last updated:** 2026-09-22 (documentation remediation — M4/M5 status, Lucide usage map, JFIF→PNG lineage, Train 848×1264, unused/preloaded register, root LICENSE clarification)

> Manual product-owner **APPROVAL** authorizes specified product use only.  
> It does **not** establish Exalo ownership, open-source license, or completed legal terms review.  
> AI-generated / SynthID / C2PA provenance does **not** establish Exalo originality or commercial rights.

### Classification system (exact)

1. EXALO ORIGINAL  
2. OPEN SOURCE  
3. THIRD-PARTY LICENSED  
4. THIRD-PARTY — LICENSE UNKNOWN  
5. PROVENANCE UNKNOWN  
6. SYSTEM / PLATFORM  

---

## CURRENT FRONTEND MILESTONE STATUS (2026-09-22)

| Milestone | Status (repository evidence) |
| --- | --- |
| M1 Home / onboarding foundation | Implemented |
| M2 Journey | Implemented (runtime TP-071) |
| M3 Train Selection | Implemented (`/train/:subject`; TP-073 / TP-074) |
| M4 Train Gameplay | **Implemented** (`/train/[subject]/[topic]`; local question seam; Lucide + LinearGradient) |
| M5 Train Results | **Implemented** (`/train/[subject]/[topic]/results`; `TrainResultsView`) |
| M6 Focus | **Not complete** — placeholder route only (`app/focus/[subject].tsx`) |
| M7 Test | **Not complete** — placeholder route only (`app/test/[subject].tsx`) |
| M8 Streak / Badges / Score / Profile / Parents | Implemented (utility/profile screens) |

Backend `/train/*` APIs remain **parked** for frontend Train. This register is **frontend-only** (not question-bank generation).

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
| 2026-09-17 | **M2 Journey header:** TP-071 `journey-bg-clean.png` derived from TP-070 — baked “Maths” / “Choose your path” removed; local star-field reconstructed from TP-070 only. Runtime uses TP-071. LICENSE REVIEW REQUIRED (inherits TP-070). No new packages. Derivation script: `scripts/derive_journey_bg_clean.py`. |
| 2026-09-17 | **M2 Journey closure:** PRODUCT-OWNER VISUAL REVIEW **APPROVED** (Maths + English). Native device matrix remains **NOT YET DEVICE-VERIFIED** (iOS/Android × portrait/landscape). TP-070/TP-071 license status unchanged. |
| 2026-09-17 | **M8A Streak:** Native composable Streak screen at `/streak`. (Later same day: TP-072 + TP-004 approved and installed — see below.) |
| 2026-09-17 | **M8A hero/icon parity gate:** Exact hero LinearGradient needs **TP-072** `expo-linear-gradient` (APPROVAL REQUIRED). Lucide icons need **TP-004 reopen** for Streak (APPROVAL REQUIRED). |
| 2026-09-17 | **M8A PO decision:** TP-072 **USE APPROVED**; TP-004 **REOPEN APPROVED** / **USE APPROVED** (Streak + shared UI where Lovable uses Lucide). Installed `expo-linear-gradient@57.0.2` (MIT), `lucide-react-native@1.47.0` (ISC), `react-native-svg@15.15.4` (MIT). |
| 2026-09-17 | **M8A Lucide Metro fix:** Pinned **`lucide-react-native@0.575.0`** (ISC). `react-native-svg@15.15.4` unchanged. |
| 2026-09-18 | **M8A Shields + sticky CTA:** Shields stat uses Lucide `Shield` (production adaptation; Lovable source remains emoji). |
| 2026-09-18 | **M8 Badges:** `/badges`. Reuses TP-072 + TP-004. Badge icons = genuine Lovable emoji. |
| 2026-09-18 | **M8 Score:** `/score`. Reuses TP-072 + TP-004 (`Target`/`Zap`/`Repeat`/`Mountain`). |
| 2026-09-21 | **M3 Train Selection:** `/train/:subject`. Copied TP-073 / TP-074 from Lovable. LICENSE REVIEW REQUIRED. *(Historical note: at introduction, topic CTA was an M3 boundary placeholder; **superseded** by M4/M5 — see below.)* |
| 2026-09-21+ | **M4 Train Gameplay:** Implemented composable `TrainQuizPlayer`; local `loadTrainQuestions` seam; no `/train/start`. Reuses TP-004 Lucide + TP-072 LinearGradient. No new visual TP assets. |
| 2026-09-21+ | **M5 Train Results:** Implemented `TrainResultsView` on `/train/[subject]/[topic]/results`. Reuses TP-004 Lucide. No new visual TP assets / packages. |
| 2026-09-22 | **Register remediation (docs only):** Corrected Train artboard dimensions to **848×1264**; expanded TP-004 usage map through M4/M5 + utility screens; documented JFIF→PNG format conversion for TP-058/059/060 and TP-025…030; clarified root LICENSE vs product/asset IP; added unused/preloaded/rejected distinction; app icon/splash provenance; NOTICE follow-up. |

---

## M3 TRAIN SELECTION — GOVERNANCE NOTE

NEWLY DISCOVERED THIRD-PARTY ITEMS: **TP-073** `maths-train-mode.png`, **TP-074** `english-train-mode.png`  
NEW PACKAGES: NONE  
NEW OPEN-SOURCE VISUAL ASSETS: NONE  
REJECTED ASSETS REUSED: NONE  

**PRODUCT-OWNER VISUAL REVIEW:** PENDING (formal USE APPROVED confirmation for TP-073/074 as recorded at introduction)  
**Native device verification:** NOT YET DEVICE-VERIFIED (iOS/Android × portrait/landscape)  

**Backend / DB / `/train/start` / question-bank:** NONE (explicitly parked for frontend Train)  

**Supersession:** M4 Train Gameplay and M5 Train Results **are implemented**. Do **not** treat the topic route as an M3-only placeholder.

TP-073 / TP-074: **LICENSE REVIEW REQUIRED.** Intrinsic size verified **848×1264** (2026-09-22). Byte-identical to Lovable sources (SHA256 match in provenance audit).

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER: UPDATED — see TP-073 / TP-074 below and sections G / H / J.

---

## M4 TRAIN GAMEPLAY — GOVERNANCE NOTE

NEW VISUAL TP ASSETS: NONE  
NEW PACKAGES: NONE (reuses TP-004 Lucide, TP-072 LinearGradient)  
NEW OPEN-SOURCE VISUAL ASSETS: NONE  

Gameplay background is software/theme (`#070421` / train gameplay tokens) — not a new artboard TP.  
Questions: temporary local frontend seam only — **not** covered by this frontend asset register’s ownership claims.

**Native device verification:** NOT YET DEVICE-VERIFIED  

---

## M5 TRAIN RESULTS — GOVERNANCE NOTE

NEW VISUAL TP ASSETS: NONE  
NEW PACKAGES: NONE (reuses TP-004 Lucide)  
Results background is software/theme (`#070421` / results tokens).  
In-memory result handoff only — no AsyncStorage result history; no backend results APIs.

**Native device verification:** NOT YET DEVICE-VERIFIED (web manual verification reported PASS by product owner; native matrix still open)

---

## M2 JOURNEY — GOVERNANCE NOTE

NEWLY DISCOVERED THIRD-PARTY ITEM: **TP-070** `journey-bg.png`  
DERIVED ASSET: **TP-071** `journey-bg-clean.png` (from TP-070 only)  
NEW PACKAGES: NONE  
NEW OPEN-SOURCE VISUAL ASSETS: NONE  
REJECTED ASSETS REUSED: NONE (TP-067/068/069 remain unused)

**PRODUCT-OWNER VISUAL REVIEW:** APPROVED (Maths Journey + English Journey)  
**Native device verification:** NOT YET DEVICE-VERIFIED (iOS/Android × portrait/landscape)

TP-070 / TP-071: **USE APPROVED** does **not** clear license — both remain **LICENSE REVIEW REQUIRED**.  
TP-071 remains a **DERIVATIVE OF TP-070** (not Exalo-original). Local derivation does **not** create new ownership.  
Derivation tooling: `scripts/derive_journey_bg_clean.py` (Pillow used as tooling only; not a shipped frontend visual dependency).

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

## ROOT LICENSE vs EXALO PRODUCT / ASSET IP

| Item | Path | Finding |
| --- | --- | --- |
| Root `LICENSE` | `/LICENSE` | Expo scaffold / template **MIT** text associated with **650 Industries, Inc. (aka Expo)** — software scaffold notice |
| What it is **not** | — | Proof that Exalo owns product artwork; proof that all assets are MIT-licensed; Exalo product copyright assignment; coverage of question/content IP |

**A. Scaffold / software licensing** — Expo/React Native stack packages carry their own OSS licences (section B).  
**B. Exalo product / asset / content ownership** — visual TP assets remain classified per sections M / G / I / J; unresolved items stay **LICENSE REVIEW REQUIRED**.

**DOCUMENTATION / LEGAL FOLLOW-UP REQUIRED:** consider a future Exalo-specific copyright / product-IP notice distinct from the Expo scaffold `LICENSE`. Do not invent legal language in this register.

---

## M. MANUALLY APPROVED PRODUCT-USE ITEMS

### TP-003 — `exalo-home-v2.png` (Home)

| Field | Value |
| --- | --- |
| Filename | `exalo-home-v2.png` |
| Source | `C:\projects\exalo\src\assets\exalo-home-v2.png` |
| Destination | `assets/home/exalo-home-v2.png` |
| Copy relationship | Byte-identical Lovable ↔ Expo (provenance audit SHA256) |
| Intrinsic size | 843×1264 |
| Provenance | AI-GENERATED / SYNTHETIC (XMP trainedAlgorithmicMedia; Google C2PA / SynthID) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** — M1 Home artboard only |
| Open-source? | **No** |
| Note | AI / SynthID evidence ≠ Exalo originality |

### TP-058 — `onb-rocket.png`

| Field | Value |
| --- | --- |
| Source | `C:\projects\exalo\src\assets\onb-rocket.png` |
| Destination | `assets/onboarding/onb-rocket.png` |
| Screens | Email, Year |
| Format conversion | Lovable file is **JPEG/JFIF** binary despite `.png` extension (`FF D8 FF E0…`). Expo destination is **true PNG** (`89 50 4E 47…`). **FORMAT CONVERSION only** — does **not** establish new ownership or change underlying provenance/licensing. |
| Provenance | UNKNOWN (Lovable asset lineage; no AI meta found in prior audit) |
| Classification | **PROVENANCE UNKNOWN** |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** — Lovable-faithful onboarding Email + Year |
| Open-source? | **No** |

### TP-059 — `onb-astronaut-wave.png`

| Field | Value |
| --- | --- |
| Source | `C:\projects\exalo\src\assets\onb-astronaut-wave.png` |
| Destination | `assets/onboarding/onb-astronaut-wave.png` |
| Screens | Name |
| Format conversion | Same JFIF-as-`.png` → true PNG lineage as TP-058 (FORMAT CONVERSION; no new ownership) |
| Provenance | UNKNOWN |
| Classification | **PROVENANCE UNKNOWN** |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** — Lovable-faithful Name |
| Open-source? | **No** |

### TP-060 — `onb-astronaut-goal.png`

| Field | Value |
| --- | --- |
| Source | `C:\projects\exalo\src\assets\onb-astronaut-goal.png` |
| Destination | `assets/onboarding/onb-astronaut-goal.png` (+ `assets/astronauts/onb-astronaut-goal.png` byte-identical duplicate retained) |
| Screens | School (runtime uses `OnboardingAssets.goalAstronaut`) |
| Format conversion | Same JFIF-as-`.png` → true PNG lineage as TP-058 (FORMAT CONVERSION; no new ownership) |
| Intra-Expo duplicate | `assets/astronauts/onb-astronaut-goal.png` ≡ `assets/onboarding/onb-astronaut-goal.png` (SHA256) — provenance traceability only; do not treat as cleanup |
| Provenance | UNKNOWN |
| Classification | **PROVENANCE UNKNOWN** |
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
| Source | `C:\projects\exalo\src\assets\avatar-*.png` |
| Screens | Avatar onboarding; ProfilePill / selected-avatar display |
| Format conversion | Lovable counterparts are **JPEG/JFIF** despite `.png` names; Expo copies are **true PNG**. **FORMAT CONVERSION only** — no new ownership; LICENSE REVIEW REQUIRED unchanged |
| Provenance | UNKNOWN |
| Classification | **PROVENANCE UNKNOWN** |
| License | UNKNOWN — LICENSE REVIEW REQUIRED |
| Manual use status | **APPROVED BY PRODUCT OWNER** |
| Open-source? | **No** |
| Prior note | Not approved for M1 Home; approved 2026-09-16 for onboarding + profile display |

### TP-070 — `journey-bg.png` (Journey provenance source)

| Field | Value |
| --- | --- |
| Filename | `journey-bg.png` |
| Source | `C:\projects\exalo\src\assets\journey-bg.png` |
| Destination | `assets/journey/journey-bg.png` |
| Copy relationship | Byte-identical Lovable ↔ Expo |
| Screens | Provenance source; **not** active Journey runtime after TP-071 |
| Intrinsic size | 843×1264 |
| Provenance | AI-GENERATED / SYNTHETIC (XMP `trainedAlgorithmicMedia`; C2PA / SynthID signals) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** (+ AI-generated evidence) |
| License | UNKNOWN — **LICENSE REVIEW REQUIRED** |
| Manual use status | **USE APPROVED BY PRODUCT OWNER** — Journey artboard family |
| Open-source? | **No** |
| Note | Contains baked header text “Maths” / “Choose your path”; retained unchanged for provenance. Registered in `JourneyAssets.artboardSource` / preload; **PRESENT — APPARENTLY UNUSED IN CURRENT UI** as displayed artboard (runtime uses TP-071). |

### TP-071 — `journey-bg-clean.png` (Journey runtime — DERIVATIVE OF TP-070)

| Field | Value |
| --- | --- |
| Filename | `journey-bg-clean.png` |
| Source | **DERIVATIVE OF TP-070** only (`assets/journey/journey-bg.png`) |
| Destination | `assets/journey/journey-bg-clean.png` |
| Screens | Journey runtime (Maths + English) via `JourneyAssets.artboard` |
| Intrinsic size | 843×1264 (unchanged) |
| Modification | Baked “Maths” and “Choose your path” header removed; underlying local star-field reconstructed from TP-070 pixels only (no external imagery) |
| Provenance | Same as TP-070 (derivative; **not** Exalo-original) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** (inherits TP-070) |
| License | UNKNOWN — **LICENSE REVIEW REQUIRED** |
| Manual use status | **USE APPROVED** as narrowly scoped derivative required to make approved TP-070 subject-neutral |
| Open-source? | **No** |
| Derivation tooling | `scripts/derive_journey_bg_clean.py` (Pillow) — local derivation ≠ new ownership |

### TP-073 — `maths-train-mode.png` (Maths Train Selection artboard)

| Field | Value |
| --- | --- |
| Filename | `maths-train-mode.png` |
| Source | `C:\projects\exalo\src\assets\maths-train-mode.png` |
| Destination | `assets/train/maths-train-mode.png` |
| Copy relationship | Byte-identical Lovable ↔ Expo |
| Screens | Train Selection `/train/maths` (M3) |
| Intrinsic size | **848×1264** (verified 2026-09-22; prior register value 843×1264 was incorrect) |
| Provenance | XMP `trainedAlgorithmicMedia` + C2PA / SynthID / Google Generative AI signals (same class as TP-003 / TP-070) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** |
| License | UNKNOWN — **LICENSE REVIEW REQUIRED** |
| Manual use status | Introduced for M3 Train Selection parity; **formal USE APPROVED pending PO visual review** (as last recorded) |

### TP-074 — `english-train-mode.png` (English Train Selection artboard)

| Field | Value |
| --- | --- |
| Filename | `english-train-mode.png` |
| Source | `C:\projects\exalo\src\assets\english-train-mode.png` |
| Destination | `assets/train/english-train-mode.png` |
| Copy relationship | Byte-identical Lovable ↔ Expo |
| Screens | Train Selection `/train/english` (M3) |
| Intrinsic size | **848×1264** (verified 2026-09-22; prior register value 843×1264 was incorrect) |
| Provenance | XMP `trainedAlgorithmicMedia` + C2PA / SynthID / Google Generative AI signals (same class as TP-003 / TP-070) |
| Classification | **THIRD-PARTY — LICENSE UNKNOWN** |
| License | UNKNOWN — **LICENSE REVIEW REQUIRED** |
| Manual use status | Introduced for M3 Train Selection parity; **formal USE APPROVED pending PO visual review** (as last recorded) |

### TP-001 — Fredoka

| Field | Value |
| --- | --- |
| Files | `assets/fonts/Fredoka-wdth-wght.ttf`, `assets/fonts/OFL.txt` |
| License | SIL OFL-1.1 (evidence: bundled OFL.txt) |
| Manual use status | **CONDITIONALLY APPROVED** |
| Classification | OPEN SOURCE (font) |
| Attribution | Preserve `assets/fonts/OFL.txt` |

### TP-004 — `lucide-react-native` (icons)

| Field | Value |
| --- | --- |
| Package | `lucide-react-native` **0.575.0** (exact) |
| Peer | `react-native-svg` **15.15.4** (MIT) |
| License | **ISC** (`node_modules/lucide-react-native/package.json`) |
| Classification | **OPEN SOURCE** |
| Manual use status | **REOPEN APPROVED / USE APPROVED** — Streak and shared UI where Lovable uses Lucide; expanded production usage through M4/M5 and utility screens |
| Current usage map (verified imports, 2026-09-22) | See section F |

### TP-072 — `expo-linear-gradient`

| Field | Value |
| --- | --- |
| Package | `expo-linear-gradient` ~57.0.2 / installed **57.0.2** |
| License | **MIT** |
| Classification | **OPEN SOURCE** |
| Manual use status | **USE APPROVED** — Streak/Badges/Score/Profile/Parents gradients; also Train Gameplay |

---

## A. EXALO ORIGINAL ASSETS

None newly classified with deed/provenance establishing Exalo originality for visual materials.  
Repository presence, Lovable copy, AI generation, PNG re-encode, or local derivative edits do **not** establish EXALO ORIGINAL.

---

## B. OPEN-SOURCE SOFTWARE

Declared in `package.json`; installed versions / licences verified from `node_modules/<pkg>/package.json` (2026-09-22).

| Package | Declared | Installed | Role | Runtime/dev | License | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| expo | ~57.0.11 | 57.0.11 | App framework | runtime | MIT | Scaffold |
| react | 19.2.3 | 19.2.3 | UI | runtime | MIT | |
| react-native | 0.86.2 | 0.86.2 | Native UI | runtime | MIT | |
| expo-router | ~57.0.11 | 57.0.11 | File routing | runtime | MIT | |
| expo-font | ~57.0.1 | 57.0.1 | Font loading | runtime | MIT | TP-001 companion |
| expo-asset | ~57.0.9 | 57.0.9 | Asset loading / preload | runtime | MIT | |
| expo-constants | ~57.0.9 | 57.0.9 | Constants | runtime | MIT | |
| expo-linking | ~57.0.5 | 57.0.5 | Deep links / DEV reset URL | runtime | MIT | |
| expo-splash-screen | ~57.0.5 | 57.0.5 | Splash | runtime | MIT | |
| expo-status-bar | ~57.0.1 | 57.0.1 | Status bar | runtime | MIT | |
| @react-native-async-storage/async-storage | 2.2.0 | 2.2.0 | Local persistence | runtime | MIT | |
| react-native-safe-area-context | ~5.7.0 | 5.7.0 | Safe areas | runtime | MIT | |
| react-native-screens | ~4.26.0 | 4.26.2 | Native screens | runtime | MIT | |
| react-native-gesture-handler | ~2.32.0 | 2.32.0 | Gestures | runtime | MIT | |
| react-dom | 19.2.3 | 19.2.3 | Web | runtime | MIT | |
| react-native-web | ^0.21.2 | 0.21.2 | Web | runtime | MIT | |
| expo-linear-gradient | ~57.0.2 | 57.0.2 | Gradients | runtime | MIT | **TP-072 USE APPROVED** |
| lucide-react-native | 0.575.0 | 0.575.0 | Icons | runtime | ISC | **TP-004 USE APPROVED** |
| react-native-svg | 15.15.4 | 15.15.4 | SVG peer for Lucide | runtime | MIT | Companion to TP-004 |
| typescript | ~6.0.3 | 6.0.3 | Types | dev | Apache-2.0 | |
| @types/react | ~19.2.2 | 19.2.18 | Types | dev | MIT | |

**NOTICE / REDISTRIBUTION REVIEW REQUIRED:** a cumulative production NOTICE assembling MIT/ISC/Apache-2.0 (and Fredoka OFL) texts has not been prepared in-repo. Retain package LICENSE files when redistributing.

Exact license text: verify under each package’s LICENSE file in `node_modules` when preparing redistribution notices.

---

## C. OPEN-SOURCE VISUAL ASSETS

None (approved onboarding/artboard PNGs are **not** OSS unless evidence establishes a license).  
Fredoka is an **open-source font** (TP-001), not a raster visual.

---

## D. THIRD-PARTY LICENSED ASSETS

None with an established third-party commercial license deed for the product PNGs.  
Approved items remain **THIRD-PARTY — LICENSE UNKNOWN** or **PROVENANCE UNKNOWN** under product-owner use approval (section M).

---

## E. FONTS

| Font | TP | Status | License |
| --- | --- | --- | --- |
| Fredoka variable | TP-001 | CONDITIONALLY APPROVED | SIL OFL-1.1 — preserve `assets/fonts/OFL.txt` |
| System / platform fallbacks | — | Implicit RN/web | SYSTEM / PLATFORM |

---

## F. ICONS / ICON SYSTEMS

### TP-004 Lucide — current usage map (verified 2026-09-22)

| Screen / module | Import evidence | Icons |
| --- | --- | --- |
| Home `app/home/index.tsx` | lucide-react-native | ChevronDown |
| Train Gameplay `src/components/train/TrainQuizPlayer.tsx` | lucide-react-native | ArrowLeft, Check, ChevronRight, Lightbulb, X |
| Train Results `src/components/train/TrainResultsView.tsx` | lucide-react-native | Check, Home, RotateCcw, X |
| Streak `app/streak.tsx` | lucide-react-native | AlertTriangle, ArrowLeft, ChevronDown, ChevronRight, Clock, Flame, HeartCrack, Palmtree, Rocket, Shield, Sparkles, Star, TrendingUp |
| Badges `app/badges.tsx` | lucide-react-native | ArrowLeft, Award, ChevronDown, Hourglass, Lock, Sparkles |
| Score `app/score.tsx` | lucide-react-native | ArrowLeft, ChevronDown, Mountain, Repeat, Target, Zap |
| Profile `app/profile.tsx` | lucide-react-native | AlertTriangle, Bell, Bug, Check, ChevronDown, ChevronRight, CreditCard, Download, FileText, Flame, HelpCircle, LifeBuoy, Lightbulb, LogOut, Mail, Moon, Palette, Send, Settings, ShieldCheck, User, UserCog, Volume2, X |
| Parents `app/parents.tsx` | lucide-react-native | AlertTriangle, ArrowLeft, Award, BarChart3, BookOpen, Brain, Calculator, Calendar, ChevronDown, Clock, Download, FileText, History, Lightbulb, Sparkles, Target, TreePalm, Trophy |

| Item | Status |
| --- | --- |
| Lucide via `lucide-react-native` (TP-004) | **REOPEN APPROVED / USE APPROVED**. Installed **0.575.0** (ISC). Peer: `react-native-svg@15.15.4` MIT. **Shields stat adaptation:** Lovable = emoji `🛡`; Expo = Lucide `Shield` for contrast — not a claim Lovable uses Lucide for that glyph. |
| Custom PNG nav icons | `assets/navigation/home_icon.png`, `parents_icon.png` — **PROVENANCE UNKNOWN**; LICENSE REVIEW REQUIRED; used in `BottomNavigation` |
| Onboarding progress rocket image (TP-067) | **REJECTED** — Text 🚀 used |
| Envelope PNG (TP-069) | **REJECTED** — Text ✉ used |
| Emoji / Text glyphs | SYSTEM / PLATFORM where used as UI |

---

## F2. GRADIENTS (SOFTWARE)

| Item | Status |
| --- | --- |
| `expo-linear-gradient` (TP-072) | **USE APPROVED** — Streak / Badges / Score / Profile / Parents; also Train Gameplay. License MIT. |

---

## G. BACKGROUNDS / ARTBOARDS / SCREEN MATERIAL MAP

| Screen | Background / material | TP / class |
| --- | --- | --- |
| Home | TP-003 `exalo-home-v2.png` artboard | 4 + LRR |
| Journey | TP-071 clean derivative of TP-070 | 4 + LRR |
| Train Selection Maths | TP-073 (848×1264) | 4 + LRR |
| Train Selection English | TP-074 (848×1264) | 4 + LRR |
| Onboarding | TP-058 / TP-059 / TP-060 heroes + theme wash | 5 + LRR; wash = 6 |
| Train Gameplay | Theme `#070421` + software UI (no artboard TP) | 6 / software |
| Train Results | Theme `#070421` + software UI | 6 / software |
| Streak / Badges / Score | Theme + LinearGradient (TP-072) + Lucide (TP-004) | 2 |
| Profile / Parents | Theme + LinearGradient + Lucide | 2 |
| Gallery / `SpaceBackground` | `background planets.png` (+ optional planet overlays) | 5 + LRR |
| Focus / Test | Placeholders only — **no final visual materials claimed** | — |

| Asset | TP | Lovable/source | Expo dest | Screens | Provenance | License | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `exalo-home-v2.png` | TP-003 | Lovable (byte-identical) | `assets/home/` | Home | AI/SynthID | UNKNOWN | APPROVED Home |
| `journey-bg.png` | TP-070 | Lovable (byte-identical) | `assets/journey/` | Provenance source | AI/SynthID | UNKNOWN | **USE APPROVED** |
| `journey-bg-clean.png` | TP-071 | Derivative of TP-070 only | `assets/journey/` | Journey runtime | Inherits TP-070 | UNKNOWN | **USE APPROVED** (derivative) |
| `maths-train-mode.png` | TP-073 | Lovable (byte-identical) | `assets/train/` | Train Selection maths | AI/SynthID | UNKNOWN | LRR; formal USE APPROVED pending |
| `english-train-mode.png` | TP-074 | Lovable (byte-identical) | `assets/train/` | Train Selection english | AI/SynthID | UNKNOWN | LRR; formal USE APPROVED pending |
| Onboarding page wash | — | CSS `--gradient-bg` | StyleSheet | Onboarding | Recreated | N/A | System |
| `background planets.png` | — | OneDrive/pack lineage | `assets/backgrounds/` | SpaceBackground / gallery | UNKNOWN | UNKNOWN | LRR — not Journey/Train artboard |

---

## G2. ASSET USAGE CLASSES (UI vs preload)

Evidence: `src/constants/assets.ts` registry; UI `require`/component references; `src/services/assets.ts` `collectImageModules()` + `AssetProvider` preload of registered buckets.

### A. USED IN PRODUCT UI

Home artboard (TP-003); Journey clean (TP-071); Train Selection artboards (TP-073/074); onboarding heroes (TP-058/059/060); avatars (TP-025…030); nav `home_icon` / `parents_icon`; SpaceBackground planets (gallery/`Screen` path); Fredoka; Lucide; LinearGradient.

### B. PRESENT / PRELOADED BUT APPARENTLY UNUSED IN CURRENT UI

Registered and included in `collectImageModules()` / `AssetProvider`, with **no current screen Image usage found** (2026-09-22 search):

- `assets/branding/exalo logo.png` (`BrandingAssets.logo`)
- Rocket pack: `rocket.png`, `rocket-only.png`, `rocket_main.png`, `launchpad.png`
- Subject pack: `maths.png`, `maths_card.png`, `english_card.png`, `book.png`
- Gamification pack: `badge.png`, `badge_card.png`, `flame.png`, `streak_card.png`
- `assets/decorative/rocket_flame.png`
- `assets/miscellaneous/avatar.png`
- `assets/astronauts/onb-astronaut-goal.png` (duplicate of onboarding TP-060 file; School uses onboarding path)
- TP-070 `journey-bg.png` as **displayed** artboard (retained for provenance; runtime shows TP-071)

Wording: **PRESENT — APPARENTLY UNUSED IN CURRENT UI** (may still be preloaded at bootstrap).

### C. REJECTED / UNUSED

TP-067, TP-068, TP-069 — see section L. May remain on disk; **not** approved production assets; **LICENSE REVIEW REQUIRED** if ever reused.

### D. REFERENCE-ONLY

Lovable repo assets not copied into Expo; exalo-mobile scaffold icons (technical reference only — not visual authority).

---

## H. AI-GENERATED / SYNTHETIC MATERIALS

| Item | Evidence | Status |
| --- | --- | --- |
| TP-003 `exalo-home-v2.png` | XMP + C2PA Google Generative AI / SynthID | APPROVED for Home use; **not** EXALO ORIGINAL; LRR |
| TP-070 `journey-bg.png` | XMP `trainedAlgorithmicMedia` + C2PA / SynthID | **USE APPROVED**; LRR |
| TP-071 `journey-bg-clean.png` | Derivative of TP-070 only | **USE APPROVED** as derivative; LRR; **not** EXALO ORIGINAL |
| TP-073 `maths-train-mode.png` | XMP + C2PA / SynthID | LRR; formal USE APPROVED pending |
| TP-074 `english-train-mode.png` | XMP `trainedAlgorithmicMedia` + C2PA / SynthID | LRR; formal USE APPROVED pending |
| TP-068 `onboarding_email_hero.png` | AI meta previously noted | **REJECTED / DO NOT USE** |

AI-generated provenance ≠ copyright ownership, commercial rights, or redistribution rights.

---

## I. UNKNOWN PROVENANCE

- TP-058, TP-059, TP-060, TP-025…TP-030 — Lovable lineage + JFIF→PNG conversion; approved for specified use; license unknown  
- Pack assets (branding logo, rockets, subjects, gamification, decorative, miscellaneous avatar, planets background)  
- Custom navigation PNG icons  
- App icon / adaptive icons / splash / favicon (section I2)  

---

## I2. APP ICON / SPLASH / FAVICON

Configured in `app.json`:

| Asset | Path | Role | Classification | Review |
| --- | --- | --- | --- | --- |
| App icon | `assets/icon.png` | `expo.icon` | PROVENANCE UNKNOWN | LICENSE REVIEW REQUIRED |
| Android adaptive foreground | `assets/android-icon-foreground.png` | adaptiveIcon | PROVENANCE UNKNOWN | LICENSE REVIEW REQUIRED |
| Android adaptive background | `assets/android-icon-background.png` | adaptiveIcon | PROVENANCE UNKNOWN | LICENSE REVIEW REQUIRED |
| Android monochrome | `assets/android-icon-monochrome.png` | adaptiveIcon | PROVENANCE UNKNOWN | LICENSE REVIEW REQUIRED |
| Splash image | `assets/splash-icon.png` | expo-splash-screen plugin | PROVENANCE UNKNOWN | LICENSE REVIEW REQUIRED |
| Web favicon | `assets/favicon.png` | `web.favicon` | PROVENANCE UNKNOWN | LICENSE REVIEW REQUIRED |

Do **not** assume Exalo-original or Expo defaults without specific evidence for each file.

---

## J. LICENSE REVIEW REQUIRED (master)

| TP / item | Notes |
| --- | --- |
| TP-003 | Approved use; license UNKNOWN |
| TP-070 | USE APPROVED; license UNKNOWN |
| TP-071 | USE APPROVED (derivative of TP-070); license UNKNOWN |
| TP-073 | Train Selection maths; **848×1264**; license UNKNOWN; formal USE APPROVED pending |
| TP-074 | Train Selection english; **848×1264**; license UNKNOWN; formal USE APPROVED pending |
| TP-058 / TP-059 / TP-060 | Approved use; JFIF→PNG conversion documented; license UNKNOWN |
| TP-025…030 | Approved use; JFIF→PNG conversion documented; license UNKNOWN |
| Pack PNGs (branding, rockets, subjects, gamification, decorative, misc avatar) | PROVENANCE UNKNOWN; often preloaded |
| `background planets.png` / planet overlays | PROVENANCE UNKNOWN |
| Custom nav icons `home_icon.png` / `parents_icon.png` | PROVENANCE UNKNOWN |
| App icon / adaptive / splash / favicon | PROVENANCE UNKNOWN |
| Root `LICENSE` vs Exalo product/asset IP | Clarification / follow-up — Expo scaffold ≠ asset ownership |
| OSS NOTICE / redistribution | Cumulative NOTICE not yet prepared |
| TP-067 / TP-068 / TP-069 | Rejected; LRR if ever reused |

---

## K. ATTRIBUTION / NOTICE REQUIREMENTS

| Material | Requirement |
| --- | --- |
| Fredoka TP-001 | Preserve `assets/fonts/OFL.txt` (SIL OFL-1.1) |
| Lucide (ISC) + MIT/Apache frontend packages | Retain applicable copyright/licence notices on redistribution |
| TP artboards / onboarding PNGs | No OSS attribution formula established; retain embedded metadata where preserved |
| Cumulative NOTICE file | **NOTICE / REDISTRIBUTION REVIEW REQUIRED** — not generated in this remediation |

---

## L. REJECTED / DEFERRED / NO-LONGER-USED ITEMS

| TP / item | Status | Notes |
| --- | --- | --- |
| TP-002 | REJECTED | `@expo-google-fonts/fredoka` path historically rejected for canonical app |
| TP-004 Lucide | Was REJECTED; **2026-09-17 REOPEN APPROVED**; usage expanded through M4/M5 + utility screens | `lucide-react-native@0.575.0` + `react-native-svg@15.15.4` |
| TP-005 / TP-007 packs | REJECTED AS BUNDLE | — |
| TP-006 generated pack | DEFERRED as pack | Split decisions historically |
| **TP-067** `assets/navigation/progress_rocket.png` | **REJECTED** | Not in `NavigationAssets`; Text 🚀 in ProgressBar; may remain on disk |
| **TP-068** `assets/onboarding/onboarding_email_hero.png` | **REJECTED / DO NOT USE** | Not in `OnboardingAssets`; may remain on disk (incl. untracked) |
| **TP-069** `assets/icons/envelope_icon.png` | **REJECTED** | Not in runtime icon registry; Text ✉; may remain on disk |
| TP-008…TP-024 | Deferred / not required historically | Retained IDs |

Rejected assets are **not** approved production materials. **LICENSE REVIEW REQUIRED** before any reuse.

---

## ONBOARDING MILESTONE GOVERNANCE SUMMARY

NEWLY DISCOVERED THIRD-PARTY/OPEN-SOURCE ITEMS: NONE (beyond previously audited TP IDs)

NEWLY APPROVED ITEMS: TP-058, TP-059, TP-060, TP-025, TP-026, TP-027, TP-028, TP-029, TP-030

NEWLY REJECTED ITEMS: TP-067, TP-068, TP-069

NEWLY USED ITEMS: TP-058, TP-059, TP-060, TP-025…TP-030 (onboarding runtime)

ITEMS NO LONGER USED: TP-067, TP-068, TP-069 (runtime references removed)

LICENSE REVIEW REQUIRED: TP-003, TP-058, TP-059, TP-060, TP-025…TP-030 (and expanded master list in section J)

NEW PACKAGES: NONE

CUMULATIVE THIRD-PARTY / OPEN-SOURCE REGISTER: UPDATED AND REVIEWED
