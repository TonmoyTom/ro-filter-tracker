import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { ReactNode, useCallback, useState } from 'react';
import { Alert, Linking, Pressable, Switch, Text, View } from 'react-native';
import { IconButton } from '../components/Button';
import { Cartridge } from '../components/Cartridge';
import { MonthStepper, Segmented } from '../components/Form';
import { PressableScale } from '../components/PressableScale';
import { Screen } from '../components/Screen';
import { Lang } from '../constants/presets';
import { StringKey } from '../constants/strings';
import { font } from '../constants/theme';
import { useI18n } from '../lib/i18n';
import { requestPermission, sendTestReminder } from '../lib/notifications';
import { cartridgeCode, presetOf } from '../lib/cartridges';
import { AppState, loadState, resetAll, updateMonths, updateSettings } from '../lib/storage';
import { Mode, useTheme } from '../lib/ThemeContext';

const DAY_OPTIONS = [3, 7, 15, 30];

export default function Settings() {
  const { theme, mode, setMode } = useTheme();
  const { t, lang, setLang, cName } = useI18n();
  const [state, setState] = useState<AppState | null>(null);

  // কার্টিজ এডিট করে ফিরলে নতুন তালিকা দেখায়
  useFocusEffect(
    useCallback(() => {
      loadState().then(setState);
    }, []),
  );

  if (!state) return null;

  const setMonths = async (id: string, months: number) => setState(await updateMonths(state, id, months));
  const p = state.purifier;

  // অনুমতি না থাকলে চাওয়া হয়; আগে "না" বলা থাকলে ফোনের সেটিংসে পাঠায়
  const askPermission = async () => {
    const res = await requestPermission(t('nChannel'));
    if (res === 'unavailable') Alert.alert(t('unavailTitle'), t('unavailBody'));
    if (res === 'blocked' || res === 'denied') {
      Alert.alert(t('permTitle'), t('permBody'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('openSettings'), onPress: () => Linking.openSettings() },
      ]);
    }
    return res === 'granted';
  };

  const toggleReminders = async (v: boolean) => {
    if (v && !(await askPermission())) return;
    setState(await updateSettings(state, { remindersOn: v }));
  };

  const testReminder = async () => {
    if (!(await askPermission())) return;
    await sendTestReminder(t('nTestTitle'), t('nTestBody'));
    Alert.alert(t('testSentTitle'), t('testSentBody'));
  };

  const toggle = async (key: 'remindersOn' | 'dailyAfterExpiry', v: boolean) =>
    setState(await updateSettings(state, { [key]: v }));

  const cycleDays = async () => {
    const i = DAY_OPTIONS.indexOf(state.remindDaysBefore);
    setState(await updateSettings(state, { remindDaysBefore: DAY_OPTIONS[(i + 1) % DAY_OPTIONS.length] }));
  };

  const confirmReset = () =>
    Alert.alert(t('resetTitle'), t('resetBody'), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('resetYes'),
        style: 'destructive',
        onPress: async () => {
          await resetAll();
          router.replace('/setup');
        },
      },
    ]);

  const card = { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 22, paddingHorizontal: 16 } as const;
  const rowBorder = (last: boolean) => ({ borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border });
  const switchProps = { trackColor: { true: theme.blue, false: theme.border }, thumbColor: '#FFFFFF', ios_backgroundColor: theme.border };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <IconButton icon="chevron-back" onPress={() => router.back()} />
        <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 26 }}>{t('settings')}</Text>
      </View>

      <Section title={t('language')}>
        <Segmented<Lang>
          value={lang}
          onChange={setLang}
          options={[['bn', 'বাংলা'], ['en', 'English']]}
        />
      </Section>

      <Section title={t('theme')}>
        <Segmented<Mode>
          value={mode}
          onChange={setMode}
          options={(['system', 'dark', 'light'] as const).map((m) => [m, t(`mode.${m}` as StringKey)])}
        />
      </Section>

      {state.setupDone && (
        <Section title={t('purifier')}>
          <View style={card}>
            <LinkRow
              icon="ribbon-outline"
              label={t('editPurifier')}
              value={[p?.brand, p?.name].filter(Boolean).join(' · ')}
              onPress={() => router.push('/setup?edit=1')}
            />
            <LinkRow
              icon="layers-outline"
              label={t('editCartridges')}
              value={t('cartridgesCount', { n: state.cartridges.length })}
              onPress={() => router.push('/setup/cartridges?edit=1')}
              last
            />
          </View>
        </Section>
      )}

      {state.setupDone && (
        <Section title={t('intervals')}>
          <View style={card}>
            {state.cartridges.map((c, i) => {
              const preset = presetOf(c);
              return (
                <View key={c.id} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, rowBorder(i === state.cartridges.length - 1)]}>
                  <Cartridge kind={preset.kind} cap={preset.cap} height={40} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ color: theme.text, fontFamily: font.bold, fontSize: 15 }}>
                      {cartridgeCode(c, i)} <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>{cName(c)}</Text>
                    </Text>
                    {preset.id !== 'custom' && (
                      <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 12 }}>{t('recommended', { n: preset.defaultMonths })}</Text>
                    )}
                  </View>
                  <MonthStepper value={c.months} onChange={(m) => setMonths(c.id, m)} />
                </View>
              );
            })}
          </View>
        </Section>
      )}

      <Section title={t('reminders')}>
        <View style={card}>
          <View style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }, rowBorder(false)]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontFamily: font.semibold, fontSize: 16 }}>{t('remindersOn')}</Text>
              <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>{t('remindersSub')}</Text>
            </View>
            <Switch value={state.remindersOn} onValueChange={toggleReminders} {...switchProps} />
          </View>

          <View style={{ opacity: state.remindersOn ? 1 : 0.4 }} pointerEvents={state.remindersOn ? 'auto' : 'none'}>
            <Pressable onPress={cycleDays} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }, rowBorder(false)]}>
              <Text style={{ flex: 1, color: theme.text, fontFamily: font.semibold, fontSize: 16 }}>{t('daysBefore')}</Text>
              <Text style={{ color: theme.blue, fontFamily: font.semibold, fontSize: 15 }}>{t('nDaysBefore', { n: state.remindDaysBefore })}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.blue} style={{ marginLeft: 4 }} />
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontFamily: font.semibold, fontSize: 16 }}>{t('daily')}</Text>
                <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>{t('dailySub')}</Text>
              </View>
              <Switch value={state.dailyAfterExpiry} onValueChange={(v) => toggle('dailyAfterExpiry', v)} {...switchProps} />
            </View>
          </View>
        </View>

        <PressableScale
          onPress={testReminder}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: theme.blue + '55', backgroundColor: theme.blueTint }}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.blue} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.blue, fontFamily: font.bold, fontSize: 15 }}>{t('testReminder')}</Text>
            <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 12 }}>{t('testReminderSub')}</Text>
          </View>
          <Ionicons name="paper-plane-outline" size={18} color={theme.blue} />
        </PressableScale>
      </Section>

      <PressableScale
        onPress={confirmReset}
        style={{ marginTop: 28, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.red + '66', backgroundColor: theme.redTint, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={theme.red} />
        <Text style={{ color: theme.red, fontFamily: font.semibold, fontSize: 15 }}>{t('reset')}</Text>
      </PressableScale>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ color: theme.textDim, fontFamily: font.medium, fontSize: 14, marginBottom: 8, marginLeft: 4 }}>{title}</Text>
      {children}
    </View>
  );
}

function LinkRow({ icon, label, value, onPress, last }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: string; onPress: () => void; last?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border }}
    >
      <Ionicons name={icon} size={20} color={theme.blue} />
      <Text style={{ color: theme.text, fontFamily: font.semibold, fontSize: 16 }}>{label}</Text>
      <Text numberOfLines={1} style={{ flex: 1, textAlign: 'right', color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>{value}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.blue} />
    </Pressable>
  );
}
