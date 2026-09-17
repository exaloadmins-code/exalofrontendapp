# EXALO Asset Inventory

Audit date: 2026-08-08  
Source directory (untouched): `C:\Users\exalo\OneDrive\Pictures\exaloassets`  
Reference screenshots reviewed: `C:\Users\exalo\OneDrive\Pictures\Screenshots\Screenshot 2026-08-08 1410*.png` / `1412*.png` / `1413*.png`  
Project registry: `src/constants/assets.ts`

## Summary

| Metric | Count |
| --- | ---: |
| Total files inspected in source directory | 27 |
| Total usable graphical assets (PNG) | 27 |
| Subfolders in source directory | 0 (flat) |
| Exact duplicate files (identical SHA-256) | 0 |
| Alternate / variant sets (same subject, different treatment) | 6 |
| Assets copied into React Native project | 28 file copies (27 unique source files; `onb-astronaut-goal.png` placed in both `astronauts/` and `onboarding/`) |
| Unidentified / purpose-uncertain assets | 3 |
| Missing artwork required by reference screens | Many (see Missing section) |

Transparency notes:

- **Alpha channel** = file is RGBA (or equivalent) and can store transparency.
- **Uses transparent pixels** = measured non-opaque alpha (`alpha < 250`) via Pillow.
- Several UI cards/icons are RGBA but fully opaque (rounded art baked onto an opaque canvas). Treat those as non-transparent cutouts unless re-exported later.

---

## Branding

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `exalo logo.png` | 322×127 | Yes (RGBA) | No (fully opaque) | EXALO wordmark (star in “A”, orange/blue side rays). Home header branding. | `assets/branding/exalo logo.png` |

---

## Backgrounds

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `background planets.png` | 1024×1536 | No (RGB) | No | Full-screen portrait space scene: stars, purple + blue ringed planets, side clouds, ground plane. Home / Maths path / Train Mode environment. | `assets/backgrounds/background planets.png` |

---

## Planets

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `planet blue.png` | 203×139 | Yes (RGBA) | No (fully opaque) | Standalone blue ringed planet decoration (also embedded in background). | `assets/planets/planet blue.png` |
| `planet purple.png` | 221×146 | Yes (RGBA) | No (fully opaque) | Standalone purple ringed planet decoration (also embedded in background). | `assets/planets/planet purple.png` |

---

## Rockets

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `rocket.png` | 768×1024 | Yes (RGBA) | Yes | Angled white body, **orange** nose/fins, **blue** porthole, yellow/orange exhaust. Closest Home central rocket / Focus-rocket candidate. | `assets/rockets/rocket.png` |
| `rocket-only.png` | 1024×1024 | No (RGB) | No | Larger alternate of the same white/orange launch rocket family (different flame treatment; opaque canvas). | `assets/rockets/rocket-only.png` |
| `rocket_main.png` | 152×318 | Yes (RGBA) | No (fully opaque) | Vertical white/orange rocket, **no exhaust**. Candidate for Train Mode heading rocket / Focus. | `assets/rockets/rocket_main.png` |
| `launchpad.png` | 640×512 | Yes (RGBA) | Yes | Grey/orange character rocket with glowing eyes on circular pad. **Not matched** to a specific reference-screen element. | `assets/rockets/launchpad.png` |

**Not found as distinct files:** red Test rocket, silver Train rocket, onboarding red-nose/green-window launch scene rocket, small orange progress-bar rocket.

---

## Astronauts

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `onb-astronaut-goal.png` | 768×512 | No (RGB) | No | Child astronaut holding red **GOAL** banner on baked starfield. Onboarding 4. | `assets/astronauts/onb-astronaut-goal.png` (+ copy in `assets/onboarding/`) |

**Not found:** floating mascot astronaut with black visor + glowing blue eyes (Onboarding 2).

---

