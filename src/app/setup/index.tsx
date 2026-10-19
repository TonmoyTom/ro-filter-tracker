import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PrimaryButton } from '../../components/Button';
import { Segmented, TextField } from '../../components/Form';
import { HexPattern } from '../../components/HexPattern';
import { LcdPanel } from '../../components/MachineDisplay';
import { Screen } from '../../components/Screen';
import { SetupHeader } from '../../components/SetupHeader';
import { Lang } from '../../constants/presets';
import { font, lcd } from '../../constants/theme';
import { useI18n } from '../../lib/i18n';
import { loadState, savePurifier } from '../../lib/storage';
import { useTheme } from '../../lib/ThemeContext';

// ধাপ ১: ভাষা, পিউরিফায়ারের নাম আর ব্র্যান্ড
export default function PurifierStep() {
  const { theme } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = !!edit;
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');

  useEffect(() => {
    loadState().then((s) => {
      setName(s.purifier?.name ?? '');
      setBrand(s.purifier?.brand ?? '');
    });
  }, []);

  const ready = brand.trim().length > 0;

  const next = async () => {
    await savePurifier(name, brand);
    if (editing) router.back();
    else router.push('/setup/cartridges');
  };

  return (
    <Screen
      footer={
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, opacity: ready ? 1 : 0.4 }} pointerEvents={ready ? 'auto' : 'none'}>
          <PrimaryButton icon={editing ? 'checkmark' : 'arrow-forward'} label={editing ? t('save') : t('next')} onPress={next} />
        </View>
      }
    >
      <SetupHeader step={1} editing={editing} />

      {/* ব্র্যান্ড লিখলেই মেশিনের গায়ে ফুটে ওঠে */}
      <Animated.View entering={FadeInDown.duration(500)}>
        <LinearGradient colors={lcd.body} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 22, padding: 10, paddingBottom: 12, marginTop: 22, marginHorizontal: 30, overflow: 'hidden', boxShadow: '0 16px 30px #00000055' }}>
          <HexPattern color="#FFFFFF10" scale={0.6} />
          <LcdPanel rows={[]} message={name.trim() || t('lcdWaiting')} messageColor={name.trim() ? lcd.blue : '#FFFFFF66'} />
          <Text numberOfLines={1} style={{ color: '#FFFFFFB0', fontSize: 9, fontWeight: '800', letterSpacing: 2.5, marginTop: 10 }}>
            {(brand.trim() || 'BRAND').toUpperCase()}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={{ color: theme.text, fontFamily: font.bold, fontSize: 30, lineHeight: 42, marginTop: 24 }}>
        {t('p1Title')}
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(160).duration(500)} style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 15, lineHeight: 24, marginBottom: 20 }}>
        {t('p1Sub')}
      </Animated.Text>

      <Animated.View entering={FadeInDown.delay(220).duration(500)}>
        {!editing && (
          <View style={{ marginBottom: 16 }}>
            <Segmented<Lang> value={lang} onChange={setLang} options={[['bn', 'বাংলা'], ['en', 'English']]} />
          </View>
        )}
        <TextField label={t('brand')} value={brand} onChangeText={setBrand} placeholder={t('brandHint')} icon="ribbon-outline" />
        <TextField label={t('purifierName')} hint={t('optional')} value={name} onChangeText={setName} placeholder={t('purifierNameHint')} icon="water-outline" />
      </Animated.View>
    </Screen>
  );
}

