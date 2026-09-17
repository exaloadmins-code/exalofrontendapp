import { useLocalSearchParams } from 'expo-router';
import { ComingSoonPlaceholder } from '@/components/placeholder/ComingSoonPlaceholder';
import { normalizeJourneySubject } from '@/constants/journey';

/**
 * M3+ Train destination placeholder — keeps Journey Train hotspot live.
 */
export default function TrainPlaceholderScreen() {
  const { subject: subjectParam } = useLocalSearchParams<{ subject: string }>();
  const subject = normalizeJourneySubject(subjectParam);
  const label = subject === 'english' ? 'English' : subject === 'maths' ? 'Maths' : 'Subject';

  return (
    <ComingSoonPlaceholder
      title={`${label} Train`}
      subtitle="Train mode topic selection and gameplay arrive in a later milestone. Journey navigation is wired."
    />
  );
}
