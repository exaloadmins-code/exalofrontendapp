/**
 * M8 — Lovable Profile menu (`/profile` → `ProfileMenu.tsx`).
 *
 * Not PageShell: right slide-over panel (`md:max-w-md` 448) with sticky
 * "My Profile" + X close. Identity from shared Expo `UserProfile` /
 * AsyncStorage; preference toggles via `profilePrefs`.
 *
 * Icons: Lucide (TP-004). Avatars: ONBOARDING_AVATARS / resolveAvatarSource.
 * Gradient: TP-072 expo-linear-gradient (panel + modals).
 */
import { Href, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Bell,
  Bug,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Flame,
  HelpCircle,
  LifeBuoy,
  Lightbulb,
  LogOut,
  Mail,
  Moon,
  Palette,
  Send,
  Settings,
  ShieldCheck,
  User as UserIcon,
  UserCog,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import {
  ONBOARDING_AVATARS,
  ONBOARDING_YEARS,
  PROFILE_ACCENT_STYLES,
  PROFILE_CONTENT_MAX_WIDTH,
  PROFILE_COPY,
  PROFILE_PAGE_PADDING_X,
  SUPPORT_EMAIL,
  resolveAvatarSource,
  type OnboardingYearOption,
  type ProfileAccent,
} from '@/constants';
import {
  PROFILE_ACCENT,
  PROFILE_ACCENT_GLOW,
  PROFILE_BORDER,
  PROFILE_DESTRUCTIVE,
  PROFILE_FOREGROUND,
  PROFILE_MUTED,
  PROFILE_MUTED_FOREGROUND,
  PROFILE_PRIMARY,
} from '@/constants/profile';
import { Routes } from '@/constants/routes';
import { ExaloTextInput } from '@/components/ui/TextInputField';
import { useAppContext } from '@/providers';
import {
  defaultOnboardingState,
  defaultProfile,
  getProfilePrefs,
  getStreakView,
  setProfilePref,
  storage,
} from '@/services';
import { colors, fonts } from '@/theme';

const PANEL_GRADIENT = ['#0C1540', '#080C21', '#04060F'] as const;

type ModalKey =
  | null
  | 'edit-profile'
  | 'app-prefs'
  | 'payment-methods'
  | 'billing'
  | 'cancel-sub'
  | 'upgrade'
  | 'login-security'
  | 'privacy'
  | 'download-data'
  | 'delete-account'
  | 'help'
  | 'contact'
  | 'report'
  | 'faq'
  | 'suggest';

type DraftProfile = {
  name: string;
  year: string;
  email: string;
  school: string;
};

type SupportForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/** Lovable `toast({ title, description? })` — in-app banner (Alert.alert is unreliable on web). */
type ToastPayload = {
  title: string;
  description?: string;
};

const TOAST_VISIBLE_MS = 5000;
/** Lovable ToastViewport `p-4` = 16. */
const TOAST_EDGE = 16;
/** Lovable `md:max-w-[420px]` on ToastViewport. */
const TOAST_VIEWPORT_MAX_MD = 420;
/** Tailwind `sm:` — below this, viewport is `top-0 w-full`; at/above, `sm:bottom-0 sm:right-0`. */
const TOAST_SM_BREAKPOINT = 640;
/** Tailwind `md:` — applies viewport max-width 420. */
const TOAST_MD_BREAKPOINT = 768;

function PrefToggle({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: PROFILE_MUTED, true: PROFILE_PRIMARY }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={PROFILE_MUTED}
    />
  );
}

