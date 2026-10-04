import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  G,
  Line,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { fonts } from '@/theme';
import { DIAGRAM } from '../colors';
import {
  asFiniteNumber,
  asFinitePoint,
  asPositiveInt,
  asRecord,
} from '../guards';
import {
  cellToneAt,
  resolveUnitSquareShading,
  type CellTone,
  type UnitSquareShading,
} from './unitSquareShading';

type Props = {
  data: Record<string, unknown>;
  width: number;
};

type DisplayRect = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

type AreaFigure = {
  id: string;
  kind: string | null;
  shaded: boolean;
  displayRect: DisplayRect | null;
  points: Point[] | null;
  labels: { side?: string; role?: string; value: string; visible: boolean }[];
  heightMarker: { from: Point; to: Point } | null;
};

type AreaCutout = {
  id: string;
  kind: string | null;
  displayRect: DisplayRect | null;
  labels: AreaFigure['labels'];
};

const AREA_VISUAL_TYPES = new Set([
  'unit_square_grid',
  'rectilinear_l_shape',
  'multi_rectangle_composite',
  'shaded_remaining_region',
  'labelled_rectangle',
  'labelled_square',
  'labelled_triangle_base_height',
  'triangle_on_unit_grid',
  'outer_inner_nested_rectangles',
  'rectangle_with_rectangular_cutout',
]);

