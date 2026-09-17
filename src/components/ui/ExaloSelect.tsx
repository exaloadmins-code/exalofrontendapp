import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import { ExaloTextInput } from './TextInputField';
import { colors, fonts } from '@/theme';
import { useResponsive } from '@/hooks';
import { useDeviceLayout } from '@/responsive';

export type ExaloSelectOption = {
  label: string;
  value: string;
};

export type ExaloSelectProps = {
  /** Predefined options. Strings are normalized to `{ label, value }`. */
  options: ReadonlyArray<string | ExaloSelectOption>;
  value: string | null;
  onChange: (value: string | null) => void;
  /** Closed-state placeholder when nothing is selected. */
  placeholder?: string;
  /** When true, open panel includes a filter field (ExaloTextInput). */
  searchable?: boolean;
  searchPlaceholder?: string;
  accessibilityLabel?: string;
  containerStyle?: ViewStyle;
  /** Max height of the options list (scrolls internally). */
  maxListHeight?: number;
  disabled?: boolean;
};

function normalizeOptions(
  options: ReadonlyArray<string | ExaloSelectOption>,
): ExaloSelectOption[] {
  return options.map((item) =>
    typeof item === 'string' ? { label: item, value: item } : item,
  );
}

/**
 * Canonical Exalo select / dropdown for predefined options.
 *
 * Distinct from `ExaloTextInput` (free-form text).
 * See docs/EXALO_SELECT_DESIGN_SYSTEM.md.
 */
export function ExaloSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  searchPlaceholder = 'Search…',
  accessibilityLabel,
  containerStyle,
  maxListHeight,
  disabled = false,
}: ExaloSelectProps) {
  const { s, fs } = useResponsive();
  const { isTablet } = useDeviceLayout();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const normalized = useMemo(() => normalizeOptions(options), [options]);

  const selected = useMemo(
    () => normalized.find((o) => o.value === value) ?? null,
    [normalized, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return normalized;
    }
    return normalized.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [normalized, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  // Web: close when clicking outside (no extra package).
  useEffect(() => {
    if (!open || Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      const wrap = document.querySelector('[data-exalo-select-root="1"]');
      const target = event.target as Node | null;
      if (wrap && target && !wrap.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const height = s(48);
  const radius = s(16);
  const listMax = maxListHeight ?? s(220);
  const borderColor = open ? colors.inputRing : colors.inputBorder;
  const borderWidth = open ? 2 : 1;

  const toggle = () => {
    if (disabled) {
      return;
    }
    setOpen((prev) => !prev);
  };

  const selectOption = (option: ExaloSelectOption) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <View
      {...(Platform.OS === 'web'
        ? ({ dataSet: { exaloSelectRoot: '1' } } as object)
        : null)}
      style={[
        {
          width: '100%',
          maxWidth: isTablet ? 480 : undefined,
          alignSelf: 'stretch',
          zIndex: open ? 20 : 1,
        },
        containerStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        disabled={disabled}
        onPress={toggle}
        style={[
          styles.trigger,
          {
            minHeight: height,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderBottomLeftRadius: open ? 0 : radius,
            borderBottomRightRadius: open ? 0 : radius,
            borderWidth,
            borderColor,
            backgroundColor: colors.inputBackground,
            paddingHorizontal: s(16),
            opacity: disabled ? 0.5 : 1,
          },
          open && Platform.OS === 'web'
            ? ({
                boxShadow: `0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.inputRing}`,
              } as ViewStyle)
            : null,
        ]}
      >
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: fonts.display,
            fontSize: fs(16),
            fontWeight: '500',
            color: selected ? colors.textPrimary : colors.textMuted,
            paddingRight: s(8),
          }}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            fontFamily: fonts.display,
            fontSize: fs(12),
            color: colors.textMuted,
          }}
        >
          {open ? '▲' : '▼'}
        </Text>
      </Pressable>

      {open ? (
        <View
          style={[
            styles.panel,
            {
              borderWidth,
              borderTopWidth: 0,
              borderColor,
              borderBottomLeftRadius: radius,
              borderBottomRightRadius: radius,
              backgroundColor: colors.inputBackground,
            },
          ]}
        >
          {searchable ? (
            <View style={{ paddingHorizontal: s(10), paddingTop: s(10), paddingBottom: s(6) }}>
              <ExaloTextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel={searchPlaceholder}
                leftIcon={<Text style={{ fontSize: fs(14), color: colors.textMuted }}>⌕</Text>}
              />
            </View>
          ) : null}

          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: listMax }}
            contentContainerStyle={{ paddingBottom: s(8) }}
          >
            {filtered.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={option.label}
                  onPress={() => selectOption(option)}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      minHeight: s(44),
                      paddingHorizontal: s(16),
                      paddingVertical: s(12),
                      backgroundColor: isSelected
                        ? 'rgba(255,138,60,0.15)'
                        : pressed
                          ? 'rgba(36,51,86,0.55)'
                          : 'transparent',
                      borderLeftWidth: isSelected ? 3 : 0,
                      borderLeftColor: colors.orange,
                    },
                  ]}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: fonts.display,
                      fontSize: fs(14),
                      fontWeight: isSelected ? '600' : '500',
                      color: colors.textPrimary,
                    }}
                    numberOfLines={2}
                  >
                    {isSelected ? (
                      <Text style={{ color: colors.orange }}>● </Text>
                    ) : (
                      <Text style={{ color: colors.textMuted }}>○ </Text>
                    )}
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}

            {filtered.length === 0 ? (
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: fs(13),
                  color: colors.textSecondary,
                  paddingHorizontal: s(16),
                  paddingVertical: s(14),
                }}
              >
                No matching schools
              </Text>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  panel: {
    width: '100%',
    overflow: 'hidden',
  },
  option: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
