import {
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { colors, fonts } from '@/theme';
import { useResponsive } from '@/hooks';
import { useDeviceLayout } from '@/responsive';

const INNER_RESET_STYLE_ID = 'exalo-text-input-chrome-reset';

/**
 * RN Web TextInput does not forward `className`. Use `dataSet` → `data-exalo-text-input`.
 * Browser UA :focus outline/box-shadow must be killed or a second rectangle appears.
 */
function ensureWebInputChromeReset(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }
  if (document.getElementById(INNER_RESET_STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = INNER_RESET_STYLE_ID;
  style.textContent = `
[data-exalo-text-input="1"],
[data-exalo-text-input="1"]:focus,
[data-exalo-text-input="1"]:focus-visible,
[data-exalo-text-input="1"]:active {
  outline: none !important;
  outline-width: 0 !important;
  outline-style: none !important;
  outline-color: transparent !important;
  outline-offset: 0 !important;
  /* Kill UA focus ring; Exalo focus ring is applied via inline box-shadow when focused */
  -webkit-appearance: none !important;
  appearance: none !important;
}
[data-exalo-text-input="1"]:not([data-exalo-focused="1"]),
[data-exalo-text-input="1"]:not([data-exalo-focused="1"]):focus {
  box-shadow: none !important;
  -webkit-box-shadow: none !important;
}
`;
  document.head.appendChild(style);
}

/** Prevent callers from reintroducing a second nested chrome layer via inputStyle. */
function sanitizeTextOnlyStyle(style?: TextStyle): TextStyle | undefined {
  if (!style) {
    return undefined;
  }
  const flat = StyleSheet.flatten(style) as Record<string, unknown>;
  const {
    borderWidth: _a,
    borderColor: _b,
    borderStyle: _c,
    borderRadius: _d,
    borderTopWidth: _e,
    borderBottomWidth: _f,
    borderLeftWidth: _g,
    borderRightWidth: _h,
    outlineWidth: _i,
    outlineColor: _j,
    outlineStyle: _k,
    outlineOffset: _l,
    boxShadow: _m,
    backgroundColor: _n,
    background: _o,
    height: _p,
    minHeight: _q,
    paddingLeft: _r,
    paddingRight: _s,
    paddingHorizontal: _t,
    ...rest
  } = flat;
  return rest as TextStyle;
}

/**
 * Canonical Exalo text-entry — Lovable onboarding Input architecture:
 *
 * ONE bordered control = the TextInput itself (h-12, rounded-2xl).
 * Leading icon is absolutely positioned over left padding (pl-10 / pl-9).
 * There is no second bordered View wrapping the TextInput.
 *
 * See docs/EXALO_INPUT_DESIGN_SYSTEM.md.
 */
export type ExaloTextInputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: ReactNode;
  containerStyle?: ViewStyle;
  /** @deprecated Prefer not to override chrome. Kept for layout margins only via containerStyle. */
  fieldStyle?: ViewStyle;
  /** Text typography only — border/background/radius stripped. */
  inputStyle?: TextStyle;
  variant?: 'default';
  /**
   * Optional override for bottom corner radii (e.g. `0` when a dropdown is attached).
   * Top corners always use the default Exalo radius.
   */
  bottomCornerRadius?: number;
  /**
   * When true, focus uses border color/width only — no outer box-shadow/glow ring.
   * Required for attached combobox joins so bottom corners do not paint “hooks”.
   */
  disableFocusRing?: boolean;
  /** Rendered inside the same width container, directly below the field chrome. */
  belowControl?: ReactNode;
};

export type ExaloTextInputHandle = {
  focus: () => void;
  blur: () => void;
};

export const ExaloTextInput = forwardRef<ExaloTextInputHandle, ExaloTextInputProps>(
  function ExaloTextInput(
    {
      label,
      helperText,
      errorText,
      leftIcon,
      containerStyle,
      fieldStyle,
      inputStyle,
      variant = 'default',
      bottomCornerRadius,
      disableFocusRing = false,
      belowControl,
      onFocus,
      onBlur,
      editable = true,
      multiline = false,
      accessibilityLabel,
      ...rest
    },
    ref,
  ) {
    const { s, fs } = useResponsive();
    const { isTablet } = useDeviceLayout();
    const inputRef = useRef<TextInput>(null);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      ensureWebInputChromeReset();
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    const disabled = editable === false;
    const hasError = Boolean(errorText);

    // Lovable: h-12 (48), rounded-2xl (16), border-input, bg-background, pl-10 with icon
    const height = s(48);
    const radius = s(16);
    const padRight = s(16);
    const padLeft = leftIcon ? s(40) : s(16);
    const iconLeft = s(14);

    let borderColor: string = colors.inputBorder;
    let borderWidth = 1;
    if (hasError) {
      borderColor = colors.red;
      borderWidth = 1.5;
    } else if (focused) {
      borderColor = colors.inputRing;
      borderWidth = 2;
    }

    if (variant !== 'default') {
      console.warn(`[ExaloTextInput] Unsupported variant "${String(variant)}" — using default.`);
    }

    const bottomRadius = bottomCornerRadius ?? radius;

    // Lovable focus-visible:ring-2 ring-ring ring-offset-2 — on the SAME element as the border.
    // Attached comboboxes disable the outer ring so the join stays a clean shared border.
    const focusRingStyle: TextStyle | undefined = disableFocusRing
      ? Platform.OS === 'web'
        ? ({ boxShadow: 'none' } as unknown as TextStyle)
        : undefined
      : focused && !hasError
        ? Platform.OS === 'web'
          ? ({
              boxShadow: `0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.inputRing}`,
            } as unknown as TextStyle)
          : ({
              shadowColor: colors.inputRing,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.55,
              shadowRadius: 6,
            } as TextStyle)
        : Platform.OS === 'web'
          ? ({ boxShadow: 'none' } as unknown as TextStyle)
          : undefined;

    const safeTextStyle = sanitizeTextOnlyStyle(inputStyle);

    return (
      <View
        style={[
          { width: '100%', maxWidth: isTablet ? 480 : undefined, alignSelf: 'stretch' },
          containerStyle,
        ]}
      >
        {label ? (
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: fs(13),
              fontWeight: '600',
              color: colors.textSecondary,
              marginBottom: s(8),
              letterSpacing: 0.4,
            }}
          >
            {label}
          </Text>
        ) : null}

        <View style={[styles.controlWrap, fieldStyle]}>
          {leftIcon ? (
            <Pressable
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              onPress={() => {
                if (!disabled) {
                  inputRef.current?.focus();
                }
              }}
              style={[
                styles.iconHit,
                {
                  left: iconLeft,
                  height: multiline ? s(80) : height,
                  width: s(22),
                },
              ]}
            >
              <View pointerEvents="none">{leftIcon}</View>
            </Pressable>
          ) : null}

          <TextInput
            ref={inputRef}
            editable={editable}
            multiline={multiline}
            placeholderTextColor={colors.textMuted}
            underlineColorAndroid="transparent"
            accessibilityLabel={accessibilityLabel ?? label ?? rest.placeholder}
            {...rest}
            {...(Platform.OS === 'web'
              ? ({
                  // RN Web only — maps to data-exalo-text-input / data-exalo-focused
                  dataSet: {
                    exaloTextInput: '1',
                    exaloFocused: focused ? '1' : '0',
                  },
                } as object)
              : null)}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[
              styles.input,
              {
                minHeight: multiline ? s(80) : height,
                borderTopLeftRadius: radius,
                borderTopRightRadius: radius,
                borderBottomLeftRadius: bottomRadius,
                borderBottomRightRadius: bottomRadius,
                borderWidth,
                borderColor,
                backgroundColor: colors.inputBackground,
                paddingLeft: padLeft,
                paddingRight: padRight,
                paddingTop: multiline ? s(12) : Platform.OS === 'ios' ? s(12) : s(10),
                paddingBottom: multiline ? s(12) : Platform.OS === 'ios' ? s(12) : s(10),
                fontFamily: fonts.display,
                fontSize: fs(16),
                fontWeight: '500',
                color: colors.textPrimary,
                lineHeight: fs(22),
                opacity: disabled ? 0.5 : 1,
                textAlignVertical: multiline ? 'top' : 'center',
              },
              focusRingStyle,
              Platform.OS === 'web'
                ? ({
                    outlineWidth: 0,
                    outlineColor: 'transparent',
                    outlineOffset: 0,
                  } as unknown as TextStyle)
                : null,
              safeTextStyle,
            ]}
          />
        </View>

        {belowControl ?? null}

        {errorText || helperText ? (
          <Text
            style={{
              fontFamily: fonts.display,
              fontSize: fs(12),
              marginTop: s(8),
              color: hasError ? colors.red : colors.textSecondary,
              lineHeight: fs(16),
            }}
            accessibilityLiveRegion={hasError ? 'polite' : undefined}
          >
            {errorText ?? helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);

/** Historical export name — same component as `ExaloTextInput`. */
export const TextInputField = ExaloTextInput;

const styles = StyleSheet.create({
  controlWrap: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  iconHit: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    margin: 0,
    // Single control chrome — matches Lovable <input className="h-12 rounded-2xl …">
  },
});