export function AreaDiagramV1({ data, width }: Props): React.ReactElement | null {
  if (data.schema_version !== 'area_diagram_v1') return null;
  const visualType =
    typeof data.visual_type === 'string' ? data.visual_type : null;
  if (!visualType || !AREA_VISUAL_TYPES.has(visualType)) return null;

  try {
    const figures = parseFigures(data.figures);
    const cutouts = parseCutouts(data.cutouts);
    const grid = asRecord(data.grid);
    const units = typeof data.units === 'string' ? data.units : '';
    const notToScale = data.not_to_scale === true;

    // unit_square_grid shading is authoritative via grid.occupied_cells
    // (or full rectangle when occupied_cells absent).
    let unitShading: UnitSquareShading | null = null;
    if (visualType === 'unit_square_grid') {
      unitShading = resolveUnitSquareShading(grid);
      if (!unitShading) return null;
    }

    const gridGeom = unitShading
      ? {
          rows: unitShading.rows,
          cols: unitShading.cols,
          cell: unitShading.cellPx,
        }
      : grid
        ? {
            rows: asPositiveInt(grid.rows),
            cols: asPositiveInt(grid.cols),
            cell: asPositiveInt(grid.cell_px) ?? 24,
          }
        : null;

    if (gridGeom && (gridGeom.rows == null || gridGeom.cols == null)) {
      return null;
    }

    // Empty figures is valid for pure unit_square_grid
    if (!figures.length && !gridGeom) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const expand = (x: number, y: number) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    };

    if (gridGeom && gridGeom.rows != null && gridGeom.cols != null) {
      expand(0, 0);
      expand(gridGeom.cols * gridGeom.cell, gridGeom.rows * gridGeom.cell);
    }

    for (const f of figures) {
      if (f.displayRect) {
        expand(f.displayRect.x, f.displayRect.y);
        expand(f.displayRect.x + f.displayRect.w, f.displayRect.y + f.displayRect.h);
      }
      if (f.points) {
        for (const p of f.points) expand(p.x, p.y);
      }
      if (f.heightMarker) {
        expand(f.heightMarker.from.x, f.heightMarker.from.y);
        expand(f.heightMarker.to.x, f.heightMarker.to.y);
      }
    }
    for (const c of cutouts) {
      if (c.displayRect) {
        expand(c.displayRect.x, c.displayRect.y);
        expand(
          c.displayRect.x + c.displayRect.w,
          c.displayRect.y + c.displayRect.h,
        );
      }
    }

    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;

    const pad = 36;
    const vbX = minX - pad;
    const vbY = minY - pad;
    const vbW = Math.max(40, maxX - minX + pad * 2);
    const vbH = Math.max(40, maxY - minY + pad * 2);
    const svgW = Math.max(200, width - 8);
    const svgH = Math.min(280, (svgW * vbH) / vbW);

    const isDifference =
      visualType === 'shaded_remaining_region' ||
      visualType === 'outer_inner_nested_rectangles' ||
      visualType === 'rectangle_with_rectangular_cutout';

    return (
      <View style={styles.wrap}>
        <Svg
          width={svgW}
          height={svgH}
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {gridGeom && gridGeom.rows != null && gridGeom.cols != null
            ? renderGrid(
                gridGeom.rows,
                gridGeom.cols,
                gridGeom.cell,
                unitShading,
              )
            : null}

          {figures.map((f) => {
            if (f.points && f.points.length >= 3) {
              const points = f.points.map((p) => `${p.x},${p.y}`).join(' ');
              return (
                <G key={f.id}>
                  <Polygon
                    points={points}
                    fill={f.shaded ? DIAGRAM.shadeAsk : DIAGRAM.unshaded}
                    stroke={DIAGRAM.stroke}
                    strokeWidth={2}
                  />
                  {f.heightMarker ? (
                    <>
                      <Line
                        x1={f.heightMarker.from.x}
                        y1={f.heightMarker.from.y}
                        x2={f.heightMarker.to.x}
                        y2={f.heightMarker.to.y}
                        stroke={DIAGRAM.marker}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                      />
                      {/* perpendicular tick near foot */}
                      <Line
                        x1={f.heightMarker.to.x - 6}
                        y1={f.heightMarker.to.y}
                        x2={f.heightMarker.to.x}
                        y2={f.heightMarker.to.y - 6}
                        stroke={DIAGRAM.marker}
                        strokeWidth={1.5}
                      />
                    </>
                  ) : null}
                  {renderLabels(f)}
                </G>
              );
            }
            if (f.displayRect) {
              return (
                <G key={f.id}>
                  <Rect
                    x={f.displayRect.x}
                    y={f.displayRect.y}
                    width={f.displayRect.w}
                    height={f.displayRect.h}
                    fill={
                      isDifference || f.shaded
                        ? DIAGRAM.shadeAsk
                        : DIAGRAM.unshaded
                    }
                    stroke={DIAGRAM.stroke}
                    strokeWidth={2}
                  />
                  {renderLabels(f)}
                </G>
              );
            }
            return null;
          })}

          {cutouts.map((c) => {
            if (!c.displayRect) return null;
            // kind may be absent — use display only; do not invent kind
            return (
              <G key={c.id}>
                <Rect
                  x={c.displayRect.x}
                  y={c.displayRect.y}
                  width={c.displayRect.w}
                  height={c.displayRect.h}
                  fill={DIAGRAM.cutout}
                  stroke={DIAGRAM.stroke}
                  strokeWidth={2}
                  strokeDasharray={isDifference ? '6 4' : undefined}
                />
                {renderLabels({
                  displayRect: c.displayRect,
                  points: null,
                  labels: c.labels,
                })}
              </G>
            );
          })}
        </Svg>
        <View style={styles.meta}>
          {units ? <Text style={styles.metaText}>Units: {units}</Text> : null}
          {notToScale ? (
            <Text style={styles.metaText}>Diagram not to scale</Text>
          ) : null}
        </View>
      </View>
    );
  } catch {
    return null;
  }
}

function toneFill(tone: CellTone): string {
  if (tone === 'shaded') return DIAGRAM.shadeAsk;
  if (tone === 'region_a') return DIAGRAM.shadeA;
  if (tone === 'region_b') return DIAGRAM.shadeB;
  return DIAGRAM.unshaded;
}

function renderGrid(
  rows: number,
  cols: number,
  cell: number,
  shading: UnitSquareShading | null,
) {
  const nodes: React.ReactNode[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const tone = shading ? cellToneAt(shading, r, c) : 'unshaded';
      nodes.push(
        <Rect
          key={`g-${r}-${c}`}
          x={c * cell}
          y={r * cell}
          width={cell}
          height={cell}
          fill={toneFill(tone)}
          stroke={DIAGRAM.stroke}
          strokeWidth={1}
        />,
      );
    }
  }
  return <G>{nodes}</G>;
}