## Avatars

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `avatar-1.png` | 512×512 | No (RGB) | No | Selectable helmeted boy (brown hair). Onboarding 5 / profile pill. | `assets/avatars/avatar-1.png` |
| `avatar-2.png` | 512×512 | No (RGB) | No | Selectable helmeted girl (long brown hair, hands on hips). | `assets/avatars/avatar-2.png` |
| `avatar-3.png` | 512×512 | No (RGB) | No | Selectable helmeted boy with glasses. | `assets/avatars/avatar-3.png` |
| `avatar-4.png` | 512×512 | No (RGB) | No | Selectable helmeted girl (side-swept dark hair). | `assets/avatars/avatar-4.png` |
| `avatar-5.png` | 512×512 | No (RGB) | No | Selectable helmeted boy (dark skin, black hair). | `assets/avatars/avatar-5.png` |
| `avatar-6.png` | 512×512 | No (RGB) | No | Selectable helmeted girl (pigtails). | `assets/avatars/avatar-6.png` |

All six avatar options use a solid dark navy studio background (not cut out).

---

## Onboarding

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `onb-astronaut-goal.png` | 768×512 | No (RGB) | No | Onboarding 4 GOAL illustration (same file as Astronauts). | `assets/onboarding/onb-astronaut-goal.png` |

No dedicated onboarding launch-scene or floating-astronaut files exist in the source pack.

---

## Subjects

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `maths.png` | 512×512 | Yes (RGBA) | Yes | Composite sheet of 4 glossy operator tiles (+, ×, −, −). Home Maths artwork / Number Skills-adjacent candidate. | `assets/subjects/maths.png` |
| `maths_card.png` | 192×329 | Yes (RGBA) | No (fully opaque) | Blue **MATHS** subject card with dark image placeholder + arrow pill. | `assets/subjects/maths_card.png` |
| `english_card.png` | 189×332 | Yes (RGBA) | No (fully opaque) | Green **ENGLISH** subject card with blue open book baked in + arrow pill. | `assets/subjects/english_card.png` |
| `book.png` | 512×512 | Yes (RGBA) | Yes | Standalone open book, **red** cover + red ribbon. English / Focus icon candidate. | `assets/subjects/book.png` |

---

## Maths Topics

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| — | — | — | — | **None present** for Number Skills, Fractions, Decimals, Percentages, Ratio & Proportion, Algebra, Geometry, Angles, Measurement, Word Problems. | `assets/topics/` (empty; `.gitkeep` only) |

---

## Gamification

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `badge.png` | 512×512 | Yes (RGBA) | Yes | Purple shield + gold star + red ribbon (standalone badge). | `assets/gamification/badge.png` |
| `badge_card.png` | 241×225 | Yes (RGBA) | No (fully opaque) | Home **BADGES** widget card (“Collect more!”). | `assets/gamification/badge_card.png` |
| `flame.png` | 512×512 | Yes (RGBA) | Yes | Standalone streak flame icon. | `assets/gamification/flame.png` |
| `streak_card.png` | 236×223 | Yes (RGBA) | No (fully opaque) | Home **STREAK** widget card (“Keep it up!”). | `assets/gamification/streak_card.png` |

**Not found:** golden trophy with star (Train Mode CTA), score sparkle/ray marks as separate files (logo rays exist only inside `exalo logo.png`).

---

## Navigation

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `home_icon.png` | 143×134 | Yes (RGBA) | No (fully opaque) | Bottom nav Home (blue house in dark circle). | `assets/navigation/home_icon.png` |
| `parents_icon.png` | 146×118 | Yes (RGBA) | No (fully opaque) | Bottom nav Parents (two green figures in dark circle). | `assets/navigation/parents_icon.png` |

**Not found as image assets:** back chevron button artwork, list chevrons, search magnifier, envelope input icon, progress-bar rocket (likely drawn in UI or still missing).

---

