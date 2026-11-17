/**
 * Parse the public BIDMAS-13A PLACE/OPT diagram payload.
 * Consumes only public fields. Private keys (_audit, answer ids, values) are
 * ignored when present and never returned to the renderer.
 */

import { asRecord, asString, asUnknownArray } from '../guards';
import type { AssociationTree } from './formatAssociationTree';

export const BIDMAS_SCHEMA_VERSION = 'bidmas_1.0';
export const BIDMAS_VISUAL_GROUP = 'bid_group_placements';

const PLACE_OPERATIONS = new Set([
  'bidmas_bracket_placement',
  'bidmas_extremal_grouping',
]);

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

export type BidmasPlacement = {
  optionKey: (typeof OPTION_KEYS)[number];
  tree: AssociationTree;
};

export type BidmasGroupPlacementsPublic = {
  schemaVersion: typeof BIDMAS_SCHEMA_VERSION;
  visualType: typeof BIDMAS_VISUAL_GROUP;
  operation: string;
  fixedTokens: string[];
  placements: BidmasPlacement[];
  accessibilityText: string;
};

function parseTree(node: unknown, depth = 0): AssociationTree | null {
  if (depth > 32) return null;
  if (typeof node === 'number' && Number.isInteger(node) && node >= 0) {
    return node;
  }
  const rec = asRecord(node);
  if (!rec) return null;
  if (!('op_index' in rec) || !('left' in rec) || !('right' in rec)) {
    return null;
  }
  const opIndex = rec.op_index;
  if (typeof opIndex !== 'number' || !Number.isInteger(opIndex) || opIndex < 0) {
    return null;
  }
  const left = parseTree(rec.left, depth + 1);
  const right = parseTree(rec.right, depth + 1);
  if (left == null || right == null) return null;
  return { op_index: opIndex, left, right };
}

function isOperandToken(token: string): boolean {
  return /^\d+$/.test(token);
}

function isOperatorToken(token: string): boolean {
  return token === '+' || token === '−' || token === '×' || token === '÷';
}

/**
 * Returns a typed public payload, or null when the data cannot be rendered safely.
 * Extra / private keys are ignored (not treated as hard errors).
 */
export function parseBidmasGroupPlacements(
  data: Record<string, unknown>,
): BidmasGroupPlacementsPublic | null {
  if (data.schema_version !== BIDMAS_SCHEMA_VERSION) return null;
  if (data.visual_type !== BIDMAS_VISUAL_GROUP) return null;

  const operation = asString(data.operation);
  if (!operation || !PLACE_OPERATIONS.has(operation)) return null;

  const accessibilityText = asString(data.accessibility_text)?.trim() ?? '';
  if (!accessibilityText) return null;

  const tokensRaw = asUnknownArray(data.fixed_tokens);
  if (!tokensRaw || tokensRaw.length < 3 || tokensRaw.length % 2 !== 1) {
    return null;
  }
  const fixedTokens: string[] = [];
  for (let i = 0; i < tokensRaw.length; i += 1) {
    const token = asString(tokensRaw[i]);
    if (!token) return null;
    if (i % 2 === 0) {
      if (!isOperandToken(token)) return null;
    } else if (!isOperatorToken(token)) {
      return null;
    }
    fixedTokens.push(token);
  }

  const placementsRaw = asUnknownArray(data.placements);
  if (!placementsRaw || placementsRaw.length !== 4) return null;

  const placements: BidmasPlacement[] = [];
  for (let i = 0; i < 4; i += 1) {
    const row = asRecord(placementsRaw[i]);
    if (!row) return null;
    const optionKey = asString(row.option_key);
    if (optionKey !== OPTION_KEYS[i]) return null;
    const tree = parseTree(row.tree);
    if (tree == null || typeof tree === 'number') return null;
    placements.push({ optionKey, tree });
  }

  return {
    schemaVersion: BIDMAS_SCHEMA_VERSION,
    visualType: BIDMAS_VISUAL_GROUP,
    operation,
    fixedTokens,
    placements,
    accessibilityText,
  };
}
