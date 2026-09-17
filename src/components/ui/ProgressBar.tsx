import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, typography } from '@/theme';
import { useResponsive } from '@/hooks';

type ProgressBarProps = {
  /** 1-based current step */
  step: number;
  /** Total steps */
  total?: number;
  showLabel?: boolean;
  style?: ViewStyle;
};

/**
 * Lovable onboarding progress: “n of 5”, orange fill, node dots, Text rocket marker.
 * TP-067 progress_rocket.png is REJECTED — use system/Text glyph only.
 */
export function ProgressBar({ step, total = 5, showLabel = true, style }: ProgressBarProps) {
  const { s, fs } = useResponsive();
  const clamped = Math.min(Math.max(step, 1), total);
  const progress = (clamped - 1) / Math.max(total - 1, 1);
  const nodeSize = s(14);
  const rocketSize = fs(18);

  return (
    <View style={style}>
      {showLabel ? (
        <Text
          style={[
            typography.caption,
            {
              fontSize: fs(12),
              color: colors.textSecondary,
              marginBottom: s(8),
              fontWeight: '500',
            },
          ]}
        >
          {clamped} of {total}
        </Text>
      ) : null}

      <View style={{ height: s(28), justifyContent: 'center' }}>
        <View style={[styles.track, { height: s(6), borderRadius: radius.pill }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${progress * 100}%`,
                height: s(6),
                borderRadius: radius.pill,
              },
            ]}
          />
        </View>

        {Array.from({ length: total }).map((_, index) => {
          const p = (index / Math.max(total - 1, 1)) * 100;
          const active = index + 1 <= clamped;
          return (
            <View
              key={index}
              style={[
                styles.node,
                {
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: nodeSize / 2,
                  left: `${p}%`,
                  marginLeft: -nodeSize / 2,
                  backgroundColor: active ? colors.orange : colors.progressTrack,
                  borderColor: active ? colors.orange : colors.borderMuted,
                },
              ]}
            />
          );
        })}

        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            position: 'absolute',
            left: `${progress * 100}%`,
            marginLeft: -rocketSize / 2,
            top: -s(18),
            fontSize: rocketSize,
            transform: [{ rotate: '45deg' }],
          }}
        >
          🚀
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.progressTrack,
    width: '100%',
  },
  fill: {
    backgroundColor: colors.orange,
  },
  node: {
    position: 'absolute',
    borderWidth: 2,
  },
});
