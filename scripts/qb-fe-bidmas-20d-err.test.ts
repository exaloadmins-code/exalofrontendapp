/**
 * BIDMAS-20D — ERR (bid_error_panel) registry, parser, dispatcher wiring,
 * and full 41-diagram inventory (31 PLACE + 10 ERR).
 *
 * Run: npx --yes tsx scripts/qb-fe-bidmas-20d-err.test.ts
 *
 * Loads fixtures derived from frozen Medium/Hard banks (not invented maths).
 * Does not mount React Native visually — structural/component-path checks only.
 */
// @ts-nocheck

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lookupDiagramFamily } from '../src/components/train/diagrams/registry';
import { parseBidmasGroupPlacements } from '../src/components/train/diagrams/bidmas/parseBidmasGroupPlacements';
import {
  joinExpressionTokens,
  parseBidmasErrorPanel,
} from '../src/components/train/diagrams/bidmas/parseBidmasErrorPanel';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const ERR_IDS = [
  'MATH-NUMBER-BIDMAS-MEDIUM-014',
  'MATH-NUMBER-BIDMAS-MEDIUM-015',
  'MATH-NUMBER-BIDMAS-MEDIUM-073',
  'MATH-NUMBER-BIDMAS-MEDIUM-074',
  'MATH-NUMBER-BIDMAS-MEDIUM-075',
  'MATH-NUMBER-BIDMAS-MEDIUM-076',
  'MATH-NUMBER-BIDMAS-MEDIUM-077',
  'MATH-NUMBER-BIDMAS-MEDIUM-078',
  'MATH-NUMBER-BIDMAS-MEDIUM-079',
  'MATH-NUMBER-BIDMAS-MEDIUM-080',
];

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

const errFixture = JSON.parse(
  readFileSync(
    join(
      root,
      'scripts/diagram-fixtures/bidmas_1.0_bid_error_panel_medium_10.json',
    ),
    'utf8',
  ),
);
const inventory = JSON.parse(
  readFileSync(
    join(
      root,
      'scripts/diagram-fixtures/bidmas_1.0_all_41_diagrams_inventory.json',
    ),
    'utf8',
  ),
);

const errRendererSrc = readFileSync(
  join(root, 'src/components/train/diagrams/bidmas/BidmasErrorPanel.tsx'),
  'utf8',
);
const dispatcherSrc = readFileSync(
  join(root, 'src/components/train/diagrams/DiagramDispatcher.tsx'),
  'utf8',
);
const unsupportedSrc = readFileSync(
  join(root, 'src/components/train/diagrams/UnsupportedDiagram.tsx'),
  'utf8',
);

check('Fixture SHA and 10 ERR IDs match approved Medium bank', () => {
  assertEqual(
    errFixture.source_sha256,
    'f62897c6fe48dbcce2e8b4648ebfcad3cadb95eaa4c597fdfb08f0367ab135e4',
  );
  assertEqual(errFixture.questions.length, 10);
  const ids = errFixture.questions.map((q) => q.external_id).sort();
  assertEqual(JSON.stringify(ids), JSON.stringify([...ERR_IDS].sort()));
});

check('Registry dispatches bid_error_panel → BidmasErrorPanel', () => {
  assertEqual(
    lookupDiagramFamily('bidmas_1.0', 'bid_error_panel'),
    'BidmasErrorPanel',
  );
  assertEqual(
    lookupDiagramFamily('bidmas_1.0', 'bid_group_placements'),
    'BidmasGroupPlacements',
  );
  assertEqual(lookupDiagramFamily('bidmas_1.0', 'bid_unknown'), null);
  assertEqual(lookupDiagramFamily('bidmas_2.0', 'bid_error_panel'), null);
});

check('Dispatcher wires BidmasErrorPanel case', () => {
  assertOk(/BidmasErrorPanel/.test(dispatcherSrc));
  assertOk(/case 'BidmasErrorPanel'/.test(dispatcherSrc));
  assertOk(/import \{ BidmasErrorPanel \}/.test(dispatcherSrc));
});

check('ERR renderer uses parser + panel steps; no answer-key fields', () => {
  assertOk(/parseBidmasErrorPanel/.test(errRendererSrc));
  assertOk(/panel\.steps\.map/.test(errRendererSrc));
  assertOk(/accessibilityLabel=\{parsed\.accessibilityText\}/.test(errRendererSrc));
  assertOk(!/correct_answer/.test(errRendererSrc));
  assertOk(!/correct_option/.test(errRendererSrc));
  assertOk(!/_audit/.test(errRendererSrc));
  // Must not fall through by rendering UnsupportedDiagram itself
  assertOk(!/UnsupportedDiagram/.test(errRendererSrc));
  assertOk(/UnsupportedDiagram/.test(unsupportedSrc));
});

