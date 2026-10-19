import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { font } from '../constants/theme';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { PressableScale } from './PressableScale';

export function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  const { theme } = useTheme();
  return (
    <Text style={{ color: theme.textDim, fontFamily: font.medium, fontSize: 14, marginBottom: 6, marginLeft: 4 }}>
      {label}
      {hint ? <Text style={{ fontFamily: font.regular, fontSize: 12 }}> · {hint}</Text> : null}
    </Text>
  );
}

export function TextField({
  label, hint, value, onChangeText, placeholder, icon, autoFocus,
}: {
  label: string; hint?: string; value: string; onChangeText: (v: string) => void; placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap; autoFocus?: boolean;
}) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <FieldLabel label={label} hint={hint} />
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 10,
          backgroundColor: theme.card, borderRadius: 16, paddingHorizontal: 14,
          borderWidth: 1, borderColor: focused ? theme.blue : theme.border,
          boxShadow: focused ? `0 0 0 3px ${theme.blue}22` : undefined,
        }}
      >
        {icon && <Ionicons name={icon} size={20} color={focused ? theme.blue : theme.textDim} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textDim + '99'}
          autoFocus={autoFocus}
          maxLength={40}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, color: theme.text, fontFamily: font.semibold, fontSize: 16, paddingVertical: 14 }}
        />
      </View>
    </View>
  );
}

// − ৬ মাস + ধরনের কাউন্টার
export function MonthStepper({ value, onChange, min = 1, max = 36 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const btn = (icon: 'remove' | 'add', delta: number, disabled: boolean) => (
    <PressableScale onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))} disabled={disabled} hitSlop={6} style={{ padding: 10, opacity: disabled ? 0.35 : 1 }}>
      <Ionicons name={icon} size={18} color={theme.blue} />
    </PressableScale>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.tile, borderColor: theme.border, borderWidth: 1, borderRadius: 14 }}>
      {btn('remove', -1, value <= min)}
      <Text style={{ minWidth: 56, textAlign: 'center', color: theme.text, fontFamily: font.bold, fontSize: 15 }}>
        {t('monthsShort', { n: value })}
      </Text>
      {btn('add', 1, value >= max)}
    </View>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: (readonly [T, string])[] }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6, backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 18, padding: 5 }}>
      {options.map(([v, label]) => {
        const on = v === value;
        return (
          <PressableScale
            key={v}
            onPress={() => onChange(v)}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center', backgroundColor: on ? theme.blue : 'transparent', boxShadow: on ? `0 4px 14px ${theme.blue}44` : undefined }}
          >
            <Text style={{ color: on ? theme.onBlue : theme.text, fontFamily: font.semibold, fontSize: 15 }}>{label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

// ড্রপডাউনের মতো দেখতে চাপার ঘর
export function SelectField({ label, children, onPress }: { label: string; children: ReactNode; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <FieldLabel label={label} />
      <PressableScale
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.tile, borderColor: theme.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, minHeight: 54 }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>{children}</View>
        <Ionicons name="chevron-down" size={20} color={theme.blue} />
      </PressableScale>
    </View>
  );
}
