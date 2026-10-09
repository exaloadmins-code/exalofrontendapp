/**
 * Typed Train API client — continuous Maths Train (pages of up to 20).
 */

import { apiRequest } from '@/services/api/http';

export type TrainStartPayload = {
  user_id: number;
  subject: string;
  topic: string;
  difficulty: string;
};

export type TrainStartResponse = {
  session_id: number;
  total_questions: number;
  page_size: number;
  added_count: number;
  has_more: boolean;
};

export type TrainContinueResponse = {
  session_id: number;
  added_count: number;
  added_from_question_number: number;
  added_to_question_number: number;
  total_questions: number;
  page_size: number;
  has_more: boolean;
};

export type TrainQuestionResponse = {
  question_number: number;
  total_questions: number;
  stem: string;
  options: string[];
  answered: boolean;
  flagged?: boolean;
  selected_answer?: string | null;
  /** Present on Test gameplay GETs — backend-authoritative expiry. */
  remaining_seconds?: number | null;
  expires_at?: string | null;
  section_order?: number | null;
  section_name?: string | null;
  has_diagram?: boolean;
  diagram_type?: string | null;
  diagram_prompt?: string | null;
  diagram_data?: Record<string, unknown> | null;
};

export type TrainAnswerPayload = {
  session_id: number;
  question_number: number;
  selected_answer: string;
};

export type TrainAnswerResponse = {
  session_id: number;
  question_number: number;
  saved: boolean;
};

export type TrainCompletePayload = {
  session_id: number;
};

export type TrainCompleteResponse = {
  session_id: number;
  status: string;
  completed_at: string;
};

export type TrainQuestionResult = {
  question_number: number;
  stem: string;
  options: string[];
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean | null;
  explanation: string | null;
  has_diagram?: boolean;
  diagram_type?: string | null;
  diagram_prompt?: string | null;
  diagram_data?: Record<string, unknown> | null;
  /** Present on Focus (and future) session Results; optional for Train. */
  time_spent_seconds?: number | null;
};

export type TrainResultsResponse = {
  session_id: number;
  status: string;
  total_questions: number;
  answered_count: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  score_percent: number;
  questions: TrainQuestionResult[];
};

export function startTrain(payload: TrainStartPayload): Promise<TrainStartResponse> {
  return apiRequest<TrainStartResponse>('/train/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function continueTrainSession(
  sessionId: number,
): Promise<TrainContinueResponse> {
  return apiRequest<TrainContinueResponse>(
    `/train/sessions/${sessionId}/continue`,
    { method: 'POST' },
  );
}

export function getTrainQuestion(
  sessionId: number,
  questionNumber: number,
): Promise<TrainQuestionResponse> {
  return apiRequest<TrainQuestionResponse>(
    `/train/sessions/${sessionId}/questions/${questionNumber}`,
  );
}

export function answerTrainQuestion(
  payload: TrainAnswerPayload,
): Promise<TrainAnswerResponse> {
  return apiRequest<TrainAnswerResponse>('/train/answer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function completeTrain(
  payload: TrainCompletePayload,
): Promise<TrainCompleteResponse> {
  return apiRequest<TrainCompleteResponse>('/train/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getTrainResults(sessionId: number): Promise<TrainResultsResponse> {
  return apiRequest<TrainResultsResponse>(
    `/train/sessions/${sessionId}/results`,
  );
}