check('All 10 ERR payloads parse; maths preserved; no invented verdict', () => {
  for (const q of errFixture.questions) {
    const dd = q.diagram_data;
    assertEqual(dd.schema_version, 'bidmas_1.0', q.external_id);
    assertEqual(dd.visual_type, 'bid_error_panel', q.external_id);
    assertEqual(dd.operation, 'bidmas_error_diagnosis', q.external_id);
    assertEqual(
      lookupDiagramFamily(dd.schema_version, dd.visual_type),
      'BidmasErrorPanel',
      q.external_id,
    );
    const parsed = parseBidmasErrorPanel(dd);
    assertOk(parsed, `parse failed for ${q.external_id}`);
    assertEqual(
      JSON.stringify(parsed.expressionTokens),
      JSON.stringify(dd.expression_tokens),
      q.external_id,
    );
    assertEqual(parsed.panels.length, dd.panels.length, q.external_id);
    for (let i = 0; i < dd.panels.length; i += 1) {
      assertEqual(parsed.panels[i].label, dd.panels[i].label, q.external_id);
      assertEqual(
        JSON.stringify(parsed.panels[i].steps),
        JSON.stringify(dd.panels[i].steps),
        `${q.external_id} steps`,
      );
    }
    // Approved payloads do not highlight / reveal — keep that contract
    assertEqual(parsed.highlightFaultPanel, null, q.external_id);
    assertEqual(parsed.revealVerdict, false, q.external_id);
    assertEqual(
      joinExpressionTokens(parsed.expressionTokens),
      dd.expression_tokens.join(' '),
    );
    // Privacy: parsed object must not grow answer keys
    assertEqual('correct_option_key' in parsed, false);
    assertEqual('_audit' in parsed, false);
  }
});

check('ERR negative cases fail closed', () => {
  const sample = errFixture.questions[0].diagram_data;
  assertEqual(parseBidmasErrorPanel({}), null);
  assertEqual(
    parseBidmasErrorPanel({
      schema_version: 'bidmas_9.0',
      visual_type: 'bid_error_panel',
      operation: 'bidmas_error_diagnosis',
      expression_tokens: sample.expression_tokens,
      panels: sample.panels,
      accessibility_text: 'x',
    }),
    null,
  );
  assertEqual(
    parseBidmasErrorPanel({
      ...sample,
      visual_type: 'bid_unknown_type',
    }),
    null,
  );
  assertEqual(
    parseBidmasErrorPanel({
      ...sample,
      panels: [],
    }),
    null,
  );
  assertEqual(
    parseBidmasErrorPanel({
      ...sample,
      panels: [{ label: 'Working A', steps: ['1 + 1 = 2'] }],
    }),
    null,
  );
  assertEqual(
    parseBidmasErrorPanel({
      ...sample,
      expression_tokens: ['6', '+'],
    }),
    null,
  );
  assertEqual(
    parseBidmasErrorPanel({
      ...sample,
      expression_tokens: ['6', '+', 'oops'],
    }),
    null,
  );
  assertEqual(
    parseBidmasErrorPanel({
      ...sample,
      accessibility_text: '   ',
    }),
    null,
  );
  assertEqual(
    parseBidmasErrorPanel({
      ...sample,
      highlight_fault_panel: 'Working Z',
    }),
    null,
  );
  // Accidental answer metadata ignored
  const tampered = {
    ...sample,
    _audit: { correct_option: 'A' },
    correct_answer: 'Working A is correct',
  };
  const parsed = parseBidmasErrorPanel(tampered);
  assertOk(parsed);
  assertEqual('correct_answer' in parsed, false);
  assertEqual('_audit' in parsed, false);
});

check('Full 41-diagram inventory: 31 PLACE + 10 ERR, 0 unsupported', () => {
  assertEqual(inventory.count, 41);
  assertEqual(inventory.questions.length, 41);
  let place = 0;
  let err = 0;
  let unsupported = 0;
  let parseFail = 0;
  for (const q of inventory.questions) {
    const fam = lookupDiagramFamily(q.schema_version, q.visual_type);
    if (q.visual_type === 'bid_group_placements') {
      place += 1;
      assertEqual(fam, 'BidmasGroupPlacements', q.external_id);
      if (!parseBidmasGroupPlacements(q.diagram_data)) {
        parseFail += 1;
      }
    } else if (q.visual_type === 'bid_error_panel') {
      err += 1;
      assertEqual(fam, 'BidmasErrorPanel', q.external_id);
      if (!parseBidmasErrorPanel(q.diagram_data)) {
        parseFail += 1;
      }
    } else {
      unsupported += 1;
    }
  }
  assertEqual(place, 31);
  assertEqual(err, 10);
  assertEqual(unsupported, 0);
  assertEqual(parseFail, 0);
});

console.log(`\nBIDMAS-20D ERR ts checks: ${passed} passed`);
