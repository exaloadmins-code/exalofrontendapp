import { useEffect, useMemo, useState } from 'react';
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
import { ExaloTextInput, PrimaryButton } from '@/components/ui';
import {
  FOCUS,
  FOCUS_COPY,
  FOCUS_QUESTION_COUNT_COPY as COPY,
  isValidFocusQuestionCount,
  parseFocusQuestionCountInput,
} from '@/constants/focus';
import { fonts } from '@/theme';

export type FocusQuestionCountModalProps = {
  visible: boolean;
  /** Bumps when returning to setup / reopening so the field stays empty. */
  resetKey: number;
  starting?: boolean;
  onCancel: () => void;
  /** Called only with a validated integer in 5–50. */
  onConfirm: (count: number) => void;
};

/**
 * Start-time Focus question-count prompt.
 * ONE numeric text box only — no stepper, presets, or defaults.
 * Always opens with an empty field.
 */
export function FocusQuestionCountModal({
  visible,
  resetKey,
  starting = false,
  onCancel,
  onConfirm,
}: FocusQuestionCountModalProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // Frozen: every open/close starts empty — never prefill prior/default count.
    setInputText('');
  }, [visible, resetKey]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!starting) {
        onCancel();
      }
      return true;
    });
    return () => sub.remove();
  }, [visible, onCancel, starting]);

  const parsed = useMemo(
    () => parseFocusQuestionCountInput(inputText),
    [inputText],
  );
  const selected = parsed.ok ? parsed.value : null;
  const canConfirm =
    selected != null && isValidFocusQuestionCount(selected) && !starting;

  const feedback = useMemo(() => {
    if (inputText.trim().length === 0) {
      return null;
    }
    if (parsed.ok) {
      return null;
    }
    return COPY.helper;
  }, [inputText, parsed]);

  const onChangeCount = (text: string) => {
    // Digits only while editing — reject decimals/signs/letters at the source.
    setInputText(text.replace(/[^\d]/g, ''));
  };

  const handleConfirm = () => {
    if (!canConfirm || selected == null) {
      return;
    }
    onConfirm(selected);
  };

  const cardMaxWidth = Math.min(windowWidth - 40, 420);
  const landscape = windowWidth > windowHeight;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!starting) {
          onCancel();
        }
      }}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            disabled={starting}
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
              testID="focus-question-count-modal"
              accessibilityViewIsModal
              style={[
                styles.card,
                {
                  width: cardMaxWidth,
                  maxHeight: landscape
                    ? Math.max(
                        260,
                        windowHeight - insets.top - insets.bottom - 24,
                      )
                    : undefined,
                },
              ]}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.cardScroll}
              >
                <Text
                  accessibilityRole="header"
                  style={styles.title}
                >
                  {COPY.title}
                </Text>
                <Text style={styles.subtitle}>{COPY.subtitle}</Text>

                <ExaloTextInput
                  key={`focus-count-${resetKey}`}
                  label={COPY.inputLabel}
                  placeholder={COPY.inputPlaceholder}
                  value={inputText}
                  onChangeText={onChangeCount}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={2}
                  helperText={COPY.helper}
                  errorText={feedback ?? undefined}
                  accessibilityLabel={COPY.inputLabel}
                  containerStyle={styles.inputWrap}
                  onSubmitEditing={handleConfirm}
                  returnKeyType="done"
                />

                <PrimaryButton
                  label={starting ? FOCUS_COPY.loading : FOCUS_COPY.start}
                  onPress={handleConfirm}
                  disabled={!canConfirm}
                  showChevron={false}
                  style={styles.cta}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  accessibilityState={{ disabled: starting }}
                  disabled={starting}
                  onPress={onCancel}
                  style={styles.cancelLink}
                >
                  <Text style={styles.cancelLabel}>Cancel</Text>
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
  flex: { flex: 1 },
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
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cardScroll: { paddingBottom: 8 },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: FOCUS.intro,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputWrap: { marginBottom: 4 },
  cta: { marginTop: 18 },
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
