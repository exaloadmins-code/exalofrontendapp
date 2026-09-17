import { useLocalSearchParams } from 'expo-router';
import { ComingSoonPlaceholder } from '@/components/placeholder/ComingSoonPlaceholder';

export default function JourneyPlaceholder() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const label =
    subject === 'english' ? 'English Journey' : subject === 'maths' ? 'Maths Journey' : 'Journey';
  return (
    <ComingSoonPlaceholder
      title={label}
      subtitle="Journey, Train, Focus and Test modes are planned for later milestones. This placeholder keeps Home navigation live."
    />
  );
}
