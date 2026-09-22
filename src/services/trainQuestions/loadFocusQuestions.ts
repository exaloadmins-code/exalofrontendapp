/**
 * Focus question loader seam (M6).
 *
 * UI must call this function — never import `questionBank` directly.
 * LOCAL / TEMPORARY only (question generation shared with Train bank).
 * Future backend integration replaces this module's body without redesigning Focus UI.
 *
 * No network. No session IDs. No Focus API endpoints.
 *
 * Exalo production difficulty semantics (intentional departure from Lovable):
 * - Difficulties are explicit opt-in only.
 * - Empty / omitted difficulties → no questions (never expand to Easy+Medium+Hard).
 *
 * Invariant: every returned question's Difficulty is in the selected set.
 * The ≤20 limit is a maximum — never widen difficulties to pad the set.
 */

import type { JourneySubject } from '@/constants/journey';
import { FOCUS_QUESTIONS_PER_RUN } from '@/constants/focus';
import { trainTopicsFor } from '@/constants/train';
import { generateQuestions, shuffleRows } from './questionBank';
import type {
  TrainBankDifficulty,
  TrainQuestionRow,
  TrainSubjectType,
} from './types';

export type LoadFocusQuestionsParams = {
  subject: JourneySubject;
  /** Topic display labels (Lovable stores selectedTopics as labels). */
  topicLabels: string[];
  /**
   * Explicit capitalized difficulties. At least one required for a valid session.
   * Empty array or omitted → no questions (no all-difficulty fallback).
   */
  difficulties?: TrainBankDifficulty[];
  /** Defaults to Lovable Focus parity (20). */
  limit?: number;
};

export type LoadFocusQuestionsResult = {
  questions: TrainQuestionRow[];
  subjectType: TrainSubjectType;
  /** Canonicalized difficulties used for generation/filter (empty if none valid). */
  effectiveDifficulties: TrainBankDifficulty[];
};

function toSubjectType(subject: JourneySubject): TrainSubjectType {
  return subject === 'english' ? 'English' : 'Maths';
}

/** Deterministic canonicalisation of bank difficulty labels. */
export function canonicalizeFocusDifficulty(
  raw: string | null | undefined,
): TrainBankDifficulty | null {
  const v = (raw ?? '').toString().trim().toLowerCase();
  if (v === 'easy') return 'Easy';
  if (v === 'medium') return 'Medium';
  if (v === 'hard') return 'Hard';
  return null;
}

/**
 * Canonicalize and dedupe selected difficulties.
 * Empty / omitted / all-invalid → [] (never silently becomes all three).
 */
function resolveSelectedDifficulties(
  difficulties: TrainBankDifficulty[] | undefined,
): TrainBankDifficulty[] {
  if (!difficulties || difficulties.length === 0) {
    return [];
  }
  const seen = new Set<TrainBankDifficulty>();
  const out: TrainBankDifficulty[] = [];
  for (const d of difficulties) {
    const canon = canonicalizeFocusDifficulty(d);
    if (!canon || seen.has(canon)) continue;
    seen.add(canon);
    out.push(canon);
  }
  return out;
}

/**
 * LOCAL-ONLY Focus question load — multi-topic × multi-difficulty mix, shuffled, capped.
 * Throws if any topic label is unknown for the subject.
 * Empty topics or empty difficulties → empty questions (safe defensive no-op).
 */
export async function loadFocusQuestions(
  params: LoadFocusQuestionsParams,
): Promise<LoadFocusQuestionsResult> {
  const {
    subject,
    topicLabels,
    difficulties,
    limit = FOCUS_QUESTIONS_PER_RUN,
  } = params;

  const subjectType = toSubjectType(subject);
  const known = new Set(trainTopicsFor(subject).map((t) => t.label));

  for (const label of topicLabels) {
    if (!known.has(label)) {
      throw new Error(`Unknown topic "${label}" for ${subjectType}.`);
    }
  }

  const effectiveDifficulties = resolveSelectedDifficulties(difficulties);

  if (topicLabels.length === 0 || effectiveDifficulties.length === 0) {
    return { questions: [], subjectType, effectiveDifficulties };
  }

  const perCombo = Math.max(
    1,
    Math.ceil(limit / (topicLabels.length * effectiveDifficulties.length)),
  );

  const rows: TrainQuestionRow[] = [];
  for (const topicLabel of topicLabels) {
    for (const difficulty of effectiveDifficulties) {
      rows.push(
        ...generateQuestions({
          subjectType,
          subject: topicLabel,
          difficulty,
          count: perCombo,
        }),
      );
    }
  }

  const allowed = new Set(effectiveDifficulties);
  const questions = shuffleRows(rows)
    .filter((q) => {
      const d = canonicalizeFocusDifficulty(String(q.Difficulty ?? ''));
      return d !== null && allowed.has(d);
    })
    .slice(0, limit);

  return { questions, subjectType, effectiveDifficulties };
}
