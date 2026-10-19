import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconButton, PrimaryButton } from '../../components/Button';
import { Cartridge } from '../../components/Cartridge';
import { DatePickerSheet } from '../../components/DatePickerSheet';
import { HexPattern } from '../../components/HexPattern';
import { lcdRows } from '../../components/MachineDisplay';
import { RingProgress } from '../../components/RingProgress';
import { Screen } from '../../components/Screen';
import { SegmentBar } from '../../components/SegmentBar';
import { StatusPill } from '../../components/StatusPill';
import { font, lcd, statusColor } from '../../constants/theme';
import { cartridgeCode, cartridgeState, presetOf } from '../../lib/cartridges';
import { daysBetween } from '../../lib/dates';
import { useI18n } from '../../lib/i18n';
import { replaceCartridgeToday, setInstallDate } from '../../lib/storage';
import { useTheme } from '../../lib/ThemeContext';
import { useAppState } from '../../lib/useAppState';

export default function FilterDetail() {
  const { theme } = useTheme();
  const { t, date, cName, pDesc } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, isDemo, setState } = useAppState();
  const [editing, setEditing] = useState(false);

  const index = state?.cartridges.findIndex((c) => c.id === id) ?? -1;
  const record = state?.cartridges[index];
  if (!state || !record) return null;

  const preset = presetOf(record);
  const code = cartridgeCode(record, index);
  const months = record.months;
  const s = cartridgeState(record);
  const color = statusColor(theme, s.status);

  const all = [record.installedAt, ...record.history];
  const rows = all.map((iso, i) => {
    const start = new Date(iso);
    const end = i === 0 ? new Date() : new Date(all[i - 1]);
    return { iso, start, days: daysBetween(start, end), running: i === 0 };
  });

  // নমুনা ডাটা কখনো সেভ হয় না — আগে সেটআপ
  const guard = (fn: () => void) => () => (isDemo ? router.push('/setup') : fn());

  const confirmReplace = () =>
    Alert.alert(t('confirmTitle'), t('confirmBody', { code }), [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        onPress: async () => {
          setState(await replaceCartridgeToday(state, record.id));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
        },
      },
    ]);

  const onEditDate = async (d: Date) => {
    setEditing(false);
    setState(await setInstallDate(state, record.id, d));
  };

  return (
    <Screen
      footer={
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, gap: 10, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border }}>
          <PrimaryButton icon={isDemo ? 'sparkles-outline' : 'checkmark'} label={isDemo ? t('demoCta') : t('changedToday')} onPress={guard(confirmReplace)} />
          {!isDemo && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PrimaryButton variant="outline" icon="calendar-outline" label={t('editDate')} onPress={() => setEditing(true)} />
              <PrimaryButton variant="ghost" icon="notifications-outline" label={t('reminders')} onPress={() => router.push('/settings')} />
            </View>
          )}
        </View>
      }
    >
      {/* হেডার */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <IconButton icon="chevron-back" onPress={() => router.back()} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: theme.text, fontFamily: font.bold, fontSize: 20 }}>
            {code} · {cName(record)}
          </Text>
          <Text numberOfLines={1} style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 12 }}>
            {t('stage', { n: index + 1 })} · {record.presetId === 'custom' ? t('lastsMonths', { n: months }) : pDesc(preset)}
          </Text>
        </View>
        <StatusPill status={s.status} label={t(`statusLong.${s.status}`)} />
      </View>

      {/* হিরো: মেশিনের রঙে কার্টিজ আর রিং */}
      <Animated.View entering={FadeInDown.duration(450)}>
        <LinearGradient
          colors={lcd.body}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 26, padding: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#FFFFFF1A', marginBottom: 14 }}
        >
          <HexPattern color="#FFFFFF10" scale={0.7} />

          {/* ছোট ডিসপ্লে — অন্য ফিল্টারে যাওয়া যায় */}
          <View style={{ flexDirection: 'row', backgroundColor: lcd.bg, borderRadius: 14, padding: 6, gap: 4 }}>
            {lcdRows(state.cartridges).map((r) => {
              const on = r.id === record.id;
              const c = r.status ? statusColor(lcd, r.status) : '#FFFFFF55';
              return (
                <Pressable
                  key={r.id}
                  onPress={() => !on && router.setParams({ id: r.id })}
                  style={{ flex: 1, paddingHorizontal: 6, paddingVertical: 5, borderRadius: 9, borderWidth: 1, borderColor: on ? c : 'transparent', backgroundColor: on ? c + '1A' : 'transparent' }}
                >
                  <Text style={{ color: c, fontSize: 9, fontWeight: '800' }}>{r.code}</Text>
                  <SegmentBar fraction={r.remaining ?? 0} color={c} off={lcd.off} total={8} height={3} />
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
            <View style={{ width: 104, alignSelf: 'stretch', borderRadius: 18, backgroundColor: '#0000004D', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
              <Cartridge kind={preset.kind} cap={preset.cap} height={150} />
              <Text style={{ color: '#FFFFFFCC', fontFamily: font.semibold, fontSize: 12, marginTop: 6 }}>
                {t('stageOf', { n: index + 1, t: state.cartridges.length })}
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <RingProgress
                key={record.id}
                fraction={s.remaining}
                color={statusColor(lcd, s.status)}
                track="#FFFFFF14"
                days={Math.abs(s.daysLeft)}
                label={s.status === 'expired' ? t('daysOver') : t('daysLeft')}
                sub={t('used', { n: s.usedPercent })}
                subColor="#FFFFFF99"
                size={190}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* তারিখের তথ্য */}
      <Animated.View entering={FadeInDown.delay(80).duration(450)} style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, marginBottom: 14 }}>
        <InfoRow icon="calendar-outline" iconColor={theme.blue} label={t('lastChanged')} value={date(new Date(record.installedAt))} />
        <InfoRow icon="calendar-number-outline" iconColor={color} label={t('nextDue')} value={date(s.due)} valueColor={color} />
        <InfoRow icon="repeat-outline" iconColor={theme.blue} label={t('interval')} value={t('everyMonths', { n: months })} last />
      </Animated.View>

      {/* ইতিহাস */}
      <Animated.View entering={FadeInDown.delay(160).duration(450)} style={{ backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 22, padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 17 }}>{t('history')}</Text>
          <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>{t('records', { n: rows.length })}</Text>
        </View>
        {rows.map((r, i) => (
          <View key={r.iso} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40 }}>
            <View style={{ width: 16, alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center' }}>
              {i < rows.length - 1 && <View style={{ position: 'absolute', top: '50%', bottom: 0, width: 2, backgroundColor: theme.border }} />}
              {i > 0 && <View style={{ position: 'absolute', top: 0, bottom: '50%', width: 2, backgroundColor: theme.border }} />}
              <View
                style={{
                  width: r.running ? 14 : 10, height: r.running ? 14 : 10, borderRadius: 7,
                  backgroundColor: r.running ? theme.card : theme.textDim + '66',
                  borderWidth: r.running ? 3 : 0, borderColor: theme.blue,
                  boxShadow: r.running ? `0 0 8px ${theme.blue}` : undefined,
                }}
              />
            </View>
            <Text style={{ flex: 1, color: theme.text, fontFamily: font.semibold, fontSize: 15 }}>{date(r.start)}</Text>
            <Text style={{ color: r.running ? theme.blue : theme.textDim, fontFamily: font.regular, fontSize: 13 }}>
              {r.running ? t('running', { n: r.days }) : t('lasted', { n: r.days })}
            </Text>
          </View>
        ))}
      </Animated.View>

      <DatePickerSheet
        key={`${editing}-${record.installedAt}`}
        visible={editing}
        initial={new Date(record.installedAt)}
        title={t('editDateTitle')}
        subtitle={t('editDateSub')}
        applyLabel={t('save')}
        onClose={() => setEditing(false)}
        onApply={onEditDate}
      />
    </Screen>
  );
}

function InfoRow({ icon, iconColor, label, value, valueColor, last }: {
  icon: keyof typeof Ionicons.glyphMap; iconColor: string; label: string; value: string; valueColor?: string; last?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border }}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <Text style={{ flex: 1, color: theme.textDim, fontFamily: font.regular, fontSize: 15 }}>{label}</Text>
      <Text style={{ color: valueColor ?? theme.text, fontFamily: font.bold, fontSize: 15 }}>{value}</Text>
    </View>
  );
}
