import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PhoneViewport } from '@/components/layout/PhoneViewport';
import { AppProvider } from '@/providers';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <PhoneViewport>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background, flex: 1 },
            animation: 'fade',
          }}
        />
      </PhoneViewport>
    </AppProvider>
  );
}
