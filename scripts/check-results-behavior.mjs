/**
 * Lightweight Results contract checks:
 * - Mission Review = wrong answered only
 * - Perfect state requires wrong=0 AND unanswered=0
 * - Home → Routes.Home for Train/Focus/Test
 * - Try Again preserves subject + mode (no Train API retry)
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

// --- Pure review/perfect predicates (mirror services/trainResults.ts) ---
function summarize(answers, totalQuestions) {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  for (const a of answers) {
    if (a.chosen == null) unanswered += 1;
    else if (a.isCorrect) correct += 1;
    else wrong += 1;
  }
  const total = totalQuestions > 0 ? totalQuestions : answers.length;
  return { correct, wrong, unanswered, total };
}

function buildReview(answers) {
  const items = [];
  for (let i = 0; i < answers.length; i += 1) {
    const a = answers[i];
    if (a.chosen == null || a.isCorrect) continue;
    items.push(i);
  }
  return items;
}

/** Mirror reviewDiagramFromQuestion + buildTrainReviewItems diagram attach. */
function buildReviewWithDiagrams(answers, questions) {
  const items = [];
  for (let i = 0; i < answers.length; i += 1) {
    const a = answers[i];
    if (a.chosen == null || a.isCorrect) continue;
    const q = questions[i];
    const item = { index: i };
    if (q?.has_diagram) {
      item.diagram = {
        hasDiagram: true,
        diagramType: q.diagram_type ?? null,
        diagramPrompt: q.diagram_prompt ?? null,
        diagramData: q.diagram_data ?? null,
      };
    }
    items.push(item);
  }
  return items;
}

function isPerfect(summary) {
  return summary.total > 0 && summary.wrong === 0 && summary.unanswered === 0;
}

const mixed = [
  { chosen: 'A', isCorrect: true },
  { chosen: 'B', isCorrect: false },
  { chosen: null, isCorrect: false },
  { chosen: 'C', isCorrect: false },
  { chosen: null, isCorrect: false },
];
const mixedSummary = summarize(mixed, 5);
assert.equal(mixedSummary.correct, 1);
assert.equal(mixedSummary.wrong, 2);
assert.equal(mixedSummary.unanswered, 2);
assert.equal(mixedSummary.total, 5);
const mixedReview = buildReview(mixed);
assert.deepEqual(mixedReview, [1, 3], 'review = wrong answered only');
assert.equal(isPerfect(mixedSummary), false);

const noWrongUnanswered = [
  { chosen: 'A', isCorrect: true },
  { chosen: null, isCorrect: false },
  { chosen: 'B', isCorrect: true },
];
const nwuSummary = summarize(noWrongUnanswered, 3);
assert.equal(nwuSummary.wrong, 0);
assert.equal(nwuSummary.unanswered, 1);
assert.deepEqual(buildReview(noWrongUnanswered), []);
assert.equal(isPerfect(nwuSummary), false, 'empty review ≠ perfect');

const perfectAnswers = [
  { chosen: 'A', isCorrect: true },
  { chosen: 'B', isCorrect: true },
];
const perfectSummary = summarize(perfectAnswers, 2);
assert.deepEqual(buildReview(perfectAnswers), []);
assert.equal(isPerfect(perfectSummary), true);

// --- Diagram retention on wrong-only review ---
const diagQuestions = [
  {
    has_diagram: true,
    diagram_type: 'geometry',
    diagram_prompt: null,
    diagram_data: { schema_version: '2.0', visual_type: 'circle_model' },
  },
  {
    has_diagram: true,
    diagram_type: null,
    diagram_prompt: null,
    diagram_data: {
      schema_version: 'area_diagram_v1',
      visual_type: 'labelled_triangle_base_height',
    },
  },
  {
    has_diagram: true,
    diagram_type: null,
    diagram_prompt: null,
    diagram_data: { schema_version: 'broken' },
  },
  { has_diagram: false, diagram_data: null },
  {
    has_diagram: true,
    diagram_type: null,
    diagram_prompt: null,
    diagram_data: {
      schema_version: 'angles_diagram_v1',
      visual_type: 'angles_missing_angle_semantic_a7',
    },
  },
];
const diagAnswers = [
  { chosen: 'A', isCorrect: true }, // correct + diagram → not in review
  { chosen: 'B', isCorrect: false }, // wrong + diagram → keep
  { chosen: null, isCorrect: false }, // unanswered + diagram → not in review
  { chosen: 'C', isCorrect: false }, // wrong + no diagram
  { chosen: 'D', isCorrect: false }, // wrong + diagram
];
const diagReview = buildReviewWithDiagrams(diagAnswers, diagQuestions);
assert.deepEqual(
  diagReview.map((r) => r.index),
  [1, 3, 4],
  'wrong-only indices with diagrams mixed in',
);
assert.ok(diagReview[0].diagram, 'wrong + diagram retains payload');
assert.equal(diagReview[0].diagram.diagramData.visual_type, 'labelled_triangle_base_height');
assert.equal(diagReview[1].diagram, undefined, 'wrong + no diagram → no payload');
assert.ok(diagReview[2].diagram, 'second wrong diagram retained');
assert.equal(
  diagReview.some((r) => r.index === 2),
  false,
  'unanswered + diagram excluded from Mission Review',
);
assert.equal(
  diagReview.some((r) => r.index === 0),
  false,
  'correct + diagram excluded from Mission Review',
);
// Malformed explicit diagram still passes through for fail-closed renderer.
assert.equal(
  buildReviewWithDiagrams(
    [{ chosen: 'A', isCorrect: false }],
    [
      {
        has_diagram: true,
        diagram_type: null,
        diagram_prompt: null,
        diagram_data: { schema_version: 'broken' },
      },
    ],
  )[0].diagram.diagramData.schema_version,
  'broken',
  'malformed diagram reaches review for fail-closed path',
);

