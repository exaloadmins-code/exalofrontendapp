/**
 * Public-only BIDMAS PLACE fixture for BIDMAS-13E/13G/13H frontend preview.
 * Source: 13A/13B SYNTH_PLACE_01_2x8_minus_4_plus_3.
 * Marker: SYNTHETIC_OFFLINE_REVIEW_ONLY (preview chrome only — not drawn by the diagram).
 *
 * MCQ option strings are the authoritative 13A question options (not tree-formatter output).
 */

import type { TrainQuestionRow } from '@/services/trainQuestions/types';

export const SYNTHETIC_OFFLINE_REVIEW_ONLY = 'SYNTHETIC_OFFLINE_REVIEW_ONLY' as const;

/** Authoritative 13A option texts for SYNTH_PLACE_01. */
export const SYNTH_PLACE_01_OPTIONS = [
  '(2 × (8 − 4)) + 3',
  '(2 × 8) − (4 + 3)',
  '2 × ((8 − 4) + 3)',
  '2 × (8 − (4 + 3))',
] as const;

export const SYNTH_PLACE_01_META = {
  review_status: SYNTHETIC_OFFLINE_REVIEW_ONLY,
  fixture_id: 'SYNTH_PLACE_01_2x8_minus_4_plus_3',
  production_candidate: false,
  milestone: 'BIDMAS-13H',
  stem: 'Where must the brackets go so that 2 × 8 − 4 + 3 equals 9?',
  diagram_type: 'bid_group_placements',
  /**
   * Assistive copy only — must NOT be passed as visible diagram_prompt
   * (DiagramDispatcher paints diagram_prompt as on-screen text).
   */
  accessibility_text:
    'Four bracket placements on two times eight minus four plus three. Choose the grouping that equals nine.',
} as const;

/** Public diagram_data only — no _audit, totals, or correct-option identifiers. */
export const SYNTH_PLACE_01_DIAGRAM_DATA: Record<string, unknown> = {
  schema_version: 'bidmas_1.0',
  visual_type: 'bid_group_placements',
  operation: 'bidmas_bracket_placement',
  fixed_tokens: ['2', '×', '8', '−', '4', '+', '3'],
  placements: [
    {
      option_key: 'A',
      tree: {
        op_index: 5,
        left: {
          op_index: 1,
          left: 0,
          right: { op_index: 3, left: 1, right: 2 },
        },
        right: 3,
      },
    },
    {
      option_key: 'B',
      tree: {
        op_index: 3,
        left: { op_index: 1, left: 0, right: 1 },
        right: { op_index: 5, left: 2, right: 3 },
      },
    },
    {
      option_key: 'C',
      tree: {
        op_index: 1,
        left: 0,
        right: {
          op_index: 5,
          left: { op_index: 3, left: 1, right: 2 },
          right: 3,
        },
      },
    },
    {
      option_key: 'D',
      tree: {
        op_index: 1,
        left: 0,
        right: {
          op_index: 3,
          left: 1,
          right: { op_index: 5, left: 2, right: 3 },
        },
      },
    },
  ],
  reveal_values: false,
  accessibility_text: SYNTH_PLACE_01_META.accessibility_text,
};

/**
 * Synthetic Train question for offline preview.
 * diagram_prompt is null so Dispatcher does not reprint accessibility prose.
 * Correct_Option is a non-authoritative placeholder — preview uses
 * deferCorrectness and does not open scored Results.
 */
export function buildSynthPlace01TrainQuestion(): TrainQuestionRow {
  return {
    Question_ID: 'SYNTH_PLACE_01_2x8_minus_4_plus_3',
    Subject_Type: 'Maths',
    Subject: 'BIDMAS',
    Difficulty: 'Medium',
    Question_Text: SYNTH_PLACE_01_META.stem,
    Option_A: SYNTH_PLACE_01_OPTIONS[0],
    Option_B: SYNTH_PLACE_01_OPTIONS[1],
    Option_C: SYNTH_PLACE_01_OPTIONS[2],
    Option_D: SYNTH_PLACE_01_OPTIONS[3],
    Option_E: null,
    Correct_Option: 'A',
    Explanation: null,
    has_diagram: true,
    diagram_type: SYNTH_PLACE_01_META.diagram_type,
    diagram_prompt: null,
    diagram_data: { ...SYNTH_PLACE_01_DIAGRAM_DATA },
  };
}
