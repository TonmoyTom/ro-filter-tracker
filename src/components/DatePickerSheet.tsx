import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { font } from '../constants/theme';
import { startOfDay } from '../lib/dates';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { PrimaryButton } from './Button';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';

const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();

// শুধু ক্যালেন্ডার অংশ — শিটের ভেতরেও বসানো যায়
export function Calendar({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  const { theme } = useTheme();
  const { t, n, date, months, weekdays } = useI18n();
  const today = startOfDay(new Date());
  const selected = startOfDay(value);
  const [month, setMonth] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1));

  const pick = (d: Date) => {
    onChange(d);
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const shortcuts = [
    { label: t('today'), date: today },
    { label: t('yesterday'), date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1) },
    { label: t('weekAgo', { n: 1 }), date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7) },
    { label: t('monthAgo', { n: 1 }), date: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()) },
  ];

  // শনিবার = ০ ধরে প্রথম দিনের অবস্থান
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 1) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  const canNext =
    month.getFullYear() < today.getFullYear() ||
    (month.getFullYear() === today.getFullYear() && month.getMonth() < today.getMonth());

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {shortcuts.map((s) => {
          const on = sameDay(s.date, selected);
          return (
            <PressableScale
              key={s.label}
              onPress={() => pick(s.date)}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: on ? theme.blue : 'transparent', borderWidth: 1, borderColor: on ? theme.blue : theme.border }}
            >
              <Text style={{ color: on ? theme.onBlue : theme.text, fontFamily: font.semibold, fontSize: 14 }}>{s.label}</Text>
            </PressableScale>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Pressable onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={theme.blue} />
        </Pressable>
        <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 17 }}>
          {months[month.getMonth()]} {n(month.getFullYear())}
        </Text>
        <Pressable disabled={!canNext} onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} hitSlop={12}>
          <Ionicons name="chevron-forward" size={22} color={canNext ? theme.blue : theme.border} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {weekdays.map((d, i) => (
          <Text key={d} style={{ flex: 1, textAlign: 'center', color: i === 6 ? theme.red : theme.textDim, fontFamily: font.medium, fontSize: 12, paddingVertical: 6 }}>
            {d}
          </Text>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 44 }} />;
          const future = d.getTime() > today.getTime();
          const on = sameDay(d, selected);
          const isToday = sameDay(d, today);
          return (
            <Pressable key={i} disabled={future} onPress={() => onChange(d)} style={{ width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: on ? theme.blue : 'transparent',
                  borderWidth: isToday && !on ? 1 : 0, borderColor: theme.blue,
                  boxShadow: on ? `0 0 12px ${theme.blue}88` : undefined,
                }}
              >
                <Text style={{ color: on ? theme.onBlue : future ? theme.border : theme.text, fontFamily: font.semibold, fontSize: 15 }}>
                  {n(d.getDate())}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 14, marginTop: 12 }}>
        <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 15 }}>{t('selected')}</Text>
        <Text style={{ color: theme.blue, fontFamily: font.bold, fontSize: 15 }}>{date(selected)}</Text>
      </View>
    </View>
  );
}

export function DatePickerSheet({
  visible, title, subtitle, applyLabel, initial, onClose, onApply,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  applyLabel: string;
  initial?: Date;
  onClose: () => void;
  onApply: (d: Date) => void;
}) {
  const [selected, setSelected] = useState(startOfDay(initial ?? new Date()));
  return (
    <Sheet visible={visible} title={title} subtitle={subtitle} onClose={onClose}>
      <Calendar value={selected} onChange={setSelected} />
      <View style={{ height: 14 }} />
      <PrimaryButton icon="checkmark" label={applyLabel} onPress={() => onApply(selected)} />
    </Sheet>
  );
}
