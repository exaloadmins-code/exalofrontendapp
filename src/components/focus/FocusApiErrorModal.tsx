import { useEffect } from 'react';
import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TRAIN_GAMEPLAY as T } from '@/constants/trainGameplay';
import { fonts } from '@/theme';

export type FocusApiErrorPrompt = {
  title: string;
  message: string;
};

export type FocusApiErrorModalProps = {
  error: FocusApiErrorPrompt | null;
  onDismiss: () => void;
};

/**
 * Train-parity API error presentation for Focus setup AND gameplay finalize.
 * Same card language as Train gameplay load failure (title + body + dismiss).
 * Modal so it remains visible over artboard/gameplay (never raw inline ApiError).
 */
export function FocusApiErrorModal({
  error,
  onDismiss,
}: FocusApiErrorModalProps) {
  const insets = useSafeAreaInsets();
  const visible = error != null;

  useEffect(() => {
    if (!visible) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onDismiss();
      return true;
    });
    return () => sub.remove();
  }, [visible, onDismiss]);

  if (!error) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View
        style={[
          styles.backdrop,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss error"
          onPress={onDismiss}
          style={StyleSheet.absoluteFill}
        />
        <View
          testID="focus-api-error-modal"
          accessibilityViewIsModal
          style={styles.errorCard}
        >
          <Text
            accessibilityRole="header"
            style={styles.errorTitle}
          >
            {error.title}
          </Text>
          <Text style={styles.errorBody}>{error.message}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="OK"
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.cta,
              { opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <Text style={styles.ctaLabel}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 2, 24, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Match Train gameplay error card (app/train/.../index.tsx).
  errorCard: {
    maxWidth: T.emptyMaxWidth,
    width: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(26, 23, 72, 0.96)',
    borderWidth: 1,
    borderColor: T.errorBorder,
    padding: 32,
    alignItems: 'center',
    zIndex: 1,
  },
  errorTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: T.errorText,
    marginBottom: 24,
    textAlign: 'center',
  },
  cta: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: T.cta,
  },
  ctaLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
