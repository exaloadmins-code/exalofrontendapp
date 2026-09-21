export { storage, defaultOnboardingState, defaultProfile } from './storage';
export type { StorageService } from './storage';
export { collectImageModules, preloadImageAssets, assets } from './assets';
export {
  getStreakView,
  getHistoryDays,
  getStreakState,
  consumeShieldMessage,
  setHolidayMode,
  clearHolidayMode,
  getHolidayView,
  STREAK_STATUS_META,
  ymd,
} from './streak';
export type {
  StreakView,
  StreakState,
  StreakStatus,
  HistoryDay,
  HolidayView,
} from './streak';
export { getProfilePrefs, setProfilePref, defaultPrefs } from './profilePrefs';
export type { ProfilePrefs } from './profilePrefs';
export {
  setTrainSelection,
  getTrainSelection,
  setTrainDifficulty,
  clearTrainSelection,
} from './trainSelection';
export type { TrainSelectionSnapshot } from './trainSelection';
export {
  loadTrainQuestions,
  TRAIN_QUESTIONS_PER_RUN,
  getTrainOptions,
  OPTION_LETTERS,
} from './trainQuestions';
export type {
  LoadTrainQuestionsParams,
  LoadTrainQuestionsResult,
  OptionLetter,
  TrainAnswerRecord,
  TrainBankDifficulty,
  TrainQuestionRow,
  TrainSubjectType,
} from './trainQuestions';
export {
  setTrainResult,
  getTrainResult,
  clearTrainResult,
  armTrainRetry,
  clearArmedTrainRetry,
  consumeArmedTrainRetry,
  trainResultPercent,
} from './trainResults';
export type { TrainResultSnapshot } from './trainResults';
