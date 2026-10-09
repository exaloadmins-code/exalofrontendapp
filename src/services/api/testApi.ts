/**
 * Typed Test API client — Maths Test (B3.3 contract).
 * English Test must never call these endpoints.
 */

import { apiRequest } from '@/services/api/http';
import {
  buildMathsDevTestStartPayload,
  MATHS_TEST_DEV_BLUEPRINT,
  usesMathsTestApi,
  type TestBlueprintPurpose,
  type TestStartPayload,
} from '@/services/api/testBlueprint';

export {
  buildMathsDevTestStartPayload,
  MATHS_TEST_DEV_BLUEPRINT,
  usesMathsTestApi,
};
export type { TestBlueprintPurpose, TestStartPayload };

export type TestStartResponse = {
  session_id: number;
  total_questions: number;
  time_limit_minutes: number;
  started_at: string;
  expires_at: string;
  test_pattern_id?: number | null;
  test_pattern_name?: string | null;
};

export type TestAnswerPayload = {
  session_id: number;
  question_number: number;
  selected_answer: string;
};

export type TestAnswerResponse = {
  session_id: number;
  question_number: number;
  saved: boolean;
};

export type TestFlagPayload = {
  session_id: number;
  question_number: number;
  flagged: boolean;
};

export type TestFlagResponse = {
  session_id: number;
  question_number: number;
  flagged: boolean;
};

export type TestSubmitPayload = {
  session_id: number;
};

export type TestSubmitResponse = {
  session_id: number;
  status: string;
  completed_at: string;
  time_taken_seconds: number;
  auto_submitted: boolean;
};

export type TestQuestionResult = {
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
};

export type TestTopicBreakdown = {
  topic_id: number;
  topic_name: string;
  questions_count: number;
  answered_count: number;
  correct_count: number;
  accuracy_percent: number;
};

export type TestSectionBreakdown = {
  section_order: number;
  section_name: string;
  subject_id: number;
  subject_name: string;
  questions_count: number;
  answered_count: number;
  correct_count: number;
  accuracy_percent: number;
};

/**
 * Backend Test results DTO (B3.2E). Aggregate naming differs from Train/Focus;
 * normalize at the adapter boundary before shared Results hydration.
 */
export type TestResultsResponse = {
  session_id: number;
  status: string;
  session_type: string;
  total_questions: number;
  answered_count: number;
  unanswered_count: number;
  correct_count: number;
  incorrect_count: number;
  score_percentage: number;
  time_taken_seconds: number;
  time_limit_minutes: number;
  auto_submitted: boolean;
  topic_breakdown: TestTopicBreakdown[];
  section_breakdown?: TestSectionBreakdown[];
  flagged_questions: number[];
  questions: TestQuestionResult[];
};

export function startTest(payload: TestStartPayload): Promise<TestStartResponse> {
  return apiRequest<TestStartResponse>('/test/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function answerTestQuestion(
  payload: TestAnswerPayload,
): Promise<TestAnswerResponse> {
  return apiRequest<TestAnswerResponse>('/test/answer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function flagTestQuestion(
  payload: TestFlagPayload,
): Promise<TestFlagResponse> {
  return apiRequest<TestFlagResponse>('/test/flag', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function submitTest(
  payload: TestSubmitPayload,
): Promise<TestSubmitResponse> {
  return apiRequest<TestSubmitResponse>('/test/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
