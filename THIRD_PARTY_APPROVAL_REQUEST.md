# EXALO THIRD-PARTY / OPEN-SOURCE APPROVAL REQUEST

**Project:** `C:\projects\exalofrontendapp`  
**Milestone:** M3 Train Selection (+ retained M8 / M2 / M1 decisions)  
**Last updated:** 2026-09-21  

Existing Lovable usage does **not** constitute approval for exalofrontendapp.  
Manual product-owner approval ≠ open-source license ≠ ownership.

---

## M3 TRAIN SELECTION — APPROVAL REQUEST (2026-09-21)

| ID | Item | Requested decision | Notes |
| --- | --- | --- | --- |
| **TP-073** | `maths-train-mode.png` | **USE APPROVAL REQUESTED** | Copied from `exalo/src/assets/maths-train-mode.png` → `assets/train/`. SynthID / C2PA / `trainedAlgorithmicMedia`. Required for M3 `/train/maths` parity. **LICENSE REVIEW REQUIRED**. |
| **TP-074** | `english-train-mode.png` | **USE APPROVAL REQUESTED** | Copied from `exalo/src/assets/english-train-mode.png` → `assets/train/`. SynthID / C2PA / `trainedAlgorithmicMedia`. Required for M3 `/train/english` parity. **LICENSE REVIEW REQUIRED**. |
| New packages | — | NONE | No new npm dependencies for M3 |
| Backend / `/train/start` | — | NONE | Explicitly parked |

USE APPROVAL ≠ LICENSE CLEARANCE for TP-073 / TP-074.

---

## M8A STREAK — GOVERNANCE (2026-09-17)

| Item | Status |
| --- | --- |
| TP-072 `expo-linear-gradient` | **USE APPROVED** — installed `~57.0.2` (57.0.2); license MIT (package.json) |
| TP-004 Lucide | **REOPEN APPROVED** / **USE APPROVED** for M8A Streak (+ shared UI where Lovable uses Lucide) |
| Installed Lucide stack | `lucide-react-native` **0.575.0** (exact; ISC); peer `react-native-svg` `15.15.4` (MIT, Expo SDK 57) |
| Note | `1.47.0` rejected by Metro/web: `exports["."].react-native` → missing/unresolvable `dist/esm/*.mjs`. Pinned to Metro-compatible `0.575.0` (`.js` ESM exports). |
| New fonts / raster assets | **NONE** |
| License clearance | Product-use approval ≠ license clearance — keep **LICENSE REVIEW REQUIRED** where applicable for cumulative OSS review unless evidence fully closes the item |
| TP-070 / TP-071 | **Unchanged** — USE APPROVED / LICENSE REVIEW REQUIRED; TP-071 DERIVATIVE OF TP-070 |

---

## M2 JOURNEY DECISIONS (2026-09-17)

| ID | Item | Decision | Notes |
| --- | --- | --- | --- |
| **TP-070** | `journey-bg.png` | **USE APPROVED** | Journey artboard family source (baked header). LICENSE REVIEW REQUIRED remains open. |
| **TP-071** | `journey-bg-clean.png` | **USE APPROVED** (derivative of TP-070) | Narrowly scoped header-text removal for subject-neutral runtime. **Not** a new design; inherits TP-070 license status → LICENSE REVIEW REQUIRED. No separate approval request required beyond recording the derivative. |

### M2 visual / device closure

| Item | Status |
| --- | --- |
| PRODUCT-OWNER VISUAL REVIEW | **APPROVED** (Maths + English Journey) |
| iOS portrait | NOT YET DEVICE-VERIFIED |
| iOS landscape | NOT YET DEVICE-VERIFIED |
| Android portrait | NOT YET DEVICE-VERIFIED |
| Android landscape | NOT YET DEVICE-VERIFIED |
| Backend / DB / question-bank | NONE |
| M3 | **IMPLEMENTED** (Train Selection) — see M3 approval request above; visual USE APPROVAL pending |

