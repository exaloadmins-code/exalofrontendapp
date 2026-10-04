/** Shared diagram palette — Exalo dark/space Train UI. */
export const DIAGRAM = {
  stroke: '#A78BFA',
  strokeMuted: 'rgba(167, 139, 250, 0.45)',
  shadeA: '#38BDF8',
  shadeB: '#6366F1',
  shadeAsk: 'rgba(56, 189, 248, 0.45)',
  unshaded: '#1A1748',
  cutout: '#0B1026',
  text: 'rgba(221, 214, 254, 0.92)',
  textMuted: 'rgba(221, 214, 254, 0.7)',
  grid: 'rgba(167, 139, 250, 0.35)',
  marker: '#FDBA74',
  rightAngle: '#FDE68A',
  arc: 'rgba(167, 139, 250, 0.85)',
  background: 'rgba(15, 11, 52, 0.55)',
} as const;

/** Alias used by some helpers */
export const diagramColors = {
  stroke: DIAGRAM.stroke,
  strokeMuted: DIAGRAM.strokeMuted,
  sky: DIAGRAM.shadeA,
  indigo: DIAGRAM.shadeB,
  fillShaded: DIAGRAM.shadeAsk,
  fillShadedStrong: 'rgba(99, 102, 241, 0.62)',
  fillUnshaded: DIAGRAM.unshaded,
  fillGrid: 'rgba(26, 23, 72, 0.85)',
  cutoutFill: DIAGRAM.cutout,
  background: '#080C21',
  text: DIAGRAM.text,
  textMuted: DIAGRAM.textMuted,
  arc: DIAGRAM.arc,
  marker: DIAGRAM.marker,
  gridLine: DIAGRAM.grid,
  dashed: 'rgba(56, 189, 248, 0.85)',
  heightMarker: 'rgba(56, 189, 248, 0.9)',
} as const;

export type DiagramColorToken = keyof typeof diagramColors;
