import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { ExaloTextInput, PrimaryButton } from '@/components/ui';
import {
  TRAIN_QUESTION_COUNT_COPY as COPY,
  TRAIN_QUESTION_COUNT_PRESETS,
  isValidTrainQuestionCount,
  parseTrainQuestionCountInput,
} from '@/constants/train';
import { TRAIN_GAMEPLAY as T } from '@/constants/trainGameplay';
import { fonts } from '@/theme';

export type TrainQuestionCountModalProps = {
  visible: boolean;
  topicLabel: string;
  difficultyLabel: string;
  /** Bumps when a new topic opens the modal so count state resets fresh. */
  resetKey: string;
  starting?: boolean;
  onCancel: () => void;
  onStart: (questionCount: number) => void;
};

/**
 * Number-of-Questions popup over Train Selection.
 * Preserves Train artboard underneath; no dedicated /count route.
 */
export function TrainQuestionCountModal({
  visible,
  topicLabel,
  difficultyLabel,
  resetKey,
  starting = false,
  onCancel,
  onStart,
}: TrainQuestionCountModalProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (visible) {
      setInputText('');
    }
  }, [visible, resetKey]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => sub.remove();
  }, [visible, onCancel]);

  const parsed = useMemo(
    () => parseTrainQuestionCountInput(inputText),
    [inputText],
  );
  const questionCount = parsed.ok ? parsed.value : null;
  const canStart =
    questionCount != null &&
    isValidTrainQuestionCount(questionCount) &&
    !starting;

  const feedback = useMemo(() => {
    if (inputText.trim().length === 0) {
      return null;
    }
    if (parsed.ok) {
      return null;
    }
    if (parsed.reason === 'tooLow') return COPY.tooLow;
    if (parsed.reason === 'tooHigh') return COPY.tooHigh;
    return COPY.invalid;
  }, [inputText, parsed]);

  const selectPreset = useCallback((n: number) => {
    setInputText(String(n));
  }, []);

  const onChangeCount = useCallback((text: string) => {
    setInputText(text.replace(/[^\d]/g, ''));
  }, []);

  const handleStart = useCallback(() => {
    if (!canStart || questionCount == null) {
      return;
    }
    onStart(questionCount);
  }, [canStart, questionCount, onStart]);

  const cardMaxWidth = Math.min(windowWidth - 40, 420);
  const landscape = windowWidth > windowHeight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.cancel}
            onPress={onCancel}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="box-none"
            style={[
              styles.centerWrap,
              {
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 12,
                paddingHorizontal: 20,
              },
            ]}
          >
            <View
              style={[
                styles.card,
                {
                  width: cardMaxWidth,
                  maxHeight: landscape
                    ? Math.max(280, windowHeight - insets.top - insets.bottom - 24)
                    : undefined,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.cancel}
                onPress={onCancel}
                style={styles.closeBtn}
                hitSlop={10}
              >
                <X size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.cardScroll}
              >
                <Text style={styles.title}>{COPY.title}</Text>
                <Text style={styles.subtitle}>
                  {COPY.subtitle(topicLabel, difficultyLabel)}
                </Text>

                <View style={styles.presetRow}>
                  {TRAIN_QUESTION_COUNT_PRESETS.map((n) => {
                    const selected = questionCount === n;
                    return (
                      <Pressable
                        key={n}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`${n} questions`}
                        onPress={() => selectPreset(n)}
                        style={[
                          styles.presetPill,
                          selected ? styles.presetPillSelected : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetLabel,
                            selected ? styles.presetLabelSelected : null,
                          ]}
                        >
                          {n}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <ExaloTextInput
                  label={COPY.inputLabel}
                  placeholder={COPY.inputPlaceholder}
                  value={inputText}
                  onChangeText={onChangeCount}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={2}
                  errorText={feedback ?? undefined}
                  accessibilityLabel={COPY.inputLabel}
                  containerStyle={styles.inputWrap}
                />

                <PrimaryButton
                  label={starting ? COPY.loading : COPY.start}
                  onPress={handleStart}
                  disabled={!canStart}
                  showChevron={false}
                  style={styles.cta}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={COPY.cancel}
                  onPress={onCancel}
                  style={styles.cancelLink}
                >
                  <Text style={styles.cancelLabel}>{COPY.cancel}</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 2, 24, 0.72)',
    justifyContent: 'center',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(26, 23, 72, 0.96)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.55)',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  cardScroll: {
    paddingBottom: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 11, 52, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 255, 0.4)',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 28,
  },
  subtitle: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '500',
    color: T.violetText,
    textAlign: 'center',
    marginBottom: 22,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  presetPill: {
    minWidth: 68,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 11, 52, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 255, 0.35)',
  },
  presetPillSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
    borderColor: '#A78BFA',
  },
  presetLabel: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(221, 214, 254, 0.9)',
  },
  presetLabelSelected: {
    color: '#FFFFFF',
  },
  inputWrap: {
    marginBottom: 4,
  },
  cta: {
    marginTop: 16,
  },
  cancelLink: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(196, 181, 253, 0.9)',
  },
});
