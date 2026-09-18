/**
 * Local streak engine — faithful port of Lovable `src/lib/streak.ts`.
 *
 * Persistence: AsyncStorage (not backend).
 * Backend `GET /analytics/dashboard` has NO streak/calendar fields (M8A read-only check).
 *
 * Classification:
 * - current/best/shields/status/calendar minutes → REAL EXISTING LOCAL STATE
 * - insight averages in UI → TEMPORARY_UI_DEMO (see constants/streak.ts)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FREEZE_CAP,
  FREEZE_INITIAL,
  GRACE_WINDOW_DAYS,
  RESET_AFTER_DAYS,
  STREAK_GOAL_MINUTES,
  STREAK_HISTORY_DAYS,
} from '@/constants/streak';

const STATE_KEY = '@exalo/streak_state';
const ACTIVITY_KEY = '@exalo/activity';
const SHIELD_MSG_KEY = '@exalo/shield_msg';

const pad = (n: number) => String(n).padStart(2, '0');

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const MS_DAY = 86_400_000;
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / MS_DAY);

const addDays = (key: string, n: number) => {
  const d = new Date(key);
  d.setDate(d.getDate() + n);
  return ymd(d);
};

export type StreakStatus =
  | 'Active'
  | 'Protected'
  | 'Grace Window'
  | 'Holiday Mode'
  | 'Broken';

export type StreakState = {
  current_streak: number;
  best_streak: number;
  freeze_days: number;
  grace_window_active: boolean;
  grace_window_start_date: string | null;
  holiday_mode_active: boolean;
  holiday_start_date: string | null;
  holiday_end_date: string | null;
  last_learning_date: string | null;
  total_learning_days: number;
};

export type StreakView = StreakState & {
  status: StreakStatus;
  status_message: string;
  today_minutes: number;
  goal_minutes: number;
  today_completed: boolean;
};

export type HistoryDay = {
  date: Date;
  key: string;
  minutes: number;
  active: boolean;
};

type ActivityMap = Record<string, number>;

const defaultState = (): StreakState => ({
  current_streak: 0,
  best_streak: 0,
  freeze_days: FREEZE_INITIAL,
  grace_window_active: false,
  grace_window_start_date: null,
  holiday_mode_active: false,
  holiday_start_date: null,
  holiday_end_date: null,
  last_learning_date: null,
  total_learning_days: 0,
});

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

const loadRaw = async (): Promise<StreakState> => {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    if (!raw) {
      return defaultState();
    }
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<StreakState>) };
  } catch {
    return defaultState();
  }
};

const save = async (s: StreakState): Promise<void> => {
  await writeJson(STATE_KEY, s);
};

export const getActivity = async (): Promise<ActivityMap> => {
  try {
    const raw = await AsyncStorage.getItem(ACTIVITY_KEY);
    if (!raw) {
      return {};
    }
    return (JSON.parse(raw) as ActivityMap) || {};
  } catch {
    return {};
  }
};

const saveActivity = async (a: ActivityMap): Promise<void> => {
  await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(a));
};

export const getTodayMinutes = async (a?: ActivityMap): Promise<number> => {
  const map = a ?? (await getActivity());
  return Math.floor(map[ymd(new Date())] || 0);
};

const isHolidayActiveOn = (s: StreakState, dayKey: string) =>
  s.holiday_mode_active &&
  s.holiday_start_date !== null &&
  s.holiday_end_date !== null &&
  dayKey >= s.holiday_start_date &&
  dayKey <= s.holiday_end_date;

const advance = async (s: StreakState, todayKey: string): Promise<StreakState> => {
  if (
    s.holiday_mode_active &&
    s.holiday_end_date !== null &&
    todayKey > s.holiday_end_date
  ) {
    s.holiday_mode_active = false;
    if (!s.last_learning_date || s.last_learning_date < s.holiday_end_date) {
      s.last_learning_date = s.holiday_end_date;
    }
  }

  if (isHolidayActiveOn(s, todayKey)) {
    return s;
  }

  if (!s.last_learning_date) {
    return s;
  }

  let cursor = addDays(s.last_learning_date, 1);
  while (cursor < todayKey) {
    if (isHolidayActiveOn(s, cursor)) {
      cursor = addDays(cursor, 1);
      continue;
    }

    const inactiveSpan = dayDiff(s.last_learning_date, cursor);
    if (inactiveSpan >= RESET_AFTER_DAYS) {
      s.current_streak = 0;
      s.grace_window_active = false;
      s.grace_window_start_date = null;
      break;
    }

    if (s.freeze_days > 0) {
      s.freeze_days -= 1;
      await AsyncStorage.setItem(
        SHIELD_MSG_KEY,
        'Mission Shield Activated. Your streak is protected.',
      );
    } else {
      if (!s.grace_window_active) {
        s.grace_window_active = true;
        s.grace_window_start_date = cursor;
      }
      const graceLen = dayDiff(s.grace_window_start_date as string, cursor) + 1;
      if (graceLen > GRACE_WINDOW_DAYS) {
        s.current_streak = 0;
        s.grace_window_active = false;
        s.grace_window_start_date = null;
        break;
      }
    }

    cursor = addDays(cursor, 1);
  }

  return s;
};

const buildStatus = (
  s: StreakState,
  todayMinutes: number,
): { status: StreakStatus; message: string } => {
  const todayKey = ymd(new Date());
  if (isHolidayActiveOn(s, todayKey)) {
    return {
      status: 'Holiday Mode',
      message: 'Holiday Mode is on. Your streak is safely paused.',
    };
  }
  if (s.current_streak === 0 && todayMinutes < STREAK_GOAL_MINUTES) {
    return {
      status: 'Broken',
      message: 'Start a new streak today — one short mission is all it takes!',
    };
  }
  if (s.grace_window_active) {
    return {
      status: 'Grace Window',
      message: 'Your rocket is waiting. Return within 3 days to continue your mission.',
    };
  }
  if (todayMinutes >= STREAK_GOAL_MINUTES) {
    return { status: 'Active', message: "You're on a roll! Keep going!" };
  }
  if (s.last_learning_date && s.last_learning_date < todayKey) {
    return {
      status: 'Protected',
      message: 'Mission Shield Activated. Your streak is protected.',
    };
  }
  return {
    status: 'Active',
    message: 'One mission today keeps your streak alive!',
  };
};

export const getStreakState = async (): Promise<StreakState> => {
  const s = await advance(await loadRaw(), ymd(new Date()));
  await save(s);
  return s;
};

export const getStreakView = async (): Promise<StreakView> => {
  const s = await getStreakState();
  const today_minutes = await getTodayMinutes();
  const { status, message } = buildStatus(s, today_minutes);
  return {
    ...s,
    status,
    status_message: message,
    today_minutes,
    goal_minutes: STREAK_GOAL_MINUTES,
    today_completed: today_minutes >= STREAK_GOAL_MINUTES,
  };
};

export const getHistoryDays = async (n = STREAK_HISTORY_DAYS): Promise<HistoryDay[]> => {
  const a = await getActivity();
  const out: HistoryDay[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = ymd(d);
    const minutes = Math.floor(a[key] || 0);
    out.push({ date: d, key, minutes, active: minutes >= STREAK_GOAL_MINUTES });
  }
  return out;
};

export const consumeShieldMessage = async (): Promise<string | null> => {
  const v = await AsyncStorage.getItem(SHIELD_MSG_KEY);
  if (v) {
    await AsyncStorage.removeItem(SHIELD_MSG_KEY);
  }
  return v;
};

// ---------------------------------------------------------------------------
// Holiday Mode — parent-controlled (Lovable `setHolidayMode` / `clearHolidayMode` / `getHolidayView`)
// ---------------------------------------------------------------------------

export type HolidayView = {
  active: boolean;
  start: string | null;
  end: string | null;
  daysRemaining: number;
};

export const setHolidayMode = async (
  startISO: string,
  endISO: string,
): Promise<StreakState> => {
  let start = startISO;
  let end = endISO;
  if (start > end) {
    [start, end] = [end, start];
  }
  const s = await loadRaw();
  s.holiday_mode_active = true;
  s.holiday_start_date = start;
  s.holiday_end_date = end;
  await save(s);
  return s;
};

export const clearHolidayMode = async (): Promise<StreakState> => {
  const s = await loadRaw();
  s.holiday_mode_active = false;
  s.holiday_start_date = null;
  s.holiday_end_date = null;
  await save(s);
  return s;
};

export const getHolidayView = async (): Promise<HolidayView> => {
  const s = await getStreakState();
  const today = ymd(new Date());
  if (!s.holiday_mode_active || !s.holiday_start_date || !s.holiday_end_date) {
    return { active: false, start: null, end: null, daysRemaining: 0 };
  }
  const remaining = Math.max(0, dayDiff(today, s.holiday_end_date) + 1);
  return {
    active: true,
    start: s.holiday_start_date,
    end: s.holiday_end_date,
    daysRemaining: remaining,
  };
};

/**
 * Status chrome — Lovable `STATUS_STYLES` HSL opacities (icons are Lucide in UI).
 * Colors from `src/index.css` tokens.
 */
export const STREAK_STATUS_META: Record<
  StreakStatus,
  { emoji: string; bg: string; border: string; text: string }
> = {
  Active: {
    emoji: '🔥',
    bg: 'rgba(34, 195, 101, 0.2)',
    border: 'rgba(34, 195, 101, 0.4)',
    text: '#22C365',
  },
  Protected: {
    emoji: '🛡️',
    bg: 'rgba(26, 133, 255, 0.2)',
    border: 'rgba(26, 133, 255, 0.4)',
    text: '#FFFFFF',
  },
  'Grace Window': {
    emoji: '⚠️',
    bg: 'rgba(255, 130, 41, 0.2)',
    border: 'rgba(255, 130, 41, 0.4)',
    text: '#FFB433',
  },
  'Holiday Mode': {
    emoji: '🌴',
    bg: 'rgba(140, 60, 221, 0.2)',
    border: 'rgba(140, 60, 221, 0.4)',
    text: '#C775F0',
  },
  Broken: {
    emoji: '💔',
    bg: 'rgba(239, 67, 67, 0.2)',
    border: 'rgba(239, 67, 67, 0.4)',
    text: '#EF4343',
  },
};

export { STREAK_GOAL_MINUTES, FREEZE_CAP };
