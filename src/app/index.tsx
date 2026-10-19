import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { IconButton } from '../components/Button';
import { FilterCard } from '../components/FilterCard';
import { MachineDisplay } from '../components/MachineDisplay';
import { PressableScale } from '../components/PressableScale';
import { Screen } from '../components/Screen';
import { font } from '../constants/theme';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { useAppState } from '../lib/useAppState';

// "পরে করব" চাপলে এই সেশনে আর সেটআপ খুলবে না
let setupPrompted = false;

export default function Home() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, isDemo } = useAppState();

  useEffect(() => {
    if (isDemo && state && !setupPrompted) {
      setupPrompted = true;
      router.push('/setup');
    }
  }, [isDemo, state]);

  if (!state) return null;

  const p = state.purifier;
  const subtitle = isDemo || !p ? t('tagline') : [...new Set([p.name, p.brand].filter(Boolean))].join(' · ');

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>{subtitle}</Text>
          <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 28, lineHeight: 38 }}>{t('title')}</Text>
        </View>
        <IconButton icon="options-outline" onPress={() => router.push('/settings')} />
      </View>

      <MachineDisplay state={state} />

      {isDemo && (
        <Animated.View entering={FadeIn.delay(300)}>
          <PressableScale
            onPress={() => router.push('/setup')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.blueTint, borderColor: theme.blue + '55', borderWidth: 1, borderRadius: 18, padding: 14, marginTop: 18 }}
          >
            <Ionicons name="sparkles-outline" size={22} color={theme.blue} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontFamily: font.semibold, fontSize: 15 }}>{t('demoTitle')}</Text>
              <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>{t('demoBody')}</Text>
            </View>
            <View style={{ backgroundColor: theme.blue, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: theme.onBlue, fontFamily: font.bold, fontSize: 13 }}>{t('demoCta')}</Text>
            </View>
          </PressableScale>
        </Animated.View>
      )}

      <View style={{ height: 20 }} />

      {state.cartridges.map((c, i) => (
        <FilterCard key={c.id} cartridge={c} index={i} />
      ))}
    </Screen>
  );
}
