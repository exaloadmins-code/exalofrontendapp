# EXALO M1 HOME VISUAL PARITY CORRECTION REPORT

**Date:** 2026-09-16  
**Status:** Visual parity correction applied (phone primary). Prior “Strong artboard parity” claim is **withdrawn**.

**M1 visual status (product review):** was **FAIL — PRODUCT VISUAL REVIEW**; re-check below after correction.

---

## 1. Root cause of background discrepancy

Three compounding causes (no wrong/missing PNG):

1. **Letterbox colour mismatch**  
   Lovable Home `<main>` uses Tailwind `bg-background` = `hsl(230 60% 8%)` → **`#080C21`**.  
   Expo used `backgroundDeep` / `backgroundDark` (`#070B1A` / `#0B1230`), so the vertical bands above/below the contained artboard looked like a different “background.”

2. **Safe-area shrink of the artboard box**  
   Expo padded safe-area then ran contain inside the *reduced* content box. Lovable uses the **full viewport** (`min-h-screen` / `max-h-screen`) with **no** safe-area inset on the artboard. That changed band size and framing.

3. **Web phone shell capped at 390**  
   `PhoneViewport` forced `maxWidth: 390` for all phone-class web widths. At **430** logical width this left **~20px side bands** of shell/page colour that Lovable does not have.

**Not causes:** wrong asset file, PNG transparency (asset is opaque RGB), missing layered PNGs, body gradient (Lovable `main` is opaque `bg-background`), or need for a new image.

**Clarification:** Index markup `max-h-screen w-auto` alone looks like height-fill, but **Tailwind preflight `img { max-width: 100% }`** makes the **rendered** result viewport **contain**. Measured Lovable @ 390×844: img **390×584.8 at y=129.6** — same as contain.

---

## 2. Exact Lovable rendering implementation

| Item | Implementation |
| --- | --- |
| Asset | Only `exalo-home-v2.png` |
| Layers | No second PNG; no starfield on Home; overlays = profile chip + streak/badge counts + invisible hotspot buttons |
| Container | `<main class="min-h-screen … bg-background">` + `<div class="relative max-h-screen">` |
| Image CSS | `max-h-screen w-auto object-contain` + preflight `max-width: 100%` → **contain** |
| Page colour | Opaque `bg-background` (#080C21); body `--gradient-bg` not visible around Home |
| Fit | Flex center; letterbox top/bottom on phone portrait |

---

## 3. Exact Expo implementation before correction

| Item | Before |
| --- | --- |
| Asset | Same TP-003 PNG (correct file) |
| Fit | `contain` inside **safe-area-reduced** content box |
| Page colour | `backgroundDeep` / stack `backgroundDark` |
| Web shell | Cap **390** even when viewport is 430 |
| Hotspots | % of contain box (OK in principle) but box ≠ Lovable viewport box |

---

## 4. Files changed

- `app/home/index.tsx` — full viewport + `fit: 'lovableHome'` + `colors.background`
- `src/artboard/artboardMath.ts` — document/measure-true `lovableHome` (= viewport contain)
- `src/artboard/ResponsiveArtboard.tsx` — `fit` prop; explicit box size + `resizeMode="stretch"` (box already aspect-correct)
- `src/theme/colors.ts` — add Lovable `background` `#080C21`
- `src/components/layout/PhoneViewport.tsx` — no 390 cap inside 320–430; shell/page use `colors.background`
- `app/_layout.tsx` — stack `contentStyle` uses `colors.background`

---

## 5. Rendering / scaling / cropping changes

- Artboard box = **full** `viewportWidth` × `viewportHeight`
- Scale = `min(vw/843, vh/1264, 1)` (Lovable-equivalent contain)
- Centered; letterbox uses `#080C21`
- Removed tablet landscape `maxWidthFraction: 0.55` override (was diverging from Lovable)

---

## 6. Background / layer changes

- Letterbox / chrome colour → Lovable `bg-background` `#080C21`
- No new image layers; still single TP-003 PNG

---

## 7. Hotspot changes

- Still Lovable percentages of the **rendered image box**
- Image box now matches Lovable’s measured box → hotspot alignment restored vs reference

---

## 8. Lovable vs Expo comparison (390 portrait)

Measured DOM `getBoundingClientRect()` on `<img>`:

| | Lovable | Expo (after) |
| --- | --- | --- |
| Viewport | 390×844 | 390×844 |
| Image | x0 y129.6 w390 h584.8 | x0 y129.6 w390 h584.8 |

**Geometry match: identical.**

---

## 9–14. Viewport matrix

| Viewport | TECHNICAL LAYOUT | VISUAL PARITY (vs Lovable geometry + fill) | DEVICE VERIFICATION |
| --- | --- | --- | --- |
| **9. 320 portrait** | **PASS** (Expo=Lovable 320×479.8 @ y44.1) | **PASS** (web side-by-side geometry) | NOT YET DEVICE-VERIFIED |
| **10. 390 portrait** | **PASS** (identical rects) | **PASS** (primary parity target) | NOT YET DEVICE-VERIFIED |
| **11. 430 portrait** | **PASS** (after shell fix: identical 430×644.7 @ y143.6) | **PASS** | NOT YET DEVICE-VERIFIED |
| **12. 600 tablet portrait** | **PASS** (identical 600×899.6 @ y30.2) | **PASS** (web) | NOT YET DEVICE-VERIFIED |
| **13. Tablet landscape (representative)** | Exercised via 1024×768 path | See §14 | NOT YET DEVICE-VERIFIED |
| **14. 1024 tablet landscape** | **PASS** (Expo=Lovable 512.2×768 @ x255.9) | **PASS** (web geometry) | NOT YET DEVICE-VERIFIED |

Web technical PASS ≠ native device verification.

---

## 15. Native iOS verification

**NOT YET DEVICE-VERIFIED**

---

## 16. Native Android verification

**NOT YET DEVICE-VERIFIED**

---

## 17. Third-party / open-source materials newly required

**NONE**

---

## 18. New packages

**NONE**

---

## 19. Backend changes

**NONE**

---

## 20. DB changes

**NONE**

---

## 21. Question-bank changes

**NONE**

---

## 22. Remaining visual discrepancies

- Fredoka may still fall back briefly on web if `loadAsync` times out  
- Profile chip / count overlays are RN recreations (not baked); letter avatar vs Lovable optional photo  
- Native notch/home-indicator over full-bleed artboard not device-checked (Lovable web has no safe-area on Home)  
- Pixel-level glow/anti-alias differences between RN Image and browser `<img>` possible  

**M1 visual status after correction (web, phone primary):** geometry and letterbox colour aligned with rendered Lovable — pending your product visual acceptance. Native still **NOT YET DEVICE-VERIFIED**.

---

**STOP. Do not start M2.**
