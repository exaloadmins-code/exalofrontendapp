# EXALO SELECT DESIGN SYSTEM

**Permanent frontend rule** for `C:\projects\exalofrontendapp`.

---

## Components

| Control | Path | Purpose |
| --- | --- | --- |
| `ExaloTextInput` / `TextInputField` | `src/components/ui/TextInputField.tsx` | Free-form text entry |
| `ExaloSelect` | `src/components/ui/ExaloSelect.tsx` | Selection from **predefined** options |
| Searchable select | `ExaloSelect` + `searchable` | Predefined options + filter via `ExaloTextInput` |

Do **not** replace text inputs with selects, or invent feature-specific dropdowns when `ExaloSelect` can satisfy the requirement.

---

## Permanent principle

> Use `ExaloSelect` for predefined-option selection. Do not implement feature-specific dropdown/select controls when `ExaloSelect` can satisfy the requirement.

Also:

- **TextInput** = free text  
- **Select** = predefined options  
- **Searchable Select** = predefined options with filtering  

---

## Visual contract

Align with Exalo input family tokens:

| Token | Usage |
| --- | --- |
| Height | `h-12` / `s(48)` trigger |
| Radius | `rounded-2xl` / `s(16)` |
| Border | `colors.inputBorder` closed; `colors.inputRing` when open |
| Background | `colors.inputBackground` |
| Chevron | Text `▼` / `▲` (no Lucide / icon packages) |
| Typography | Fredoka via `fonts.display` |

Closed: one control showing placeholder or selected label.  
Open: panel attached under the trigger (shared border radius family); options scroll internally.

When `searchable`, reuse **`ExaloTextInput`** inside the panel — preserve the single-boundary textbox focus contract.

---

## Behavior

- Tap closed → open  
- Tap trigger again → close  
- Tap option → select + close + `onChange`  
- Long lists: constrained `maxListHeight` + internal scroll  
- Web: outside click closes (no extra package)  

---

## Third-party gate

No new picker/dropdown packages without manual approval. Prefer React Native primitives + existing Exalo UI.
