import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, Sparkles } from 'lucide-react-native';
import {
  FOCUS,
  FOCUS_COPY as COPY,
  FOCUS_DIFFICULTIES,
  type FocusDifficulty,
} from '@/constants/focus';
import type { TrainTopic } from '@/constants/train';
import { fonts } from '@/theme';

export type FocusSetupViewProps = {
  subjectLabel: string;
  topics: readonly TrainTopic[];
  selectedTopics: string[];
  selectedDiffs: FocusDifficulty[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onToggleTopic: (label: string) => void;
  onToggleAllTopics: () => void;
  onToggleDiff: (d: FocusDifficulty) => void;
  onStart: () => void;
};

/**
 * Lovable `FocusMode` setup UI — multi-topic + multi-difficulty selection.
 */
export function FocusSetupView({
  subjectLabel,
  topics,
  selectedTopics,
  selectedDiffs,
  loading,
  error,
  onBack,
  onToggleTopic,
  onToggleAllTopics,
  onToggleDiff,
  onStart,
}: FocusSetupViewProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth - 32, FOCUS.contentMaxWidth);
  const twoCol = windowWidth >= FOCUS.topicGridSmMinWidth;
  const allSelected =
    topics.length > 0 && selectedTopics.length === topics.length;
  const startDisabled =
    loading ||
    selectedTopics.length === 0 ||
    selectedDiffs.length === 0;

  const topicRows = useMemo(() => {
    if (!twoCol) {
      return topics.map((t) => [t] as const);
    }
    const rows: (readonly TrainTopic[])[] = [];
    for (let i = 0; i < topics.length; i += 2) {
      rows.push(topics.slice(i, i + 2));
    }
    return rows;
  }, [topics, twoCol]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: Math.max(16, (windowWidth - contentWidth) / 2),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ width: contentWidth, alignSelf: 'center' }}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
              style={styles.backBtn}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.25} />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>{subjectLabel}</Text>
              <Text style={styles.title}>{COPY.title}</Text>
            </View>
          </View>

          <Text style={styles.intro}>{COPY.intro}</Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{COPY.topicsHeading}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={allSelected ? COPY.clearAll : COPY.selectAll}
                onPress={onToggleAllTopics}
                hitSlop={8}
              >
                <Text style={styles.selectAll}>
                  {allSelected ? COPY.clearAll : COPY.selectAll}
                </Text>
              </Pressable>
            </View>

            <View style={styles.topicGrid}>
              {topicRows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.topicRow}>
                  {row.map((t) => {
                    const checked = selectedTopics.includes(t.label);
                    return (
                      <Pressable
                        key={t.slug}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked }}
                        accessibilityLabel={t.label}
                        onPress={() => onToggleTopic(t.label)}
                        style={[
                          styles.topicItem,
                          twoCol && styles.topicItemHalf,
                          checked && styles.topicItemChecked,
                        ]}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            checked && styles.checkboxChecked,
                          ]}
                        >
                          {checked ? (
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          ) : null}
                        </View>
                        <Text style={styles.topicLabel}>{t.label}</Text>
                      </Pressable>
                    );
                  })}
                  {twoCol && row.length === 1 ? (
                    <View style={styles.topicItemHalfSpacer} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.section, styles.diffSection]}>
            <Text style={[styles.sectionTitle, styles.diffHeading]}>
              {COPY.difficultyHeading}
            </Text>
            <View style={styles.diffRow}>
              {FOCUS_DIFFICULTIES.map((d) => {
                const on = selectedDiffs.includes(d);
                return (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={d}
                    onPress={() => onToggleDiff(d)}
                    style={[styles.diffBtn, on ? styles.diffOn : styles.diffOff]}
                  >
                    <Text style={[styles.diffLabel, !on && styles.diffLabelOff]}>
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              loading ? COPY.loading : COPY.start(selectedTopics.length)
            }
            accessibilityState={{ disabled: startDisabled }}
            disabled={startDisabled}
            onPress={onStart}
            style={[styles.ctaWrap, startDisabled && styles.ctaDisabled]}
          >
            <LinearGradient
              colors={[FOCUS.ctaFrom, FOCUS.ctaTo]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.cta}
            >
              <Sparkles size={16} color="#FFFFFF" strokeWidth={2.25} />
              <Text style={styles.ctaLabel}>
                {loading ? COPY.loading : COPY.start(selectedTopics.length)}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: FOCUS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    height: 44,
    width: 44,
    borderRadius: 999,
    backgroundColor: FOCUS.backBtnBg,
    borderWidth: 1,
    borderColor: FOCUS.backBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: FOCUS.subjectEyebrow,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  intro: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: FOCUS.intro,
    marginBottom: 20,
    lineHeight: 20,
  },
  section: {
    borderRadius: 24,
    backgroundColor: FOCUS.panel,
    borderWidth: 1,
    borderColor: FOCUS.panelBorder,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectAll: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    color: FOCUS.selectAll,
  },
  topicGrid: {
    gap: 8,
  },
  topicRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    backgroundColor: FOCUS.topicRowBg,
    borderWidth: 1,
    borderColor: FOCUS.topicRowBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  topicItemHalf: {
    flex: 1,
  },
  topicItemHalfSpacer: {
    flex: 1,
  },
  topicItemChecked: {
    borderColor: FOCUS.topicRowBorderActive,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: FOCUS.checkboxBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: FOCUS.checkboxCheckedBg,
    borderColor: FOCUS.checkboxCheckedBg,
  },
  topicLabel: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  diffSection: {
    marginBottom: 24,
  },
  diffHeading: {
    marginBottom: 12,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffOn: {
    backgroundColor: FOCUS.diffOnBg,
    borderColor: FOCUS.diffOnBorder,
  },
  diffOff: {
    backgroundColor: FOCUS.diffOffBg,
    borderColor: FOCUS.diffOffBorder,
  },
  diffLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  diffLabelOff: {
    color: FOCUS.diffOffText,
  },
  errorBox: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: FOCUS.errorBg,
    borderWidth: 1,
    borderColor: FOCUS.errorBorder,
    padding: 12,
  },
  errorText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: FOCUS.errorText,
  },
  ctaWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FOCUS.ctaBorder,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  ctaLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
