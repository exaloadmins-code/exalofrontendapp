# Generated / rejected inventory artifacts (historical)

The three files below were **generated** during early frontend work because they were missing from the source pack at:

`C:\Users\exalo\OneDrive\Pictures\exaloassets`

Existing source-pack artwork was never regenerated or modified for those originals.

**Current M1 runtime status:** all three are **REJECTED / NOT USED**. They are **not** registered in `src/constants/assets.ts` and are **not** loaded by the application. They may remain on disk for audit history only and must **not** be treated as runtime assets.

| Filename | On-disk path | Historical purpose | Current runtime replacement | Governance |
| --- | --- | --- | --- | --- |
| `progress_rocket.png` | `assets/navigation/progress_rocket.png` | Onboarding progress-bar rocket marker | Text/Unicode `🚀` in `ProgressBar` | TP-067 — REJECTED |
| `onboarding_email_hero.png` | `assets/onboarding/onboarding_email_hero.png` | Email-step hero illustration | `assets/onboarding/onb-rocket.png` via `OnboardingAssets.rocket` (TP-058) | TP-068 — REJECTED / DO NOT USE |
| `envelope_icon.png` | `assets/icons/envelope_icon.png` | Email field leading icon | Text/Unicode `✉` in `app/onboarding/email.tsx` | TP-069 — REJECTED |

**Registry note (current implementation)**

`NavigationAssets` in `src/constants/assets.ts` currently contains **only**:

- `home` → `assets/navigation/home_icon.png`
- `parents` → `assets/navigation/parents_icon.png`

There is **no** `NavigationAssets.envelope`, `NavigationAssets.progressRocket`, or `OnboardingAssets.emailHero`.

**Other notes**

- Project copy of `exalo logo.png` had a baked near-white plate; alpha was restored so it composites correctly on the dark hero (artwork itself unchanged).
- Source folder `C:\Users\exalo\OneDrive\Pictures\exaloassets` was not modified.
