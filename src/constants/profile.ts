/**
 * Profile menu — Lovable `src/pages/ProfileMenu.tsx`.
 *
 * Identity fields map to Expo `UserProfile` / AsyncStorage (not Lovable localStorage).
 * Preference toggles (notif/sound/dark) use device-local AsyncStorage keys.
 */

export const PROFILE_CONTENT_MAX_WIDTH = 448;
/** Lovable sticky header / body `p-4` = 16. */
export const PROFILE_PAGE_PADDING_X = 16;

export const SUPPORT_EMAIL = 'exalo.admins@gmail.com';

export const PROFILE_CARD = '#121836';
export const PROFILE_BORDER = '#212A47';
export const PROFILE_MUTED = '#1F2740';
export const PROFILE_MUTED_FOREGROUND = '#ACB9D2';
export const PROFILE_FOREGROUND = '#F8FAFC';
export const PROFILE_PRIMARY = '#198CFF';
export const PROFILE_PRIMARY_GLOW = '#4DC3FF';
export const PROFILE_SECONDARY = '#9B4DE0';
export const PROFILE_SECONDARY_GLOW = '#C084FC';
export const PROFILE_ACCENT = '#FF8A29';
export const PROFILE_ACCENT_GLOW = '#FFB433';
export const PROFILE_SUCCESS = '#22C365';
export const PROFILE_DESTRUCTIVE = '#EF4343';

export const PROFILE_COPY = {
  title: 'My Profile',
  chooseAvatar: 'Choose your space explorer 🚀',
  myProfile: 'My Profile',
  editNameDetails: 'Edit name & details',
  changeAvatar: 'Change avatar',
  email: 'Email',
  school: 'School',
  add: 'Add',
  settings: 'Settings',
  notifications: 'Notifications',
  soundHaptics: 'Sound & Haptics',
  darkMode: 'Dark Mode',
  appPrefs: 'App Preferences',
  payments: 'Payments & Subscription',
  currentPlan: 'Current plan',
  freePlan: 'Exalo Free',
  upgradePro: 'Upgrade to Pro',
  paymentMethods: 'Payment Methods',
  billingHistory: 'Billing History',
  cancelSub: 'Cancel Subscription',
  accountPrivacy: 'Account & Privacy',
  loginSecurity: 'Login & Security',
  dataPrivacy: 'Data Privacy Controls',
  downloadData: 'Download My Data',
  deleteAccount: 'Delete Account',
  support: 'Support',
  helpCentre: 'Help Centre',
  contactSupport: 'Contact Support',
  reportProblem: 'Report a Problem',
  faq: 'FAQ',
  suggestFeature: 'Suggest a Feature',
  logOut: 'Log out',
  version: 'Exalo · v1.0',
  dayStreak: 'day streak',
  galaxyCadet: 'Galaxy Cadet',
  explorer: 'Explorer',
} as const;

export type ProfileAccent = 'primary' | 'secondary' | 'accent' | 'success' | 'destructive';

export const PROFILE_ACCENT_STYLES: Record<
  ProfileAccent,
  { iconBg: string; iconColor: string }
> = {
  primary: { iconBg: 'rgba(25, 140, 255, 0.2)', iconColor: PROFILE_PRIMARY_GLOW },
  secondary: { iconBg: 'rgba(155, 77, 224, 0.2)', iconColor: PROFILE_SECONDARY_GLOW },
  accent: { iconBg: 'rgba(255, 138, 41, 0.2)', iconColor: PROFILE_ACCENT_GLOW },
  success: { iconBg: 'rgba(34, 195, 101, 0.2)', iconColor: PROFILE_SUCCESS },
  destructive: { iconBg: 'rgba(239, 68, 67, 0.2)', iconColor: PROFILE_DESTRUCTIVE },
};
