import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { fonts } from '@/theme';
import { DIAGRAM } from '../colors';
import { asFiniteNumber, asPositiveInt, asRecord } from '../guards';
import { isNumberStyleNumberLine } from '../registry';
import { FractionDiagram2 } from './FractionDiagram2';

type Props = {
  data: Record<string, unknown>;
  width: number;
};

export function NumberDiagram2({ data, width }: Props): React.ReactElement | null {
  const visualType =
    typeof data.visual_type === 'string' ? data.visual_type : null;
  if (!visualType) return null;

  try {
    switch (visualType) {
      case 'number_line':
        if (isNumberStyleNumberLine(data)) {
          return renderNumberNumberLine(data, width);
        }
        // Fraction operand-based number_line must not use start/end renderer.
        return <FractionDiagram2 data={data} width={width} />;
      case 'magnitude_bar':
        return renderMagnitudeBar(data, width);
      case 'pictorial_quantity':
        return renderPictorial(data, width);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function renderNumberNumberLine(data: Record<string, unknown>, width: number) {
  const start = asFiniteNumber(data.start);
  const end = asFiniteNumber(data.end);
  if (start == null || end == null || end === start) return null;

  const ticks = Array.isArray(data.ticks)
    ? data.ticks.map((t) => Number(t)).filter((n) => Number.isFinite(n))
    : [];
  const marked = Array.isArray(data.marked_values)
    ? data.marked_values.map((t) => Number(t)).filter((n) => Number.isFinite(n))
    : [];
  const labels = Array.isArray(data.labels) ? data.labels : [];

  const w = Math.max(220, width - 8);
  const h = 80;
  const pad = 28;
  const y = 34;
  const scale = (value: number) =>
    pad + ((value - start) / (end - start)) * (w - pad * 2);

  const tickSet = ticks.length
    ? ticks
    : Array.from({ length: 5 }, (_, i) => start + ((end - start) * i) / 4);

  return (
    <View style={styles.wrap}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Line
          x1={pad}
          y1={y}
          x2={w - pad}
          y2={y}
          stroke={DIAGRAM.stroke}
          strokeWidth={2}
        />
        {tickSet.map((tick) => {
          const x = scale(tick);
          const isMarked = marked.includes(tick);
          return (
            <React.Fragment key={`tick-${tick}`}>
              <Line
                x1={x}
                y1={y - 8}
                x2={x}
                y2={y + 8}
                stroke={DIAGRAM.stroke}
                strokeWidth={2}
              />
              {isMarked ? (
                <Circle cx={x} cy={y} r={5} fill={DIAGRAM.shadeB} />
              ) : null}
              <SvgText
                x={x}
                y={y + 24}
                fill={DIAGRAM.text}
                fontSize="10"
                textAnchor="middle"
              >
                {String(tick)}
              </SvgText>
            </React.Fragment>
          );
        })}
        {marked
          .filter((m) => !tickSet.includes(m))
          .map((m) => (
            <Circle key={`m-${m}`} cx={scale(m)} cy={y} r={5} fill={DIAGRAM.shadeA} />
          ))}
      </Svg>
      {labels.length ? (
        <Text style={styles.hint}>{labels.map(String).join(' · ')}</Text>
      ) : null}
    </View>
  );
}

function renderMagnitudeBar(data: Record<string, unknown>, width: number) {
  const values = Array.isArray(data.values)
    ? data.values.map((v) => asFiniteNumber(v)).filter((n): n is number => n != null)
    : [];
  const barLengths = Array.isArray(data.bar_lengths)
    ? data.bar_lengths.map((v) => asFiniteNumber(v)).filter((n): n is number => n != null)
    : [];
  const labels = Array.isArray(data.labels) ? data.labels.map(String) : [];
  if (!values.length || barLengths.length !== values.length) return null;

  const maxLen = Math.max(...barLengths, 1);
  const maxValue = asFiniteNumber(data.max_value) ?? Math.max(...values, 1);
  const w = Math.max(200, width - 8);
  const rowH = 28;
  const gap = 10;
  const labelW = 64;
  const barMax = w - labelW - 12;
  const h = values.length * (rowH + gap);

  return (
    <View style={styles.wrap}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {values.map((value, i) => {
          const y = i * (rowH + gap);
          const len = (barLengths[i]! / maxLen) * barMax;
          // shared_scale: bar_lengths already on shared scale — do not distort
          void maxValue;
          return (
            <React.Fragment key={i}>
              <Rect
                x={labelW}
                y={y}
                width={Math.max(2, len)}
                height={rowH}
                rx={6}
                fill={i % 2 === 0 ? DIAGRAM.shadeA : DIAGRAM.shadeB}
                stroke={DIAGRAM.stroke}
                strokeWidth={1}
              />
              <SvgText
                x={labelW - 6}
                y={y + rowH / 2 + 4}
                fill={DIAGRAM.text}
                fontSize="11"
                textAnchor="end"
              >
                {labels[i] ?? String(value)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

/**
 * Pictorial quantity: cluster counts can be very large (100s).
 * Draw a capped icon sample proportional to clusters and always show
 * authoritative value labels from the payload.
 */
function renderPictorial(data: Record<string, unknown>, width: number) {
  const groups = Array.isArray(data.groups) ? data.groups : [];
  const labels = Array.isArray(data.labels) ? data.labels.map(String) : [];
  if (!groups.length) return null;

  const MAX_ICONS = 40;
  const parsed = groups
    .map((raw) => {
      const g = asRecord(raw);
      if (!g) return null;
      const value = asFiniteNumber(g.value);
      const clusters = asPositiveInt(g.clusters);
      const perCluster = asPositiveInt(g.per_cluster) ?? 1;
      if (value == null || clusters == null) return null;
      return { value, clusters, perCluster };
    })
    .filter((g): g is NonNullable<typeof g> => g != null);
  if (!parsed.length) return null;

  const maxClusters = Math.max(...parsed.map((g) => g.clusters));
  const w = Math.max(200, width - 8);

  return (
    <View style={styles.wrap}>
      {parsed.map((g, i) => {
        const iconCount =
          maxClusters <= MAX_ICONS
            ? g.clusters
            : Math.max(1, Math.round((g.clusters / maxClusters) * MAX_ICONS));
        const r = 5;
        const gap = 3;
        const cols = Math.min(iconCount, 20);
        const rows = Math.ceil(iconCount / cols);
        const svgW = cols * (r * 2 + gap) + 4;
        const svgH = rows * (r * 2 + gap) + 4;
        const nodes: React.ReactNode[] = [];
        for (let n = 0; n < iconCount; n += 1) {
          const row = Math.floor(n / cols);
          const col = n % cols;
          nodes.push(
            <Circle
              key={n}
              cx={r + 2 + col * (r * 2 + gap)}
              cy={r + 2 + row * (r * 2 + gap)}
              r={r}
              fill={i % 2 === 0 ? DIAGRAM.shadeA : DIAGRAM.shadeB}
              stroke={DIAGRAM.stroke}
              strokeWidth={1}
            />,
          );
        }
        return (
          <View key={i} style={styles.pictorialRow}>
            <Text style={styles.label}>
              {labels[i] ?? String(g.value)}
              {iconCount < g.clusters
                ? `  (${g.clusters}×${g.perCluster})`
                : `  (${g.clusters}×${g.perCluster})`}
            </Text>
            <Svg width={Math.min(w, svgW)} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
              {nodes}
            </Svg>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  hint: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: DIAGRAM.textMuted,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    color: DIAGRAM.text,
  },
  pictorialRow: {
    width: '100%',
    gap: 4,
    alignItems: 'flex-start',
  },
});
