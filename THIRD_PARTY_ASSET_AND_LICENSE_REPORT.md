# THIRD_PARTY_ASSET_AND_LICENSE_REPORT

**Project:** `C:\projects\exalofrontendapp`  
**Companion:** `THIRD_PARTY_APPROVAL_REQUEST.md`  
**Nature:** PERMANENT CUMULATIVE governance register (not milestone-only)  
**Last updated:** 2026-09-16 (Onboarding parity — approvals recorded; five-step implemented)

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
| Lucide (TP-004) | REJECTED |
| Onboarding progress rocket image (TP-067) | REJECTED — Text 🚀 used |
| Envelope PNG (TP-069) | REJECTED — Text ✉ used |
| Search / check / chevron | System/Text glyphs |

---

## G. BACKGROUNDS / ARTBOARDS

| Asset | TP | Lovable/source | Expo dest | Screens | Provenance | License | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `exalo-home-v2.png` | TP-003 | `exalo/src/assets/exalo-home-v2.png` | `assets/home/` | Home | AI/SynthID | UNKNOWN | APPROVED Home |
| Onboarding page wash | — | CSS `--gradient-bg` | StyleSheet approx. | Onboarding | System/platform recreation | N/A | System |
| `background planets.png` | — | Pack / prior | `assets/backgrounds/` | Optional SpaceBackground | UNKNOWN | UNKNOWN | Not newly expanded this milestone |

---

## H. AI-GENERATED / SYNTHETIC MATERIALS

| Item | Evidence | Status |
| --- | --- | --- |
| TP-003 `exalo-home-v2.png` | XMP + C2PA Google Generative AI / SynthID | APPROVED for Home use |
| TP-068 `onboarding_email_hero.png` | AI meta previously noted | **REJECTED / DO NOT USE** |

---

## I. UNKNOWN PROVENANCE

TP-058, TP-059, TP-060, TP-025…TP-030 — provenance unknown beyond Lovable repo presence; **approved for specified use**; license unknown.

---

## J. LICENSE REVIEW REQUIRED

| TP / item | Notes |
| --- | --- |
| TP-003 | Approved use; license still UNKNOWN |
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
| TP-004 Lucide | REJECTED | Text/system substitutes |
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