function renderLabels(
  fig: Pick<AreaFigure, 'displayRect' | 'points' | 'labels'>,
) {
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < fig.labels.length; i += 1) {
    const lab = fig.labels[i]!;
    if (!lab.visible) continue;
    let x = 0;
    let y = 0;
    if (fig.displayRect) {
      const d = fig.displayRect;
      switch (lab.side) {
        case 'top':
          x = d.x + d.w / 2;
          y = d.y - 8;
          break;
        case 'bottom':
          x = d.x + d.w / 2;
          y = d.y + d.h + 14;
          break;
        case 'left':
          x = d.x - 10;
          y = d.y + d.h / 2 + 4;
          break;
        case 'right':
          x = d.x + d.w + 10;
          y = d.y + d.h / 2 + 4;
          break;
        default:
          x = d.x + d.w / 2;
          y = d.y - 8;
      }
    } else if (fig.points && fig.points.length >= 2) {
      if (lab.role === 'base' || lab.side === 'bottom') {
        const a = fig.points[0]!;
        const b = fig.points[1]!;
        x = (a.x + b.x) / 2;
        y = Math.max(a.y, b.y) + 14;
      } else {
        const p = fig.points[0]!;
        x = p.x - 14;
        y = (fig.points[0]!.y + fig.points[fig.points.length - 1]!.y) / 2;
      }
    } else {
      continue;
    }
    nodes.push(
      <SvgText
        key={`lab-${i}`}
        x={x}
        y={y}
        fill={DIAGRAM.text}
        fontSize="12"
        fontWeight="600"
        textAnchor="middle"
      >
        {lab.value}
      </SvgText>,
    );
  }
  return nodes;
}

function parseLabels(raw: unknown): AreaFigure['labels'] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const r = asRecord(item);
      if (!r) return null;
      const value = r.value;
      if (value == null) return null;
      return {
        side: typeof r.side === 'string' ? r.side : undefined,
        role: typeof r.role === 'string' ? r.role : undefined,
        value: String(value),
        visible: r.visible !== false,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);
}

function parseDisplayRect(raw: unknown): DisplayRect | null {
  const d = asRecord(raw);
  if (!d) return null;
  if (Array.isArray(d.points)) return null;
  const x = asFiniteNumber(d.x);
  const y = asFiniteNumber(d.y);
  const w = asFiniteNumber(d.w);
  const h = asFiniteNumber(d.h);
  if (x == null || y == null || w == null || h == null) return null;
  if (w <= 0 || h <= 0) return null;
  return { x, y, w, h };
}

function parseFigures(raw: unknown): AreaFigure[] {
  if (!Array.isArray(raw)) return [];
  const out: AreaFigure[] = [];
  for (const item of raw) {
    const r = asRecord(item);
    if (!r) continue;
    const id = typeof r.id === 'string' ? r.id : `fig-${out.length}`;
    const kind = typeof r.kind === 'string' ? r.kind : null;
    const display = asRecord(r.display);
    let points: Point[] | null = null;
    let heightMarker: AreaFigure['heightMarker'] = null;
    if (display && Array.isArray(display.points)) {
      points = display.points
        .map((p) => asFinitePoint(p))
        .filter((p): p is Point => p != null);
      if (points.length < 3) points = null;
      const hm = asRecord(display.height_marker);
      if (hm) {
        const from = asFinitePoint(hm.from);
        const to = asFinitePoint(hm.to);
        if (from && to) heightMarker = { from, to };
      }
    }
    const displayRect = points ? null : parseDisplayRect(r.display);
    if (!points && !displayRect) continue;
    out.push({
      id,
      kind,
      shaded: r.shaded === true,
      displayRect,
      points,
      labels: parseLabels(r.labels),
      heightMarker,
    });
  }
  return out;
}

function parseCutouts(raw: unknown): AreaCutout[] {
  if (!Array.isArray(raw)) return [];
  const out: AreaCutout[] = [];
  for (const item of raw) {
    const r = asRecord(item);
    if (!r) continue;
    const id = typeof r.id === 'string' ? r.id : `cut-${out.length}`;
    // kind optional — do not invent
    const kind = typeof r.kind === 'string' ? r.kind : null;
    const displayRect = parseDisplayRect(r.display);
    if (!displayRect) continue;
    out.push({
      id,
      kind,
      displayRect,
      labels: parseLabels(r.labels),
    });
  }
  return out;
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 6,
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  metaText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: DIAGRAM.textMuted,
  },
});