## Decorative

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Intended use | Project location |
| --- | --- | --- | --- | --- | --- |
| `rocket_flame.png` | 163×254 | Yes (RGBA) | No (fully opaque) | Conical orange/white **beam / spotlight** on dark base (filename says flame; visual is a beam). Decorative / effect candidate. | `assets/decorative/rocket_flame.png` |

Stars/sparkles elsewhere are baked into backgrounds, logo, or screenshots as emoji/UI — not separate cutouts.

---

## Miscellaneous / unidentified

| Source filename | Dimensions | Alpha channel | Uses transparent pixels | Notes | Project location |
| --- | --- | --- | --- | --- | --- |
| `avatar.png` | 512×512 | Yes (RGBA) | Yes | Boy **face-only** portrait (no helmet). Not one of the six selectable Onboarding 5 avatars. Purpose unclear. | `assets/miscellaneous/avatar.png` |
| `launchpad.png` | 640×512 | Yes (RGBA) | Yes | Character rocket on pad; no confident screen match. Listed again here as unidentified purpose. | `assets/rockets/launchpad.png` |
| `rocket_flame.png` | 163×254 | Yes (RGBA) | No | Beam asset; purpose on reference screens unclear. | `assets/decorative/rocket_flame.png` |

---

## Screen Mapping

Cross-checked against the supplied EXALO reference screenshots (8 Aug 2026).  
Confidence: **Confirmed** = visual match to a source file · **Candidate** = closest available file(s), differences noted · **Missing** = not found in source pack.

### A. Onboarding 1 of 5 — Email / rocket launch

| Element | Mapping |
| --- | --- |
| Hero launch illustration (red nose/fins, green window, clouds, moon, stars) | **Missing** as a complete scene. Closest rocket body candidates: `rocket.png`, `rocket-only.png` (both orange nose + blue window; no cloud/moon scene). |
| Small orange progress rocket | **Missing** |
| Back arrow | **Missing** as asset (UI draw) |
| Envelope icon | **Missing** as asset (UI draw) |
| EXALO wordmark in card | Typography in screenshot (not the graphical `exalo logo.png`) |

### B. Onboarding 2 of 5 — “What would you like to be called?”

| Element | Mapping |
| --- | --- |
| Floating astronaut (black visor, glowing blue eyes, arms open) | **Missing** |
| Card space/planet vignette | **Missing** as crop; related planets exist separately (`planet blue.png`, background) |
| Progress rocket / back arrow | **Missing** as assets |

### C. Onboarding 3 of 5 — “Which year are you in?”

| Element | Mapping |
| --- | --- |
| Rocket illustration (red nose, green window, clouds, stars, blue planet) | **Missing** as complete scene. Same candidates as Onboarding 1: `rocket.png` / `rocket-only.png` (wrong colours; incomplete scene). |
| Progress rocket / back arrow | **Missing** as assets |

### D. Onboarding 4 of 5 — “Which school are you targeting?”

| Element | Mapping |
| --- | --- |
| Astronaut holding GOAL banner | **Confirmed:** `onb-astronaut-goal.png` |
| Search / list / chevrons | **Missing** as assets (UI draw) |

### E. Onboarding 5 of 5 — Avatar selection

| Element | Mapping |
| --- | --- |
| Avatar option 1 | **Confirmed:** `avatar-1.png` |
| Avatar option 2 | **Confirmed:** `avatar-2.png` |
| Avatar option 3 | **Confirmed:** `avatar-3.png` |
| Avatar option 4 | **Confirmed:** `avatar-4.png` |
| Avatar option 5 | **Confirmed:** `avatar-5.png` |
| Avatar option 6 | **Confirmed:** `avatar-6.png` |

### F. EXALO Home

