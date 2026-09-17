# EXALO FRONTEND M1 IMPLEMENTATION REPORT

**Date:** 2026-09-16  
**Project:** `C:\projects\exalofrontendapp`  
**Visual source of truth:** `C:\projects\exalo`  

---

## 1. Summary

M1 Home is implemented as a Lovable-faithful responsive artboard using **TP-003** `exalo-home-v2.png` with %-based hotspots, profile/count overlays, Fredoka (**TP-001**), centralized device/safe-area layout, and Exalo-branded placeholders for destinations outside M1. No new npm packages. No backend/DB/question-bank changes.

---

## 2. Files changed (high level)

| Area | Paths |
| --- | --- |
| Governance | `THIRD_PARTY_APPROVAL_REQUEST.md`, `THIRD_PARTY_ASSET_AND_LICENSE_REPORT.md` |
| Approved assets | `assets/home/exalo-home-v2.png`, `assets/fonts/Fredoka-wdth-wght.ttf`, `assets/fonts/OFL.txt` |
| Responsive | `src/responsive/*` |
| Artboard | `src/artboard/*` |
| Home | `app/home/index.tsx` |
| Placeholders | `app/streak.tsx`, `badges.tsx`, `score.tsx`, `parents.tsx`, `profile.tsx`, `journey/[subject].tsx`, `src/components/placeholder/*` |
| Entry | `app/index.tsx`, `app/gallery.tsx`, `app/onboarding/name.tsx` |
| Theme / bootstrap | `src/theme/*`, `src/providers/AppProvider.tsx`, `src/constants/*`, `src/services/assets.ts`, `PhoneViewport.tsx`, `app.json` (`orientation: default`) |

Pre-existing 106 staged scaffold files were not reset/cleaned; M1 adds on top.

---

## 3. Lovable references used

- `src/pages/Index.tsx` — artboard import, hotspot %, profile overlay, streak/badge counts  
- `src/index.css` / `tailwind.config.ts` — space theme / Fredoka  
- `src/assets/exalo-home-v2.png` — TP-003 source  
- Entry pattern: onboarded → Home  

---

## 4. TP-001 usage

| Field | Value |
| --- | --- |
| Files | `assets/fonts/Fredoka-wdth-wght.ttf` (from google/fonts `ofl/fredoka` variable font), `assets/fonts/OFL.txt` |
| Loader | Existing `expo-font` via `AppProvider` `CUSTOM_FONTS` |
| Package | **Not** `@expo-google-fonts/fredoka` (TP-002 rejected) |
| Theme | `fonts.display` / typography `fontFamily: 'Fredoka'` |

**Note:** On Expo web, `Font.loadAsync` for this variable file can hang; bootstrap uses a **10s timeout** then continues so Home still renders (system fallback until font resolves). Native device font load: **NOT YET DEVICE-VERIFIED**.

---

## 5. TP-003 usage

| Field | Value |
| --- | --- |
| Destination | `assets/home/exalo-home-v2.png` |
| Reference size | 843×1264 |
| Usage | Home `ResponsiveArtboard` + hotspot map from Lovable percentages |

---

## 6. TP-003 product-owner approval record

| Field | Value |
| --- | --- |
| Decision | **APPROVED BY PRODUCT OWNER** |
| Date | 2026-09-16 |
| Scope | M1 Home artboard + responsive Home in `exalofrontendapp` |
| External terms research | **WAIVED BY PRODUCT OWNER FOR M1** |

---

## 7. TP-003 known provenance / unresolved facts (retained)

- C2PA: “Created by Google Generative AI.”; SynthID watermark action  
- XMP: `trainedAlgorithmicMedia`; Credit “Made with Google AI”  
- Exact Google product UI **not** established  
- Precursor provenance **not** established  
- **No specific open-source license established**  
- Ingested via Lovable `gpt-engineer-app[bot]` commits  

---

## 8. Confirmation — not falsely classified as open-source

TP-003 is recorded as **AI-GENERATED / THIRD-PARTY-GOVERNED VISUAL ASSET** with **NO SPECIFIC OPEN-SOURCE LICENSE ESTABLISHED**. Approval status is separate from license status. It is **not** listed under open-source visual assets.

---

## 9. `THIRD_PARTY_ASSET_AND_LICENSE_REPORT.md` update

Updated with dedicated section **THIRD-PARTY / AI-GENERATED MATERIALS APPROVED BY PRODUCT OWNER** for TP-003, plus TP-001 font bundling note.

---

## 10. `THIRD_PARTY_APPROVAL_REQUEST.md` update

TP-003 marked **APPROVED BY PRODUCT OWNER**; historical provenance preserved; further external terms research marked waived for M1.

---

## 11. Design tokens

Lovable-aligned deep space background (`backgroundDeep`), existing Exalo palette, Fredoka display typography tokens, spacing/radius/shadows retained from scaffold.

---

## 12. Responsive architecture

