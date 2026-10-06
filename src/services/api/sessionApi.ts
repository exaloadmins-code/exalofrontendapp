/**
 * Shared session question / results GETs (B2.2 `/sessions/...` paths).
 * Focus (and future modes) reuse these; Maths Train continues on `/train/sessions/...`.
 */

import { apiRequest } from '@/services/api/http';
import type { FocusResultsResponse } from '@/services/api/focusApi';
import type {
  TrainQuestionResponse,
  TrainResultsResponse,
} from '@/services/api/trainApi';

/** Gameplay question shape — compatible with TrainQuestionResponse / adapters. */
export type SessionQuestionResponse = TrainQuestionResponse;

/**
 * Focus results extend Train counts with session_type / timing metadata.
 * Overlapping fields are intentionally TrainResultsResponse-compatible.
 */
export type SessionResultsResponse = FocusResultsResponse | TrainResultsResponse;

export function getSessionQuestion(
  sessionId: number,
  questionNumber: number,
): Promise<SessionQuestionResponse> {
  return apiRequest<SessionQuestionResponse>(
    `/sessions/${sessionId}/questions/${questionNumber}`,
  );
}

export function getSessionResults(
  sessionId: number,
): Promise<SessionResultsResponse> {
  return apiRequest<SessionResultsResponse>(
    `/sessions/${sessionId}/results`,
  );
}
