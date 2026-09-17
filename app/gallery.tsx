import { ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BottomNavigation,
  Card,
  Chip,
  PrimaryButton,
  ProfilePill,
  ProgressBar,
  Screen,
  ScreenHeader,
  SecondaryButton,
  SectionTitle,
  TextInputField,
} from '@/components';
import { colors, spacing, typography } from '@/theme';
import { useResponsiveScale } from '@/hooks';

/**
 * Temporary design-system gallery for shared UI primitives.
 */
export default function DesignSystemGallery() {
  const { fs, s, width } = useResponsiveScale();
  const [step, setStep] = useState(3);
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [tab, setTab] = useState<'home' | 'parents'>('home');

  return (
    <Screen scroll avoidKeyboard edges={['top', 'left', 'right']}>
      <ScreenHeader
        showBack
        title="Design System"
        subtitle="Component gallery"
        rightSlot={<ProfilePill name="Prasad" />}
      />

      <Text style={[typography.caption, { fontSize: fs(12), marginBottom: s(16) }]}>
        Width {Math.round(width)} · temporary gallery only
      </Text>

      <GallerySection title="Typography">
        <Text style={[typography.display, { fontSize: fs(32) }]}>Display</Text>
        <Text style={[typography.title, { fontSize: fs(26) }]}>Title</Text>
        <Text style={[typography.heading, { fontSize: fs(20) }]}>Heading</Text>
        <Text style={[typography.body, { fontSize: fs(16) }]}>Body primary</Text>
        <Text style={[typography.bodySecondary, { fontSize: fs(15) }]}>Body secondary</Text>
        <Text style={[typography.caption, { fontSize: fs(13) }]}>Caption</Text>
        <SectionTitle
          title="Which year are you in?"
          highlight="year"
          subtitle="We'll tailor everything just for you!"
        />
      </GallerySection>

      <GallerySection title="Progress">
        <ProgressBar step={step} total={5} />
        <View style={styles.row}>
          <SecondaryButton label="Prev" onPress={() => setStep((v) => Math.max(1, v - 1))} />
          <SecondaryButton label="Next" onPress={() => setStep((v) => Math.min(5, v + 1))} />
        </View>
      </GallerySection>

      <GallerySection title="Buttons">
        <PrimaryButton label="Continue" tone="purple" onPress={() => undefined} />
        <View style={{ height: s(10) }} />
        <PrimaryButton label="Continue" tone="blue" onPress={() => undefined} />
        <View style={{ height: s(10) }} />
        <PrimaryButton label="Start mission" tone="orange" onPress={() => undefined} />
        <View style={{ height: s(10) }} />
        <PrimaryButton label="Test mode" tone="red" onPress={() => undefined} />
        <View style={{ height: s(10) }} />
        <SecondaryButton label="Skip for now" onPress={() => undefined} />
      </GallerySection>

      <GallerySection title="Inputs">
        <TextInputField
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          helperText="Pick a name you like – you'll see it everywhere!"
          accessibilityLabel="Gallery name demo"
        />
        <View style={{ height: s(12) }} />
        <TextInputField
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Text style={{ color: colors.textMuted }}>✉</Text>}
          accessibilityLabel="Gallery email demo"
        />
      </GallerySection>

      <GallerySection title="Chips">
        <View style={styles.chipRow}>
          {(['EASY', 'MEDIUM', 'HARD'] as const).map((level) => (
            <Chip
              key={level}
              label={level}
              selected={difficulty === level}
              tone={level === 'EASY' ? 'blue' : level === 'MEDIUM' ? 'orange' : 'red'}
              onPress={() => setDifficulty(level)}
              style={{ marginRight: s(8), marginBottom: s(8) }}
            />
          ))}
        </View>
        <View style={styles.chipRow}>
          {['Year 4', 'Year 5', 'Year 6'].map((year) => (
            <Chip key={year} label={year} style={{ marginRight: s(8), marginBottom: s(8) }} />
          ))}
        </View>
      </GallerySection>

      <GallerySection title="Cards">
        <Card tone="blue">
          <SectionTitle title="Onboarding card" highlight="card" subtitle="Slightly lighter navy surface" />
        </Card>
        <View style={{ height: s(12) }} />
        <Card tone="purple">
          <Text style={[typography.body, { fontSize: fs(15) }]}>Purple border tone</Text>
        </Card>
        <View style={{ height: s(12) }} />
        <Card tone="orange">
          <Text style={[typography.body, { fontSize: fs(15) }]}>Orange border tone</Text>
        </Card>
      </GallerySection>

      <GallerySection title="Profile">
        <View style={styles.row}>
          <ProfilePill name="Prasad" />
        </View>
      </GallerySection>

      <GallerySection title="Bottom navigation">
        <BottomNavigation activeTab={tab} onTabPress={setTab} score={62} />
      </GallerySection>

      <Text
        style={[
          typography.caption,
          {
            textAlign: 'center',
            color: colors.purple,
            marginTop: s(8),
            marginBottom: s(24),
            fontSize: fs(12),
          },
        ]}
      >
        Phase 1 · Design system gallery
      </Text>
    </Screen>
  );
}

function GallerySection({ title, children }: { title: string; children: ReactNode }) {
  const { fs, s } = useResponsiveScale();
  return (
    <View style={{ marginBottom: s(spacing.xxl) }}>
      <Text
        style={[
          typography.label,
          {
            color: colors.orange,
            fontSize: fs(12),
            marginBottom: s(12),
            letterSpacing: 1,
          },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});
