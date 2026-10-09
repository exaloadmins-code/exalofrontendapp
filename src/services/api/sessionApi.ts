/**
 * Shared session question / results GETs (`/sessions/...` paths).
 * Focus, Maths Test, and Maths Train (B4.3) reuse getSessionResults.
 * Maths Train gameplay questions remain on `/train/sessions/...`.
 */

import { apiRequest } from '@/services/api/http';
import type { FocusResultsResponse } from '@/services/api/focusApi';
import type {
  TrainQuestionResponse,
  TrainResultsResponse,
} from '@/services/api/trainApi';

/**
 * Gameplay question shape — compatible with TrainQuestionResponse / adapters.
 * Test sessions may also include remaining_seconds / expires_at / section fields.
 */
export type SessionQuestionResponse = TrainQuestionResponse & {
  remaining_seconds?: number | null;
  expires_at?: string | null;
  section_order?: number | null;
  section_name?: string | null;
};

/**
 * Shared `/sessions/{id}/results` JSON.
 * Focus returns wrong_count / score_percent; Test returns incorrect_count /
 * score_percentage — Test callers normalize via testResultsAdapter before hydrate.
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
