import { useLocalSearchParams } from 'expo-router';
import { ComingSoonPlaceholder } from '@/components/placeholder/ComingSoonPlaceholder';
import { normalizeJourneySubject } from '@/constants/journey';

/**
 * M3+ Test destination placeholder — keeps Journey Test hotspot live.
 */
export default function TestPlaceholderScreen() {
  const { subject: subjectParam } = useLocalSearchParams<{ subject: string }>();
  const subject = normalizeJourneySubject(subjectParam);
  const label = subject === 'english' ? 'English' : subject === 'maths' ? 'Maths' : 'Subject';

  return (
    <ComingSoonPlaceholder
      title={`${label} Test`}
      subtitle="Test mode papers and timers arrive in a later milestone. Journey navigation is wired."
    />
  );
}
