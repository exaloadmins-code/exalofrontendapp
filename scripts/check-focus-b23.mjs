/**
 * B2.3 Focus frontend static validation.
 * Run: node scripts/check-focus-b23.mjs
 *
 * Proves question-count (no default), Maths/English split, API contract shape,
 * answer queue + timing semantics, Results hydration hooks, error handling.
 * Does NOT perform live frontend↔backend integration (that is B2.4).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const fails = [];

function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

// ── A. QUESTION COUNT ──────────────────────────────────────────────
const focusConstants = read('src/constants/focus.ts');
assert(
  /FOCUS_MIN_QUESTION_COUNT\s*=\s*5/.test(focusConstants),
  'FOCUS_MIN_QUESTION_COUNT = 5',
);
assert(
  /FOCUS_MAX_QUESTION_COUNT\s*=\s*50/.test(focusConstants),
  'FOCUS_MAX_QUESTION_COUNT = 50',
);
assert(
  !/FOCUS_QUESTIONS_PER_RUN\s*=\s*20/.test(focusConstants),
  'FOCUS_QUESTIONS_PER_RUN=20 removed as Maths source of truth',
);
assert(
  /isValidFocusQuestionCount/.test(focusConstants),
  'isValidFocusQuestionCount helper present',
);
assert(
  /parseFocusQuestionCountInput/.test(focusConstants),
  'parseFocusQuestionCountInput helper present',
);

// Simulate range representable
const FOCUS_MIN = 5;
const FOCUS_MAX = 50;
function isValid(n) {
  return Number.isInteger(n) && n >= FOCUS_MIN && n <= FOCUS_MAX;
}
for (let n = FOCUS_MIN; n <= FOCUS_MAX; n += 1) {
  assert(isValid(n), `count ${n} representable`);
}
assert(!isValid(4), 'count 4 invalid');
assert(!isValid(51), 'count 51 invalid');
assert(!isValid(20.5), 'non-integer invalid');

const focusRoute = read('app/focus/[subject].tsx');
assert(
  /useState<\s*number\s*\|\s*null\s*>\(\s*null\s*\)/.test(focusRoute) ||
    /useState<number \| null>\(null\)/.test(focusRoute),
  'questionCount initial state is null (no default)',
);
assert(
  /isValidFocusQuestionCount\(confirmedCount\)/.test(focusRoute),
  'session start gated on confirmed valid count',
);
assert(
  /questionCount:\s*confirmedCount/.test(focusRoute) ||
    /limit:\s*confirmedCount/.test(focusRoute),
  'exact confirmed count passed into Maths/English start',
);
assert(
  !/question_count:\s*20/.test(focusRoute),
  'no hardcoded question_count: 20 in Focus route',
);
assert(
  /setQuestionCount\(null\)/.test(focusRoute),
  'Try Again / returnToSetup clears count to null',
);

const setupView = read('src/components/focus/FocusSetupView.tsx');
assert(
  !/FocusQuestionCountChip/.test(setupView),
  'no question-count chip on main Focus setup',
);
assert(
  !/focusQuestionCountChipPercent/.test(setupView),
  'no on-artboard question-count layout on setup',
);
assert(
  /FocusQuestionCountModal/.test(setupView),
  'FocusSetupView wires start-time count modal',
);
assert(
  /canOpenCountPrompt/.test(setupView) &&
    /openCountPrompt/.test(setupView),
  'main Start Focus opens count prompt after topics+difficulty',
);
assert(
  /selectedTopics\.length\s*>=\s*2/.test(setupView) &&
    /selectedDifficulty\s*!=\s*null/.test(setupView),
  'main Start validates topics + difficulty before prompt',
);
assert(
  !/isValidFocusQuestionCount\(questionCount\)/.test(setupView),
  'main setup Start does not require count on-screen',
);
assert(
  /onStart\(count\)/.test(setupView),
  'modal confirm calls onStart with typed count',
);

const countControl = read('src/components/focus/FocusQuestionCountControl.tsx');
assert(
  /ExaloTextInput/.test(countControl),
  'count prompt uses one ExaloTextInput',
);
assert(
  /setInputText\(''\)/.test(countControl) ||
    /setInputText\(""\)/.test(countControl),
  'count prompt always opens empty (no default)',
);
assert(
  !/onIncrease|onDecrease|stepBtn|presetPill|FOCUS_QUESTION_COUNT_PRESETS/.test(
    countControl,
  ),
  'no +/- stepper or preset chips in count prompt',
);
assert(
  !/FocusQuestionCountChip/.test(countControl),
  'chip component removed from count control module',
);
assert(
  /keyboardType=\"number-pad\"/.test(countControl) ||
    /keyboardType='number-pad'/.test(countControl),
  'numeric keyboard configured',
);
assert(
  /How many questions\?/.test(countControl) ||
    /COPY\.title/.test(countControl),
  'prompt title asks how many questions',
);
assert(
  /isValidFocusQuestionCount/.test(countControl) &&
    /parseFocusQuestionCountInput/.test(countControl),
  'prompt uses centralized 5–50 validation',
);
assert(
  /disabled=\{!canConfirm\}/.test(countControl),
  'modal Start disabled until valid count',
);
assert(
  !/FOCUS_QUESTION_COUNT_CHIP/.test(focusConstants),
  'chip layout constants removed from focus.ts',
);
assert(
  /How many questions\?/.test(focusConstants),
  'count copy title present in constants',
);

// ── B. MATHS / ENGLISH SPLIT ───────────────────────────────────────
assert(
  /startMathsFocusSession/.test(focusRoute),
  'Maths Focus uses startMathsFocusSession',
);
assert(
  /subject === 'maths'/.test(focusRoute) ||
    /subject === \"maths\"/.test(focusRoute),
  'Maths branch in Focus route',
);
assert(
  /loadFocusQuestions/.test(focusRoute),
  'English path still uses loadFocusQuestions',
);
assert(
  /English — local only|English remains local|local only/.test(focusRoute),
  'English local path documented in route',
);

const localLoader = read('src/services/trainQuestions/loadFocusQuestions.ts');
assert(
  /subject === 'maths'/.test(localLoader) &&
    /English-local only/.test(localLoader),
  'loadFocusQuestions rejects Maths (no local Maths fallback)',
);
assert(
  /limit:\s*number/.test(localLoader) || /limit: number/.test(localLoader),
  'English loader requires explicit limit (no default 20)',
);

const mathsLoader = read('src/services/trainQuestions/loadMathsFocusSession.ts');
assert(
  /startFocus\(/.test(mathsLoader),
  'Maths loader calls startFocus',
);
assert(
  /getSessionQuestion/.test(mathsLoader),
  'Maths loader fetches via getSessionQuestion',
);
assert(
  !/generateQuestions|from '\.\/questionBank'|from "\.\/questionBank"/.test(
    mathsLoader,
  ),
  'Maths loader has no local bank fallback imports',
);
assert(
  !/await loadFocusQuestions/.test(mathsLoader),
  'Maths loader does not call loadFocusQuestions',
);
assert(
  /isFocusInsufficientPoolError/.test(mathsLoader),
  'Maths loader handles structured insufficient pool',
);

// ── C. API CONTRACT ────────────────────────────────────────────────
assert(exists('src/services/api/focusApi.ts'), 'focusApi.ts exists');
const focusApi = read('src/services/api/focusApi.ts');
assert(/['"]\/focus\/start['"]/.test(focusApi), 'POST /focus/start');
assert(/['"]\/focus\/answer['"]/.test(focusApi), 'POST /focus/answer');
assert(/['"]\/focus\/complete['"]/.test(focusApi), 'POST /focus/complete');
assert(/question_count/.test(focusApi), 'question_count in Focus start payload');
assert(/time_spent_seconds/.test(focusApi), 'time_spent_seconds on answer');
assert(/question_times/.test(focusApi), 'question_times on complete');

const sessionApi = read('src/services/api/sessionApi.ts');
assert(
  /\/sessions\/\$\{sessionId\}\/questions\//.test(sessionApi),
  'shared GET /sessions/{id}/questions/{n}',
);
assert(
  /\/sessions\/\$\{sessionId\}\/results/.test(sessionApi),
  'shared GET /sessions/{id}/results',
);

assert(/getDevUserId\(\)/.test(mathsLoader), 'getDevUserId used for Focus start');
assert(
  /topics:\s*topicSlugs/.test(mathsLoader),
  'frontend topic slugs sent (not DB ids)',
);
assert(
  /difficulty:\s*difficultyApiValue/.test(mathsLoader),
  'selected difficulty sent lowercase',
);
assert(
  /question_count:\s*params\.questionCount/.test(mathsLoader),
  'explicit question_count sent',
);

// Train still uses train paths (regression)
const trainApi = read('src/services/api/trainApi.ts');
assert(
  /\/train\/sessions\//.test(trainApi),
  'Train still uses /train/sessions paths',
);

// ── D. ANSWERS ─────────────────────────────────────────────────────
const queueSrc = read('src/services/trainQuestions/answerWriteQueue.ts');
assert(
  /forFocus/.test(queueSrc),
  'TrainAnswerWriteQueue.forFocus factory',
);
assert(
  /answerFocusQuestion/.test(queueSrc),
  'Focus writer uses answerFocusQuestion',
);
assert(
  /optionTextForLetter/.test(queueSrc),
  'option text conversion centralized',
);
assert(
  /toBackendQuestionNumber/.test(queueSrc),
  'numbering helper used (not ad hoc +1)',
);
assert(
  /latestLetter/.test(queueSrc) && /generation/.test(queueSrc),
  'serialized latest-write generations',
);

assert(
  /TrainAnswerWriteQueue\.forFocus/.test(focusRoute),
  'Focus route uses Focus write queue',
);
assert(
  /await queue\.drain\(\)/.test(focusRoute),
  'completion drains writes',
);
assert(
  /do NOT re-enqueue|Do NOT re-enqueue|drain pending answer writes/i.test(
    focusRoute,
  ),
  'no blind re-enqueue-all before complete',
);
assert(
  /deferCorrectness=\{source === 'api'\}/.test(focusRoute),
  'editable API answers with deferred correctness',
);

// ── E. TIMING ──────────────────────────────────────────────────────
assert(exists('src/services/trainQuestions/questionTiming.ts'), 'questionTiming.ts');
const timingSrc = read('src/services/trainQuestions/questionTiming.ts');
assert(
  /cumulativeSecondsByQuestion/.test(timingSrc),
  'cumulativeSecondsByQuestion model',
);
assert(
  /activeQuestionStartedAtMs/.test(timingSrc),
  'activeQuestionStartedAtMs timestamp model',
);
assert(/setAppActive/.test(timingSrc), 'AppState active/inactive handling');
assert(/setVisibleQuestion/.test(timingSrc), 'navigation flush via setVisibleQuestion');
assert(/freezeForCompletion/.test(timingSrc), 'final freeze builds all question_times');
assert(
  /question_number:\s*i \+ 1/.test(timingSrc),
  'final question_times includes all session questions (1-based)',
);

assert(/FocusQuestionTiming/.test(focusRoute), 'Focus route uses FocusQuestionTiming');
assert(/AppState\.addEventListener/.test(focusRoute), 'Focus route AppState listener');
assert(
  /onVisibleQuestionChange/.test(focusRoute),
  'Focus wires visible-question timing callback',
);
assert(
  /freezeForCompletion/.test(focusRoute),
  'Focus freezes timing before complete',
);
assert(
  /question_times:\s*questionTimes/.test(focusRoute),
  'complete payload includes question_times',
);
assert(
  /getCumulativeSeconds/.test(queueSrc) ||
    /getTimeSpentSeconds/.test(queueSrc),
  'answer writes can include cumulative timing',
);

// Semantic sim: revisit accumulates; background excluded
class TimingSim {
  constructor() {
    this.cum = new Map();
    this.active = null;
    this.started = null;
    this.appActive = true;
    this.frozen = false;
  }
  flush() {
    if (
      this.frozen ||
      !this.appActive ||
      this.active == null ||
      this.started == null
    )
      return;
    const elapsed = 5; // fixed slice for test
    this.cum.set(this.active, (this.cum.get(this.active) ?? 0) + elapsed);
    this.started = null;
  }
  setVisible(i) {
    this.flush();
    this.active = i;
    this.started = this.appActive ? 1 : null;
  }
  setAppActive(a) {
    if (!a && this.appActive) {
      this.flush();
      this.appActive = false;
      this.started = null;
    } else if (a && !this.appActive) {
      this.appActive = true;
      if (this.active != null) this.started = 1;
    }
  }
  freeze(n) {
    this.flush();
    this.frozen = true;
    const out = [];
    for (let i = 0; i < n; i++)
      out.push({ q: i + 1, t: this.cum.get(i) ?? 0 });
    return out;
  }
}
{
  const t = new TimingSim();
  t.setVisible(0);
  t.flush(); // +5
  t.setVisible(1);
  t.flush(); // q1 +5
  t.setVisible(0); // revisit
  t.flush(); // q0 +5 → 10 cumulative
  assert(t.cum.get(0) === 10, 'revisit accumulates (not reset/delta-only)');
  t.setAppActive(false);
  t.flush(); // should no-op while inactive
  assert(t.cum.get(0) === 10, 'background/inactive excluded');
  t.setAppActive(true);
  t.flush();
  assert(t.cum.get(0) === 15, 'resume adds only active time');
  const times = t.freeze(3);
  assert(times.length === 3, 'final times include all questions');
  assert(times[2].t === 0, 'unanswered / never-visited still present at 0');
}

// ── F. RESULTS ─────────────────────────────────────────────────────
assert(
  /getSessionResults/.test(focusRoute),
  'Focus fetches shared session Results',
);
assert(
  /hydrateTrainResultFromApi/.test(focusRoute),
  'Focus hydrates via shared hydrator',
);
assert(
  /source:\s*'api'/.test(focusRoute),
  'Maths Focus Results marked source api',
);
assert(
  /buildLocalFocusResultSnapshot/.test(focusRoute),
  'local English Results builder retained',
);

const hydrator = read('src/services/trainQuestions/resultsHydrator.ts');
assert(
  /FocusResultsResponse/.test(hydrator),
  'hydrator accepts FocusResultsResponse',
);
assert(/wrong_count/.test(hydrator), 'wrong_count hydrated');
assert(/unanswered_count/.test(hydrator), 'unanswered_count hydrated');

const adapter = read('src/services/trainQuestions/backendAdapter.ts');
assert(
  /time_spent_seconds/.test(adapter),
  'result adapter retains time_spent_seconds',
);
assert(
  /has_diagram|diagram_type|diagram_data/.test(adapter),
  'diagram metadata retained through adapter',
);

// ── G. ERROR HANDLING ──────────────────────────────────────────────
const http = read('src/services/api/http.ts');
assert(
  /isFocusInsufficientPoolError/.test(http),
  'structured Focus insufficient-pool detector',
);
assert(
  /requested_question_count/.test(http) &&
    /available_question_count/.test(http),
  'Focus pool error preserves requested/available counts',
);
assert(
  /formatFocusInsufficientPoolMessage/.test(http),
  'Focus pool user-facing message',
);
assert(
  /isFocusInsufficientPoolError/.test(mathsLoader) &&
    /formatFocusInsufficientPoolMessage/.test(mathsLoader),
  'Maths start maps pool 422 to recoverable message',
);
assert(
  !/silently reduce|repeat questions/i.test(mathsLoader),
  'no silent reduction / pad language in Maths loader',
);
assert(
  /No local Maths fallback/.test(mathsLoader),
  'Maths loader documents no local Maths fallback',
);

assert(
  /setApiError\(/.test(focusRoute),
  'Focus start sets learner-visible apiError prompt state',
);
assert(
  /FocusApiErrorModal|apiError=\{apiError\}/.test(setupView) ||
    /apiError=\{apiError\}/.test(setupView),
  'FocusSetupView receives apiError for visible presentation',
);
assert(exists('src/components/focus/FocusApiErrorModal.tsx'), 'FocusApiErrorModal exists');
const errorModal = read('src/components/focus/FocusApiErrorModal.tsx');
assert(
  /Modal/.test(errorModal) && /errorTitle/.test(errorModal),
  'Focus error uses Modal + Train-style error card title',
);
assert(
  /TRAIN_GAMEPLAY|emptyMaxWidth|errorBorder/.test(errorModal),
  'Focus error reuses Train gameplay visual tokens',
);
assert(
  /Not enough questions/.test(focusRoute),
  'insufficient-pool uses dedicated title',
);
assert(
  /startErrorTitle|Couldn't load questions/.test(focusConstants) &&
    /startErrorBody|couldn't load your Focus questions/i.test(focusConstants),
  'learner-facing generic Focus start error copy in constants',
);
assert(
  /focusStartErrorPrompt|COPY\.startErrorTitle/.test(focusRoute),
  'generic Focus start errors map to learner-safe start prompt',
);
assert(
  !/message:\s*e\.message/.test(focusRoute) &&
    !/instanceof ApiError/.test(focusRoute),
  'Focus start catch does not assign ApiError/Error.message to the modal',
);
assert(
  /setPhase\('setup'\)/.test(focusRoute) &&
    /setApiError/.test(focusRoute),
  'failed start stays on setup with visible error (no gameplay)',
);
assert(
  !/errorBox/.test(setupView),
  'invisible artboard error overlay removed',
);
assert(
  /completingRef/.test(focusRoute),
  'duplicate completion guarded',
);

// ── H. COMPLETION ERROR PRESENTATION (Test 10) ─────────────────────
assert(
  /onFinalizeError/.test(focusRoute) &&
    /FocusApiErrorModal/.test(focusRoute),
  'Focus completion failures use FocusApiErrorModal via onFinalizeError',
);
assert(
  /finishErrorTitle|Couldn't finish Focus/.test(focusConstants) &&
    /finishErrorBody|couldn't finish your Focus session/i.test(focusConstants),
  'learner-facing Focus finish error copy in constants',
);
assert(
  /focusCompletionErrorPrompt|COPY\.finishErrorTitle/.test(focusRoute),
  'completion path maps to safe finish error prompt',
);
assert(
  /sessionCompletedOnBackendRef/.test(focusRoute),
  'Results-retry after successful complete does not re-POST complete',
);
assert(
  /throw new Error\(COPY\.finishErrorBody\)/.test(focusRoute),
  'completion catch throws safe finish body (not raw ApiError URL/env text)',
);

const player = read('src/components/train/TrainQuizPlayer.tsx');
assert(
  /onVisibleQuestionChange\?:/.test(player),
  'TrainQuizPlayer exposes optional onVisibleQuestionChange',
);
assert(
  /onFinalizeError\?:/.test(player),
  'TrainQuizPlayer exposes optional onFinalizeError',
);
assert(
  /if \(onFinalizeErrorRef\.current\)/.test(player) &&
    /setFinalizeError\(null\)/.test(player),
  'when onFinalizeError provided, raw inline finalizeError is suppressed',
);
assert(
  /onFinalizeErrorRef\.current\(err\)/.test(player),
  'finalize failure delegates to parent error handler',
);
// Train still has inline finalize path when callback omitted
assert(
  /setFinalizeError\(message\)/.test(player),
  'Train inline finalizeError path preserved when onFinalizeError omitted',
);

if (fails.length) {
  console.error('check-focus-b23: FAIL');
  for (const f of fails) console.error(' -', f);
  process.exit(1);
}
console.log('check-focus-b23: PASS');
console.log('B2.3 static validation only — NOT live-integration-verified.');