`src/responsive` — `useDeviceLayout`, `MVP` breakpoints (phone 320–430, tablet 600–1024), deviceClass, orientation, safe-area, content box. Centralized — screens do not scatter ad-hoc width checks.

---

## 13. Safe-area architecture

`useSafeAreaInsets` via `useDeviceLayout`; Home pads root with insets; content box drives artboard contain-fit.

---

## 14. Artboard / hotspot architecture

`computeArtboardRect` (contain), `percentRectToLayout`, `ResponsiveArtboard`, `HOME_HOTSPOTS` / `HOME_OVERLAYS` from Lovable %. Tablet landscape uses `maxWidthFraction: 0.55` to avoid horizontal stretch.

---

## 15. Home implementation

`app/home/index.tsx` — TP-003 image, hotspots, profile chip (letter + native `▾` chevron), streak/badge count overlays.

---

## 16. Navigation / placeholders

Routes: `/streak`, `/badges`, `/score`, `/parents`, `/profile`, `/journey/[subject]` → branded `ComingSoonPlaceholder`. Maths hotspot verified → `/journey/maths` → Back to Home. Entry: incomplete onboarding → email → name stub completes → Home. `/` redirects to Home; AppProvider still routes by onboarding state.

---

## 17. Phone responsive results

| Config | Result |
| --- | --- |
| Web Emulation 320×568 portrait | **PASS** (artboard contain, UI coherent) |
| Web Emulation 390×844 portrait | **PASS** |
| Web Emulation 430 (metrics set) | Layout path exercised; screenshot not separately archived — treat as **PASS** for resize survival |
| iOS Simulator physical | **NOT YET DEVICE-VERIFIED** |
| Android Emulator physical | **NOT YET DEVICE-VERIFIED** |

---

## 18. iOS tablet portrait/landscape

| Config | Result |
| --- | --- |
| Web Emulation 768×1024 (tablet portrait class) | Navigation retained after return to Home — **PASS** (web proxy) |
| iOS iPad Simulator | **NOT YET DEVICE-VERIFIED** |

---

## 19. Android tablet portrait/landscape

| Config | Result |
| --- | --- |
| Android tablet emulator | **NOT YET DEVICE-VERIFIED** |
| Web 1024×768 landscape | **PASS** (contain artboard, not stretched; hotspots present) |

---

## 20. Rotation results

| Test | Result |
| --- | --- |
| Web resize 1024×768 ↔ return to Home after navigation | **PASS** — no crash; hotspots remain; nav state via router |
| Native iPad / Android tablet Portrait→Landscape→Portrait | **NOT YET DEVICE-VERIFIED** |

`app.json` `orientation` set to `default` to allow tablet rotation.

---

## 21. Lovable vs Expo visual comparison

| Aspect | Assessment |
| --- | --- |
| Artboard composition | Strong match (same TP-003 asset) |
| Hotspot targets | Match Lovable %-regions |
| Profile chip | Present; letter fallback (no avatars in M1); native chevron |
| Counts | Overlay numbers match Lovable positions |
| Font | Fredoka intended; web may fall back briefly if load times out |
| Tablet landscape | Constrained contain — deliberate adaptation, not stretch |

---

## 22. Typecheck / lint / Expo startup

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | **PASS** (exit 0) |
| Lint | No separate lint script run |
| Expo web (`npx expo start --web --port 8082`) | **PASS** — bundled; Home rendered |

---

## 23. New packages installed

**NONE**

---

## 24. package.json changes caused by new dependencies

**NONE**

---

## 25. lockfile changes caused by new dependencies

**NONE**

---

## 26. Backend changes

**NONE**

---

## 27. Database changes

**NONE**

---

## 28. Question-bank changes

**NONE**

---

## 29. Remaining third-party / open-source approvals

| Item | Status |
| --- | --- |
| TP-008…024 pack PNGs | Not required for M1 |
| TP-025…030 avatars | Not required for M1 |
| TP-006 generated onboarding | Deferred (existing email use only) |
| Optional expo-asset / AsyncStorage / status-bar expands | Deferred |
| Scaffold class-A packages | Operational inventory only |

---

## 30. Known issues / visual discrepancies

1. Web Fredoka `loadAsync` may timeout → temporary system font until resolved.  
2. Native phone/tablet simulators not run in this session.  
3. Full onboarding (year/school/avatar) still stubbed after email.  
4. Score value empty on artboard (Lovable also overlays counts only for streak/badges).  
5. Web deprecation warnings (pointerEvents / shadow) from RN-web — non-blocking.  

---

## 31. Recommended M2

- Native device matrix for MVP phone/tablet + rotation  
- Resolve Fredoka web load (still OFL files only; no TP-002)  
- Journey / Train entry visual parity (new approvals if assets needed)  
- Complete onboarding steps beyond email/name stub  
- Wire real streak/badge/score data when backend APIs exist  

**DO NOT START M2 in this session.**

---

**STOP.**
