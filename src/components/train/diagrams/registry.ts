/**
 * Authoritative renderer coverage for currently active Maths diagram keys.
 * Dispatch key = (schema_version, visual_type).
 */

export type DiagramRendererFamily =
  | 'FractionDiagram2'
  | 'NumberDiagram2'
  | 'AreaDiagramV1'
  | 'AnglesDiagramV1';

export type DiagramDispatchKey = {
  schemaVersion: string;
  visualType: string;
  family: DiagramRendererFamily;
  /** Fraction vs Number for shared visual_type number_line is payload-routed. */
  notes?: string;
};

/** Every currently known active (schema, visual_type) combination. */
export const IMPLEMENTED_DIAGRAM_KEYS: readonly DiagramDispatchKey[] = [
  { schemaVersion: '2.0', visualType: 'array_model', family: 'FractionDiagram2' },
  { schemaVersion: '2.0', visualType: 'bar_model', family: 'FractionDiagram2' },
  { schemaVersion: '2.0', visualType: 'circle_model', family: 'FractionDiagram2' },
  { schemaVersion: '2.0', visualType: 'fraction_strip', family: 'FractionDiagram2' },
  { schemaVersion: '2.0', visualType: 'set_model', family: 'FractionDiagram2' },
  { schemaVersion: '2.0', visualType: 'shaded_rectangle', family: 'FractionDiagram2' },
  {
    schemaVersion: '2.0',
    visualType: 'number_line',
    family: 'NumberDiagram2',
    notes: 'Routed to Number or Fraction renderer by payload shape',
  },
  { schemaVersion: '2.0', visualType: 'magnitude_bar', family: 'NumberDiagram2' },
  { schemaVersion: '2.0', visualType: 'pictorial_quantity', family: 'NumberDiagram2' },
  { schemaVersion: 'area_diagram_v1', visualType: 'unit_square_grid', family: 'AreaDiagramV1' },
  { schemaVersion: 'area_diagram_v1', visualType: 'rectilinear_l_shape', family: 'AreaDiagramV1' },
  {
    schemaVersion: 'area_diagram_v1',
    visualType: 'multi_rectangle_composite',
    family: 'AreaDiagramV1',
  },
  {
    schemaVersion: 'area_diagram_v1',
    visualType: 'shaded_remaining_region',
    family: 'AreaDiagramV1',
  },
  { schemaVersion: 'area_diagram_v1', visualType: 'labelled_rectangle', family: 'AreaDiagramV1' },
  { schemaVersion: 'area_diagram_v1', visualType: 'labelled_square', family: 'AreaDiagramV1' },
  {
    schemaVersion: 'area_diagram_v1',
    visualType: 'labelled_triangle_base_height',
    family: 'AreaDiagramV1',
  },
  {
    schemaVersion: 'area_diagram_v1',
    visualType: 'triangle_on_unit_grid',
    family: 'AreaDiagramV1',
  },
  {
    schemaVersion: 'area_diagram_v1',
    visualType: 'outer_inner_nested_rectangles',
    family: 'AreaDiagramV1',
  },
  {
    schemaVersion: 'area_diagram_v1',
    visualType: 'rectangle_with_rectangular_cutout',
    family: 'AreaDiagramV1',
  },
  {
    schemaVersion: 'angles_diagram_v1',
    visualType: 'angles_missing_angle_semantic_a7',
    family: 'AnglesDiagramV1',
  },
] as const;

export function lookupDiagramFamily(
  schemaVersion: string | null | undefined,
  visualType: string | null | undefined,
): DiagramRendererFamily | null {
  if (!schemaVersion || !visualType) return null;
  const hit = IMPLEMENTED_DIAGRAM_KEYS.find(
    (k) => k.schemaVersion === schemaVersion && k.visualType === visualType,
  );
  return hit?.family ?? null;
}

/** Fraction number_line has operand fractions; Number number_line has start/end. */
export function isNumberStyleNumberLine(data: Record<string, unknown>): boolean {
  const start = Number(data.start);
  const end = Number(data.end);
  return Number.isFinite(start) && Number.isFinite(end) && start !== end;
}

export function isFractionStyleNumberLine(data: Record<string, unknown>): boolean {
  if (isNumberStyleNumberLine(data)) return false;
  const a = data.operand_a;
  return !!(a && typeof a === 'object' && !Array.isArray(a));
}
