import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/theme';
import { DIAGRAM } from '../colors';
import {
  joinExpressionTokens,
  parseBidmasErrorPanel,
} from './parseBidmasErrorPanel';

type Props = {
  data: Record<string, unknown>;
  width: number;
};

/**
 * BIDMAS ERR diagram — public `bid_error_panel` / `bidmas_error_diagnosis`.
 *
 * Shows the shared expression and labelled working panels exactly as supplied.
 * Does not evaluate steps, invent verdicts, or expose MCQ answer keys.
 * When `highlight_fault_panel` is set, emphasises that panel without naming a
 * correct option. When `reveal_verdict` is false (all approved Medium ERR
 * payloads), no verdict chrome is shown.
 *
 * MCQ rows and stems remain owned by TrainQuizPlayer.
 */
export function BidmasErrorPanel({
  data,
  width,
}: Props): React.ReactElement | null {
  const parsed = useMemo(() => parseBidmasErrorPanel(data), [data]);
  if (!parsed) return null;

  const expression = joinExpressionTokens(parsed.expressionTokens);
  if (!expression.trim()) return null;

  // Fail closed if payload asks to reveal a verdict without a fault panel —
  // never invent which working is wrong/correct.
  if (parsed.revealVerdict && !parsed.highlightFaultPanel) {
    return null;
  }

  const maxWidth = Math.max(200, width);

  return (
    <View
      style={[styles.wrap, { maxWidth }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={parsed.accessibilityText}
      importantForAccessibility="yes"
    >
      <View style={styles.expressionCard}>
        <Text style={styles.expressionText}>{expression}</Text>
      </View>

      <View style={styles.panelsRow}>
        {parsed.panels.map((panel) => {
          const emphasised =
            parsed.highlightFaultPanel != null &&
            panel.label === parsed.highlightFaultPanel;
          return (
            <View
              key={panel.label}
              style={[styles.panel, emphasised && styles.panelEmphasised]}
            >
              <Text style={styles.panelLabel}>{panel.label}</Text>
              {panel.steps.map((step, index) => (
                <Text key={`${panel.label}-${index}`} style={styles.stepText}>
                  {step}
                </Text>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  expressionCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIAGRAM.strokeMuted,
    backgroundColor: DIAGRAM.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  expressionText: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: DIAGRAM.text,
    flexWrap: 'wrap',
  },
  panelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  panel: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIAGRAM.strokeMuted,
    backgroundColor: DIAGRAM.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  panelEmphasised: {
    borderColor: DIAGRAM.marker,
  },
  panelLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '700',
    color: DIAGRAM.text,
    marginBottom: 2,
  },
  stepText: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '500',
    color: DIAGRAM.text,
    lineHeight: 22,
    flexWrap: 'wrap',
  },
});
