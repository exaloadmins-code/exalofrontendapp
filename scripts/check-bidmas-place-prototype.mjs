/**
 * BIDMAS-13E/13G/13H/21B focused PLACE (+ ERR coexistence) checks (no Jest).
 * Run: node scripts/check-bidmas-place-prototype.mjs
 *
 * Production-facing only — does not read app/dev preview routes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const fails = [];

function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function formatAssociationTree(tree, tokens) {
  if (typeof tree === 'number') return String(tokens[2 * tree]);
  const left = formatAssociationTree(tree.left, tokens);
  const right = formatAssociationTree(tree.right, tokens);
  const op = tokens[tree.op_index];
  return `(${left} ${op} ${right})`;
}

const registry = read('src/components/train/diagrams/registry.ts');
const dispatcher = read('src/components/train/diagrams/DiagramDispatcher.tsx');
const renderer = read(
  'src/components/train/diagrams/bidmas/BidmasGroupPlacements.tsx',
);
const parserSrc = read(
  'src/components/train/diagrams/bidmas/parseBidmasGroupPlacements.ts',
);
const errRenderer = read(
  'src/components/train/diagrams/bidmas/BidmasErrorPanel.tsx',
);
const trainPlayer = read('src/components/train/TrainQuizPlayer.tsx');
const fixtureModule = read(
  'src/components/train/diagrams/bidmas/fixtures/synthPlace01Public.ts',
);
const fixturePath = path.join(
  root,
  'scripts/diagram-fixtures/bidmas_1.0_bid_group_placements_SYNTH_PLACE_01.json',
);
assert(fs.existsSync(fixturePath), 'synthetic PLACE fixture missing');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert(/BidmasGroupPlacements/.test(registry), 'registry PLACE family missing');
assert(
  /schemaVersion: 'bidmas_1\.0'/.test(registry) &&
    /visualType: 'bid_group_placements'/.test(registry),
  'registry PLACE key missing',
);
assert(/BidmasErrorPanel/.test(registry), 'registry ERR family missing');
assert(
  /visualType: 'bid_error_panel'/.test(registry),
  'registry ERR key missing',
);
assert(/case 'BidmasGroupPlacements'/.test(dispatcher), 'dispatcher PLACE case missing');
assert(/case 'BidmasErrorPanel'/.test(dispatcher), 'dispatcher ERR case missing');
assert(/UnsupportedDiagram/.test(dispatcher), 'fail-closed UnsupportedDiagram kept');

assert(
  fixture.review_status === 'SYNTHETIC_OFFLINE_REVIEW_ONLY',
  'fixture synthetic marker',
);
assert(fixture.production_candidate === false, 'fixture not production');
const data = fixture.diagram_data;
assert(data.schema_version === 'bidmas_1.0', 'fixture schema');
assert(data.visual_type === 'bid_group_placements', 'fixture visual');
assert(!('_audit' in data), 'fixture diagram_data must omit _audit');
assert(!('correct_option_key' in data), 'fixture must omit correct_option_key');
assert(!('option_values' in data) && !('target' in data), 'fixture must omit totals/target');
assert(data.reveal_values === false, 'reveal_values false');
assert(data.placements.length === 4, 'four placements');
assert(Array.isArray(fixture.options) && fixture.options.length === 4, 'fixture options A–D');
assert(fixture.diagram_prompt === null, 'fixture diagram_prompt null (13G)');

const tokens = data.fixed_tokens;
const formatted = data.placements.map((p) =>
  formatAssociationTree(p.tree, tokens),
);
assert(formatted[0] === '((2 × (8 − 4)) + 3)', `A tree format got ${formatted[0]}`);
assert(new Set(formatted).size === 4, 'four distinct trees');

// 13G/13H: diagram renderer must NOT own MCQ cards / instructional copy /
// a visible Expression panel (stem already carries the expression).
assert(!/optionRow|optionBadge|Option \$\{/.test(renderer), 'renderer must not draw A–D cards');
assert(
  !/Choose the bracket grouping that matches the question/.test(renderer),
  'renderer must not hardcode instruction',
);
assert(!/expressionCard/.test(renderer), '13H: no expressionCard UI');
assert(
  !/>\s*Expression\s*</.test(renderer) && !/'Expression'|"Expression"|`Expression`/.test(renderer),
  '13H: no visible Expression label',
);
assert(/joinFixedTokens/.test(renderer), 'validates fixed_tokens (no visible panel)');
assert(/accessibilityLabel=\{parsed\.accessibilityText\}/.test(renderer), 'a11y wired');
assert(/a11yOnly/.test(renderer) && /width:\s*0/.test(renderer), 'a11y-only 0-width host');
assert(/parseBidmasGroupPlacements/.test(renderer), 'parser used');
assert(!/evaluateAssociationTree|correct_option_key|option_values|winning_key/.test(renderer), 'renderer privacy');
assert(/Private keys|_audit/.test(parserSrc), 'parser documents private ignore');

// Production Train path owns MCQ + diagram surface (replaces preview-only checks).
assert(/getTrainOptions/.test(trainPlayer), 'TrainQuizPlayer uses getTrainOptions');
assert(/TrainQuestionDiagram/.test(trainPlayer), 'TrainQuizPlayer mounts TrainQuestionDiagram');
assert(/diagramPrompt=\{q\.diagram_prompt\}/.test(trainPlayer), 'Train passes row diagram_prompt');
assert(/deferCorrectness/.test(trainPlayer), 'Train supports deferCorrectness safety flag');

assert(/Option_A: SYNTH_PLACE_01_OPTIONS\[0\]/.test(fixtureModule), 'synthetic row Option_A');
assert(/diagram_prompt: null/.test(fixtureModule), 'synthetic row diagram_prompt null');
assert(/buildSynthPlace01TrainQuestion/.test(fixtureModule), 'Train question builder');

assert(!/correct_option|_audit|winning_key/.test(errRenderer), 'ERR renderer privacy');
const home = read('app/index.tsx');
assert(!/bidmas-place-preview/.test(home), 'preview not linked from home');
assert(!/bidmas-20g-offline-preview/.test(home), 'offline QA preview not linked from home');

if (fails.length) {
  console.error('BIDMAS-21B PLACE prototype checks FAILED:');
  for (const f of fails) console.error(' -', f);
  process.exit(1);
}

console.log(`BIDMAS-21B PLACE (+ ERR coexistence) checks: ok`);
console.log('PASS  registry + dispatcher PLACE and ERR');
console.log('PASS  synthetic public fixture');
console.log('PASS  diagram does not own A–D / instruction / Expression panel');
console.log('PASS  TrainQuizPlayer production diagram/MCQ path');
