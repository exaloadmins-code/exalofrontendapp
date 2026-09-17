import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { useResponsiveScale } from '@/hooks';

type SectionTitleProps = {
  title: string;
  /** Substring highlighted in orange when found inside title */
  highlight?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  size?: 'title' | 'heading';
  rightSlot?: ReactNode;
  style?: ViewStyle;
};

/**
 * Title + optional orange highlight word + secondary subtitle.
 */
export function SectionTitle({
  title,
  highlight,
  subtitle,
  align = 'left',
  size = 'title',
  rightSlot,
  style,
}: SectionTitleProps) {
  const { fs, s } = useResponsiveScale();
  const textAlign = align;
  const baseStyle = size === 'heading' ? typography.heading : typography.title;
  const fontSize = size === 'heading' ? fs(20) : fs(24);

  const renderTitle = () => {
    if (!highlight || !title.includes(highlight)) {
      return (
        <Text style={[baseStyle, { fontSize, textAlign }]}>{title}</Text>
      );
    }

    const index = title.indexOf(highlight);
    const before = title.slice(0, index);
    const after = title.slice(index + highlight.length);

    return (
      <Text style={[baseStyle, { fontSize, textAlign }]}>
        {before}
        <Text style={{ color: colors.orange }}>{highlight}</Text>
        {after}
      </Text>
    );
  };

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <View style={styles.textCol}>{renderTitle()}</View>
        {rightSlot}
      </View>
      {subtitle ? (
        <Text
          style={[
            typography.bodySecondary,
            { fontSize: fs(14), textAlign, marginTop: s(spacing.sm) },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
  },
});
