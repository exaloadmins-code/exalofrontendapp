import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { joinFixedTokens } from './formatAssociationTree';
import { parseBidmasGroupPlacements } from './parseBidmasGroupPlacements';

type Props = {
  data: Record<string, unknown>;
  width: number;
};

/**
 * BIDMAS PLACE/OPT diagram — public diagram_data only.
 *
 * BIDMAS-13H: PLACE no longer paints a visible expression panel (the stem
 * already states the expression). The renderer still parses + validates
 * diagram_data and exposes accessibility_text to assistive tech only.
 *
 * Does NOT own MCQ rows, stems, or instructional paragraphs — those belong
 * to TrainQuizPlayer (BIDMAS-13G Train UI parity).
 *
 * Never evaluates trees, never reads _audit / answer keys / option totals.
 */
export function BidmasGroupPlacements({
  data,
  width: _width,
}: Props): React.ReactElement | null {
  const parsed = useMemo(() => parseBidmasGroupPlacements(data), [data]);
  if (!parsed) return null;

  // Validate fixed_tokens can form an expression (fail closed) without painting UI.
  try {
    const expression = joinFixedTokens(parsed.fixedTokens);
    if (!expression.trim()) return null;
  } catch {
    return null;
  }

  // Zero-size a11y-only host: keeps DiagramDispatcher from treating a null
  // return as UnsupportedDiagram, without blank cards or vertical chrome.
  return (
    <View
      style={styles.a11yOnly}
      accessible
      accessibilityRole="image"
      accessibilityLabel={parsed.accessibilityText}
      importantForAccessibility="yes"
    />
  );
}

const styles = StyleSheet.create({
  a11yOnly: {
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
});