// --- Source contracts ---
const service = read('src/services/trainResults.ts');
assert.match(
  service,
  /if \(answer\.chosen == null \|\| answer\.isCorrect\)/,
  'buildTrainReviewItems skips unanswered and correct',
);
assert.match(service, /isTrainResultPerfect/, 'exports isTrainResultPerfect');
assert.match(
  service,
  /summary\.wrong === 0 && summary\.unanswered === 0/,
  'perfect requires wrong=0 and unanswered=0',
);
assert.match(
  service,
  /reviewDiagramFromQuestion/,
  'review attaches diagram via reviewDiagramFromQuestion',
);
assert.match(
  service,
  /has_diagram/,
  'diagram attach gates on has_diagram',
);
assert.doesNotMatch(
  service,
  /retryTrain|armTrainApiRetry|\/train\/sessions\/.*\/retry/,
  'no Train API retry in trainResults',
);

const view = read('src/components/train/TrainResultsView.tsx');
assert.match(view, /isTrainResultPerfect\(summary\)/, 'view uses perfect helper');
assert.match(view, /NoWrongReviewState|noWrongReviewTitle/, 'no-wrong review state');
assert.match(view, /showNoWrongReview/, 'empty review ≠ perfect branch');
assert.match(
  view,
  /TrainQuestionDiagram/,
  'Mission Review reuses TrainQuestionDiagram',
);
assert.match(
  view,
  /entry\.diagram\?\.hasDiagram/,
  'diagram renders only when review item has diagram',
);

const hydrator = read('src/services/trainQuestions/resultsHydrator.ts');
assert.match(
  hydrator,
  /backendResultQuestionToRow/,
  'API results hydrate via backendResultQuestionToRow',
);
const adapter = read('src/services/trainQuestions/backendAdapter.ts');
assert.match(
  adapter,
  /has_diagram: Boolean\(q\.has_diagram\)/,
  'result adapter preserves has_diagram',
);
assert.match(
  adapter,
  /diagram_data:/,
  'result adapter preserves diagram_data',
);

const copy = read('src/constants/trainResults.ts');
assert.match(copy, /noWrongReviewTitle/, 'copy for non-perfect empty review');
assert.match(copy, /noWrongReviewBody/, 'body for non-perfect empty review');
assert.match(
  copy,
  /Nothing incorrect to review/,
  'no-wrong copy does not claim perfect score',
);

const trainResultsScreen = read('app/train/[subject]/[topic]/results.tsx');
assert.match(trainResultsScreen, /Routes\.Home/, 'Train Home → Routes.Home');
assert.match(
  trainResultsScreen,
  /`\/train\/\$\{subject\}`/,
  'Train Try Again → /train/{subject}',
);
assert.doesNotMatch(
  trainResultsScreen,
  /retryTrain|armTrainApiRetry|armTrainRetry\(/,
  'Train Results no retry arm/API',
);

const focus = read('app/focus/[subject].tsx');
assert.match(focus, /Routes\.Home/, 'Focus Home → Routes.Home');
assert.match(focus, /returnToSetup\(\)/, 'Focus Try Again → setup');
assert.match(focus, /onHome=\{onHome\}/, 'Focus Results wires onHome');
assert.doesNotMatch(
  focus,
  /onTryAgain[\s\S]{0,200}setPhase\('play'\)/,
  'Focus Try Again does not auto-start play',
);

const testScreen = read('app/test/[subject].tsx');
assert.match(testScreen, /Routes\.Home/, 'Test Home → Routes.Home');
assert.match(
  testScreen,
  /onTryAgain[\s\S]{0,200}resetToInstructions/,
  'Test Try Again → instructions (same subject)',
);
assert.match(
  testScreen,
  /type TestPhase = 'instructions'/,
  'Test has instructions phase',
);
assert.doesNotMatch(
  testScreen,
  /modeEntryNonce/,
  'Test no longer auto-starts via modeEntryNonce',
);
assert.doesNotMatch(
  testScreen,
  /onTryAgain[\s\S]{0,200}loadTestQuestions/,
  'Test Try Again does not load a paper',
);
assert.doesNotMatch(
  testScreen,
  /onTryAgain[\s\S]{0,200}setPhase\('play'\)/,
  'Test Try Again does not jump to play',
);

const trainApi = read('src/services/api/trainApi.ts');
assert.doesNotMatch(trainApi, /retryTrain/, 'trainApi has no retryTrain');
assert.doesNotMatch(
  trainApi,
  /\/train\/sessions\/.+\/retry/,
  'trainApi has no retry path',
);

console.log('check-results-behavior: PASS');
