/**
 * QB-FE-2 Train End, Test End Test, and live filtered pre-submit review.
 * Run: npx --yes tsx scripts/qb-fe-2-end-and-filtered-review.test.ts
 *
 * Does not touch the development database or question banks.
 * Avoids importing React Native barrels.
 */
// @ts-nocheck

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  firstFlaggedIndex,
  firstUnansweredIndex,
  nextFilteredIndex,
  previousFilteredIndex,
  summarizeTestPaperState,
} from '../src/services/trainQuestions/testNavigationState';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const readSrc = (rel) => readFileSync(join(root, rel), 'utf8');

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message ??
        `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
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

function between(source, start, end) {
  const from = source.indexOf(start);
  assertOk(from >= 0, `missing start marker: ${start}`);
  const to = source.indexOf(end, from + start.length);
  assertOk(to > from, `missing end marker after: ${start}`);
  return source.slice(from, to);
}

function answered(qid, chosen = 'A') {
  return { qid, chosen, correct: 'A', isCorrect: false };
}

/** Indexes 1, 4, 8 flagged. Others clear. */
function flaggedPaper() {
  const flags = Array.from({ length: 10 }, () => false);
  flags[1] = true;
  flags[4] = true;
  flags[8] = true;
  const slots = flags.map((_, i) => answered(String(i)));
  return { flags, slots, total: flags.length };
}

/** Indexes 1, 3, 7 unanswered. Others answered. */
function unansweredPaper() {
  const total = 10;
  const slots = Array.from({ length: total }, (_, i) =>
    i === 1 || i === 3 || i === 7 ? null : answered(String(i)),
  );
  const flags = Array.from({ length: total }, () => false);
  return { slots, flags, total };
}

const player = readSrc('src/components/train/TrainQuizPlayer.tsx');
const trainRoute = readSrc('app/train/[subject]/[topic]/index.tsx');
const testRoute = readSrc('app/test/[subject].tsx');
const focusRoute = readSrc('app/focus/[subject].tsx');
const finishModal = readSrc('src/components/test/TestFinishReviewModal.tsx');

const goNext = between(player, 'const goNext = () => {', 'const toggleFlag');
const goPrevious = between(player, 'const goPrevious = () => {', 'const goNext');
const requestEndTrain = between(
  player,
  'const requestEndTrain = () => {',
  'const cancelEndTrain',
);
const cancelEndTrain = between(
  player,
  'const cancelEndTrain = () => {',
  'const confirmEndTrain',
);
const confirmEndTrain = between(
  player,
  'const confirmEndTrain = () => {',
  'const requestEndTest',
);
const requestEndTest = between(
  player,
  'const requestEndTest = () => {',
  'if (!questions.length)',
);
const confirmEndFocus = between(
  player,
  'const confirmEndFocus = () => {',
  'const requestEndTrain',
);
const onBeforeTrainResults = between(
  trainRoute,
  'const onBeforeSeeResults = async',
  'const onSeeResults',
);
const onBeforeTestResults = between(
  testRoute,
  'const onBeforeSeeResults = async',
  'const onTimeExpired',
);

check('Train route enables End; Focus and Test do not', () => {
  assertOk(/showEndTrain/.test(trainRoute));
  assertEqual(/showEndTrain/.test(focusRoute), false);
  assertEqual(/showEndTest/.test(trainRoute), false);
  assertEqual(/showEndTrain/.test(testRoute), false);
  assertOk(/showEndTrain = false/.test(player));
  assertOk(/accessibilityLabel=\{COPY\.endTrain\}/.test(player));
  assertOk(/endTrain: 'End Train'/.test(readSrc('src/constants/trainGameplay.ts')));
});

check('Train End opens confirmation and does not finalize immediately', () => {
  assertOk(/setEndTrainConfirmVisible\(true\)/.test(requestEndTrain));
  assertEqual(/finalizeOnce/.test(requestEndTrain), false);
  assertEqual(/onPageContinue/.test(requestEndTrain), false);
  assertEqual(/continueMathsTrainSession/.test(requestEndTrain), false);
  assertOk(/End Train\?/.test(readSrc('src/constants/trainGameplay.ts')));
  assertOk(/cancelEndTrain/.test(player));
});

check('Train End Cancel only closes confirmation', () => {
  assertOk(/setEndTrainConfirmVisible\(false\)/.test(cancelEndTrain));
  assertEqual(/finalizeOnce/.test(cancelEndTrain), false);
  assertEqual(/setIdx/.test(cancelEndTrain), false);
  assertEqual(/completeTrain/.test(cancelEndTrain), false);
});

check('Train End confirm reuses finalizeOnce and never continues', () => {
  assertOk(/finalizeOnce\(answerSlotsRef\.current\)/.test(confirmEndTrain));
  assertEqual(/onPageContinue/.test(confirmEndTrain), false);
  assertEqual(/continueMathsTrainSession/.test(confirmEndTrain), false);
  assertEqual(/\/train\/continue/.test(confirmEndTrain), false);
  assertEqual(/selected == null/.test(confirmEndTrain), false);
  assertOk(/completeTrain\(/.test(onBeforeTrainResults));
  assertEqual(/continueMathsTrainSession/.test(onBeforeTrainResults), false);
  assertOk(/queue\.drain\(\)/.test(onBeforeTrainResults));
});

check('Early Train End keeps unanswered slots as chosen null', () => {
  assertOk(/chosen: null/.test(player));
  assertOk(/slotsToResults\(slots, questionsRef\.current\)/.test(player));
  assertOk(/if \(finalizedRef\.current\) return/.test(player));
});

check('Normal Train completion and Focus End remain in place', () => {
  assertOk(/finalizeOnce\(answerSlotsRef\.current\)/.test(goNext));
  assertOk(/setCheckpointVisible\(true\)/.test(goNext));
  assertOk(/confirmCheckpointResults/.test(player));
  assertOk(/showEndFocus/.test(focusRoute));
  assertEqual(/showEndTrain/.test(focusRoute), false);
  assertOk(/setEndFocusConfirmVisible\(true\)/.test(player));
  assertOk(/finalizeOnce\(answerSlotsRef\.current\)/.test(confirmEndFocus));
  assertOk(/Keep Focusing/.test(readSrc('src/constants/trainGameplay.ts')));
});

check('Test route exposes End Test and not Train End', () => {
  assertOk(/showEndTest/.test(testRoute));
  assertOk(/showEndTest = false/.test(player));
  assertOk(/requireFinishReview/.test(testRoute));
  assertOk(/End Test/.test(readSrc('src/constants/test.ts')));
  assertEqual(/showEndTest/.test(focusRoute), false);
});

check('End Test opens finish review and does not submit', () => {
  assertOk(/openFinishReview\(\)/.test(requestEndTest));
  assertEqual(/finalizeOnce/.test(requestEndTest), false);
  assertEqual(/submitTest/.test(requestEndTest), false);
  assertOk(/Ready to finish\?/.test(finishModal));
  assertOk(/setReviewMode\('normal'\)/.test(player));
  assertOk(/setFinishReviewVisible\(true\)/.test(player));
});

check('Finish from the modal still uses the single submit path', () => {
  const finishHandler = between(
    player,
    'onFinish={() => {',
    '/>',
  );
  assertOk(/finalizeOnce\(answerSlotsRef\.current\)/.test(finishHandler));
  assertOk(/submitTest\(/.test(onBeforeTestResults));
  assertOk(/sessionSubmittedOnBackendRef\.current/.test(onBeforeTestResults));
  assertOk(/flagQueue\.drain\(\)/.test(onBeforeTestResults));
  assertOk(/queue\.drain\(\)/.test(onBeforeTestResults));
  assertOk(/counts\.flagged > 0/.test(finishModal) || /hasFlagged/.test(finishModal));
  assertOk(/hasUnanswered/.test(finishModal));
});

check('Timeout still bypasses the modal and finalizes once', () => {
  const timer = between(
    player,
    'if (sessionEndsAtMs == null)',
    'useEffect(() => {\n    if (sessionEndsAtMs != null || sessionStartedAtMs == null)',
  );
  assertOk(/Timeout bypasses Finish review confirmation/.test(timer));
  assertOk(/setFinishReviewVisible\(false\)/.test(timer));
  assertOk(/setReviewMode\('normal'\)/.test(timer));
  assertOk(/finalizeOnceRef\.current\(answerSlotsRef\.current\)/.test(timer));
  assertOk(/\}, \[sessionEndsAtMs\]\)/.test(timer));
  assertEqual(/finishReviewVisible/.test(timer.slice(timer.lastIndexOf('return () =>'))), false);
  assertEqual(/reviewMode/.test(timer.slice(timer.lastIndexOf('], ['))), false);
});

check('Filtered review keeps the original absolute index', () => {
  const { flags, slots, total } = flaggedPaper();
  assertEqual(firstFlaggedIndex(flags, total), 1);
  assertEqual(nextFilteredIndex('flagged', 1, total, flags, slots), 4);
  assertEqual(nextFilteredIndex('flagged', 4, total, flags, slots), 8);
  assertEqual(nextFilteredIndex('flagged', 8, total, flags, slots), null);
  assertEqual(previousFilteredIndex('flagged', 8, total, flags, slots), 4);
  assertEqual(previousFilteredIndex('flagged', 4, total, flags, slots), 1);
  assertEqual(previousFilteredIndex('flagged', 1, total, flags, slots), null);
  assertOk(/jumpToIndex\(target\)/.test(goNext));
  assertOk(/jumpToIndex\(idx \+ 1\)/.test(goNext));
  assertOk(/jumpToIndex\(idx - 1\)/.test(goPrevious));
  assertEqual(/setQuestions/.test(goNext), false);
});

check('Flagged Next and Previous skip non-flagged questions', () => {
  const { flags, slots, total } = flaggedPaper();
  let idx = 1;
  idx = nextFilteredIndex('flagged', idx, total, flags, slots);
  assertEqual(idx, 4);
  idx = nextFilteredIndex('flagged', idx, total, flags, slots);
  assertEqual(idx, 8);
  idx = previousFilteredIndex('flagged', idx, total, flags, slots);
  assertEqual(idx, 4);
  idx = previousFilteredIndex('flagged', idx, total, flags, slots);
  assertEqual(idx, 1);
  assertEqual(idx === 2, false);
});

check('Flagged boundaries: first Previous disabled, last Next opens review', () => {
  const { flags, slots, total } = flaggedPaper();
  assertEqual(previousFilteredIndex('flagged', 1, total, flags, slots), null);
  assertEqual(nextFilteredIndex('flagged', 8, total, flags, slots), null);
  assertOk(/if \(target == null\) return/.test(goPrevious));
  assertOk(/openFinishReview\(\)/.test(goNext));
  assertOk(/reviewMode !== 'normal'/.test(goNext));
});

check('Single flagged question: Previous disabled, Next opens review', () => {
  const flags = [false, true, false];
  const slots = [answered('0'), answered('1'), answered('2')];
  assertEqual(firstFlaggedIndex(flags, 3), 1);
  assertEqual(previousFilteredIndex('flagged', 1, 3, flags, slots), null);
  assertEqual(nextFilteredIndex('flagged', 1, 3, flags, slots), null);
});

check('No flagged questions hides Review flagged and does not enter review', () => {
  const flags = [false, false, false];
  assertEqual(firstFlaggedIndex(flags, 3), null);
  const counts = summarizeTestPaperState(
    [answered('0'), answered('1'), answered('2')],
    flags,
    3,
  );
  assertEqual(counts.flagged, 0);
  assertOk(/if \(target == null\) return/.test(player));
  assertOk(/hasFlagged \?/.test(finishModal));
});

check('Unflagging the current question uses the live flagged subset', () => {
  const { flags, slots, total } = flaggedPaper();
  flags[4] = false;
  assertEqual(nextFilteredIndex('flagged', 4, total, flags, slots), 8);
  assertEqual(previousFilteredIndex('flagged', 4, total, flags, slots), 1);
  assertEqual(nextFilteredIndex('flagged', 8, total, flags, slots), null);
  assertEqual(previousFilteredIndex('flagged', 8, total, flags, slots), 1);
});

check('Removing the final flagged question sends Next back to review', () => {
  const flags = [false, false, false, false, true];
  const slots = flags.map((_, i) => answered(String(i)));
  flags[4] = false;
  assertEqual(nextFilteredIndex('flagged', 4, 5, flags, slots), null);
  assertEqual(previousFilteredIndex('flagged', 4, 5, flags, slots), null);
  const counts = summarizeTestPaperState(slots, flags, 5);
  assertEqual(counts.flagged, 0);
});

check('Unanswered Next and Previous skip answered questions', () => {
  const { slots, flags, total } = unansweredPaper();
  assertEqual(firstUnansweredIndex(slots, total), 1);
  assertEqual(nextFilteredIndex('unanswered', 1, total, flags, slots), 3);
  assertEqual(nextFilteredIndex('unanswered', 3, total, flags, slots), 7);
  assertEqual(previousFilteredIndex('unanswered', 7, total, flags, slots), 3);
  assertEqual(previousFilteredIndex('unanswered', 3, total, flags, slots), 1);
  assertEqual(previousFilteredIndex('unanswered', 1, total, flags, slots), null);
  assertEqual(nextFilteredIndex('unanswered', 7, total, flags, slots), null);
});

check('Single and empty unanswered subsets', () => {
  const one = [answered('0'), null, answered('2')];
  const flags = [false, false, false];
  assertEqual(firstUnansweredIndex(one, 3), 1);
  assertEqual(previousFilteredIndex('unanswered', 1, 3, flags, one), null);
  assertEqual(nextFilteredIndex('unanswered', 1, 3, flags, one), null);
  const none = [answered('0'), answered('1')];
  assertEqual(firstUnansweredIndex(none, 2), null);
  const counts = summarizeTestPaperState(none, [false, false], 2);
  assertEqual(counts.unanswered, 0);
  assertOk(/hasUnanswered \?/.test(finishModal));
});

check('Answering the current unanswered question updates the live subset', () => {
  const { slots, flags, total } = unansweredPaper();
  slots[3] = answered('3');
  assertEqual(nextFilteredIndex('unanswered', 3, total, flags, slots), 7);
  assertEqual(previousFilteredIndex('unanswered', 3, total, flags, slots), 1);
  assertEqual(previousFilteredIndex('unanswered', 7, total, flags, slots), 1);
  slots[7] = answered('7');
  assertEqual(nextFilteredIndex('unanswered', 7, total, flags, slots), null);
  assertEqual(previousFilteredIndex('unanswered', 7, total, flags, slots), 1);
});

check('Answering the only unanswered question ends the filtered subset', () => {
  const slots = [answered('0'), null, answered('2')];
  const flags = [false, false, false];
  slots[1] = answered('1');
  assertEqual(nextFilteredIndex('unanswered', 1, 3, flags, slots), null);
  assertEqual(previousFilteredIndex('unanswered', 1, 3, flags, slots), null);
  assertEqual(summarizeTestPaperState(slots, flags, 3).unanswered, 0);
});

check('Ordinary navigation stays idx +/- 1 when review mode is inactive', () => {
  const filtered = between(goNext, 'if (reviewMode !== \'normal\')', 'Train / Focus');
  assertOk(/return;/.test(filtered));
  const normal = goNext.slice(goNext.indexOf('Train / Focus'));
  assertOk(/jumpToIndex\(idx \+ 1\)/.test(normal));
  assertEqual(/nextFilteredIndex/.test(normal), false);
  const normalPrev = goPrevious.slice(goPrevious.lastIndexOf('if (!canGoPrevious)'));
  assertOk(/jumpToIndex\(idx - 1\)/.test(normalPrev));
  assertEqual(/previousFilteredIndex/.test(normalPrev), false);
});

check('Review entry sets mode and jumps without rewriting answers or flags', () => {
  const flaggedEntry = between(
    player,
    'onReviewFlagged={() => {',
    'onReviewUnanswered',
  );
  const unansweredEntry = between(
    player,
    'onReviewUnanswered={() => {',
    'onFinish',
  );
  assertOk(/setReviewMode\('flagged'\)/.test(flaggedEntry));
  assertOk(/firstFlaggedIndex\(flags, questions\.length\)/.test(flaggedEntry));
  assertOk(/jumpToIndex\(target\)/.test(flaggedEntry));
  assertEqual(/setFlags/.test(flaggedEntry), false);
  assertEqual(/setAnswerSlots/.test(flaggedEntry), false);
  assertOk(/setReviewMode\('unanswered'\)/.test(unansweredEntry));
  assertOk(/firstUnansweredIndex/.test(unansweredEntry));
  assertOk(/jumpToIndex\(target\)/.test(unansweredEntry));
  assertEqual(/setAnswerSlots/.test(unansweredEntry), false);
});

check('Keep working and the question map clear filtered review', () => {
  assertOk(/onKeepWorking=\{\(\) => \{\s*setReviewMode\('normal'\)/.test(player));
  assertOk(/onJump=\{\(sessionIndex\) => \{\s*setReviewMode\('normal'\)/.test(player));
});

check('Answer and flag persistence stay on change, not on Next or Previous', () => {
  assertOk(/onAnswerChangeRef\.current\?\.\(idx, letter, record\)/.test(player));
  assertOk(/onFlagChangeRef\.current\?\.\(idx, flagged\)/.test(player));
  assertEqual(/onAnswerChange/.test(goNext), false);
  assertEqual(/onFlagChange/.test(goNext), false);
  assertEqual(/onAnswerChange/.test(goPrevious), false);
  assertEqual(/onFlagChange/.test(goPrevious), false);
  assertOk(/TestFlagWriteQueue/.test(testRoute));
});

check('Player defaults do not turn Test review on for Train or Focus', () => {
  assertOk(/allowFlagging = false/.test(player));
  assertOk(/requireFinishReview = false/.test(player));
  assertOk(/allowUnansweredNavigation = false/.test(player));
  assertEqual(/requireFinishReview/.test(trainRoute), false);
  assertEqual(/allowFlagging/.test(trainRoute), false);
  assertEqual(/allowFlagging/.test(focusRoute), false);
  assertEqual(/requireFinishReview/.test(focusRoute), false);
});

console.log(`\nQB-FE-2 automated checks: ${passed} passed`);
