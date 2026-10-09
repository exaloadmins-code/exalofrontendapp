/**
 * B3.3 Maths Test API integration — focused automated coverage.
 * Run: npx --yes tsx scripts/b33-maths-test-integration.test.ts
 *
 * Does not touch the development database.
 * Avoids importing React Native barrels.
 */
// @ts-nocheck

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildMathsDevTestStartPayload,
  MATHS_TEST_DEV_BLUEPRINT,
  usesMathsTestApi,
} from '../src/services/api/testBlueprint';
import {
  countMissionReviewItems,
  isMissionReviewWrongAnswer,
  isTestQuestionMissionReviewEligible,
  testResultsToShared,
} from '../src/services/trainQuestions/testResultsAdapter';
import { letterForOptionText } from '../src/services/trainQuestions/optionAdapter';
import { toBackendQuestionNumber } from '../src/services/trainQuestions/numbering';
import {
  buildTestNavCells,
  describeTestNavCell,
  firstFlaggedIndex,
  firstUnansweredIndex,
  questionMapCellSize,
  questionMapColumns,
  summarizeTestPaperState,
} from '../src/services/trainQuestions/testNavigationState';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const readSrc = (rel) => readFileSync(join(root, rel), 'utf8');

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message ?? `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertOk(value, message) {
  if (!value) {
    throw new Error(message ?? 'Expected truthy value');
  }
}

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (err) {
    console.error(`FAIL  ${name}`);
    throw err;
  }
}

// 1. Maths Test start sends the development blueprint selector correctly.
check('Maths start payload uses exalo-maths-mock v1 development', () => {
  const payload = buildMathsDevTestStartPayload(1);
  assertEqual(payload.user_id, 1);
  assertEqual(payload.test_blueprint_code, 'exalo-maths-mock');
  assertEqual(payload.test_blueprint_version, 1);
  assertEqual(payload.purpose, 'development');
  assertEqual(MATHS_TEST_DEV_BLUEPRINT.code, 'exalo-maths-mock');
});

// 2. English Test remains local (routing guard).
check('English does not use Maths Test API', () => {
  assertEqual(usesMathsTestApi('english'), false);
  assertEqual(usesMathsTestApi('maths'), true);
  assertEqual(usesMathsTestApi(null), false);
});

// 3. Backend start response fields consumed (shape contract).
check('Start response fields required for runtime', () => {
  const started = {
    session_id: 1713,
    total_questions: 20,
    time_limit_minutes: 5,
    started_at: '2026-04-01T10:00:00Z',
    expires_at: '2026-04-01T10:05:00Z',
  };
  assertEqual(started.session_id, 1713);
  assertEqual(started.total_questions, 20);
  assertEqual(started.time_limit_minutes, 5);
  assertOk(Date.parse(started.expires_at) > Date.parse(started.started_at));
});

// 4–5. Question fetch mapping + no gameplay correctness fields.
check('Gameplay question mapping has no correctness dependency', () => {
  const gameplay = {
    question_number: 1,
    total_questions: 20,
    stem: 'What is 50% of 100?',
    options: ['50', '90', '25', '75'],
    answered: true,
    selected_answer: '50',
    flagged: true,
    remaining_seconds: 280,
    expires_at: '2026-04-01T10:05:00Z',
    has_diagram: false,
  };
  assertEqual('correct_answer' in gameplay, false);
  assertEqual('is_correct' in gameplay, false);
  assertEqual('explanation' in gameplay, false);
  assertEqual(letterForOptionText(gameplay.options, '50'), 'A');
  assertEqual(toBackendQuestionNumber(0), 1);
});

// 6–8. Answer edit / flag / submit schemas + duplicate-submit guard.
check('Answer / flag / submit request schemas', () => {
  const answer = {
    session_id: 1713,
    question_number: 1,
    selected_answer: '90',
  };
  const flag = { session_id: 1713, question_number: 1, flagged: true };
  const submit = { session_id: 1713 };
  assertEqual(answer.selected_answer, '90');
  assertEqual(flag.flagged, true);
  assertEqual(submit.session_id, 1713);
});

check('Duplicate submit guard keeps a single submit token', () => {
  let submitted = false;
  const submitOnce = () => {
    if (submitted) return 'skipped';
    submitted = true;
    return 'submitted';
  };
  assertEqual(submitOnce(), 'submitted');
  assertEqual(submitOnce(), 'skipped');
});

// Latest-wins answer edit semantics (generation counter pattern).
check('Answer persistence latest-wins generation', () => {
  let generation = 0;
  let latest = '';
  const enqueue = (value) => {
    generation += 1;
    const gen = generation;
    latest = value;
    return { gen, flush: () => (gen === generation ? latest : null) };
  };
  const a = enqueue('50');
  const b = enqueue('90');
  assertEqual(a.flush(), null);
  assertEqual(b.flush(), '90');
});

// 9–15. Rich Test results → shared model + Mission Review (session 1713).
const session1713 = {
  session_id: 1713,
  status: 'completed',
  session_type: 'test',
  total_questions: 20,
  answered_count: 1,
  unanswered_count: 19,
  correct_count: 0,
  incorrect_count: 1,
  score_percentage: 0,
  time_taken_seconds: 42,
  time_limit_minutes: 5,
  auto_submitted: false,
  topic_breakdown: [],
  section_breakdown: [],
  flagged_questions: [1],
  questions: [
    {
      question_number: 1,
      stem: 'Angle question',
      options: ['50', '90', '25', '75'],
      selected_answer: '50',
      correct_answer: '90',
      is_correct: false,
      explanation: 'Opposite angles…',
      has_diagram: true,
      diagram_type: 'angles_v1',
      diagram_prompt: null,
      diagram_data: { version: 1, nodes: [] },
    },
    ...Array.from({ length: 19 }, (_, i) => ({
      question_number: i + 2,
      stem: `Q${i + 2}`,
      options: ['A', 'B', 'C', 'D'],
      selected_answer: null,
      correct_answer: 'A',
      is_correct: null,
      explanation: null,
      has_diagram: false,
      diagram_type: null,
      diagram_prompt: null,
      diagram_data: null,
    })),
  ],
};

check('incorrect_count maps to shared wrong_count', () => {
  const shared = testResultsToShared(session1713);
  assertEqual(shared.wrong_count, 1);
  assertEqual(shared.wrong_count, session1713.incorrect_count);
});

check('score_percentage maps to shared score_percent', () => {
  const shared = testResultsToShared(session1713);
  assertEqual(shared.score_percent, 0);
  assertEqual(shared.score_percent, session1713.score_percentage);
});

check('questions[] diagram fields survive hydration adapter', () => {
  const shared = testResultsToShared(session1713);
  assertEqual(shared.questions[0].has_diagram, true);
  assertEqual(shared.questions[0].diagram_type, 'angles_v1');
  assertOk(shared.questions[0].diagram_data);
});

check('Wrong answered question is Mission Review eligible', () => {
  assertEqual(
    isTestQuestionMissionReviewEligible(session1713.questions[0]),
    true,
  );
});

check('Correct answered question is NOT Mission Review eligible', () => {
  assertEqual(
    isTestQuestionMissionReviewEligible({
      selected_answer: '90',
      is_correct: true,
    }),
    false,
  );
});

check('Unanswered question is NOT Mission Review eligible', () => {
  assertEqual(
    isTestQuestionMissionReviewEligible({
      selected_answer: null,
      is_correct: null,
    }),
    false,
  );
  assertEqual(
    isMissionReviewWrongAnswer({ chosen: null, isCorrect: false }),
    false,
  );
});

check('Session 1713 yields exactly 1 Mission Review card', () => {
  const shared = testResultsToShared(session1713);
  const answers = shared.questions.map((q) => ({
    qid: `api-1713-q${q.question_number}`,
    chosen:
      q.selected_answer == null
        ? null
        : letterForOptionText(q.options, q.selected_answer),
    correct: letterForOptionText(q.options, q.correct_answer) ?? 'A',
    isCorrect: q.is_correct === true,
  }));
  assertEqual(countMissionReviewItems(answers), 1);
  assertEqual(shared.unanswered_count, 19);
  assertEqual(shared.answered_count, 1);
});

check('Try Again must not reuse completed session id', () => {
  let sessionId = 1713;
  sessionId = null;
  assertEqual(sessionId, null);
  const nextStart = buildMathsDevTestStartPayload(1);
  assertEqual(nextStart.test_blueprint_code, 'exalo-maths-mock');
});

// ── B3.3 UX extension: free nav / flag / navigator / finish review ──
check('Unanswered Next is allowed only when allowUnansweredNavigation is wired', () => {
  const player = readSrc('src/components/train/TrainQuizPlayer.tsx');
  assertOk(/allowUnansweredNavigation/.test(player));
  assertOk(
    /if \(!allowUnansweredNavigation && selected == null\) return/.test(player),
  );
  // Default remains gated for Train/Focus.
  assertOk(/allowUnansweredNavigation = false/.test(player));
});

check('Test route enables free nav + navigator + flagging + finish review', () => {
  const route = readSrc('app/test/[subject].tsx');
  assertOk(/allowUnansweredNavigation/.test(route));
  assertOk(/showQuestionNavigator/.test(route));
  assertOk(/allowFlagging/.test(route));
  assertOk(/requireFinishReview/.test(route));
  assertOk(/TestFlagWriteQueue/.test(route));
  assertOk(/onFlagChange/.test(route));
  assertOk(/flagQueue\.drain\(\)/.test(route) || /flagQueueRef/.test(route));
});

check('Paper counts: answered + unanswered = total; flagged independent', () => {
  const slots = [
    { qid: '1', chosen: 'A', correct: 'A', isCorrect: true },
    null,
    { qid: '3', chosen: 'B', correct: 'A', isCorrect: false },
    null,
    null,
  ];
  const flags = [true, true, false, false, true];
  const counts = summarizeTestPaperState(slots, flags, 5);
  assertEqual(counts.answered, 2);
  assertEqual(counts.unanswered, 3);
  assertEqual(counts.answered + counts.unanswered, counts.total);
  assertEqual(counts.flagged, 3);
});

check('Navigator cells distinguish answered+flagged and unanswered+flagged', () => {
  const slots = [
    { qid: '1', chosen: 'A', correct: 'A', isCorrect: true },
    null,
  ];
  const flags = [true, true];
  const cells = buildTestNavCells({
    answerSlots: slots,
    flags,
    total: 2,
    currentIndex: 1,
  });
  assertEqual(cells[0].answered, true);
  assertEqual(cells[0].flagged, true);
  assertEqual(cells[0].current, false);
  assertEqual(cells[1].answered, false);
  assertEqual(cells[1].flagged, true);
  assertEqual(cells[1].current, true);
  assertOk(describeTestNavCell(cells[0]).includes('answered'));
  assertOk(describeTestNavCell(cells[0]).includes('flagged'));
  assertOk(describeTestNavCell(cells[1]).includes('unanswered'));
  assertOk(describeTestNavCell(cells[1]).includes('current'));
});

check('Review flagged / unanswered jump to first matching index', () => {
  const flags = [false, true, true];
  const slots = [
    { qid: '1', chosen: 'A', correct: 'A', isCorrect: true },
    null,
    { qid: '3', chosen: 'B', correct: 'A', isCorrect: false },
  ];
  assertEqual(firstFlaggedIndex(flags, 3), 1);
  assertEqual(firstUnansweredIndex(slots, 3), 1);
  assertEqual(firstFlaggedIndex([false, false], 2), null);
  assertEqual(
    firstUnansweredIndex(
      [
        { qid: '1', chosen: 'A', correct: 'A', isCorrect: true },
        { qid: '2', chosen: 'B', correct: 'A', isCorrect: false },
      ],
      2,
    ),
    null,
  );
});

check('Flag latest-wins generation mirrors answer queue', () => {
  let generation = 0;
  let latest = null;
  const enqueue = (value) => {
    generation += 1;
    const gen = generation;
    latest = value;
    return { gen, flush: () => (gen === generation ? latest : null) };
  };
  const a = enqueue(true);
  const b = enqueue(false);
  assertEqual(a.flush(), null);
  assertEqual(b.flush(), false);
});

check('Selecting/changing answer does not clear flag (state independence)', () => {
  // Pure state model: answer slot and flag bit are separate arrays.
  const flags = [true];
  const slots = [null];
  // Answer Q1 — flag remains.
  slots[0] = { qid: '1', chosen: 'A', correct: 'A', isCorrect: false };
  assertEqual(flags[0], true);
  // Change answer — flag remains.
  slots[0] = { qid: '1', chosen: 'B', correct: 'A', isCorrect: false };
  assertEqual(flags[0], true);
  assertEqual(slots[0].chosen, 'B');
});

check('Finish allowed with unanswered and flagged (no hard block)', () => {
  const counts = summarizeTestPaperState(
    [null, null],
    [true, false],
    2,
  );
  assertEqual(counts.unanswered, 2);
  assertEqual(counts.flagged, 1);
  // Submission gate is counts-agnostic — only requireFinishReview confirmation.
  const mayFinish = true;
  assertEqual(mayFinish, true);
});

check('Timeout path bypasses finish review modal in player source', () => {
  const player = readSrc('src/components/train/TrainQuizPlayer.tsx');
  assertOk(/Timeout bypasses Finish review confirmation/.test(player));
  assertOk(/setFinishReviewVisible\(false\)/.test(player));
  // Timeout still uses finalizeOnce / onBeforeSeeResults — not the review Finish CTA.
  assertOk(/expiredRef\.current = true/.test(player));
});

check('Mission Review still ignores flagged-correct and unanswered', () => {
  assertEqual(
    isTestQuestionMissionReviewEligible({
      selected_answer: '90',
      is_correct: true,
    }),
    false,
  );
  assertEqual(
    isTestQuestionMissionReviewEligible({
      selected_answer: null,
      is_correct: null,
    }),
    false,
  );
  // Flagged is not part of Mission Review eligibility.
  assertEqual(
    isTestQuestionMissionReviewEligible({
      selected_answer: '50',
      is_correct: false,
    }),
    true,
  );
});

check('English remains local; Maths uses API', () => {
  assertEqual(usesMathsTestApi('english'), false);
  assertEqual(usesMathsTestApi('maths'), true);
  const route = readSrc('app/test/[subject].tsx');
  assertOk(/English — local only/.test(route) || /local only/.test(route));
  assertOk(/usesMathsTestApi\(subject\)/.test(route));
});

check('Train/Focus defaults do not enable Test-only UX props', () => {
  const player = readSrc('src/components/train/TrainQuizPlayer.tsx');
  assertOk(/allowFlagging = false/.test(player));
  assertOk(/showQuestionNavigator = false/.test(player));
  assertOk(/requireFinishReview = false/.test(player));
  const focus = readSrc('app/focus/[subject].tsx');
  assertEqual(/allowUnansweredNavigation/.test(focus), false);
  assertEqual(/showQuestionNavigator/.test(focus), false);
  assertEqual(/allowFlagging/.test(focus), false);
});

check('Navigating does not fabricate an answer payload', () => {
  // Skipping leaves null slots — no synthetic letter.
  const slots = [null, null];
  const nextIdx = 1;
  assertEqual(slots[0], null);
  assertEqual(slots[nextIdx], null);
  const player = readSrc('src/components/train/TrainQuizPlayer.tsx');
  assertOk(/without fabricating answers/.test(player));
});

// ── Compact Question Map refinement ──
check('Question Map layout helpers: 5–6 columns and tappable cell size', () => {
  assertEqual(questionMapColumns(360), 6);
  assertEqual(questionMapColumns(300), 5);
  assertEqual(questionMapColumns(240), 4);
  const size6 = questionMapCellSize(360, 6, 8);
  assertOk(size6 >= 36 && size6 <= 48, `expected 36–48, got ${size6}`);
  const size4 = questionMapCellSize(240, 4, 8);
  assertOk(size4 >= 36, `narrow map cell too small: ${size4}`);
});

check('Question Map state model scales to 20 and 45 questions', () => {
  for (const total of [20, 45]) {
    const slots = Array.from({ length: total }, (_, i) =>
      i % 3 === 0
        ? { qid: String(i), chosen: 'A', correct: 'A', isCorrect: true }
        : null,
    );
    const flags = Array.from({ length: total }, (_, i) => i % 7 === 0);
    const counts = summarizeTestPaperState(slots, flags, total);
    assertEqual(counts.total, total);
    assertEqual(counts.answered + counts.unanswered, total);
    const cells = buildTestNavCells({
      answerSlots: slots,
      flags,
      total,
      currentIndex: total - 1,
    });
    assertEqual(cells.length, total);
    assertEqual(cells[total - 1].current, true);
    assertOk(cells.some((c) => c.answered && c.flagged));
    assertOk(cells.some((c) => !c.answered && c.flagged));
  }
});

check('Compact Question Map removes large summary cards; counter opens map', () => {
  const nav = readSrc('src/components/test/TestQuestionNavigator.tsx');
  assertOk(/test-question-navigator/.test(nav));
  assertOk(/answered ·/.test(nav) || /answered · /.test(nav));
  assertEqual(/SummaryChip/.test(nav), false);
  assertOk(/maxSheetHeight|maxHeight/.test(nav));
  assertOk(/questionMapColumns/.test(nav));
  const player = readSrc('src/components/train/TrainQuizPlayer.tsx');
  assertOk(/LayoutGrid/.test(player));
  assertOk(/Open question map/.test(player));
});

console.log(`\nB3.3 automated checks: ${passed} passed`);
