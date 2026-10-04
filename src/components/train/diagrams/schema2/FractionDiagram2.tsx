import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { fonts } from '@/theme';
import { DIAGRAM } from '../colors';
import { asNonNegInt, asPositiveInt, asRecord } from '../guards';
import {
  formatFraction,
  parseFractionLoose,
  rectangleGridLayout,
  resolveOperandSegments,
  segmentFill,
  tonesForOperation,
  wedgePath,
  type SegmentTone,
} from './fractionUtils';

type Props = {
  data: Record<string, unknown>;
  width: number;
};

export function FractionDiagram2({ data, width }: Props): React.ReactElement | null {
  const visualType =
    typeof data.visual_type === 'string' ? data.visual_type : null;
  if (!visualType) return null;
  const w = Math.max(200, width);

  try {
    switch (visualType) {
      case 'circle_model':
        return renderCircle(data, w);
      case 'bar_model':
        return renderBar(data, w);
      case 'fraction_strip':
        return renderStrip(data, w);
      case 'shaded_rectangle':
        return renderShadedRect(data, w);
      case 'number_line':
        return renderFractionNumberLine(data, w);
      case 'set_model':
        return renderSet(data, w);
      case 'array_model':
        return renderArray(data, w);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function LabelRow({
  left,
  right,
  hint,
}: {
  left?: string;
  right?: string;
  hint?: string;
}) {
  return (
    <View style={styles.labels}>
      {left ? <Text style={styles.labelText}>{left}</Text> : null}
      {right ? <Text style={styles.labelText}>{right}</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function CirclePie({
  tones,
  size,
}: {
  tones: SegmentTone[];
  size: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const den = Math.max(1, tones.length);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill={DIAGRAM.unshaded}
        stroke={DIAGRAM.stroke}
        strokeWidth={2}
      />
      {tones.map((tone, index) => {
        const start = -Math.PI / 2 + (index / den) * Math.PI * 2;
        const end = -Math.PI / 2 + ((index + 1) / den) * Math.PI * 2;
        return (
          <Path
            key={index}
            d={wedgePath(cx, cy, r, start, end)}
            fill={tone ? segmentFill(tone) : 'transparent'}
            stroke={DIAGRAM.stroke}
            strokeWidth={1.2}
          />
        );
      })}
    </Svg>
  );
}

function renderCircle(data: Record<string, unknown>, width: number) {
  const segs = resolveOperandSegments(data);
  if (!segs) return null;
  const size = Math.min(160, width * 0.42);

  if (segs.dualPanel && segs.segB) {
    const tonesA = Array.from({ length: segs.denominator }, (_, i) =>
      i < segs.segA.numerator ? ('a' as const) : false,
    );
    const tonesB = Array.from({ length: segs.denominator }, (_, i) =>
      i < segs.segB!.numerator ? ('b' as const) : false,
    );
    return (
      <View style={styles.wrap}>
        <View style={styles.row}>
          <View style={styles.panel}>
            <CirclePie tones={tonesA} size={size} />
            <Text style={styles.labelText}>{formatFraction(segs.displayA)}</Text>
          </View>
          <View style={styles.panel}>
            <CirclePie tones={tonesB} size={size} />
            <Text style={styles.labelText}>
              {formatFraction(segs.displayB!)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const tones = tonesForOperation(data, segs);
  return (
    <View style={styles.wrap}>
      <CirclePie tones={tones} size={Math.min(180, width * 0.55)} />
      <LabelRow
        left={formatFraction(segs.displayA)}
        right={segs.displayB ? formatFraction(segs.displayB) : undefined}
      />
    </View>
  );
}

function BarSegments({
  tones,
  width,
  height = 44,
}: {
  tones: SegmentTone[];
  width: number;
  height?: number;
}) {
  const n = Math.max(1, tones.length);
  const segW = width / n;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={6}
        fill="transparent"
        stroke={DIAGRAM.stroke}
        strokeWidth={2}
      />
      {tones.map((tone, i) => (
        <Rect
          key={i}
          x={i * segW}
          y={1}
          width={Math.max(1, segW - 0.5)}
          height={height - 2}
          fill={segmentFill(tone)}
          stroke={DIAGRAM.strokeMuted}
          strokeWidth={0.5}
        />
      ))}
    </Svg>
  );
}

function renderFoaBarPanel(
  panel: Record<string, unknown>,
  width: number,
  title?: string,
) {
  const groupsTotal = asPositiveInt(panel.groups_total);
  const groupsShaded = asNonNegInt(panel.groups_shaded);
  if (groupsTotal == null || groupsShaded == null) return null;
  const tones: SegmentTone[] = Array.from({ length: groupsTotal }, (_, i) =>
    i < groupsShaded ? 'a' : false,
  );
  const amount = asPositiveInt(panel.amount_total);
  const frac = parseFractionLoose(panel.operand_a);
  return (
    <View style={styles.panel}>
      {title ? <Text style={styles.hint}>{title}</Text> : null}
      <BarSegments tones={tones} width={width} />
      <LabelRow
        left={frac ? formatFraction(frac) : undefined}
        right={amount != null ? `of ${amount}` : undefined}
      />
    </View>
  );
}

function renderBar(data: Record<string, unknown>, width: number) {
  const foaPanels = Array.isArray(data.foa_panels) ? data.foa_panels : null;
  if (foaPanels && foaPanels.length > 0) {
    const panelW = Math.max(160, width - 8);
    return (
      <View style={styles.wrap}>
        {foaPanels.map((raw, i) => {
          const panel = asRecord(raw);
          if (!panel) return null;
          const id =
            typeof panel.panel_id === 'string' ? panel.panel_id : `Panel ${i + 1}`;
          return (
            <React.Fragment key={id}>
              {renderFoaBarPanel(panel, panelW, id)}
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  const stages = Array.isArray(data.stages) ? data.stages : null;
  if (stages && stages.length > 0) {
    return (
      <View style={styles.wrap}>
        {stages.map((raw, i) => {
          const st = asRecord(raw);
          if (!st) return null;
          const label = typeof st.label === 'string' ? st.label : `Stage ${i + 1}`;
          const fraction =
            typeof st.fraction === 'string' ? st.fraction : undefined;
          return (
            <View key={`stage-${i}`} style={styles.stageCard}>
              <Text style={styles.labelText}>{label}</Text>
              {fraction ? <Text style={styles.hint}>{fraction}</Text> : null}
              <View
                style={[
                  styles.stageBar,
                  {
                    backgroundColor:
                      st.type === 'loss' ? 'rgba(248,113,113,0.35)' : DIAGRAM.shadeA,
                  },
                ]}
              />
            </View>
          );
        })}
        {asPositiveInt(data.final_amount_label) != null ? (
          <Text style={styles.hint}>Final amount label present</Text>
        ) : null}
      </View>
    );
  }

  // FOA single bar
  if (
    data.operation === 'fraction_of_amount' ||
    asPositiveInt(data.groups_total) != null
  ) {
    const rendered = renderFoaBarPanel(data, Math.max(180, width - 8));
    if (rendered) return <View style={styles.wrap}>{rendered}</View>;
  }

  const segs = resolveOperandSegments(data);
  if (!segs) return null;
  const barW = Math.max(180, width - 8);

  if (segs.dualPanel && segs.segB) {
    const tonesA = Array.from({ length: segs.denominator }, (_, i) =>
      i < segs.segA.numerator ? ('a' as const) : false,
    );
    const tonesB = Array.from({ length: segs.denominator }, (_, i) =>
      i < segs.segB!.numerator ? ('b' as const) : false,
    );
    return (
      <View style={styles.wrap}>
        <BarSegments tones={tonesA} width={barW} />
        <Text style={styles.labelText}>{formatFraction(segs.displayA)}</Text>
        <BarSegments tones={tonesB} width={barW} />
        <Text style={styles.labelText}>{formatFraction(segs.displayB!)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <BarSegments tones={tonesForOperation(data, segs)} width={barW} />
      <LabelRow
        left={formatFraction(segs.displayA)}
        right={segs.displayB ? formatFraction(segs.displayB) : undefined}
      />
    </View>
  );
}

function renderStrip(data: Record<string, unknown>, width: number) {
  const segs = resolveOperandSegments(data);
  if (!segs) return null;
  const barW = Math.max(180, width - 8);
  if (segs.dualPanel && segs.segB) {
    const tonesA = Array.from({ length: segs.denominator }, (_, i) =>
      i < segs.segA.numerator ? ('a' as const) : false,
    );
    const tonesB = Array.from({ length: segs.denominator }, (_, i) =>
      i < segs.segB!.numerator ? ('b' as const) : false,
    );
    return (
      <View style={styles.wrap}>
        <BarSegments tones={tonesA} width={barW} height={36} />
        <Text style={styles.labelText}>{formatFraction(segs.displayA)}</Text>
        <BarSegments tones={tonesB} width={barW} height={36} />
        <Text style={styles.labelText}>{formatFraction(segs.displayB!)}</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <BarSegments tones={tonesForOperation(data, segs)} width={barW} height={36} />
      <LabelRow
        left={formatFraction(segs.displayA)}
        right={segs.displayB ? formatFraction(segs.displayB) : undefined}
      />
    </View>
  );
}

function renderShadedRect(data: Record<string, unknown>, width: number) {
  const segs = resolveOperandSegments(data);
  if (!segs) return null;
  const layout = rectangleGridLayout(segs.denominator);
  if (!layout) return null;

  const renderGrid = (tones: SegmentTone[], label: string) => {
    const cell = Math.max(18, Math.min(36, (width - 16) / layout.cols - 2));
    const gw = layout.cols * (cell + 2);
    const gh = layout.rows * (cell + 2);
    return (
      <View style={styles.panel}>
        <Svg width={gw} height={gh} viewBox={`0 0 ${gw} ${gh}`}>
          {tones.map((tone, index) => {
            const row = Math.floor(index / layout.cols);
            const col = index % layout.cols;
            return (
              <Rect
                key={index}
                x={col * (cell + 2)}
                y={row * (cell + 2)}
                width={cell}
                height={cell}
                rx={3}
                fill={segmentFill(tone)}
                stroke={DIAGRAM.stroke}
                strokeWidth={1}
              />
            );
          })}
        </Svg>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    );
  };

  if (segs.dualPanel && segs.segB) {
    const tonesA = Array.from({ length: segs.denominator }, (_, i) =>
      i < segs.segA.numerator ? ('a' as const) : false,
    );
    const tonesB = Array.from({ length: segs.denominator }, (_, i) =>
      i < segs.segB!.numerator ? ('b' as const) : false,
    );
    return (
      <View style={[styles.wrap, styles.row]}>
        {renderGrid(tonesA, formatFraction(segs.displayA))}
        {renderGrid(tonesB, formatFraction(segs.displayB!))}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {renderGrid(
        tonesForOperation(data, segs),
        [
          formatFraction(segs.displayA),
          segs.displayB ? formatFraction(segs.displayB) : null,
        ]
          .filter(Boolean)
          .join(' · '),
      )}
    </View>
  );
}

function renderFractionNumberLine(data: Record<string, unknown>, width: number) {
  const segs = resolveOperandSegments(data);
  if (!segs) return null;
  const den = segs.denominator;
  const w = Math.max(220, width - 8);
  const h = 78;
  const pad = 24;
  const y = 36;
  const xFor = (t: number) => pad + t * (w - pad * 2);

  const aEnd = segs.segA.numerator / den;
  const bLen = segs.segB ? segs.segB.numerator / den : 0;

  return (
    <View style={styles.wrap}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Line
          x1={pad}
          y1={y}
          x2={w - pad}
          y2={y}
          stroke={DIAGRAM.stroke}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {aEnd > 0 ? (
          <Line
            x1={xFor(0)}
            y1={y}
            x2={xFor(aEnd)}
            y2={y}
            stroke={DIAGRAM.shadeA}
            strokeWidth={8}
            strokeLinecap="round"
          />
        ) : null}
        {bLen > 0 && !segs.dualPanel ? (
          <Line
            x1={xFor(aEnd)}
            y1={y}
            x2={xFor(Math.min(1, aEnd + bLen))}
            y2={y}
            stroke={DIAGRAM.shadeB}
            strokeWidth={8}
            strokeLinecap="round"
          />
        ) : null}
        {segs.dualPanel && segs.segB ? (
          <Line
            x1={xFor(0)}
            y1={y + 14}
            x2={xFor(segs.segB.numerator / den)}
            y2={y + 14}
            stroke={DIAGRAM.shadeB}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ) : null}
        {Array.from({ length: den + 1 }, (_, i) => {
          const x = xFor(i / den);
          return (
            <React.Fragment key={i}>
              <Line
                x1={x}
                y1={y - 10}
                x2={x}
                y2={y + 10}
                stroke={DIAGRAM.text}
                strokeWidth={2}
              />
              {(i === 0 || i === den) && (
                <SvgText
                  x={x}
                  y={y + 28}
                  fill={DIAGRAM.text}
                  fontSize="11"
                  textAnchor="middle"
                >
                  {i === 0 ? '0' : '1'}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
      <LabelRow
        left={formatFraction(segs.displayA)}
        right={segs.displayB ? formatFraction(segs.displayB) : undefined}
      />
    </View>
  );
}

function renderSet(data: Record<string, unknown>, width: number) {
  const foaPanels = Array.isArray(data.foa_panels) ? data.foa_panels : null;
  if (foaPanels?.length) {
    return (
      <View style={styles.wrap}>
        {foaPanels.map((raw, i) => {
          const p = asRecord(raw);
          if (!p) return null;
          return (
            <React.Fragment key={i}>
              {renderSetPanel(p, width, typeof p.panel_id === 'string' ? p.panel_id : undefined)}
            </React.Fragment>
          );
        })}
      </View>
    );
  }
  return renderSetPanel(data, width);
}

function renderSetPanel(
  data: Record<string, unknown>,
  width: number,
  title?: string,
) {
  const groupsTotal = asPositiveInt(data.groups_total);
  const groupsShaded = asNonNegInt(data.groups_shaded) ?? 0;
  const perGroup = asPositiveInt(data.amount_per_group) ?? 1;
  if (groupsTotal == null) return null;

  const r = 7;
  const gap = 4;
  const groupGap = 14;
  const dotsPerRow = Math.min(perGroup, 8);
  const groupW = dotsPerRow * (r * 2 + gap);
  const rowsPerGroup = Math.ceil(perGroup / dotsPerRow);
  const groupH = rowsPerGroup * (r * 2 + gap);
  const groupsPerRow = Math.max(1, Math.floor((width - 8) / (groupW + groupGap)));
  const rows = Math.ceil(groupsTotal / groupsPerRow);
  const svgW = Math.max(width - 8, groupsPerRow * (groupW + groupGap));
  const svgH = rows * (groupH + groupGap) + 8;

  const nodes: React.ReactNode[] = [];
  for (let g = 0; g < groupsTotal; g += 1) {
    const gr = Math.floor(g / groupsPerRow);
    const gc = g % groupsPerRow;
    const ox = gc * (groupW + groupGap) + r + 4;
    const oy = gr * (groupH + groupGap) + r + 4;
    const shaded = g < groupsShaded;
    for (let d = 0; d < perGroup; d += 1) {
      const dr = Math.floor(d / dotsPerRow);
      const dc = d % dotsPerRow;
      nodes.push(
        <Circle
          key={`${g}-${d}`}
          cx={ox + dc * (r * 2 + gap)}
          cy={oy + dr * (r * 2 + gap)}
          r={r}
          fill={shaded ? DIAGRAM.shadeA : DIAGRAM.unshaded}
          stroke={DIAGRAM.stroke}
          strokeWidth={1.2}
        />,
      );
    }
  }

  const frac = parseFractionLoose(data.operand_a);
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.hint}>{title}</Text> : null}
      <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        {nodes}
      </Svg>
      <LabelRow
        left={frac ? formatFraction(frac) : undefined}
        right={
          asPositiveInt(data.amount_total) != null
            ? `total ${data.amount_total}`
            : undefined
        }
      />
    </View>
  );
}

function renderArray(data: Record<string, unknown>, width: number) {
  const foaPanels = Array.isArray(data.foa_panels) ? data.foa_panels : null;
  if (foaPanels?.length) {
    return (
      <View style={styles.wrap}>
        {foaPanels.map((raw, i) => {
          const p = asRecord(raw);
          if (!p) return null;
          return (
            <React.Fragment key={i}>
              {renderArrayPanel(p, width)}
            </React.Fragment>
          );
        })}
      </View>
    );
  }
  return renderArrayPanel(data, width);
}

function renderArrayPanel(data: Record<string, unknown>, width: number) {
  const rows = asPositiveInt(data.array_rows);
  const cols = asPositiveInt(data.array_cols);
  const groupsShaded = asNonNegInt(data.groups_shaded) ?? 0;
  const axis = data.partition_axis === 'cols' ? 'cols' : 'rows';
  if (rows == null || cols == null) return null;

  const cell = Math.max(12, Math.min(28, (width - 16) / cols - 2));
  const gw = cols * (cell + 2);
  const gh = rows * (cell + 2);
  const nodes: React.ReactNode[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const shaded = axis === 'rows' ? r < groupsShaded : c < groupsShaded;
      nodes.push(
        <Rect
          key={`${r}-${c}`}
          x={c * (cell + 2)}
          y={r * (cell + 2)}
          width={cell}
          height={cell}
          rx={2}
          fill={shaded ? DIAGRAM.shadeA : DIAGRAM.unshaded}
          stroke={DIAGRAM.stroke}
          strokeWidth={1}
        />,
      );
    }
  }
  const frac = parseFractionLoose(data.operand_a);
  return (
    <View style={styles.wrap}>
      <Svg width={gw} height={gh} viewBox={`0 0 ${gw} ${gh}`}>
        {nodes}
      </Svg>
      <LabelRow left={frac ? formatFraction(frac) : undefined} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  panel: {
    alignItems: 'center',
    gap: 6,
  },
  labels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  labelText: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    color: DIAGRAM.text,
  },
  hint: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: DIAGRAM.textMuted,
  },
  stageCard: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DIAGRAM.strokeMuted,
    padding: 8,
    gap: 6,
  },
  stageBar: {
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: DIAGRAM.stroke,
  },
});
