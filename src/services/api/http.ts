/**
 * Minimal fetch helper for Exalo backend APIs.
 * Preserves structured JSON error bodies (e.g. Train/Focus insufficient-pool 422).
 */

import { getApiBaseUrl } from '@/config/env';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type EmptyPoolErrorBody = {
  detail: string;
  available_question_count: number;
  page_size?: number;
};

/** Focus start 422 when requested count exceeds unique eligible pool. */
export type FocusInsufficientPoolErrorBody = {
  detail: string;
  requested_question_count: number;
  available_question_count: number;
};

/** @deprecated Use EmptyPoolErrorBody / isEmptyPoolError */
export type InsufficientPoolErrorBody = EmptyPoolErrorBody & {
  requested_question_count?: number;
};

export function isEmptyPoolError(
  err: unknown,
): err is ApiError & { body: EmptyPoolErrorBody } {
  if (!(err instanceof ApiError) || err.status !== 422) {
    return false;
  }
  const body = err.body;
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return typeof record.available_question_count === 'number';
}

export function isFocusInsufficientPoolError(
  err: unknown,
): err is ApiError & { body: FocusInsufficientPoolErrorBody } {
  if (!(err instanceof ApiError) || err.status !== 422) {
    return false;
  }
  const body = err.body;
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    typeof record.available_question_count === 'number' &&
    typeof record.requested_question_count === 'number'
  );
}

/** @deprecated Use isEmptyPoolError */
export const isInsufficientPoolError = isEmptyPoolError;

export function formatEmptyPoolMessage(body: EmptyPoolErrorBody): string {
  const available = body.available_question_count;
  if (available <= 0) {
    return 'No questions are available for this topic and difficulty yet. Try another topic or difficulty.';
  }
  return `Only ${available} question${available === 1 ? '' : 's'} available for this topic and difficulty.`;
}

export function formatFocusInsufficientPoolMessage(
  body: FocusInsufficientPoolErrorBody,
): string {
  const available = body.available_question_count;
  const requested = body.requested_question_count;
  if (available <= 0) {
    return 'No unique questions are available for this Focus selection yet. Choose different topics or another difficulty.';
  }
  return `Only ${available} unique question${available === 1 ? '' : 's'} ${available === 1 ? 'is' : 'are'} available for this selection (you asked for ${requested}). Choose fewer questions, different topics, or another difficulty.`;
}

/** @deprecated Use formatEmptyPoolMessage */
export function formatInsufficientPoolMessage(body: EmptyPoolErrorBody): string {
  return formatEmptyPoolMessage(body);
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(
      `Cannot reach the API at ${base}. Check EXPO_PUBLIC_API_URL and that the backend is running. (${message})`,
      0,
      null,
    );
  }

  const body = await parseBody(response);
  if (!response.ok) {
    const detail =
      body &&
      typeof body === 'object' &&
      'detail' in body &&
      typeof (body as { detail: unknown }).detail === 'string'
        ? (body as { detail: string }).detail
        : `Request failed with status ${response.status}`;
    throw new ApiError(detail, response.status, body);
  }
  return body as T;
}
