import { asPositiveInt, asRecord } from '../guards';

export type FractionValue = { numerator: number; denominator: number };
export type SegmentTone = false | 'a' | 'b' | 'removed';

export function formatFraction(f: FractionValue): string {
  return `${f.numerator}/${f.denominator}`;
}

/** Proper or improper unit fraction / amount result (denom may be 1). */
export function parseFractionLoose(value: unknown): FractionValue | null {
  const record = asRecord(value);
  if (!record) return null;
  const numerator = asPositiveInt(record.numerator);
  const denominator = asPositiveInt(record.denominator);
  if (numerator == null || denominator == null) return null;
  return { numerator, denominator };
}

export function parseFractionProper(value: unknown): FractionValue | null {
  const f = parseFractionLoose(value);
  if (!f || f.numerator > f.denominator) return null;
  return f;
}

export function rectangleGridLayout(
  denominator: number,
): { rows: number; cols: number } | null {
  const layouts: Record<number, [number, number]> = {
    2: [1, 2],
    3: [1, 3],
    4: [2, 2],
    5: [1, 5],
    6: [2, 3],
    8: [2, 4],
    9: [3, 3],
    10: [2, 5],
    12: [3, 4],
    15: [3, 5],
    16: [4, 4],
    20: [4, 5],
    24: [4, 6],
    30: [5, 6],
  };
  const layout = layouts[denominator];
  if (!layout) return null;
  return { rows: layout[0], cols: layout[1] };
}

export function buildAdditionTones(
  denominator: number,
  numeratorA: number,
  numeratorB: number,
): SegmentTone[] {
  const total = Math.max(1, denominator);
  const tones: SegmentTone[] = Array.from({ length: total }, () => false);
  let cursor = 0;
  for (let i = 0; i < numeratorA && cursor < total; i += 1, cursor += 1) {
    tones[cursor] = 'a';
  }
  for (let i = 0; i < numeratorB && cursor < total; i += 1, cursor += 1) {
    tones[cursor] = 'b';
  }
  return tones;
}

export function buildSubtractionTones(
  denominator: number,
  numeratorA: number,
  numeratorB: number,
): SegmentTone[] {
  const total = Math.max(1, denominator);
  const tones: SegmentTone[] = Array.from({ length: total }, () => false);
  for (let i = 0; i < numeratorA && i < total; i += 1) {
    tones[i] = i < numeratorB ? 'removed' : 'a';
  }
  return tones;
}

export function buildSingleShadeTones(
  denominator: number,
  numerator: number,
): SegmentTone[] {
  const total = Math.max(1, denominator);
  return Array.from({ length: total }, (_, i) => (i < numerator ? 'a' : false));
}

export function segmentFill(tone: SegmentTone): string {
  if (tone === 'a') return '#38BDF8';
  if (tone === 'b') return '#6366F1';
  if (tone === 'removed') return 'rgba(248, 113, 113, 0.35)';
  return '#1A1748';
}

export function wedgePath(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
): string {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

export type OperandSegments = {
  displayA: FractionValue;
  displayB: FractionValue | null;
  segA: FractionValue;
  segB: FractionValue | null;
  denominator: number;
  dualPanel: boolean;
};

/**
 * Resolve segment counts for operand-based fraction visuals.
 * dualPanel = comparison / equivalence (two models).
 */
export function resolveOperandSegments(
  data: Record<string, unknown>,
): OperandSegments | null {
  const op = typeof data.operation === 'string' ? data.operation : '';
  const displayA = parseFractionLoose(data.operand_a);
  if (!displayA) return null;
  const displayB = parseFractionLoose(data.operand_b);
  const eqA = parseFractionLoose(data.operand_a_equivalent) ?? displayA;
  const eqB = displayB
    ? parseFractionLoose(data.operand_b_equivalent) ?? displayB
    : null;
  const common = asPositiveInt(data.common_denominator);

  const dualPanel =
    op === 'comparison' || op === 'equivalence' || op === 'simplification';

  if (dualPanel) {
    const denominator =
      common ??
      (eqB
        ? Math.max(eqA.denominator, eqB.denominator)
        : eqA.denominator);
    return {
      displayA,
      displayB,
      segA: eqA.denominator === denominator ? eqA : displayA,
      segB: eqB
        ? eqB.denominator === denominator
          ? eqB
          : displayB
        : null,
      denominator,
      dualPanel: true,
    };
  }

  if (op === 'subtraction' && displayB) {
    const denominator = common ?? displayA.denominator;
    return {
      displayA,
      displayB,
      segA: eqA,
      segB: eqB,
      denominator,
      dualPanel: false,
    };
  }

  // addition (default when both operands present)
  if (displayB) {
    const denominator =
      common ??
      (eqA.denominator === eqB!.denominator
        ? eqA.denominator
        : displayA.denominator);
    return {
      displayA,
      displayB,
      segA: eqA,
      segB: eqB,
      denominator,
      dualPanel: false,
    };
  }

  return {
    displayA,
    displayB: null,
    segA: eqA,
    segB: null,
    denominator: common ?? eqA.denominator,
    dualPanel: false,
  };
}

export function tonesForOperation(
  data: Record<string, unknown>,
  segs: OperandSegments,
): SegmentTone[] {
  const op = typeof data.operation === 'string' ? data.operation : 'addition';
  if (op === 'subtraction' && segs.segB) {
    return buildSubtractionTones(
      segs.denominator,
      segs.segA.numerator,
      segs.segB.numerator,
    );
  }
  if (segs.segB && !segs.dualPanel) {
    return buildAdditionTones(
      segs.denominator,
      segs.segA.numerator,
      segs.segB.numerator,
    );
  }
  return buildSingleShadeTones(segs.denominator, segs.segA.numerator);
}
