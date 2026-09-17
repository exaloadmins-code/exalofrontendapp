import { View } from 'react-native';

/**
 * Entry: AppProvider resolves Email vs resume step vs Home after storage load.
 * Do not hard-redirect to Home (that skipped incomplete onboarding).
 */
export default function Index() {
  return <View style={{ flex: 1 }} />;
}
