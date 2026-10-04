import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/theme';

type Props = {
  diagramPrompt?: string | null;
  diagramType?: string | null;
  schemaVersion?: string | null;
  visualType?: string | null;
  reason?: 'unsupported' | 'invalid' | string | null;
};

export function UnsupportedDiagram({
  diagramPrompt,
  diagramType,
  schemaVersion,
  visualType,
  reason = 'unsupported',
}: Props) {
  const unsupportedLabel = [diagramType, visualType, schemaVersion]
    .filter(Boolean)
    .join(' · ');
  const title =
    reason === 'invalid' ? 'Diagram unavailable' : 'Diagram required';
  const body =
    reason === 'invalid'
      ? `This question's diagram data could not be interpreted safely${
          unsupportedLabel ? ` (${unsupportedLabel})` : ''
        }. The visual is required to answer correctly.`
      : `This question includes a diagram${
          unsupportedLabel ? ` (${unsupportedLabel})` : ''
        } that the app cannot render yet. The visual is required to answer correctly — try another topic or question set for now.`;

  return (
    <View style={styles.wrap} accessibilityRole="text">
      {diagramPrompt ? <Text style={styles.prompt}>{diagramPrompt}</Text> : null}
      <View style={styles.unsupported}>
        <Text style={styles.unsupportedTitle}>{title}</Text>
        <Text style={styles.unsupportedBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    marginBottom: 4,
    gap: 8,
  },
  prompt: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(221, 214, 254, 0.85)',
  },
  unsupported: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.55)',
    backgroundColor: 'rgba(154, 52, 18, 0.25)',
    padding: 12,
    gap: 6,
  },
  unsupportedTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    color: '#FDBA74',
  },
  unsupportedBody: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 237, 213, 0.92)',
    lineHeight: 17,
  },
});
