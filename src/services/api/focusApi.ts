/**
 * Typed Focus API client — Maths Focus (B2.2 contract).
 * Reuses shared apiRequest / env helpers. No second HTTP stack.
 */

import { apiRequest } from '@/services/api/http';

export type FocusStartPayload = {
  user_id: number;
  subject: string;
  topics: string[];
  difficulty: string;
  question_count: number;
};

export type FocusStartResponse = {
  session_id: number;
  total_questions: number;
  subject: string;
  topics: string[];
  difficulty: string;
  question_count: number;
};

export type FocusAnswerPayload = {
  session_id: number;
  question_number: number;
  selected_answer: string;
  time_spent_seconds?: number | null;
};

export type FocusAnswerResponse = {
  session_id: number;
  question_number: number;
  saved: boolean;
};

export type FocusQuestionTimeEntry = {
  question_number: number;
  time_spent_seconds: number;
};

export type FocusCompletePayload = {
  session_id: number;
  question_times?: FocusQuestionTimeEntry[] | null;
};

export type FocusCompleteResponse = {
  session_id: number;
  status: string;
  completed_at: string;
};

export type FocusQuestionResult = {
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
  time_spent_seconds?: number | null;
};

export type FocusQuestionTiming = {
  question_number: number;
  time_spent_seconds: number | null;
};

export type FocusTopicBreakdown = {
  topic_id: number;
  topic_name: string;
  questions_count: number;
  correct_count: number;
  accuracy_percent: number;
  average_time_seconds: number | null;
};

export type FocusResultsResponse = {
  session_id: number;
  status: string;
  session_type: string;
  total_questions: number;
  answered_count: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  score_percent: number;
  average_time_seconds?: number | null;
  topic_breakdown?: FocusTopicBreakdown[];
  question_timing?: FocusQuestionTiming[];
  questions: FocusQuestionResult[];
};

export function startFocus(
  payload: FocusStartPayload,
): Promise<FocusStartResponse> {
  return apiRequest<FocusStartResponse>('/focus/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function answerFocusQuestion(
  payload: FocusAnswerPayload,
): Promise<FocusAnswerResponse> {
  return apiRequest<FocusAnswerResponse>('/focus/answer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function completeFocus(
  payload: FocusCompletePayload,
): Promise<FocusCompleteResponse> {
  return apiRequest<FocusCompleteResponse>('/focus/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
