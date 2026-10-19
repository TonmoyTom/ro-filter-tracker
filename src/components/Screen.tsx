import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../lib/ThemeContext';
import { HexPattern } from './HexPattern';

export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient
        colors={[theme.bgGlow, theme.bg]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420 }}
        pointerEvents="none"
      />
      <HexPattern color={theme.hex} />
      <SafeAreaView style={{ flex: 1 }} edges={footer ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer}
      </SafeAreaView>
    </View>
  );
}
