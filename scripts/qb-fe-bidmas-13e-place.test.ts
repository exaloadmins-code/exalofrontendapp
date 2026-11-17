/**
 * BIDMAS-13E/13G/13H/21B — PLACE parser, privacy, Train UI parity, visual cleanup.
 * Run: npx --yes tsx scripts/qb-fe-bidmas-13e-place.test.ts
 *
 * Production-facing only — does not read app/dev preview routes.
 */
// @ts-nocheck

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatAssociationTree,
  joinFixedTokens,
} from '../src/components/train/diagrams/bidmas/formatAssociationTree';
import { parseBidmasGroupPlacements } from '../src/components/train/diagrams/bidmas/parseBidmasGroupPlacements';
import { lookupDiagramFamily } from '../src/components/train/diagrams/registry';
import {
  buildSynthPlace01TrainQuestion,
  SYNTH_PLACE_01_DIAGRAM_DATA,
  SYNTH_PLACE_01_OPTIONS,
} from '../src/components/train/diagrams/bidmas/fixtures/synthPlace01Public';
import { getTrainOptions } from '../src/services/trainQuestions/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message ??
        `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertOk(value, message) {
  if (!value) throw new Error(message ?? 'Expected truthy value');
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

const fixture = JSON.parse(
  readFileSync(
    join(
      root,
      'scripts/diagram-fixtures/bidmas_1.0_bid_group_placements_SYNTH_PLACE_01.json',
    ),
    'utf8',
  ),
);

const rendererSrc = readFileSync(
  join(
    root,
    'src/components/train/diagrams/bidmas/BidmasGroupPlacements.tsx',
  ),
  'utf8',
);
const trainPlayerSrc = readFileSync(
  join(root, 'src/components/train/TrainQuizPlayer.tsx'),
  'utf8',
);
const dispatcherSrc = readFileSync(
  join(root, 'src/components/train/diagrams/DiagramDispatcher.tsx'),
  'utf8',
);

check('Registry dispatches bidmas_1.0 PLACE and ERR', () => {
  assertEqual(
    lookupDiagramFamily('bidmas_1.0', 'bid_group_placements'),
    'BidmasGroupPlacements',
  );
  assertEqual(lookupDiagramFamily('bidmas_1.0', 'bid_error_panel'), 'BidmasErrorPanel');
  assertEqual(lookupDiagramFamily('bidmas_1.0', 'unknown_visual'), null);
  assertEqual(lookupDiagramFamily('2.0', 'bar_model'), 'FractionDiagram2');
  assertEqual(
    lookupDiagramFamily('angles_diagram_v1', 'angles_missing_angle_semantic_a7'),
    'AnglesDiagramV1',
  );
});

check('Synthetic fixture parses; trees remain four distinct', () => {
  const parsed = parseBidmasGroupPlacements(fixture.diagram_data);
  assertOk(parsed);
  assertEqual(joinFixedTokens(parsed.fixedTokens), '2 × 8 − 4 + 3');
  const lines = parsed.placements.map((p) =>
    formatAssociationTree(p.tree, parsed.fixedTokens),
  );
  assertEqual(new Set(lines).size, 4);
});

check('Train question supplies four MCQ options (authoritative 13A strings)', () => {
  const q = buildSynthPlace01TrainQuestion();
  const opts = getTrainOptions(q);
  assertEqual(opts.length, 4);
  assertEqual(opts[0].text, SYNTH_PLACE_01_OPTIONS[0]);
  assertEqual(opts[1].text, SYNTH_PLACE_01_OPTIONS[1]);
  assertEqual(opts[2].text, SYNTH_PLACE_01_OPTIONS[2]);
  assertEqual(opts[3].text, SYNTH_PLACE_01_OPTIONS[3]);
  assertEqual(q.diagram_prompt, null);
  assertEqual(q.has_diagram, true);
  assertOk(q.diagram_data);
});

check('Diagram renderer does not create A–D cards, instruction, or Expression panel', () => {
  assertOk(!/optionRow/.test(rendererSrc));
  assertOk(!/Choose the bracket grouping that matches the question/.test(rendererSrc));
  assertOk(!/expressionCard/.test(rendererSrc));
  assertOk(!/'Expression'|"Expression"|`Expression`/.test(rendererSrc));
  assertOk(/joinFixedTokens/.test(rendererSrc));
  assertOk(/accessibilityLabel=\{parsed\.accessibilityText\}/.test(rendererSrc));
  assertOk(/a11yOnly/.test(rendererSrc) && /width:\s*0/.test(rendererSrc));
});

check('TrainQuizPlayer owns MCQ + diagram surface (production path)', () => {
  assertOk(/getTrainOptions/.test(trainPlayerSrc));
  assertOk(/TrainQuestionDiagram/.test(trainPlayerSrc));
  assertOk(/diagramPrompt=\{q\.diagram_prompt\}/.test(trainPlayerSrc));
  assertOk(/deferCorrectness/.test(trainPlayerSrc));
  assertOk(/case 'BidmasGroupPlacements'/.test(dispatcherSrc));
  assertOk(/case 'BidmasErrorPanel'/.test(dispatcherSrc));
  assertOk(/UnsupportedDiagram/.test(dispatcherSrc));
});

check('Accidental _audit is ignored; public parse still succeeds', () => {
  const tampered = {
    ...fixture.diagram_data,
    _audit: {
      correct_option_key: 'B',
      option_values: { A: 11, B: 9, C: 14, D: 2 },
      target: 9,
    },
    correct_option_key: 'B',
    target: 9,
  };
  const parsed = parseBidmasGroupPlacements(tampered);
  assertOk(parsed);
  assertEqual(parsed.placements.length, 4);
  assertEqual('correct_option_key' in parsed, false);
  assertEqual('_audit' in parsed, false);
});

check('Malformed payloads fail closed', () => {
  assertEqual(
    parseBidmasGroupPlacements({
      schema_version: 'bidmas_1.0',
      visual_type: 'bid_group_placements',
    }),
    null,
  );
  assertEqual(
    parseBidmasGroupPlacements({
      schema_version: 'bidmas_1.0',
      visual_type: 'bid_error_panel',
      operation: 'bidmas_error_diagnosis',
      expression_tokens: ['1', '+', '2'],
      panels: [],
      accessibility_text: 'x',
    }),
    null,
  );
  assertEqual(
    parseBidmasGroupPlacements({
      ...fixture.diagram_data,
      placements: fixture.diagram_data.placements.slice(0, 2),
    }),
    null,
  );
});

check('Fixture is marked synthetic offline review only', () => {
  assertEqual(fixture.review_status, 'SYNTHETIC_OFFLINE_REVIEW_ONLY');
  assertEqual(fixture.production_candidate, false);
  assertOk(!('_audit' in fixture.diagram_data));
  assertEqual(
    JSON.stringify(SYNTH_PLACE_01_DIAGRAM_DATA.fixed_tokens),
    JSON.stringify(fixture.diagram_data.fixed_tokens),
  );
});

console.log(`\nBIDMAS-21B PLACE ts checks: ${passed} passed`);
