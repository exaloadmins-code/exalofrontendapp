import React from 'react';
import { DiagramDispatcher } from './diagrams/DiagramDispatcher';

type Props = {
  hasDiagram?: boolean;
  diagramType?: string | null;
  diagramPrompt?: string | null;
  diagramData?: Record<string, unknown> | null;
  width: number;
};

/**
 * Train diagram surface for Maths API questions.
 * Delegates to DiagramDispatcher (schema_version + visual_type).
 */
export function TrainQuestionDiagram(props: Props) {
  return <DiagramDispatcher {...props} />;
}