USE APPROVAL ≠ LICENSE CLEARANCE for TP-070 / TP-071.

---

## NEW APPROVAL REQUESTS

**Outstanding (M3):**

| ID | Item | Product-owner decision | License note |
| --- | --- | --- | --- |
| **TP-073** | `maths-train-mode.png` | **USE APPROVAL REQUESTED** (pending visual review) | UNKNOWN — LICENSE REVIEW REQUIRED (SynthID / C2PA) |
| **TP-074** | `english-train-mode.png` | **USE APPROVAL REQUESTED** (pending visual review) | UNKNOWN — LICENSE REVIEW REQUIRED (SynthID / C2PA) |

**Prior M8A requests (decided):**

| ID | Item | Product-owner decision | License note |
| --- | --- | --- | --- |
| **TP-072** | `expo-linear-gradient` ~57.0.2 | **USE APPROVED** | MIT (package `license` field). Cumulative OSS register updated; product-use ≠ automatic legal clearance beyond recorded MIT evidence. |
| **TP-004** | `lucide-react-native` **0.575.0** (+ `react-native-svg` 15.15.4) | **REOPEN APPROVED** / **USE APPROVED** for M8A Streak iconography and shared Exalo UI where Lovable uses Lucide | Lucide ISC; `react-native-svg` MIT (package `license` fields). **0.575.0** selected after `1.47.0` Metro/web export failure (`.mjs` export target). |

---

## PRODUCT-OWNER DECISIONS — ONBOARDING (2026-09-16)

| ID | Item | Decision | Approved use |
| --- | --- | --- | --- |
| **TP-058** | `onb-rocket.png` | **APPROVED** | Lovable-faithful Email + Year heroes |
| **TP-059** | `onb-astronaut-wave.png` | **APPROVED** | Lovable-faithful Name hero |
| **TP-060** | `onb-astronaut-goal.png` | **APPROVED** | Lovable-faithful School hero |
| **TP-025** | `avatar-1.png` | **APPROVED** | Avatar onboarding + selected avatar display |
| **TP-026** | `avatar-2.png` | **APPROVED** | Avatar onboarding + selected avatar display |
| **TP-027** | `avatar-3.png` | **APPROVED** | Avatar onboarding + selected avatar display |
| **TP-028** | `avatar-4.png` | **APPROVED** | Avatar onboarding + selected avatar display |
| **TP-029** | `avatar-5.png` | **APPROVED** | Avatar onboarding + selected avatar display |
| **TP-030** | `avatar-6.png` | **APPROVED** | Avatar onboarding + selected avatar display |
| **TP-067** | `progress_rocket.png` | **REJECTED** | Do not use — Text/system rocket glyph |
| **TP-068** | `onboarding_email_hero.png` | **REJECTED / DO NOT USE** | Use TP-058 instead |
| **TP-069** | `envelope_icon.png` | **REJECTED** | Text/system envelope glyph; no new icon package |

---

## PRIOR DECISIONS (RETAINED)

| ID | Decision |
| --- | --- |
| TP-001 | CONDITIONALLY APPROVED — Fredoka + `expo-font` |
| TP-002 | REJECTED |
| TP-003 | APPROVED — Home artboard only |
| TP-004 | Was REJECTED; **2026-09-17 REOPEN / USE APPROVED** for Streak + Lovable-Lucide UI (`lucide-react-native`) |
| TP-005 | REJECTED AS BUNDLE |
| TP-006 | DEFERRED (generated onboarding pack) — individual TP-067…069 decided above |
| TP-007 | REJECTED AS BUNDLE |
| TP-008…TP-024 | Not required for prior M1 Home |

---

## IMPLEMENTATION STATUS

- M1 onboarding uses approved / system materials only; rejected TP-067/068/069 remain unused.  
- M2 Journey runtime uses **TP-071** clean derivative; **TP-070** original retained for provenance.  
- License clearance for TP-070 / TP-071 remains **LICENSE REVIEW REQUIRED**.
