/**
 * Centralized Train session numbering: frontend 0-based index ↔ backend 1-based.
 */

export function toBackendQuestionNumber(frontendIndex: number): number {
  if (!Number.isInteger(frontendIndex) || frontendIndex < 0) {
    throw new Error(`Invalid frontend question index: ${frontendIndex}`);
  }
  return frontendIndex + 1;
}

export function toFrontendQuestionIndex(backendQuestionNumber: number): number {
  if (!Number.isInteger(backendQuestionNumber) || backendQuestionNumber < 1) {
    throw new Error(`Invalid backend question_number: ${backendQuestionNumber}`);
  }
  return backendQuestionNumber - 1;
}
