import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { font, statusColor } from '../constants/theme';
import { cartridgeCode, cartridgeState, presetOf } from '../lib/cartridges';
import { useI18n } from '../lib/i18n';
import type { Cartridge as CartridgeData } from '../lib/storage';
import { useTheme } from '../lib/ThemeContext';
import { Cartridge } from './Cartridge';
import { PressableScale } from './PressableScale';
import { SegmentBar } from './SegmentBar';
import { SevenSeg } from './SevenSeg';
import { StatusPill } from './StatusPill';

export function FilterCard({ cartridge, index }: { cartridge: CartridgeData; index: number }) {
  const { theme, isDark } = useTheme();
  const { t, n, cName, dateShort } = useI18n();

  const preset = presetOf(cartridge);
  const s = cartridgeState(cartridge);
  const color = statusColor(theme, s.status);
  const expired = s.status === 'expired';

  return (
    <Animated.View entering={FadeInDown.delay(120 + index * 70).duration(450)}>
      <PressableScale
        onPress={() => router.push(`/filter/${cartridge.id}`)}
        style={{
          backgroundColor: theme.card,
          borderColor: expired ? theme.red + '55' : theme.border,
          borderWidth: 1,
          borderRadius: 24,
          padding: 12,
          marginBottom: 12,
          flexDirection: 'row',
          gap: 14,
          boxShadow: isDark ? undefined : '0 6px 18px #5A1A2610',
        }}
      >
        {/* কার্টিজের ঘর — ঢাকনার রঙের হালকা আভা */}
        <View>
          <LinearGradient
            colors={[preset.cap + (isDark ? '40' : '30'), theme.tile]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ width: 70, height: 96, borderRadius: 18, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <Cartridge kind={preset.kind} cap={preset.cap} height={80} />
          </LinearGradient>
          <View style={{ position: 'absolute', top: -6, left: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: theme.blue, borderWidth: 2, borderColor: theme.card, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: font.bold, fontSize: 11, color: theme.onBlue, lineHeight: 15 }}>{n(index + 1)}</Text>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: theme.text, fontFamily: font.bold, fontSize: 18, lineHeight: 24 }}>
                {cartridgeCode(cartridge, index)}
              </Text>
              <Text numberOfLines={1} style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 13, lineHeight: 18 }}>
                {cName(cartridge)}
              </Text>
            </View>
            <StatusPill status={s.status} label={t(`status.${s.status}`)} size="sm" />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <SevenSeg value={Math.abs(s.daysLeft)} color={color} size={24} digits={3} ghost={theme.segOff} glow={isDark} />
            <Text style={{ color, fontFamily: font.semibold, fontSize: 13, flexShrink: 1 }} numberOfLines={1}>
              {expired ? t('daysOver') : t('daysLeft')}
            </Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="calendar-clear-outline" size={12} color={theme.textDim} />
            <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 12 }}>{dateShort(s.due)}</Text>
          </View>

          <SegmentBar fraction={s.remaining} color={color} off={theme.segOff} height={5} delay={200 + index * 70} breathe={expired} glow={isDark} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}
