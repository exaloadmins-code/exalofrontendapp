/**
 * Test Instructions / pre-test lifecycle contracts.
 *
 * - Route entry lands on instructions (no auto paper/timer)
 * - Start Test is the initialization boundary
 * - Try Again returns to instructions
 * - Home remains Routes.Home
 * - Results wrong-only review remains intact
 * - No Train retry API
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

const testScreen = read('app/test/[subject].tsx');
const instructionsView = read('src/components/test/TestInstructionsView.tsx');
const testConstants = read('src/constants/test.ts');
const resultsService = read('src/services/trainResults.ts');
const resultsView = read('src/components/train/TrainResultsView.tsx');
const trainApi = read('src/services/api/trainApi.ts');

assert.match(
  testScreen,
  /type TestPhase = 'instructions' \| 'loading' \| 'play' \| 'results' \| 'error'/,
  'Test phases include instructions',
);

assert.match(
  testScreen,
  /useState<TestPhase>\(\(\) =>\s*\n?\s*subject \? 'instructions' : 'error'/,
  'initial phase is instructions when subject valid',
);

assert.match(
  testScreen,
  /resetToInstructions\(\)/,
  'subject change / Try Again uses resetToInstructions',
);

assert.match(testScreen, /const startTest = \(\) =>/, 'startTest exists');
assert.match(
  testScreen,
  /startTest[\s\S]*loadTestQuestions\(\{ subject \}\)/,
  'Start Test loads paper',
);
assert.match(
  testScreen,
  /setSessionEndsAtMs\(Date\.now\(\) \+ TEST_DURATION_MS\)/,
  'timer starts only after paper load in Start path',
);
assert.match(
  testScreen,
  /setPhase\('play'\)/,
  'Start path transitions to play',
);

assert.match(
  testScreen,
  /startingRef/,
  'double-start guard present',
);

// Auto-start must not live in a mount effect that loads then plays.
assert.doesNotMatch(
  testScreen,
  /useEffect\(\(\) => \{[\s\S]*loadTestQuestions\([\s\S]*setPhase\('play'\)[\s\S]*\}, \[subject/,
  'no mount effect auto-starts play via loadTestQuestions',
);

assert.match(
  testScreen,
  /phase === 'instructions'/,
  'renders instructions phase',
);
assert.match(
  testScreen,
  /TestInstructionsView/,
  'uses TestInstructionsView',
);
assert.match(
  testScreen,
  /onStart=\{startTest\}/,
  'Instructions Start wired to startTest',
);

assert.match(
  testScreen,
  /onTryAgain[\s\S]{0,240}resetToInstructions/,
  'Try Again → instructions',
);
assert.doesNotMatch(
  testScreen,
  /onTryAgain[\s\S]{0,240}loadTestQuestions/,
  'Try Again does not initialize paper',
);
assert.doesNotMatch(
  testScreen,
  /onTryAgain[\s\S]{0,240}setSessionEndsAtMs\(Date/,
  'Try Again does not start timer',
);

assert.match(testScreen, /Routes\.Home/, 'Home → Routes.Home');
assert.match(testScreen, /onHome=\{onHome\}/, 'Results Home wired');

// Presentational product-spec display (intentionally not wired to runtime yet).
assert.match(
  instructionsView,
  /TEST_INSTRUCTIONS_DISPLAY/,
  'instructions use product-spec display constants',
);
assert.doesNotMatch(
  instructionsView,
  /TEST_DURATION_MINUTES|TEST_QUESTIONS_PER_TOPIC|trainTopicsFor/,
  'instructions do not derive Q/time from runtime Test config',
);
assert.match(instructionsView, /Start Test|startTest/, 'Start CTA present');
assert.match(instructionsView, /BackButton/, 'Back leaves without starting');
assert.match(instructionsView, /statRow|statCard/, 'stat cards present');

assert.match(
  testConstants,
  /TEST_INSTRUCTIONS_DISPLAY[\s\S]*questionCount:\s*45[\s\S]*durationMinutes:\s*45/,
  'display spec is 45 questions / 45 minutes',
);
assert.match(
  testConstants,
  /TEST_DURATION_MINUTES = 5/,
  'runtime duration unchanged (still 5)',
);
assert.match(
  testConstants,
  /TEST_QUESTIONS_PER_TOPIC = 2/,
  'runtime per-topic count unchanged (still 2)',
);
assert.match(testConstants, /instructionBullets/, 'instruction copy present');
assert.match(
  testConstants,
  /instructionsHeading: 'Before you launch'/,
  'Before you launch heading',
);
assert.match(testConstants, /startTest: 'Start Test'/, 'Start Test label');
assert.match(
  testConstants,
  /Ready for your \$\{subjectType\} mock test\?/,
  'friendly intro copy',
);

// Preserve wrong-only Mission Review
assert.match(
  resultsService,
  /if \(answer\.chosen == null \|\| answer\.isCorrect\)/,
  'review filter still wrong-only',
);
assert.match(
  resultsService,
  /summary\.wrong === 0 && summary\.unanswered === 0/,
  'perfect semantics unchanged',
);
assert.match(
  resultsView,
  /isTrainResultPerfect\(summary\)/,
  'Results view still uses perfect helper',
);

assert.doesNotMatch(trainApi, /retryTrain/, 'no Train retry API');
assert.doesNotMatch(
  trainApi,
  /\/train\/sessions\/.+\/retry/,
  'no Train retry path',
);

console.log('check-test-instructions: PASS');
