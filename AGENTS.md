# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Git ownership (permanent)

Cursor/AI may inspect and **stage** Git changes when explicitly requested, but must **never commit or push**.

The product owner manually:

1. inspects staged files/diff  
2. decides whether changes are acceptable  
3. commits  
4. pushes  

Forbidden for Cursor/AI unless the product owner explicitly overrides in writing: `git commit`, `git push`, tags, amend, rebase, merge, `reset --hard`, force push, or history rewriting.

## Text inputs (permanent)

Use the shared `ExaloTextInput` / `TextInputField` (`src/components/ui/TextInputField.tsx`).

- Exalo text inputs have **one visual control boundary** (Lovable): `TextInput` owns border/radius/background/focus; icons overlay left padding. No nested second border/outline on an inner field.
- Do not invent one-off textbox chrome in feature screens when the shared component can match Lovable.
- New variants require Lovable justification. No new input packages without manual third-party approval.

See `docs/EXALO_INPUT_DESIGN_SYSTEM.md`.

## Selects / dropdowns (permanent)

Use the shared `ExaloSelect` (`src/components/ui/ExaloSelect.tsx`) for predefined options.

- TextInput = free text; Select = predefined options; searchable Select = predefined + filter.
- Do not invent one-off dropdowns when `ExaloSelect` can match the UX.
- No new picker packages without manual third-party approval.

See `docs/EXALO_SELECT_DESIGN_SYSTEM.md`.
