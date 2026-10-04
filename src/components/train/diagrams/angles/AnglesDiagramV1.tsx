import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { fonts } from '@/theme';
import { DIAGRAM } from '../colors';
import { asFiniteNumber, asRecord } from '../guards';
import { resolveSectorsWithBindings } from './sectorBindings';
import {
  layoutAngleAnnotations,
  type PointGeom,
  type RightAngleGeom,
  type SectorGeom,
} from './annotationLayout';

type Props = {
  data: Record<string, unknown>;
  width: number;
};

type Vertex = {
  id: string;
  x: number;
  y: number;
  pupilLabel?: string;
  labelOffset: [number, number];
};

type Ray = {
  id: string;
  origin: string;
  angleDeg: number;
  length: number;
};

type LayoutTransform = {
  pivot: [number, number];
  scale: number;
  translate: [number, number];
  rotationDeg: number;
};

const DEG = Math.PI / 180;
/** Target on-screen label size (px) — readable on narrow web. */
const TARGET_LABEL_PX = 14;
const TARGET_POINT_LABEL_PX = 12;
const TARGET_STROKE_PX = 2.25;

export function AnglesDiagramV1({
  data,
  width,
}: Props): React.ReactElement | null {
  if (data.schema_version !== 'angles_diagram_v1') return null;
  if (data.visual_type !== 'angles_missing_angle_semantic_a7') return null;

  try {
    const parsed = parseAnglesPayload(data);
    if (!parsed) return null;

    // Authoritative sector geometry: bindings drive vertex/rays when present.
    const resolvedSectors = resolveSectorsWithBindings(data);
    if (!resolvedSectors) return null;

    const {
      vertices,
      rays,
      transform,
      ownedStrokes,
      polygonsDisplay,
      requiredPointLabels,
      rightAngleMarkers,
      equalSideMarks,
      notToScale,
    } = parsed;

    const vertexMap = new Map(vertices.map((v) => [v.id, v]));
    const rayMap = new Map(rays.map((r) => [r.id, r]));

    for (const r of rays) {
      if (!vertexMap.has(r.origin)) return null;
    }
    for (const s of resolvedSectors) {
      if (!vertexMap.has(s.vertex)) return null;
      if (!rayMap.has(s.rayFrom) || !rayMap.has(s.rayTo)) return null;
    }

    const apply = (x: number, y: number) => applyLayoutTransform(x, y, transform);

    const transformedVertices = new Map(
      vertices.map((v) => {
        const p = apply(v.x, v.y);
        return [v.id, { ...v, x: p.x, y: p.y }] as const;
      }),
    );

    const maxArc = Math.max(
      40,
      ...resolvedSectors.map((s) => Math.max(s.arcRadius, s.labelRadius)),
      ...rightAngleMarkers.map((m) => m.size ?? 16),
    );
    // Cap drawn ray length so viewBox is not dominated by unused canvas.
    // Geometry direction remains authoritative from angle_deg_display.
    const displayLenFor = (ray: Ray) =>
      Math.min(ray.length, Math.max(120, maxArc * 2.8));

    const rayEndpoint = (
      ray: Ray,
      lengthOverride?: number,
    ): { x: number; y: number } | null => {
      const src = vertexMap.get(ray.origin);
      if (!src) return null;
      const len = lengthOverride ?? displayLenFor(ray);
      const rad = ray.angleDeg * DEG;
      const endRaw = {
        x: src.x + len * Math.cos(rad),
        y: src.y - len * Math.sin(rad),
      };
      return apply(endRaw.x, endRaw.y);
    };

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

    for (const v of transformedVertices.values()) expand(v.x, v.y);
    for (const ray of rays) {
      const end = rayEndpoint(ray);
      if (end) expand(end.x, end.y);
    }
    // Include arc/label loci so they are not cropped.
    for (const sector of resolvedSectors) {
      const vertex = transformedVertices.get(sector.vertex);
      const rayFrom = rayMap.get(sector.rayFrom);
      const rayTo = rayMap.get(sector.rayTo);
      if (!vertex || !rayFrom || !rayTo) return null;
      const a0 = rayFrom.angleDeg;
      const sweep = normalizeSweep(a0, rayTo.angleDeg);
      const mid = a0 + sweep / 2;
      const lr = Math.max(sector.labelRadius, sector.arcRadius);
      expand(
        vertex.x + lr * Math.cos(mid * DEG),
        vertex.y - lr * Math.sin(mid * DEG),
      );
      expand(
        vertex.x + sector.arcRadius * Math.cos(a0 * DEG),
        vertex.y - sector.arcRadius * Math.sin(a0 * DEG),
      );
      expand(
        vertex.x + sector.arcRadius * Math.cos((a0 + sweep) * DEG),
        vertex.y - sector.arcRadius * Math.sin((a0 + sweep) * DEG),
      );
    }

    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;

    const pad = Math.max(28, maxArc * 0.35);
    const svgW = Math.max(220, width - 8);
    // Provisional scale for readable fonts (refined viewBox computed after layout).
    const provisionalSpan = Math.max(80, maxX - minX + pad * 2);
    const pxToUser = provisionalSpan / svgW;
    const labelFont = Math.max(12, TARGET_LABEL_PX * pxToUser);
    const pointFont = Math.max(11, TARGET_POINT_LABEL_PX * pxToUser);
    const strokeMain = Math.max(1.5, TARGET_STROKE_PX * pxToUser);
    const strokeArc = Math.max(1.25, 2 * pxToUser);

    const drawnEdges = new Set<string>();
    const edgeKey = (a: string, b: string) =>
      a < b ? `${a}|${b}` : `${b}|${a}`;

    const lines: React.ReactNode[] = [];

    // Owned straight-line strokes (authoritative; not inferred).
    for (const stroke of ownedStrokes) {
      const rayA = rayMap.get(stroke.rayA);
      const rayB = rayMap.get(stroke.rayB);
      if (!rayA || !rayB) return null;
      const endA = rayEndpoint(rayA);
      const endB = rayEndpoint(rayB);
      if (!endA || !endB) return null;
      lines.push(
        <Line
          key={`owned-${stroke.id}`}
          x1={endA.x}
          y1={endA.y}
          x2={endB.x}
          y2={endB.y}
          stroke={DIAGRAM.stroke}
          strokeWidth={strokeMain}
        />,
      );
      drawnEdges.add(edgeKey(rayA.origin, stroke.vertex));
      drawnEdges.add(edgeKey(rayB.origin, stroke.vertex));
      const endVertexA = findRayTargetVertex(rayA, vertexMap);
      const endVertexB = findRayTargetVertex(rayB, vertexMap);
      if (endVertexA) drawnEdges.add(edgeKey(stroke.vertex, endVertexA));
      if (endVertexB) drawnEdges.add(edgeKey(stroke.vertex, endVertexB));
    }

    // Polygon sides from polygons_display (needed even when stroke suppressed flag
    // is set — pupils still need triangle edges; owned strokes cover extras).
    for (const poly of polygonsDisplay) {
      for (let i = 0; i < poly.length; i += 1) {
        const a = poly[i]!;
        const b = poly[(i + 1) % poly.length]!;
        const key = edgeKey(a, b);
        if (drawnEdges.has(key)) continue;
        const va = transformedVertices.get(a);
        const vb = transformedVertices.get(b);
        if (!va || !vb) return null;
        lines.push(
          <Line
            key={`poly-${key}`}
            x1={va.x}
            y1={va.y}
            x2={vb.x}
            y2={vb.y}
            stroke={DIAGRAM.stroke}
            strokeWidth={strokeMain}
          />,
        );
        drawnEdges.add(key);
      }
    }

    for (const ray of rays) {
      const origin = transformedVertices.get(ray.origin);
      const end = rayEndpoint(ray);
      if (!origin || !end) return null;
      const target = findRayTargetVertex(ray, vertexMap);
      if (target && drawnEdges.has(edgeKey(ray.origin, target))) continue;
      lines.push(
        <Line
          key={`ray-${ray.id}`}
          x1={origin.x}
          y1={origin.y}
          x2={end.x}
          y2={end.y}
          stroke={DIAGRAM.stroke}
          strokeWidth={strokeMain}
        />,
      );
    }

    const arcs: React.ReactNode[] = [];
    const labels: React.ReactNode[] = [];

    // Build right-angle marker geometry first (obstacles for annotation layout).
    const rightAngleGeoms: RightAngleGeom[] = [];
    for (let i = 0; i < rightAngleMarkers.length; i += 1) {
      const m = rightAngleMarkers[i]!;
      const vertex = transformedVertices.get(m.vertex);
      const rayFrom = rayMap.get(m.rayFrom);
      const rayTo = rayMap.get(m.rayTo);
      if (!vertex || !rayFrom || !rayTo) return null;
      const size = m.size ?? Math.max(14, maxArc * 0.35);
      const p1 = {
        x: vertex.x + size * Math.cos(rayFrom.angleDeg * DEG),
        y: vertex.y - size * Math.sin(rayFrom.angleDeg * DEG),
      };
      const p2 = {
        x: p1.x + size * Math.cos(rayTo.angleDeg * DEG),
        y: p1.y - size * Math.sin(rayTo.angleDeg * DEG),
      };
      const p3 = {
        x: vertex.x + size * Math.cos(rayTo.angleDeg * DEG),
        y: vertex.y - size * Math.sin(rayTo.angleDeg * DEG),
      };
      rightAngleGeoms.push({
        id: `ra-${i}`,
        p1,
        p2,
        p3,
        vertex: { x: vertex.x, y: vertex.y },
      });
      arcs.push(
        <Path
          key={`ra-${i}`}
          d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`}
          fill="none"
          stroke={DIAGRAM.rightAngle}
          strokeWidth={strokeArc}
        />,
      );
    }

    const sectorGeoms: SectorGeom[] = [];
    for (const sector of resolvedSectors) {
      const vertex = transformedVertices.get(sector.vertex);
      const rayFrom = rayMap.get(sector.rayFrom);
      const rayTo = rayMap.get(sector.rayTo);
      if (!vertex || !rayFrom || !rayTo) return null;
      const a0 = rayFrom.angleDeg;
      const sweep = normalizeSweep(a0, rayTo.angleDeg);
      sectorGeoms.push({
        sectorId: sector.sectorId,
        angleId: sector.angleId,
        label: sector.label,
        vertexId: sector.vertex,
        vx: vertex.x,
        vy: vertex.y,
        a0,
        sweep,
        arcRadius: sector.arcRadius,
        labelRadius: sector.labelRadius,
      });
      if (sector.drawArc) {
        arcs.push(
          <Path
            key={`arc-${sector.sectorId}`}
            d={arcPath(
              vertex.x,
              vertex.y,
              sector.arcRadius,
              a0,
              a0 + sweep,
            )}
            fill="none"
            stroke={DIAGRAM.arc}
            strokeWidth={strokeArc}
          />,
        );
      }
    }

    for (let i = 0; i < equalSideMarks.length; i += 1) {
      const mark = equalSideMarks[i]!;
      const a = transformedVertices.get(mark.a);
      const b = transformedVertices.get(mark.b);
      if (!a || !b) continue;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const tick = Math.max(5, 6 * pxToUser);
      const nx = (-dy / len) * tick;
      const ny = (dx / len) * tick;
      arcs.push(
        <Line
          key={`eq-${i}`}
          x1={mx - nx}
          y1={my - ny}
          x2={mx + nx}
          y2={my + ny}
          stroke={DIAGRAM.marker}
          strokeWidth={strokeArc}
        />,
      );
    }

    const pointLabelSet = new Set(
      requiredPointLabels.length
        ? requiredPointLabels
        : vertices.map((v) => v.id),
    );

    // Ray angles per vertex for outward point-label placement.
    const raysByOrigin = new Map<string, number[]>();
    for (const ray of rays) {
      const list = raysByOrigin.get(ray.origin) ?? [];
      list.push(ray.angleDeg);
      raysByOrigin.set(ray.origin, list);
    }

    const pointGeoms: PointGeom[] = [];
    for (const id of pointLabelSet) {
      const v = transformedVertices.get(id);
      if (!v) continue;
      const src = vertexMap.get(id);
      const text = v.pupilLabel ?? id;
      const scale = Math.max(1, transform.scale * 0.85);
      pointGeoms.push({
        id,
        text,
        vx: v.x,
        vy: v.y,
        preferredOx: (src?.labelOffset[0] ?? 10) * scale,
        preferredOy: (src?.labelOffset[1] ?? -12) * scale,
        rayAnglesDeg: raysByOrigin.get(id) ?? [],
        isCentralO: text === 'O' || id === 'O',
      });
      labels.push(
        <Circle
          key={`ptdot-${id}`}
          cx={v.x}
          cy={v.y}
          r={Math.max(2.5, 3 * pxToUser)}
          fill={DIAGRAM.stroke}
        />,
      );
    }

    const annotation = layoutAngleAnnotations({
      sectors: sectorGeoms,
      points: pointGeoms,
      rightAngles: rightAngleGeoms,
      angleFont: labelFont,
      pointFont: pointFont,
    });

    for (const al of annotation.angleLabels) {
      expand(al.x, al.y);
      labels.push(
        <SvgText
          key={`lbl-${al.id}`}
          x={al.x}
          y={al.y}
          fill={DIAGRAM.text}
          fontSize={labelFont}
          fontWeight="700"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {al.text}
        </SvgText>,
      );
    }
    for (const pl of annotation.pointLabels) {
      expand(pl.x, pl.y);
      labels.push(
        <SvgText
          key={`pt-${pl.id}`}
          x={pl.x}
          y={pl.y}
          fill={DIAGRAM.text}
          fontSize={pointFont}
          fontWeight="700"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {pl.text}
        </SvgText>,
      );
    }

    // Recompute viewBox after annotation expansion so labels are not cropped.
    const pad2 = Math.max(28, maxArc * 0.35, labelFont * 1.2);
    const vbX2 = minX - pad2;
    const vbY2 = minY - pad2;
    const vbW2 = Math.max(80, maxX - minX + pad2 * 2);
    const vbH2 = Math.max(80, maxY - minY + pad2 * 2);
    const svgH2 = Math.min(300, (svgW * vbH2) / vbW2);

    return (
      <View style={styles.wrap}>
        <Svg
          width={svgW}
          height={svgH2}
          viewBox={`${vbX2} ${vbY2} ${vbW2} ${vbH2}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <G>
            {lines}
            {arcs}
            {labels}
          </G>
        </Svg>
        {notToScale ? (
          <Text style={styles.meta}>Diagram not to scale</Text>
        ) : null}
      </View>
    );
  } catch {
    return null;
  }
}

function applyLayoutTransform(
  x: number,
  y: number,
  t: LayoutTransform,
): { x: number; y: number } {
  const [px, py] = t.pivot;
  const [tx, ty] = t.translate;
  const rad = t.rotationDeg * DEG;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - px;
  const dy = y - py;
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;
  return {
    x: px + t.scale * rx + tx,
    y: py + t.scale * ry + ty,
  };
}

function normalizeSweep(fromDeg: number, toDeg: number): number {
  let sweep = toDeg - fromDeg;
  while (sweep <= -180) sweep += 360;
  while (sweep > 180) sweep -= 360;
  if (sweep < 0) sweep += 360;
  if (sweep > 180) sweep = sweep - 360;
  return sweep === 0 ? 0 : sweep;
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = startDeg * DEG;
  const end = endDeg * DEG;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy - r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy - r * Math.sin(end);
  const delta = endDeg - startDeg;
  const largeArc = Math.abs(delta) > 180 ? 1 : 0;
  const sweepFlag = delta >= 0 ? 0 : 1;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${x2} ${y2}`;
}

function findRayTargetVertex(
  ray: Ray,
  raw: Map<string, Vertex>,
): string | null {
  const origin = raw.get(ray.origin);
  if (!origin) return null;
  const rad = ray.angleDeg * DEG;
  const ex = origin.x + ray.length * Math.cos(rad);
  const ey = origin.y - ray.length * Math.sin(rad);
  let best: string | null = null;
  let bestDist = 24;
  for (const [id, v] of raw) {
    if (id === ray.origin) continue;
    const d = Math.hypot(v.x - ex, v.y - ey);
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best;
}

function parseAnglesPayload(data: Record<string, unknown>) {
  if (!Array.isArray(data.vertices) || !Array.isArray(data.rays)) return null;

  const vertices: Vertex[] = [];
  for (const raw of data.vertices) {
    const r = asRecord(raw);
    if (!r || typeof r.id !== 'string') return null;
    const x = asFiniteNumber(r.x);
    const y = asFiniteNumber(r.y);
    if (x == null || y == null) return null;
    const offset = Array.isArray(r.label_offset) ? r.label_offset : [10, -12];
    const ox = asFiniteNumber(offset[0]) ?? 10;
    const oy = asFiniteNumber(offset[1]) ?? -12;
    vertices.push({
      id: r.id,
      x,
      y,
      pupilLabel:
        typeof r.pupil_label === 'string' ? r.pupil_label : undefined,
      labelOffset: [ox, oy],
    });
  }

  const rays: Ray[] = [];
  for (const raw of data.rays) {
    const r = asRecord(raw);
    if (!r || typeof r.id !== 'string' || typeof r.origin !== 'string') {
      return null;
    }
    const angleDeg = asFiniteNumber(r.angle_deg_display);
    const length = asFiniteNumber(r.length);
    if (angleDeg == null || length == null) return null;
    rays.push({ id: r.id, origin: r.origin, angleDeg, length });
  }

  const lt = asRecord(data.layout_transform);
  if (!lt) return null;
  const pivot = Array.isArray(lt.pivot) ? lt.pivot : null;
  const translate = Array.isArray(lt.translate) ? lt.translate : null;
  const scale = asFiniteNumber(lt.scale);
  const rotationDeg = asFiniteNumber(lt.rotation_deg) ?? 0;
  if (
    !pivot ||
    !translate ||
    scale == null ||
    asFiniteNumber(pivot[0]) == null ||
    asFiniteNumber(pivot[1]) == null ||
    asFiniteNumber(translate[0]) == null ||
    asFiniteNumber(translate[1]) == null
  ) {
    return null;
  }

  const transform: LayoutTransform = {
    pivot: [Number(pivot[0]), Number(pivot[1])],
    scale,
    translate: [Number(translate[0]), Number(translate[1])],
    rotationDeg,
  };

  const ownedStrokes: {
    id: string;
    rayA: string;
    rayB: string;
    vertex: string;
  }[] = [];
  if (Array.isArray(data.owned_straight_line_strokes)) {
    for (const raw of data.owned_straight_line_strokes) {
      const r = asRecord(raw);
      if (!r) continue;
      if (
        typeof r.id !== 'string' ||
        typeof r.ray_a !== 'string' ||
        typeof r.ray_b !== 'string' ||
        typeof r.vertex !== 'string'
      ) {
        return null;
      }
      ownedStrokes.push({
        id: r.id,
        rayA: r.ray_a,
        rayB: r.ray_b,
        vertex: r.vertex,
      });
    }
  }

  const polygonsDisplay: string[][] = [];
  if (Array.isArray(data.polygons_display)) {
    for (const raw of data.polygons_display) {
      const r = asRecord(raw);
      if (!r || !Array.isArray(r.vertices)) continue;
      const ids = r.vertices.filter((v): v is string => typeof v === 'string');
      if (ids.length >= 3) polygonsDisplay.push(ids);
    }
  }

  const requiredPointLabels = Array.isArray(data.required_point_labels)
    ? data.required_point_labels.filter((x): x is string => typeof x === 'string')
    : [];

  const rightAngleMarkers: {
    vertex: string;
    rayFrom: string;
    rayTo: string;
    size?: number;
  }[] = [];
  if (Array.isArray(data.right_angle_markers)) {
    for (const raw of data.right_angle_markers) {
      const r = asRecord(raw);
      if (!r) continue;
      const vertex =
        typeof r.vertex === 'string'
          ? r.vertex
          : typeof r.at === 'string'
            ? r.at
            : null;
      const rayFrom =
        typeof r.ray_from === 'string'
          ? r.ray_from
          : typeof r.ray_a === 'string'
            ? r.ray_a
            : null;
      const rayTo =
        typeof r.ray_to === 'string'
          ? r.ray_to
          : typeof r.ray_b === 'string'
            ? r.ray_b
            : null;
      if (!vertex || !rayFrom || !rayTo) return null;
      rightAngleMarkers.push({
        vertex,
        rayFrom,
        rayTo,
        size: asFiniteNumber(r.size) ?? undefined,
      });
    }
  }

  const equalSideMarks: { a: string; b: string }[] = [];
  if (Array.isArray(data.equal_side_marks)) {
    for (const raw of data.equal_side_marks) {
      const r = asRecord(raw);
      if (!r) continue;
      const side = Array.isArray(r.side)
        ? r.side
        : Array.isArray(r.vertices)
          ? r.vertices
          : null;
      if (side && typeof side[0] === 'string' && typeof side[1] === 'string') {
        equalSideMarks.push({ a: side[0], b: side[1] });
      }
    }
  }

  return {
    vertices,
    rays,
    transform,
    ownedStrokes,
    polygonsDisplay,
    requiredPointLabels,
    rightAngleMarkers,
    equalSideMarks,
    notToScale:
      data.not_to_scale === true || data.not_to_scale_required === true,
  };
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 6,
    alignItems: 'center',
  },
  meta: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: DIAGRAM.textMuted,
  },
});
