import {
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
} from '@expo-google-fonts/hind-siliguri';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nProvider } from '../lib/i18n';
import { rescheduleAll } from '../lib/notifications';
import { loadState } from '../lib/storage';
import { ThemeProvider, useTheme } from '../lib/ThemeContext';

SplashScreen.preventAutoHideAsync();

const reschedule = () => {
  loadState().then(rescheduleAll).catch(() => { });
};

function RootStack() {
  const { theme, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="filter/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="setup" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
    DSEG7: require('../../assets/fonts/DSEG7Classic-BoldItalic.ttf'),
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // প্রতিবার অ্যাপ খুললে রিমাইন্ডার নতুন করে বসে
  useEffect(reschedule, []);

  if (!loaded && !error) return null;

  return (
    <I18nProvider onChange={reschedule}>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </I18nProvider>
  );
}
