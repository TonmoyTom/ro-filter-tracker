import { Stack } from 'expo-router';
import { useTheme } from '../../lib/ThemeContext';

// সেটআপের দুই ধাপ — একই মডালের ভেতরে পাশাপাশি
export default function SetupLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
