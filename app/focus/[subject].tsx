import { useLocalSearchParams } from 'expo-router';
import { ComingSoonPlaceholder } from '@/components/placeholder/ComingSoonPlaceholder';
import { normalizeJourneySubject } from '@/constants/journey';

/**
 * M3+ Focus destination placeholder — keeps Journey Focus hotspot live.
 */
export default function FocusPlaceholderScreen() {
  const { subject: subjectParam } = useLocalSearchParams<{ subject: string }>();
  const subject = normalizeJourneySubject(subjectParam);
  const label = subject === 'english' ? 'English' : subject === 'maths' ? 'Maths' : 'Subject';

  return (
    <ComingSoonPlaceholder
      title={`${label} Focus`}
      subtitle="Focus mode session setup and gameplay arrive in a later milestone. Journey navigation is wired."
    />
  );
}
