/**
 * Centralized option letter ↔ backend option TEXT adapter for Train API.
 *
 * Backend `options` is an ordered string[] and `selected_answer` must be TEXT.
 * Frontend gameplay keeps A/B/C/D/E letter UX.
 */

import { OPTION_LETTERS, type OptionLetter } from '@/services/trainQuestions/types';

export function letterForOptionIndex(index: number): OptionLetter | null {
  if (index < 0 || index >= OPTION_LETTERS.length) {
    return null;
  }
  return OPTION_LETTERS[index];
}

export function optionIndexForLetter(letter: OptionLetter | string): number {
  const normalized = letter.toString().trim().toUpperCase();
  return OPTION_LETTERS.indexOf(normalized as OptionLetter);
}

/** Map backend options[] → lettered rows for UI (skips empty strings). */
export function letteredOptionsFromBackend(
  options: readonly string[],
): { letter: OptionLetter; text: string; index: number }[] {
  const rows: { letter: OptionLetter; text: string; index: number }[] = [];
  options.forEach((text, index) => {
    const letter = letterForOptionIndex(index);
    if (!letter) {
      return;
    }
    const trimmed = String(text ?? '').trim();
    if (!trimmed) {
      return;
    }
    rows.push({ letter, text: trimmed, index });
  });
  return rows;
}

/**
 * Convert a UI letter to the exact backend option text for POST /train/answer.
 * Throws if the letter is out of range for the given options.
 */
export function optionTextForLetter(
  options: readonly string[],
  letter: OptionLetter | string,
): string {
  const index = optionIndexForLetter(letter);
  if (index < 0 || index >= options.length) {
    throw new Error(`Option letter ${String(letter)} is not valid for this question.`);
  }
  const text = options[index];
  if (text == null || String(text).trim() === '') {
    throw new Error(`Option letter ${String(letter)} has empty text.`);
  }
  return String(text);
}

/** Convert backend option text → display letter using exact options order. */
export function letterForOptionText(
  options: readonly string[],
  text: string | null | undefined,
): OptionLetter | null {
  if (text == null) {
    return null;
  }
  const index = options.findIndex((opt) => opt === text);
  if (index < 0) {
    // Fall back to trimmed match once — still exact string after trim.
    const trimmed = text.trim();
    const soft = options.findIndex((opt) => String(opt).trim() === trimmed);
    return soft >= 0 ? letterForOptionIndex(soft) : null;
  }
  return letterForOptionIndex(index);
}

/** Results label: "B · 15" when possible. */
export function formatBackendOptionLabel(
  options: readonly string[],
  text: string | null | undefined,
): string {
  if (text == null || text === '') {
    return '';
  }
  const letter = letterForOptionText(options, text);
  if (letter) {
    return `${letter} · ${text}`;
  }
  return text;
}