function Section({
  icon: Icon,
  title,
  accent = 'primary',
  defaultOpen = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  accent?: ProfileAccent;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const accentStyle = PROFILE_ACCENT_STYLES[accent];

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((o) => !o)}
        style={styles.sectionHeader}
      >
        <View style={[styles.sectionIconWrap, { backgroundColor: accentStyle.iconBg }]}>
          <Icon size={20} color={accentStyle.iconColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ChevronDown
          size={20}
          color={PROFILE_MUTED_FOREGROUND}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  onPress,
  right,
}: {
  icon?: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
}) {
  const content = (
    <>
      {Icon ? <Icon size={16} color={PROFILE_MUTED_FOREGROUND} /> : null}
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {right ?? <ChevronRight size={16} color={PROFILE_MUTED_FOREGROUND} />}
    </>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.row}>{content}</View>;
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function PrimaryBtn({
  label,
  onPress,
  icon: Icon,
}: {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.primaryBtn}>
      {Icon ? <Icon size={16} color={colors.white} /> : null}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

/**
 * Lovable Radix/shadcn toast — non-modal floating card.
 * Viewport: `fixed … p-4 w-full`; `<sm` → top; `sm:` → bottom-right; `md:max-w-[420px]`.
 * Toast: `w-full rounded-md border p-6 pr-8 shadow-lg bg-background`.
 * Title: `text-sm font-semibold`, text-align start (not centered).
 * Measured @390×844: 358×69, top/left/right inset 16, pad 24/32/24/24, radius 18.
 */
function FloatingToast({
  toast,
  onDismiss,
  toastWidth,
  placement,
  topInset,
  bottomInset,
  leftInset,
  rightInset,
}: {
  toast: ToastPayload | null;
  onDismiss: () => void;
  toastWidth: number;
  placement: 'top' | 'bottom-right';
  topInset: number;
  bottomInset: number;
  leftInset: number;
  rightInset: number;
}) {
  if (!toast) {
    return null;
  }
  const positionStyle =
    placement === 'top'
      ? { top: topInset, left: leftInset, width: toastWidth }
      : { bottom: bottomInset, right: rightInset, width: toastWidth };

  return (
    <View pointerEvents="box-none" style={styles.toastLayer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={toast.title}
        onPress={onDismiss}
        pointerEvents="auto"
        style={[styles.toastBanner, positionStyle]}
      >
        <Text style={styles.toastTitle}>{toast.title}</Text>
        {toast.description ? (
          <Text style={styles.toastDescription}>{toast.description}</Text>
        ) : null}
      </Pressable>
    </View>
  );
}

function ProfileModal({
  open,
  title,
  onClose,
  children,
  toast,
  onDismissToast,
  toastWidth,
  toastPlacement,
  toastTopInset,
  toastBottomInset,
  toastLeftInset,
  toastRightInset,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  toast?: ToastPayload | null;
  onDismissToast?: () => void;
  toastWidth?: number;
  toastPlacement?: 'top' | 'bottom-right';
  toastTopInset?: number;
  toastBottomInset?: number;
  toastLeftInset?: number;
  toastRightInset?: number;
}) {
  const { width } = useWindowDimensions();
  const shellWidth = Math.min(PROFILE_CONTENT_MAX_WIDTH, Math.max(0, width - 32));

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.modalCard, { width: shellWidth }]}>
          <LinearGradient colors={[...PANEL_GRADIENT]} style={StyleSheet.absoluteFill} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              onPress={onClose}
              style={styles.modalCloseBtn}
            >
              <X size={16} color={PROFILE_FOREGROUND} />
            </Pressable>
          </View>
          <ScrollView
            style={styles.modalBodyScroll}
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
        {toast && onDismissToast ? (
          <FloatingToast
            toast={toast}
            onDismiss={onDismissToast}
            toastWidth={toastWidth ?? Math.max(160, width - TOAST_EDGE * 2)}
            placement={toastPlacement ?? 'top'}
            topInset={toastTopInset ?? TOAST_EDGE}
            bottomInset={toastBottomInset ?? TOAST_EDGE}
            leftInset={toastLeftInset ?? TOAST_EDGE}
            rightInset={toastRightInset ?? TOAST_EDGE}
          />
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { profile, onboarding, setProfileState, setOnboardingState } = useAppContext();

  const [enter, setEnter] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [modal, setModal] = useState<ModalKey>(null);
  const [streak, setStreak] = useState(profile.streak);
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [dark, setDark] = useState(true);
  const [draft, setDraft] = useState<DraftProfile>({
    name: '',
    year: '',
    email: '',
    school: '',
  });
  const [form, setForm] = useState<SupportForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const shellWidth = Math.min(PROFILE_CONTENT_MAX_WIDTH, Math.max(0, width));
  const name = profile.displayName?.trim() || PROFILE_COPY.explorer;
  const yearLabel = profile.yearGroup?.trim() || PROFILE_COPY.galaxyCadet;
  const avatarSource = resolveAvatarSource(profile.avatarId);
  const emailDisplay = profile.email?.trim() || PROFILE_COPY.add;
  const schoolDisplay = profile.schoolName?.trim() || PROFILE_COPY.add;

  const dismissToast = useCallback(() => setToast(null), []);

  const notify = useCallback((title: string, description?: string) => {
    setToast({ title, description });
  }, []);

  const toastBottomInset = Math.max(TOAST_EDGE, insets.bottom + TOAST_EDGE);
  const toastTopInset = Math.max(TOAST_EDGE, insets.top + TOAST_EDGE);
  const toastRightInset = Math.max(TOAST_EDGE, insets.right + TOAST_EDGE);
  const toastLeftInset = Math.max(TOAST_EDGE, insets.left + TOAST_EDGE);
  /** Lovable: <sm top full-bleed viewport; sm+ bottom-right; md max viewport 420. */
  const toastPlacement: 'top' | 'bottom-right' =
    width >= TOAST_SM_BREAKPOINT ? 'bottom-right' : 'top';
  const toastViewportWidth =
    width >= TOAST_MD_BREAKPOINT ? Math.min(TOAST_VIEWPORT_MAX_MD, width) : width;
  const toastWidth = Math.max(160, toastViewportWidth - TOAST_EDGE * 2);
  const toastProps = {
    toast,
    onDismissToast: dismissToast,
    toastWidth,
    toastPlacement,
    toastTopInset,
    toastBottomInset,
    toastLeftInset,
    toastRightInset,
  };

  useEffect(() => {
    if (!toast) {
      return;
    }
    const t = setTimeout(() => setToast(null), TOAST_VISIBLE_MS);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const t = setTimeout(() => setEnter(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const prefs = await getProfilePrefs();
      if (!cancelled) {
        setNotif(prefs.notifications);
        setSound(prefs.sound);
        setDark(prefs.darkMode);
      }
      try {
        const view = await getStreakView();
        if (!cancelled) {
          setStreak(view.current_streak);
        }
      } catch {
        if (!cancelled) {
          setStreak(profile.streak);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile.streak]);

  useEffect(() => {
    if (modal === 'edit-profile') {
      setDraft({
        name: profile.displayName ?? '',
        year: profile.yearGroup ?? '',
        email: profile.email ?? '',
        school: profile.schoolName ?? '',
      });
    }
  }, [modal, profile]);

  useEffect(() => {
    if (modal === 'contact' || modal === 'report' || modal === 'suggest') {
      setForm({
        name: profile.displayName ?? '',
        email: profile.email ?? '',
        subject:
          modal === 'report'
            ? 'Problem report from Exalo app'
            : modal === 'suggest'
              ? 'Feature suggestion for Exalo'
              : 'Support request from Exalo app',
        message: '',
      });
    }
  }, [modal, profile.displayName, profile.email]);

  const close = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.Home as Href);
  }, [router]);

  const closeModal = useCallback(() => {
    setModal(null);
    setToast(null);
  }, []);

  const updateNotif = useCallback(async (next: boolean) => {
    setNotif(next);
    await setProfilePref('notifications', next);
  }, []);

  const updateSound = useCallback(async (next: boolean) => {
    setSound(next);
    await setProfilePref('sound', next);
  }, []);

  const updateDark = useCallback(async (next: boolean) => {
    setDark(next);
    await setProfilePref('darkMode', next);
  }, []);

  const pickAvatar = useCallback(
    async (id: string) => {
      const next = { ...profile, avatarId: id };
      await setProfileState(next);
      await setOnboardingState({ ...onboarding, avatarId: id });
      setAvatarPickerOpen(false);
    },
    [onboarding, profile, setOnboardingState, setProfileState],
  );

  const saveProfile = useCallback(async () => {
    const displayName = draft.name.trim() || null;
    const yearRaw = draft.year.trim();
    const yearGroup = yearRaw || null;
    const email = draft.email.trim() || null;
    const schoolName = draft.school.trim() || null;

    await setProfileState({
      ...profile,
      displayName,
      yearGroup,
      email,
      schoolName,
    });

    const onboardingYear = (ONBOARDING_YEARS as readonly string[]).includes(yearRaw)
      ? (yearRaw as OnboardingYearOption)
      : onboarding.yearGroup;

    await setOnboardingState({
      ...onboarding,
      displayName,
      email,
      yearGroup: onboardingYear,
      schoolName,
    });

    notify('Profile updated', 'Your details have been saved.');
    closeModal();
  }, [closeModal, draft, notify, onboarding, profile, setOnboardingState, setProfileState]);

  const logout = useCallback(async () => {
    await setOnboardingState({
      ...onboarding,
      completed: false,
      currentStep: 1,
    });
    router.replace(Routes.OnboardingEmail as Href);
  }, [onboarding, router, setOnboardingState]);

  const deleteAccount = useCallback(async () => {
    await storage.clearAll();
    await setOnboardingState(defaultOnboardingState());
    await setProfileState(defaultProfile());
    notify('Account deleted', "We're sorry to see you go.");
    router.replace(Routes.OnboardingEmail as Href);
  }, [router, setOnboardingState, setProfileState]);

  const sendEmail = useCallback(async () => {
    if (!form.message.trim()) {
      notify('Please add a message', "Tell us what's going on.");
      return;
    }
    const body = [
      `Name: ${form.name || '—'}`,
      `Email: ${form.email || '—'}`,
      `Child: ${profile.displayName || '—'}`,
      '',
      form.message,
    ].join('\n');
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`;
    try {
      await Linking.openURL(href);
      notify('Opening your email app', `We've drafted a message to ${SUPPORT_EMAIL}.`);
    } catch {
      notify('Could not open email', SUPPORT_EMAIL);
    }
    closeModal();
  }, [closeModal, form, profile.displayName]);

  const modalTitle = useMemo(() => {
    switch (modal) {
      case 'edit-profile':
        return 'Edit profile';
      case 'app-prefs':
        return 'App preferences';
      case 'upgrade':
        return 'Upgrade to Exalo Pro';
      case 'payment-methods':
        return 'Payment methods';
      case 'billing':
        return 'Billing history';
      case 'cancel-sub':
        return 'Cancel subscription';
      case 'login-security':
        return 'Login & security';
      case 'privacy':
        return 'Data privacy controls';
      case 'download-data':
        return 'Download my data';
      case 'delete-account':
        return 'Delete account';
      case 'help':
        return 'Help Centre';
      case 'faq':
        return 'Frequently asked';
      case 'contact':
        return 'Contact support';
      case 'report':
        return 'Report a problem';
      case 'suggest':
        return 'Suggest a feature';
      default:
        return '';
    }
  }, [modal]);

  const avatarCellWidth = Math.max(
    0,
    (shellWidth - PROFILE_PAGE_PADDING_X * 2 - 40 - 16) / 3,
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Pressable
        style={[styles.backdrop, { opacity: enter ? 1 : 0 }]}
        onPress={close}
        accessibilityLabel="Close"
      />

      <View
        style={[
          styles.panel,
          {
            width: shellWidth,
            maxWidth: PROFILE_CONTENT_MAX_WIDTH,
            paddingTop: insets.top,
            transform: [{ translateX: enter ? 0 : Math.min(width, PROFILE_CONTENT_MAX_WIDTH) }],
          },
        ]}
      >
        <LinearGradient colors={[...PANEL_GRADIENT]} style={StyleSheet.absoluteFill} />

        <View style={[styles.stickyHeader, { paddingHorizontal: PROFILE_PAGE_PADDING_X }]}>
          <Text style={styles.pageTitle}>{PROFILE_COPY.title}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close profile menu"
            onPress={close}
            style={styles.closeBtn}
          >
            <X size={20} color={PROFILE_FOREGROUND} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: PROFILE_PAGE_PADDING_X,
            paddingBottom: insets.bottom + 40,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Change avatar"
                onPress={() => setAvatarPickerOpen((o) => !o)}
                style={styles.avatarBtn}
              >
                <View style={styles.avatarRing}>
                  {avatarSource ? (
                    <Image source={avatarSource} style={styles.avatarImg} resizeMode="cover" />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarLetter}>
                        {(profile.displayName || 'E').charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.paletteBadge}>
                  <Palette size={14} color={colors.white} />
                </View>
              </Pressable>

              <View style={styles.headerMeta}>
                <Text style={styles.displayName} numberOfLines={1}>
                  {name}
                </Text>
                <Text style={styles.yearLabel} numberOfLines={1}>
                  {yearLabel}
                </Text>
                <View style={styles.streakPill}>
                  <Flame size={12} color={PROFILE_ACCENT_GLOW} />
                  <Text style={styles.streakText}>
                    {streak} {PROFILE_COPY.dayStreak}
                  </Text>
                </View>
              </View>
            </View>

            {avatarPickerOpen ? (
              <View style={styles.avatarPicker}>
                <Text style={styles.avatarPickerHint}>{PROFILE_COPY.chooseAvatar}</Text>
                <View style={styles.avatarGrid}>
                  {ONBOARDING_AVATARS.map((a) => {
                    const selected = profile.avatarId === a.id;
                    return (
                      <Pressable
                        key={a.id}
                        accessibilityRole="button"
                        onPress={() => pickAvatar(a.id)}
                        style={[
                          styles.avatarOption,
                          {
                            width: avatarCellWidth,
                            borderColor: selected ? PROFILE_ACCENT : PROFILE_BORDER,
                          },
                        ]}
                      >
                        <Image source={a.source} style={styles.avatarOptionImg} resizeMode="cover" />
                        {selected ? (
                          <View style={styles.avatarCheck}>
                            <Check size={12} color={colors.white} />
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>

          <Section icon={UserIcon} title={PROFILE_COPY.myProfile} accent="primary" defaultOpen>
            <Row
              icon={UserCog}
              label={PROFILE_COPY.editNameDetails}
              onPress={() => setModal('edit-profile')}
            />
            <Row
              icon={Palette}
              label={PROFILE_COPY.changeAvatar}
              onPress={() => setAvatarPickerOpen(true)}
            />
            <Row
              icon={Mail}
              label={PROFILE_COPY.email}
              value={emailDisplay}
              onPress={() => setModal('edit-profile')}
            />
            <Row
              icon={UserIcon}
              label={PROFILE_COPY.school}
              value={schoolDisplay}
              onPress={() => setModal('edit-profile')}
            />
          </Section>

          <Section icon={Settings} title={PROFILE_COPY.settings} accent="secondary">
            <Row
              icon={Bell}
              label={PROFILE_COPY.notifications}
              right={<PrefToggle value={notif} onValueChange={updateNotif} />}
            />
            <Row
              icon={Volume2}
              label={PROFILE_COPY.soundHaptics}
              right={<PrefToggle value={sound} onValueChange={updateSound} />}
            />
            <Row
              icon={Moon}
              label={PROFILE_COPY.darkMode}
              right={<PrefToggle value={dark} onValueChange={updateDark} />}
            />
            <Row
              icon={Settings}
              label={PROFILE_COPY.appPrefs}
              onPress={() => setModal('app-prefs')}
            />
          </Section>

          <Section icon={CreditCard} title={PROFILE_COPY.payments} accent="accent">
            <View style={styles.planCard}>
              <Text style={styles.planLabel}>{PROFILE_COPY.currentPlan}</Text>
              <Text style={styles.planValue}>{PROFILE_COPY.freePlan}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setModal('upgrade')}
                style={styles.upgradePill}
              >
                <Text style={styles.upgradePillText}>{PROFILE_COPY.upgradePro}</Text>
              </Pressable>
            </View>
            <Row
              icon={CreditCard}
              label={PROFILE_COPY.paymentMethods}
              onPress={() => setModal('payment-methods')}
            />
            <Row
              icon={FileText}
              label={PROFILE_COPY.billingHistory}
              onPress={() => setModal('billing')}
            />
            <Row icon={X} label={PROFILE_COPY.cancelSub} onPress={() => setModal('cancel-sub')} />
          </Section>

          <Section icon={ShieldCheck} title={PROFILE_COPY.accountPrivacy} accent="success">
            <Row
              icon={ShieldCheck}
              label={PROFILE_COPY.loginSecurity}
              onPress={() => setModal('login-security')}
            />
            <Row
              icon={ShieldCheck}
              label={PROFILE_COPY.dataPrivacy}
              onPress={() => setModal('privacy')}
            />
            <Row
              icon={Download}
              label={PROFILE_COPY.downloadData}
              onPress={() => setModal('download-data')}
            />
            <Row
              icon={AlertTriangle}
              label={PROFILE_COPY.deleteAccount}
              onPress={() => setModal('delete-account')}
            />
          </Section>

          <Section icon={HelpCircle} title={PROFILE_COPY.support} accent="primary">
            <Row icon={LifeBuoy} label={PROFILE_COPY.helpCentre} onPress={() => setModal('help')} />
            <Row
              icon={Mail}
              label={PROFILE_COPY.contactSupport}
              value={SUPPORT_EMAIL}
              onPress={() => setModal('contact')}
            />
            <Row
              icon={Bug}
              label={PROFILE_COPY.reportProblem}
              onPress={() => setModal('report')}
            />
            <Row icon={HelpCircle} label={PROFILE_COPY.faq} onPress={() => setModal('faq')} />
            <Row
              icon={Lightbulb}
              label={PROFILE_COPY.suggestFeature}
              onPress={() => setModal('suggest')}
            />
          </Section>

          <Pressable accessibilityRole="button" onPress={logout} style={styles.logoutBtn}>
            <LogOut size={16} color={PROFILE_DESTRUCTIVE} />
            <Text style={styles.logoutText}>{PROFILE_COPY.logOut}</Text>
          </Pressable>
          <Text style={styles.version}>{PROFILE_COPY.version}</Text>
        </ScrollView>
      </View>

      <ProfileModal open={modal === 'edit-profile'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <View>
            <FieldLabel label="Child's name" />
            <ExaloTextInput
              value={draft.name}
              onChangeText={(v) => setDraft({ ...draft, name: v })}
              placeholder="e.g. Alex"
              containerStyle={styles.inputContainer}
            />
          </View>
          <View>
            <FieldLabel label="Year group" />
            <ExaloTextInput
              value={draft.year}
              onChangeText={(v) => setDraft({ ...draft, year: v })}
              placeholder="e.g. Year 5"
              containerStyle={styles.inputContainer}
            />
          </View>
          <View>
            <FieldLabel label="Email" />
            <ExaloTextInput
              value={draft.email}
              onChangeText={(v) => setDraft({ ...draft, email: v })}
              placeholder="parent@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputContainer}
            />
          </View>
          <View>
            <FieldLabel label="School" />
            <ExaloTextInput
              value={draft.school}
              onChangeText={(v) => setDraft({ ...draft, school: v })}
              placeholder="e.g. Greenfield Primary"
              containerStyle={styles.inputContainer}
            />
          </View>
          <PrimaryBtn label="Save changes" onPress={saveProfile} />
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'app-prefs'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <Row
            icon={Bell}
            label={PROFILE_COPY.notifications}
            right={<PrefToggle value={notif} onValueChange={updateNotif} />}
          />
          <Row
            icon={Volume2}
            label={PROFILE_COPY.soundHaptics}
            right={<PrefToggle value={sound} onValueChange={updateSound} />}
          />
          <Row
            icon={Moon}
            label={PROFILE_COPY.darkMode}
            right={<PrefToggle value={dark} onValueChange={updateDark} />}
          />
          <Text style={styles.helperText}>
            Preferences are saved automatically to this device.
          </Text>
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'upgrade'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <View style={styles.upgradeCard}>
            <Text style={styles.priceText}>
              £4.99
              <Text style={styles.priceSuffix}>/month</Text>
            </Text>
            <Text style={styles.bullet}>✓ Unlimited missions across Maths & English</Text>
            <Text style={styles.bullet}>✓ Focus & Test modes unlocked</Text>
            <Text style={styles.bullet}>✓ Detailed parent insights</Text>
            <Text style={styles.bullet}>✓ Priority support</Text>
          </View>
          <PrimaryBtn
            label="Start free trial"
            onPress={() => {
              notify('Coming soon', 'Pro plans launch shortly.');
              closeModal();
            }}
          />
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'payment-methods'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <View style={styles.dashedBox}>
            <Text style={styles.mutedCenter}>No payment methods yet.</Text>
          </View>
          <PrimaryBtn
            label="Add a card"
            onPress={() => notify('Coming soon', 'Add card flow is on the way.')}
          />
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'billing'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.dashedBox}>
          <Text style={styles.mutedCenter}>
            You haven't been charged yet. Invoices will appear here once you upgrade.
          </Text>
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'cancel-sub'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <Text style={styles.bodyText}>
            You're currently on the Free plan, so there is nothing to cancel. If you've
            upgraded and want to cancel, we'll process it within 24 hours.
          </Text>
          <PrimaryBtn label="Contact support" onPress={() => setModal('contact')} />
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'login-security'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <Row
            icon={Mail}
            label={PROFILE_COPY.email}
            value={emailDisplay}
            onPress={() => setModal('edit-profile')}
          />
          <Row
            icon={ShieldCheck}
            label="Change password"
            onPress={() => notify('Coming soon')}
          />
          <Row
            icon={ShieldCheck}
            label="Two-factor authentication"
            onPress={() => notify('Coming soon')}
          />
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'privacy'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <Row
            icon={ShieldCheck}
            label="Personalised learning"
            right={<PrefToggle value={true} onValueChange={() => {}} />}
          />
          <Row
            icon={ShieldCheck}
            label="Share progress with parents"
            right={<PrefToggle value={true} onValueChange={() => {}} />}
          />
          <Row
            icon={ShieldCheck}
            label="Anonymous usage analytics"
            right={<PrefToggle value={false} onValueChange={() => {}} />}
          />
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'download-data'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <Text style={styles.bodyText}>
            We'll prepare a copy of your child's learning data and email it to{' '}
            {profile.email?.trim() || SUPPORT_EMAIL}.
          </Text>
          <PrimaryBtn
            label="Request data export"
            onPress={() => {
              notify('Request received', 'Your data export will arrive within 48 hours.');
              closeModal();
            }}
          />
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'delete-account'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <Text style={styles.bodyText}>
            This will permanently remove your child's profile and progress. This action cannot
            be undone.
          </Text>
          <Pressable accessibilityRole="button" onPress={deleteAccount} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Yes, delete my account</Text>
          </Pressable>
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'help'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          <Text style={styles.bodyText}>Welcome to Exalo! Here are some quick tips:</Text>
          <Text style={styles.mutedBullet}>• Tap a tile in Train Mode to start a topic mission.</Text>
          <Text style={styles.mutedBullet}>• Use the Parents board for detailed insights.</Text>
          <Text style={styles.mutedBullet}>
            • Your child's streak grows by playing every day.
          </Text>
          <PrimaryBtn label="Still need help? Contact us" onPress={() => setModal('contact')} />
        </View>
      </ProfileModal>

      <ProfileModal open={modal === 'faq'} title={modalTitle} onClose={closeModal} {...toastProps}>
        <View style={styles.formStack}>
          {[
            {
              q: 'What age is Exalo for?',
              a: 'Children aged 7–14, aligned to the UK curriculum.',
            },
            {
              q: "Is my child's data safe?",
              a: "Yes — we're GDPR-compliant and never sell data.",
            },
            {
              q: 'Can I use Exalo offline?',
              a: 'Most missions work offline once loaded.',
            },
          ].map((f) => (
            <View key={f.q} style={styles.faqCard}>
              <Text style={styles.faqQ}>{f.q}</Text>
              <Text style={styles.faqA}>{f.a}</Text>
            </View>
          ))}
        </View>
      </ProfileModal>

      <ProfileModal
        open={modal === 'contact' || modal === 'report' || modal === 'suggest'}
        title={modalTitle}
        onClose={closeModal}
        {...toastProps}
      >
        <View style={styles.formStack}>
          <Text style={styles.helperText}>Your message will be sent to {SUPPORT_EMAIL}.</Text>
          <View>
            <FieldLabel label="Your name" />
            <ExaloTextInput
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              placeholder="Parent or guardian name"
              containerStyle={styles.inputContainer}
            />
          </View>
          <View>
            <FieldLabel label="Your email" />
            <ExaloTextInput
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={styles.inputContainer}
            />
          </View>
          <View>
            <FieldLabel label="Subject" />
            <ExaloTextInput
              value={form.subject}
              onChangeText={(v) => setForm({ ...form, subject: v })}
              containerStyle={styles.inputContainer}
            />
          </View>
          <View>
            <FieldLabel label="Message" />
            <ExaloTextInput
              value={form.message}
              onChangeText={(v) => setForm({ ...form, message: v })}
              multiline
              placeholder={
                modal === 'report'
                  ? 'Tell us what went wrong, and what you were doing when it happened…'
                  : modal === 'suggest'
                    ? 'What would make Exalo more fun or helpful?'
                    : 'How can we help?'
              }
              containerStyle={styles.inputContainer}
              fieldStyle={{ minHeight: 120, height: undefined, paddingTop: 12 }}
            />
          </View>
          <PrimaryBtn label="Send message" onPress={sendEmail} icon={Send} />
        </View>
      </ProfileModal>

      {/* Screen-level toast when no dialog Modal is open (Coming soon uses dialog-level toast). */}
      {!modal ? (
        <FloatingToast
          toast={toast}
          onDismiss={dismissToast}
          toastWidth={toastWidth}
          placement={toastPlacement}
          topInset={toastTopInset}
          bottomInset={toastBottomInset}
          leftInset={toastLeftInset}
          rightInset={toastRightInset}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'relative',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    height: '100%',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  stickyHeader: {
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(33, 42, 71, 0.5)',
    backgroundColor: 'rgba(8, 12, 33, 0.6)',
  },
  pageTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: PROFILE_FOREGROUND,
  },
  closeBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(18, 24, 54, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  headerCard: {
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(18, 24, 54, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.6)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarBtn: {
    position: 'relative',
  },
  avatarRing: {
    height: 80,
    width: 80,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: PROFILE_MUTED,
    borderWidth: 2,
    borderColor: 'rgba(25, 140, 255, 0.6)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: PROFILE_FOREGROUND,
  },
  paletteBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: PROFILE_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
    minWidth: 0,
  },
  displayName: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: PROFILE_FOREGROUND,
  },
  yearLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: PROFILE_MUTED_FOREGROUND,
    marginTop: 2,
  },
  streakPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 138, 41, 0.2)',
  },
  streakText: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    color: PROFILE_ACCENT_GLOW,
  },
  avatarPicker: {
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(8, 12, 33, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
  },
  avatarPickerHint: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: PROFILE_MUTED_FOREGROUND,
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarOption: {
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.backgroundDeep,
    borderWidth: 2,
  },
  avatarOptionImg: {
    width: '100%',
    height: '100%',
  },
  avatarCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PROFILE_ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    borderRadius: 24,
    backgroundColor: 'rgba(18, 24, 54, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.6)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  sectionIconWrap: {
    height: 40,
    width: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_FOREGROUND,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(8, 12, 33, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 14,
    color: PROFILE_FOREGROUND,
  },
  rowValue: {
    maxWidth: '40%',
    fontFamily: fonts.display,
    fontSize: 12,
    color: PROFILE_MUTED_FOREGROUND,
  },
  planCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 41, 0.4)',
    backgroundColor: 'rgba(255, 138, 41, 0.12)',
  },
  planLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: PROFILE_MUTED_FOREGROUND,
  },
  planValue: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: PROFILE_FOREGROUND,
    marginTop: 2,
  },
  upgradePill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PROFILE_ACCENT,
  },
  upgradePillText: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  logoutBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 67, 67, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 67, 67, 0.4)',
  },
  logoutText: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: PROFILE_DESTRUCTIVE,
  },
  version: {
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 10,
    color: PROFILE_MUTED_FOREGROUND,
    paddingTop: 8,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  modalCard: {
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.6)',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(33, 42, 71, 0.5)',
    backgroundColor: 'rgba(8, 12, 33, 0.6)',
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: PROFILE_FOREGROUND,
    flex: 1,
    paddingRight: 8,
  },
  modalCloseBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(18, 24, 54, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBodyScroll: {
    maxHeight: 480,
  },
  modalBody: {
    padding: 16,
  },
  formStack: {
    gap: 12,
  },
  fieldLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    color: PROFILE_MUTED_FOREGROUND,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputContainer: {
    maxWidth: undefined,
    alignSelf: 'stretch',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: PROFILE_PRIMARY,
  },
  primaryBtnText: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  helperText: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: PROFILE_MUTED_FOREGROUND,
    paddingTop: 8,
  },
  bodyText: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: PROFILE_FOREGROUND,
    lineHeight: 20,
  },
  mutedBullet: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: PROFILE_MUTED_FOREGROUND,
    lineHeight: 20,
  },
  upgradeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(25, 140, 255, 0.4)',
    backgroundColor: 'rgba(25, 140, 255, 0.12)',
    gap: 6,
  },
  priceText: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: PROFILE_FOREGROUND,
  },
  priceSuffix: {
    fontSize: 14,
    fontWeight: '400',
    color: PROFILE_MUTED_FOREGROUND,
  },
  bullet: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: PROFILE_FOREGROUND,
    marginTop: 4,
  },
  dashedBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(33, 42, 71, 0.6)',
  },
  mutedCenter: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: PROFILE_MUTED_FOREGROUND,
    textAlign: 'center',
  },
  deleteBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: PROFILE_DESTRUCTIVE,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  faqCard: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(8, 12, 33, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
  },
  faqQ: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_FOREGROUND,
  },
  faqA: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: PROFILE_MUTED_FOREGROUND,
    marginTop: 4,
  },
  /** Lovable ToastViewport layer — pointer-events only on the toast card. */
  toastLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
  /**
   * Lovable Toast: `w-full rounded-md border p-6 pr-8 shadow-lg bg-background`.
   * Measured @390: pad 24/32/24/24, radius 18, h≈69, title 14/600 left-aligned.
   */
  toastBanner: {
    position: 'absolute',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PROFILE_BORDER,
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 32,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  toastTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: PROFILE_FOREGROUND,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  toastDescription: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: PROFILE_MUTED_FOREGROUND,
    marginTop: 4,
    opacity: 0.9,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
});
