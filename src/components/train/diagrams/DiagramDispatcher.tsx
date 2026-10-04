import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/theme';
import { AreaDiagramV1 } from './area/AreaDiagramV1';
import { AnglesDiagramV1 } from './angles/AnglesDiagramV1';
import {
  isFractionStyleNumberLine,
  isNumberStyleNumberLine,
  lookupDiagramFamily,
} from './registry';
import { FractionDiagram2 } from './schema2/FractionDiagram2';
import { NumberDiagram2 } from './schema2/NumberDiagram2';
import { UnsupportedDiagram } from './UnsupportedDiagram';

type Props = {
  hasDiagram?: boolean;
  diagramType?: string | null;
  diagramPrompt?: string | null;
  diagramData?: Record<string, unknown> | null;
  width: number;
};

/**
 * Dispatches Train diagrams on diagram_data.schema_version + visual_type.
 * Unknown combinations and malformed payloads fail closed with a visible state.
 */
export function DiagramDispatcher({
  hasDiagram,
  diagramType,
  diagramPrompt,
  diagramData,
  width,
}: Props) {
  if (!hasDiagram) return null;

  const schemaVersion =
    diagramData && typeof diagramData.schema_version === 'string'
      ? diagramData.schema_version
      : null;
  const visualType =
    diagramData && typeof diagramData.visual_type === 'string'
      ? diagramData.visual_type
      : null;

  if (!diagramData || !schemaVersion || !visualType) {
    return (
      <UnsupportedDiagram
        diagramPrompt={diagramPrompt}
        diagramType={diagramType}
        schemaVersion={schemaVersion}
        visualType={visualType}
        reason="invalid"
      />
    );
  }

  const family = lookupDiagramFamily(schemaVersion, visualType);
  if (!family) {
    return (
      <UnsupportedDiagram
        diagramPrompt={diagramPrompt}
        diagramType={diagramType}
        schemaVersion={schemaVersion}
        visualType={visualType}
        reason="unsupported"
      />
    );
  }

  let rendered: React.ReactElement | null = null;
  try {
    switch (family) {
      case 'FractionDiagram2':
        rendered = <FractionDiagram2 data={diagramData} width={width} />;
        break;
      case 'NumberDiagram2':
        if (
          visualType === 'number_line' &&
          !isNumberStyleNumberLine(diagramData) &&
          !isFractionStyleNumberLine(diagramData)
        ) {
          rendered = null;
        } else {
          rendered = <NumberDiagram2 data={diagramData} width={width} />;
        }
        break;
      case 'AreaDiagramV1':
        rendered = <AreaDiagramV1 data={diagramData} width={width} />;
        break;
      case 'AnglesDiagramV1':
        rendered = <AnglesDiagramV1 data={diagramData} width={width} />;
        break;
      default:
        rendered = null;
    }
  } catch {
    rendered = null;
  }

  if (!rendered) {
    return (
      <UnsupportedDiagram
        diagramPrompt={diagramPrompt}
        diagramType={diagramType}
        schemaVersion={schemaVersion}
        visualType={visualType}
        reason="invalid"
      />
    );
  }

  return (
    <View style={styles.wrap}>
      {diagramPrompt ? <Text style={styles.prompt}>{diagramPrompt}</Text> : null}
      {rendered}
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
});
