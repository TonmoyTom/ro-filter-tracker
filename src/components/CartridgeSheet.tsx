import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { PRESET_LIST, PRESETS } from '../constants/presets';
import { font } from '../constants/theme';
import { startOfDay } from '../lib/dates';
import { useI18n } from '../lib/i18n';
import type { CartridgeDraft } from '../lib/storage';
import { useTheme } from '../lib/ThemeContext';
import { PrimaryButton } from './Button';
import { Cartridge } from './Cartridge';
import { Calendar } from './DatePickerSheet';
import { FieldLabel, MonthStepper, SelectField, TextField } from './Form';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';

type Page = 'form' | 'type' | 'date';

// একটি কার্টিজ যোগ বা এডিট — ধরন (ড্রপডাউন), কত মাস চলবে, কবে কিনেছেন
export function CartridgeSheet({
  visible, initial, isNew, onClose, onSave,
}: {
  visible: boolean;
  initial: CartridgeDraft;
  isNew: boolean;
  onClose: () => void;
  onSave: (d: CartridgeDraft) => void;
}) {
  const { theme } = useTheme();
  const { t, date, pName, pDesc, cName } = useI18n();
  const [draft, setDraft] = useState(initial);
  // নতুন হলে আগে ধরন বেছে নিতে হয়
  const [page, setPage] = useState<Page>(isNew ? 'type' : 'form');

  const preset = PRESETS[draft.presetId];
  const needsName = draft.presetId === 'custom' && !draft.customName?.trim();

  if (page === 'type') {
    return (
      <Sheet visible={visible} title={t('chooseType')} onClose={onClose} onBack={isNew ? undefined : () => setPage('form')}>
        {PRESET_LIST.map((p) => {
          const on = p.id === draft.presetId && !isNew;
          return (
            <PressableScale
              key={p.id}
              onPress={() => {
                // ধরন বদলালে মাসও সেই ধরনের সুপারিশে চলে যায়
                setDraft((d) => ({ ...d, presetId: p.id, months: p.id === d.presetId ? d.months : p.defaultMonths }));
                setPage('form');
              }}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, marginBottom: 8, borderRadius: 16,
                borderWidth: 1, borderColor: on ? theme.blue : theme.border, backgroundColor: on ? theme.blueTint : theme.tile,
              }}
            >
              <Cartridge kind={p.kind} cap={p.cap} height={46} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 15 }}>
                  {p.code ? `${p.code}  ` : ''}
                  <Text style={{ fontFamily: font.semibold, color: p.code ? theme.textDim : theme.text }}>{pName(p)}</Text>
                </Text>
                <Text numberOfLines={1} style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 12 }}>{pDesc(p)}</Text>
              </View>
              {p.id !== 'custom' && (
                <Text style={{ color: theme.blue, fontFamily: font.semibold, fontSize: 12 }}>{t('monthsShort', { n: p.defaultMonths })}</Text>
              )}
              {on && <Ionicons name="checkmark-circle" size={20} color={theme.blue} />}
            </PressableScale>
          );
        })}
      </Sheet>
    );
  }

  if (page === 'date') {
    return (
      <Sheet visible={visible} title={t('whenBought')} subtitle={t('whenBoughtSub')} onClose={onClose} onBack={() => setPage('form')}>
        <Calendar
          value={new Date(draft.installedAt)}
          onChange={(d) => setDraft((x) => ({ ...x, installedAt: startOfDay(d).toISOString() }))}
        />
        <View style={{ height: 14 }} />
        <PrimaryButton icon="checkmark" label={t('done')} onPress={() => setPage('form')} />
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} title={isNew ? t('addCartridge') : cName(draft)} onClose={onClose}>
      <SelectField label={t('cartType')} onPress={() => setPage('type')}>
        <Cartridge kind={preset.kind} cap={preset.cap} height={38} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 15 }}>
            {preset.code ? `${preset.code}  ` : ''}
            <Text style={{ fontFamily: font.semibold, color: theme.textDim }}>{pName(preset)}</Text>
          </Text>
        </View>
      </SelectField>

      {draft.presetId === 'custom' && (
        <TextField
          label={t('customName')}
          value={draft.customName ?? ''}
          onChangeText={(v) => setDraft((d) => ({ ...d, customName: v }))}
          placeholder={t('customNameHint')}
          icon="pricetag-outline"
          autoFocus
        />
      )}

      <FieldLabel label={t('howLong')} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.tile, borderColor: theme.border, borderWidth: 1, borderRadius: 16, paddingLeft: 14, padding: 6, marginBottom: 16 }}>
        <Text style={{ flex: 1, color: theme.textDim, fontFamily: font.regular, fontSize: 13 }}>
          {preset.id !== 'custom' ? t('recommended', { n: preset.defaultMonths }) : ''}
        </Text>
        <MonthStepper value={draft.months} onChange={(months) => setDraft((d) => ({ ...d, months }))} />
      </View>

      <SelectField label={t('whenBought')} onPress={() => setPage('date')}>
        <Ionicons name="calendar-outline" size={22} color={theme.blue} />
        <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 15 }}>{date(new Date(draft.installedAt))}</Text>
      </SelectField>

      <View style={{ opacity: needsName ? 0.4 : 1, marginTop: 4 }} pointerEvents={needsName ? 'none' : 'auto'}>
        <PrimaryButton
          icon={isNew ? 'add' : 'checkmark'}
          label={isNew ? t('add') : t('save')}
          onPress={() => onSave({ ...draft, customName: draft.presetId === 'custom' ? draft.customName?.trim() : undefined })}
        />
      </View>
    </Sheet>
  );
}