| Element | Mapping |
| --- | --- |
| EXALO logo | **Confirmed:** `exalo logo.png` |
| Space background / planets | **Confirmed:** `background planets.png`; also `planet purple.png`, `planet blue.png` |
| Main central rocket | **Candidate:** `rocket.png` (preferred — has transparency + exhaust). Alternate: `rocket-only.png`. Vertical no-flame alternate: `rocket_main.png`. |
| Streak image | **Confirmed card:** `streak_card.png`. Standalone flame: `flame.png`. |
| Badges image | **Confirmed card:** `badge_card.png`. Standalone badge: `badge.png`. |
| Maths artwork | **Candidate composite:** operators from `maths.png` + shell `maths_card.png`. Note: Home shows `+ − × ÷`; `maths.png` shows `+ × − −` (no divide tile; two minus tiles). |
| English artwork | **Confirmed card:** `english_card.png`. Standalone book alternate: `book.png` (red cover; card uses blue book). |
| Bottom nav Home | **Confirmed:** `home_icon.png` |
| Bottom nav Parents | **Confirmed:** `parents_icon.png` |
| Profile avatar in pill | **Confirmed pool:** `avatar-1.png` … `avatar-6.png` |
| EXALO Score rays/sparkles | **Missing** as separate assets (logo contains similar rays) |

### G. Maths Choose Your Path

| Element | Mapping |
| --- | --- |
| Background / planets / clouds | **Confirmed:** `background planets.png`, `planet purple.png`, `planet blue.png` |
| Red Test rocket | **Missing** |
| Orange Focus rocket | **Candidate:** `rocket.png` / `rocket_main.png` / `rocket-only.png` (orange family; not path-card sized variants) |
| Silver Train rocket | **Missing** |
| Test / Focus / Train mode icons (target, book, crosshair) | **Missing** (nearest book-only: `book.png`) |
| Bottom nav | **Confirmed:** `home_icon.png`, `parents_icon.png` |

### H. Maths Train Mode

| Element | Mapping |
| --- | --- |
| Background / planets | **Confirmed:** `background planets.png`, planet cutouts |
| Small heading rocket | **Candidate:** `rocket_main.png` (or cropped `rocket.png`) |
| Number Skills graphic | **Missing** (weak adjacent only: `maths.png` operators) |
| Fractions | **Missing** |
| Decimals | **Missing** |
| Percentages | **Missing** |
| Ratio & Proportion | **Missing** |
| Algebra | **Missing** |
| Geometry | **Missing** |
| Angles | **Missing** |
| Measurement | **Missing** |
| Word Problems | **Missing** |
| Robot mascot | **Missing** |
| Trophy | **Missing** (do not substitute `badge.png`) |
| Bottom nav | **Confirmed:** `home_icon.png`, `parents_icon.png` |

---

## Duplicate / Alternate Assets

Exact byte-identical duplicates: **none**.

| Variant set | Files | Notes | Preferred for screens |
| --- | --- | --- | --- |
| Orange launch rocket family | `rocket.png`, `rocket-only.png`, `rocket_main.png` | Same white/orange rocket concept; different pose, resolution, exhaust, alpha. | Home hero: `rocket.png`. Small heading: `rocket_main.png`. |
| Badge | `badge.png`, content inside `badge_card.png` | Standalone cutout vs composed Home card. | Home widget: `badge_card.png`. Icon-only: `badge.png`. |
| Streak flame | `flame.png`, content inside `streak_card.png` | Standalone cutout vs composed Home card. | Home widget: `streak_card.png`. Icon-only: `flame.png`. |
| English book | `book.png`, book inside `english_card.png` | Red standalone book vs blue book inside green card. | Home English: `english_card.png`. Icon-only: `book.png`. |
| Maths subject presentation | `maths.png`, `maths_card.png` | Operator sheet vs card chrome with empty image well. | Compose for Home; do not assume either alone matches the screenshot 1:1. |
| Avatar naming collision | `avatar.png` vs `avatar-1.png`…`avatar-6.png` | Face-only vs helmeted selectable set. | Onboarding 5 / profile: `avatar-1`…`avatar-6` only. |

