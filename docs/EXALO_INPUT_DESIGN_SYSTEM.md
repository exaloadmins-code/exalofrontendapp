# EXALO INPUT DESIGN SYSTEM

**Permanent frontend rule** for `C:\projects\exalofrontendapp`.

Authoritative visual reference: Lovable `C:\projects\exalo` (especially `components/ui/input.tsx` and onboarding/profile usages).

---

## Shared component

| Export | Path |
| --- | --- |
| `ExaloTextInput` (preferred) | `src/components/ui/TextInputField.tsx` |
| `TextInputField` (alias) | same module |

Do **not** create competing textbox wrappers in feature screens.

---

## Permanent requirements

1. **New text-entry controls must use `ExaloTextInput` / `TextInputField`** unless the authoritative Lovable UX requires a materially different control.
2. **Do not** introduce isolated React Native `TextInput` chrome (border, radius, focus outline) in feature screens when the shared component can satisfy the requirement.
3. **Exalo text inputs have one visual control boundary** (Lovable pattern): the `TextInput` itself owns border, radius, background and focus treatment; leading icons sit absolutely over left padding. Never nest a second visible border/outline around only the typed-text region.
4. Focus styling belongs to that **same** complete control (icon + text share one perimeter).
5. **Any new textbox variant** must first be justified against the authoritative Lovable UX — no speculative variants.
6. **No new third-party/open-source** input, form, icon, animation, or validation package without the manual approval gate (`THIRD_PARTY_APPROVAL_REQUEST.md`). Lovable usage ≠ exalofrontendapp approval.

---

## Focus architecture

```
ONE bordered element = TextInput (Lovable Input pattern)
Leading icon = absolutely positioned over left padding (not a sibling outside the border)

TextInput onFocus  →  focused=true  →  SAME TextInput gets border + ring
TextInput onBlur   →  focused=false →  SAME TextInput returns to unfocused chrome
```

There must never be a second visible border around only the typed-text region.

Web:

- `data-exalo-text-input="1"` (RN Web does **not** forward `className` on TextInput)
- injected CSS kills UA `:focus` outline
- Exalo focus ring via `boxShadow` on the same TextInput when focused

`inputStyle` chrome keys (border/outline/background/radius/padding chrome) are stripped.

---

## Lovable tokens recovered (onboarding default)

| Token | Lovable | Expo |
| --- | --- | --- |
| Height | `h-12` (48) | `s(48)` |
| Radius | `rounded-2xl` (16) | `s(16)` |
| Border | `border-input` hsl(230 40% 22%) | `colors.inputBorder` `#212A47` |
| Background | `bg-background` | `colors.inputBackground` `#080C21` |
| Focus ring | `ring-2 ring-ring` hsl(212 100% 55%) | `colors.inputRing` `#198CFF` + ring offset via box-shadow |
| Placeholder | `text-muted-foreground` | `colors.textMuted` |
| Email / School icon | Lucide inside padded input | Text glyph inside outer control (`leftIcon`) |

### Known Lovable variant (not yet a production screen)

Profile menu uses a slightly different class (`focus:ring-primary/60`, `bg-background/60`). When Profile is implemented, add a **justified** `variant` only if still required by Lovable — do not invent earlier.

---

## Responsive MVP

Shared inputs must remain correct on:

- Phones 320–430 pt/dp portrait
- Tablets 600–1024 pt/dp portrait **and** landscape

Tablet fields follow content-column max width (not full-bleed stretch).

---

## Third-party gate

If a future textbox needs a library or asset not already approved:

1. STOP  
2. Document in `THIRD_PARTY_APPROVAL_REQUEST.md`  
3. Wait for explicit item approval  

Expected for ordinary textboxes: **no new packages**.
