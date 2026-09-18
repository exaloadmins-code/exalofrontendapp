/**
 * Device-local Profile preference toggles — Lovable ProfileMenu localStorage:
 * `exalo_notif` / `exalo_sound` / `exalo_dark` (default true when unset).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  notif: '@exalo/pref_notif',
  sound: '@exalo/pref_sound',
  dark: '@exalo/pref_dark',
} as const;

export type ProfilePrefs = {
  notifications: boolean;
  sound: boolean;
  darkMode: boolean;
};

const defaultPrefs = (): ProfilePrefs => ({
  notifications: true,
  sound: true,
  darkMode: true,
});

async function readBool(key: string, fallback: boolean): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return raw !== 'false';
  } catch {
    return fallback;
  }
}

export async function getProfilePrefs(): Promise<ProfilePrefs> {
  const [notifications, sound, darkMode] = await Promise.all([
    readBool(KEYS.notif, true),
    readBool(KEYS.sound, true),
    readBool(KEYS.dark, true),
  ]);
  return { notifications, sound, darkMode };
}

export async function setProfilePref(
  key: keyof ProfilePrefs,
  value: boolean,
): Promise<void> {
  const storageKey =
    key === 'notifications' ? KEYS.notif : key === 'sound' ? KEYS.sound : KEYS.dark;
  await AsyncStorage.setItem(storageKey, String(value));
}

export { defaultPrefs };
