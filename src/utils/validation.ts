/**
 * Lightweight validation helpers for onboarding forms.
 */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  // Practical email check — not full RFC; enough for onboarding gating.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
