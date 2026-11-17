/**
 * Parse the public BIDMAS ERR diagram payload (`bid_error_panel`).
 * Consumes only public fields. Private keys (_audit, answer ids) are ignored
 * when present and never returned to the renderer.
 */

import { asBoolean, asRecord, asString, asUnknownArray } from '../guards';

export const BIDMAS_SCHEMA_VERSION = 'bidmas_1.0';
export const BIDMAS_VISUAL_ERROR_PANEL = 'bid_error_panel';
export const BIDMAS_ERROR_OPERATION = 'bidmas_error_diagnosis';

const EXPR_OPERATORS = new Set(['+', '−', '×', '÷']);
const EXPR_PARENS = new Set(['(', ')']);

export type BidmasErrorPanelRow = {
  label: string;
  steps: string[];
};

export type BidmasErrorPanelPublic = {
  schemaVersion: typeof BIDMAS_SCHEMA_VERSION;
  visualType: typeof BIDMAS_VISUAL_ERROR_PANEL;
  operation: typeof BIDMAS_ERROR_OPERATION;
  expressionTokens: string[];
  panels: BidmasErrorPanelRow[];
  /** Panel label to emphasise when present; never invents a verdict. */
  highlightFaultPanel: string | null;
  revealVerdict: boolean;
  accessibilityText: string;
};

function isExpressionToken(token: string): boolean {
  if (/^\d+$/.test(token)) return true;
  if (EXPR_OPERATORS.has(token)) return true;
  if (EXPR_PARENS.has(token)) return true;
  return false;
}

/**
 * Returns a typed public payload, or null when the data cannot be rendered safely.
 */
export function parseBidmasErrorPanel(
  data: Record<string, unknown>,
): BidmasErrorPanelPublic | null {
  if (data.schema_version !== BIDMAS_SCHEMA_VERSION) return null;
  if (data.visual_type !== BIDMAS_VISUAL_ERROR_PANEL) return null;

  const operation = asString(data.operation);
  if (operation !== BIDMAS_ERROR_OPERATION) return null;

  const accessibilityText = asString(data.accessibility_text)?.trim() ?? '';
  if (!accessibilityText) return null;

  const tokensRaw = asUnknownArray(data.expression_tokens);
  if (!tokensRaw || tokensRaw.length < 3) return null;
  const expressionTokens: string[] = [];
  for (const raw of tokensRaw) {
    const token = asString(raw);
    if (!token || !isExpressionToken(token)) return null;
    expressionTokens.push(token);
  }

  const panelsRaw = asUnknownArray(data.panels);
  if (!panelsRaw || panelsRaw.length < 2) return null;

  const panels: BidmasErrorPanelRow[] = [];
  for (const rowRaw of panelsRaw) {
    const row = asRecord(rowRaw);
    if (!row) return null;
    const label = asString(row.label)?.trim() ?? '';
    if (!label) return null;
    const stepsRaw = asUnknownArray(row.steps);
    if (!stepsRaw || stepsRaw.length < 1) return null;
    const steps: string[] = [];
    for (const stepRaw of stepsRaw) {
      const step = asString(stepRaw)?.trim() ?? '';
      if (!step) return null;
      steps.push(step);
    }
    panels.push({ label, steps });
  }

  const highlightRaw = data.highlight_fault_panel;
  let highlightFaultPanel: string | null = null;
  if (highlightRaw !== null && highlightRaw !== undefined) {
    const label = asString(highlightRaw)?.trim() ?? '';
    if (!label) return null;
    if (!panels.some((p) => p.label === label)) return null;
    highlightFaultPanel = label;
  }

  const revealVerdict = asBoolean(data.reveal_verdict, false);

  return {
    schemaVersion: BIDMAS_SCHEMA_VERSION,
    visualType: BIDMAS_VISUAL_ERROR_PANEL,
    operation: BIDMAS_ERROR_OPERATION,
    expressionTokens,
    panels,
    highlightFaultPanel,
    revealVerdict,
    accessibilityText,
  };
}

/** Join expression tokens with spaces (matches frozen stem spacing). */
export function joinExpressionTokens(tokens: string[]): string {
  return tokens.join(' ');
}
