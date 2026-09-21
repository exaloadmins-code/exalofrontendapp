/**
 * TEMPORARY frontend-only Train Selection handoff (M3).
 *
 * Holds the last subject / topic / difficulty chosen on Train Selection so the
 * M3→M4 boundary placeholder can display context without inventing session IDs
 * or calling `/train/start`.
 *
 * Replace with real backend train-session state when API integration unparks.
 */

import type { JourneySubject } from '@/constants/journey';
import type { TrainDifficulty } from '@/constants/train';

export type TrainSelectionSnapshot = {
  subject: JourneySubject;
  topicSlug: string;
  topicLabel: string;
  difficulty: TrainDifficulty;
  /** Local wall-clock ms — debug / handoff only; not a backend session. */
  selectedAt: number;
};

let lastSelection: TrainSelectionSnapshot | null = null;

export function setTrainSelection(
  snapshot: Omit<TrainSelectionSnapshot, 'selectedAt'> & { selectedAt?: number },
): TrainSelectionSnapshot {
  lastSelection = {
    ...snapshot,
    selectedAt: snapshot.selectedAt ?? Date.now(),
  };
  return lastSelection;
}

export function getTrainSelection(): TrainSelectionSnapshot | null {
  return lastSelection;
}

export function clearTrainSelection(): void {
  lastSelection = null;
}
