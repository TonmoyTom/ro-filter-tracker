import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { PrimaryButton } from '../../components/Button';
import { Cartridge } from '../../components/Cartridge';
import { CartridgeSheet } from '../../components/CartridgeSheet';
import { DatePickerSheet } from '../../components/DatePickerSheet';
import { LcdPanel, lcdRows, useLcdMessage } from '../../components/MachineDisplay';
import { PressableScale } from '../../components/PressableScale';
import { Screen } from '../../components/Screen';
import { leaveSetup, SetupHeader } from '../../components/SetupHeader';
import { HERON_TEMPLATE, MAX_CARTRIDGES, MIN_CARTRIDGES, PRESETS } from '../../constants/presets';
import { font, lcd } from '../../constants/theme';
import { cartridgeCode, presetOf } from '../../lib/cartridges';
import { startOfDay } from '../../lib/dates';
import { useI18n } from '../../lib/i18n';
import { CartridgeDraft, loadState, newId, saveCartridges } from '../../lib/storage';
import { useTheme } from '../../lib/ThemeContext';

const today = () => startOfDay(new Date()).toISOString();
const blank = (): CartridgeDraft => ({ id: newId(), presetId: 'pp', months: PRESETS.pp.defaultMonths, installedAt: today() });

// ধাপ ২: কার্টিজ যোগ — ২ থেকে ৭টি
export default function CartridgesStep() {
  const { theme } = useTheme();
  const { t, n, date, cName } = useI18n();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = !!edit;

  const [drafts, setDrafts] = useState<CartridgeDraft[]>([]);
  const [sheet, setSheet] = useState<{ draft: CartridgeDraft; isNew: boolean } | null>(null);
  const [sameDate, setSameDate] = useState(false);

  useEffect(() => {
    loadState().then((s) => setDrafts(s.cartridges.map(({ history: _h, ...d }) => d)));
  }, []);

  const rows = lcdRows(drafts);
  const { message, color } = useLcdMessage(rows);
  const canAdd = drafts.length < MAX_CARTRIDGES;
  const ready = drafts.length >= MIN_CARTRIDGES;

  const applyTemplate = () =>
    setDrafts(HERON_TEMPLATE.map((presetId) => ({ id: newId(), presetId, months: PRESETS[presetId].defaultMonths, installedAt: today() })));

  const onSave = (d: CartridgeDraft) => {
    setDrafts((list) => (list.some((x) => x.id === d.id) ? list.map((x) => (x.id === d.id ? d : x)) : [...list, d]));
    setSheet(null);
  };

  const move = (i: number, dir: -1 | 1) =>
    setDrafts((list) => {
      const next = [...list];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });

  const remove = (d: CartridgeDraft) =>
    Alert.alert(t('removeTitle'), t('removeBody', { name: cName(d) }), [
      { text: t('no'), style: 'cancel' },
      { text: t('remove'), style: 'destructive', onPress: () => setDrafts((list) => list.filter((x) => x.id !== d.id)) },
    ]);

  const finish = async () => {
    await saveCartridges(drafts);
    if (editing) router.back();
    else leaveSetup();
  };

  return (
    <Screen
      footer={
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, gap: 6 }}>
          {!ready && (
            <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13, textAlign: 'center' }}>
              {t('needMin', { n: MIN_CARTRIDGES })}
            </Text>
          )}
          <View style={{ opacity: ready ? 1 : 0.4 }} pointerEvents={ready ? 'auto' : 'none'}>
            <PrimaryButton icon="checkmark" label={editing ? t('save') : t('finish')} onPress={finish} />
          </View>
        </View>
      }
    >
      <SetupHeader step={2} editing={editing} back />

      <Animated.View entering={FadeInDown.duration(500)}>
        <LinearGradient colors={lcd.body} style={{ borderRadius: 22, padding: 10, marginTop: 20, marginHorizontal: 30, boxShadow: '0 16px 30px #00000055' }}>
          <LcdPanel rows={rows} message={message} messageColor={color} />
        </LinearGradient>
      </Animated.View>

      <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 28, lineHeight: 40, marginTop: 22 }}>{t('p2Title')}</Text>
      <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 15, lineHeight: 24, marginBottom: 16 }}>
        {t('p2Sub', { min: MIN_CARTRIDGES, max: MAX_CARTRIDGES })}
      </Text>

      {drafts.length === 0 && (
        <Animated.View entering={FadeInDown.delay(150)}>
          <PressableScale
            onPress={applyTemplate}
            style={{ backgroundColor: theme.blue, borderRadius: 22, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14, boxShadow: `0 8px 26px ${theme.blue}55` }}
          >
            <View style={{ flexDirection: 'row', marginRight: 2 }}>
              {HERON_TEMPLATE.slice(0, 3).map((id, i) => (
                <View key={id} style={{ marginLeft: i ? -10 : 0 }}>
                  <Cartridge kind={PRESETS[id].kind} cap={PRESETS[id].cap} height={44} />
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.onBlue, fontFamily: font.bold, fontSize: 16 }}>{t('useTemplate', { n: HERON_TEMPLATE.length })}</Text>
              <Text style={{ color: theme.onBlue + 'B3', fontFamily: font.regular, fontSize: 13 }}>{t('templateSub')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.onBlue} />
          </PressableScale>
        </Animated.View>
      )}

      {drafts.map((d, i) => {
        const p = presetOf(d);
        return (
          <Animated.View key={d.id} entering={FadeInDown} exiting={FadeOut} layout={LinearTransition}>
            <Pressable
              onPress={() => setSheet({ draft: d, isNew: false })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 20, padding: 10, paddingLeft: 12, marginBottom: 10 }}
            >
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: theme.blue, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: theme.onBlue, fontFamily: font.bold, fontSize: 11, lineHeight: 15 }}>{n(i + 1)}</Text>
              </View>
              <Cartridge kind={p.kind} cap={p.cap} height={50} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: theme.text, fontFamily: font.bold, fontSize: 15 }}>
                  {cartridgeCode(d, i)}{'  '}
                  <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>{cName(d)}</Text>
                </Text>
                <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 12 }}>
                  {t('lastsMonths', { n: d.months })} · {t('boughtOn', { d: date(new Date(d.installedAt)) })}
                </Text>
              </View>
              <View style={{ gap: 2 }}>
                <Pressable disabled={i === 0} onPress={() => move(i, -1)} hitSlop={6} style={{ opacity: i === 0 ? 0.25 : 1 }}>
                  <Ionicons name="chevron-up" size={18} color={theme.blue} />
                </Pressable>
                <Pressable disabled={i === drafts.length - 1} onPress={() => move(i, 1)} hitSlop={6} style={{ opacity: i === drafts.length - 1 ? 0.25 : 1 }}>
                  <Ionicons name="chevron-down" size={18} color={theme.blue} />
                </Pressable>
              </View>
              <Pressable onPress={() => remove(d)} hitSlop={8} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={18} color={theme.red} />
              </Pressable>
            </Pressable>
          </Animated.View>
        );
      })}

      <Animated.View layout={LinearTransition} style={{ flexDirection: 'row', gap: 10 }}>
        <PressableScale
          disabled={!canAdd}
          onPress={() => setSheet({ draft: blank(), isNew: true })}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.blue + '99', opacity: canAdd ? 1 : 0.4 }}
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.blue} />
          <Text style={{ color: theme.blue, fontFamily: font.bold, fontSize: 15 }}>{t('addCartridge')}</Text>
          <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 12 }}>{t('countOf', { n: drafts.length, t: MAX_CARTRIDGES })}</Text>
        </PressableScale>
      </Animated.View>

      {drafts.length > 1 && (
        <Pressable onPress={() => setSameDate(true)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          <Ionicons name="calendar-outline" size={16} color={theme.blue} />
          <Text style={{ color: theme.blue, fontFamily: font.semibold, fontSize: 14 }}>{t('sameDateAll')}</Text>
        </Pressable>
      )}

      {sheet && (
        <CartridgeSheet
          key={sheet.draft.id}
          visible
          initial={sheet.draft}
          isNew={sheet.isNew}
          onClose={() => setSheet(null)}
          onSave={onSave}
        />
      )}

      <DatePickerSheet
        key={`same-${sameDate}`}
        visible={sameDate}
        title={t('sameDateTitle')}
        subtitle={t('sameDateSub', { n: drafts.length })}
        applyLabel={t('applyAll', { n: drafts.length })}
        onClose={() => setSameDate(false)}
        onApply={(d) => {
          const iso = startOfDay(d).toISOString();
          setDrafts((list) => list.map((x) => ({ ...x, installedAt: iso })));
          setSameDate(false);
        }}
      />
    </Screen>
  );
}