Project-only duplicate copy (intentional): `onb-astronaut-goal.png` exists under both `assets/astronauts/` and `assets/onboarding/`.

---

## Missing or Unidentified Assets

### Missing (visible on reference screens; not found in source pack)

| Screen | Element | Description | Possible candidates (if any) |
| --- | --- | --- | --- |
| Onboarding 1 | Launch hero scene | Red-nose rocket, green window, clouds, moon, yellow stars as one illustration | `rocket.png`, `rocket-only.png` (wrong accent colours; incomplete) |
| Onboarding 2 | Floating astronaut mascot | White suit, black visor, glowing blue eyes, open arms | None |
| Onboarding 2–5 | Progress rocket | Tiny orange rocket on progress nodes | None |
| Onboarding 1/3 | Year/email hero rocket scene | Same red/green rocket family as Onboarding 1 | `rocket.png`, `rocket-only.png` |
| Choose Your Path | Red Test rocket | White body, red nose/fins, black porthole, exhaust | None |
| Choose Your Path | Silver Train rocket | White body, silver/grey nose/fins, exhaust | None |
| Choose Your Path | Mode icons | Target, open-book, crosshair glyphs on path cards | `book.png` only for Focus |
| Train Mode | Topic 1 Number Skills | 3D “123” icon | Weak: `maths.png` |
| Train Mode | Topic 2 Fractions | Pie chart “1/4” | None |
| Train Mode | Topic 3 Decimals | “2.5.” numerals | None |
| Train Mode | Topic 4 Percentages | “%” glyph | None |
| Train Mode | Topic 5 Ratio & Proportion | Balance scale | None |
| Train Mode | Topic 6 Algebra | “x+y” | None |
| Train Mode | Topic 7 Geometry | Cube / pyramid / sphere | None |
| Train Mode | Topic 8 Angles | Protractor “45°” | None |
| Train Mode | Topic 9 Measurement | Ruler + clock | None |
| Train Mode | Topic 10 Word Problems | Speech bubble “?” | None |
| Train Mode | Robot | White/blue waving robot | None |
| Train Mode | Trophy | Gold cup with star + sparkles | Do not use `badge.png` |
| Multiple | Back arrow / chevrons / search / envelope | Small UI icons in screenshots | None in pack (implement as vector/UI) |
| Home / Train | EXALO Score decorative rays | Orange/blue dashes around score | Only similar rays inside `exalo logo.png` |

### Unidentified (in pack; no confident screen placement)

| Filename | Why unclear |
| --- | --- |
| `avatar.png` | Face-only portrait; not in the six-avatar grid |
| `launchpad.png` | Character rocket on pad; not seen in reviewed screenshots |
| `rocket_flame.png` | Beam/spotlight look; not clearly used on reviewed screenshots |

---

## Availability verdict for current screens

| Screen | Artwork availability |
| --- | --- |
| Onboarding 1 | Incomplete — hero launch scene missing |
| Onboarding 2 | Incomplete — floating astronaut missing |
| Onboarding 3 | Incomplete — hero rocket scene missing |
| Onboarding 4 | Ready for primary illustration (`onb-astronaut-goal.png`) |
| Onboarding 5 | Ready (`avatar-1`…`avatar-6`) |
| Home | Mostly ready (logo, background, planets, streak/badge cards, subject cards, nav, rocket candidates). Maths operators may need composition / corrected divide glyph. |
| Maths Choose Your Path | Incomplete — red Test + silver Train rockets and mode icons missing |
| Maths Train Mode | Incomplete — all 10 topic graphics, robot, and trophy missing |

**Overall:** Not all artwork required for the supplied reference screens is available in the current asset directory. Confirmed coverage is strongest for Home chrome, Onboarding 4–5, planets/background, and bottom navigation. Major gaps remain for onboarding hero scenes, path-mode rocket trio, Train Mode topics, robot, and trophy.

Source folder was not modified. No UI screens were implemented in this audit.
