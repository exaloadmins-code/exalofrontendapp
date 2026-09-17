# EXALO HOME LANDSCAPE / SAFE-AREA POLICY

## Portrait (primary Lovable reference)

- Fit: `lovableHome` contain into the measured Home surface ∩ window.
- Typical phone portrait: width-limited; vertical `#080C21` letterbox.
- Artboard is **not** shrunk by safe-area insets (Lovable uses full viewport).

## Landscape

- Same contain formula: `scale = min(aw/rw, ah/rh, 1)`.
- Typical short landscape (e.g. 844×390): **height-limited**; full TP-003 visible; horizontal letterbox.
- PhoneViewport web shell height = **visible window height** (never forced `BASE_HEIGHT` 844).
- Hotspots stay `%` of the rendered artboard rect; min touch expands when `scale < 0.42`.

## Safe area

| Concern | Policy |
| --- | --- |
| Artboard centering box | Home surface ∩ window (no inset subtract) |
| Interactive chrome | Prefer overlay hit targets ≥ 44–52pt; do not inset the PNG for notch |
| Asymmetric insets (notch) | Do not assume left === right; do not pad artboard asymmetrically |

## Web shell

`PhoneViewport` must not set `minHeight: 844` / `flexShrink: 0` — that made landscape Home contain into a tall off-screen surface.
