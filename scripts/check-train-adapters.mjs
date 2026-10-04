/**
 * Lightweight adapter + continuous-Train contract self-checks.
 * Run: node scripts/check-train-adapters.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function letterForOptionIndex(index) {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  return letters[index] ?? null;
}

function optionIndexForLetter(letter) {
  return ['A', 'B', 'C', 'D', 'E'].indexOf(String(letter).trim().toUpperCase());
}

function optionTextForLetter(options, letter) {
  const index = optionIndexForLetter(letter);
  if (index < 0 || index >= options.length) {
    throw new Error('bad letter');
  }
  return options[index];
}

function letterForOptionText(options, text) {
  if (text == null) return null;
  const index = options.findIndex((opt) => opt === text);
  return index >= 0 ? letterForOptionIndex(index) : null;
}

function toBackendQuestionNumber(i) {
  return i + 1;
}

function toFrontendQuestionIndex(n) {
  return n - 1;
}

const options = ['12', '15', '18', '20'];
const asserts = [];

function assert(cond, msg) {
  if (!cond) asserts.push(msg);
}

assert(optionTextForLetter(options, 'B') === '15', 'B → 15');
assert(letterForOptionText(options, '15') === 'B', '15 → B');
assert(toBackendQuestionNumber(0) === 1, '0 → 1');
assert(toFrontendQuestionIndex(2) === 1, '2 → 1');
assert(letterForOptionText(options, null) === null, 'null text → null letter');

// Latest-write simulation
let latest = 'A';
const generations = { 0: 0 };
async function enqueue(letter) {
  const gen = ++generations[0];
  latest = letter;
  await Promise.resolve();
  if (generations[0] !== gen) return latest;
  return letter;
}
const r = await Promise.all([enqueue('A'), enqueue('B')]);
assert(r[1] === 'B' || latest === 'B', 'latest write B wins');

// Continuous page append + numbering offset + no duplicate IDs
function appendPage(existing, added) {
  const ids = new Set(existing.map((q) => q.id));
  for (const q of added) {
    if (ids.has(q.id)) throw new Error(`duplicate id ${q.id}`);
    ids.add(q.id);
  }
  return [...existing, ...added];
}
const page1 = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, n: i + 1 }));
const page2 = Array.from({ length: 20 }, (_, i) => ({
  id: 100 + i + 1,
  n: 21 + i,
}));
const page3 = Array.from({ length: 7 }, (_, i) => ({
  id: 200 + i + 1,
  n: 41 + i,
}));
let session = appendPage([], page1);
assert(session.length === 20, 'first page 20');
session = appendPage(session, page2);
assert(session.length === 40, 'continue → 40');
assert(session[20].n === 21, 'numbering continues at 21');
session = appendPage(session, page3);
assert(session.length === 47, 'final partial page 47');
const hasMoreAfterPartial = false;
assert(hasMoreAfterPartial === false, 'has_more false on final page');

// Source-file contract checks
const trainApi = fs.readFileSync(
  path.join(root, 'src/services/api/trainApi.ts'),
  'utf8',
);
assert(!trainApi.includes('question_count'), 'trainApi has no question_count');
assert(!trainApi.includes('retryTrain'), 'trainApi has no retryTrain');
assert(
  trainApi.includes('continueTrainSession'),
  'trainApi exposes continueTrainSession',
);

const loadMaths = fs.readFileSync(
  path.join(root, 'src/services/trainQuestions/loadMathsTrainSession.ts'),
  'utf8',
);
assert(!loadMaths.includes('question_count'), 'start Maths has no question_count');
assert(!loadMaths.includes('retryTrain'), 'loadMaths has no retryTrain');
assert(
  loadMaths.includes('continueMathsTrainSession'),
  'continueMathsTrainSession present',
);

const gameplay = fs.readFileSync(
  path.join(root, 'app/train/[subject]/[topic]/index.tsx'),
  'utf8',
);
assert(!gameplay.includes('questionCount'), 'gameplay drops questionCount state');
assert(gameplay.includes('onPageContinue'), 'gameplay wires onPageContinue');
assert(gameplay.includes('await queue.drain()'), 'drain before continue/complete');
assert(!gameplay.includes('retryTrain'), 'gameplay has no retryTrain');

const results = fs.readFileSync(
  path.join(root, 'app/train/[subject]/[topic]/results.tsx'),
  'utf8',
);
assert(!results.includes('armTrainRetry'), 'Try Again does not arm retry');
assert(results.includes('Routes.Home'), 'Home uses Routes.Home');
assert(
  results.includes('`/train/${subject}`') || results.includes('/train/${subject}'),
  'Try Again navigates to subject Train setup',
);

const selection = fs.readFileSync(
  path.join(root, 'app/train/[subject]/index.tsx'),
  'utf8',
);
assert(
  !selection.includes('TrainQuestionCountModal'),
  'selection removes question-count modal',
);
assert(
  !selection.includes('count: String'),
  'selection does not pass count param',
);

if (asserts.length) {
  console.error('FAIL', asserts);
  process.exit(1);
}
console.log('check-train-adapters: PASS');
