import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { font, lcd, Status, statusColor } from '../constants/theme';
import { cartridgeCode, cartridgeState } from '../lib/cartridges';
import { useI18n } from '../lib/i18n';
import type { AppState, Cartridge } from '../lib/storage';
import { HexPattern } from './HexPattern';
import { SegmentBar } from './SegmentBar';

export type LcdRow = { id: string; code: string; remaining: number | null; status: Status | null };

export function lcdRows(cartridges: Pick<Cartridge, 'id' | 'presetId' | 'customName' | 'installedAt' | 'months'>[]): LcdRow[] {
  return cartridges.map((c, i) => {
    const s = c.installedAt ? cartridgeState(c) : null;
    return { id: c.id, code: cartridgeCode(c, i), remaining: s?.remaining ?? null, status: s?.status ?? null };
  });
}

// কার্টিজ না থাকলে খালি সারি দেখায়, যেন ডিসপ্লে ফাঁকা না লাগে
const EMPTY_ROWS: LcdRow[] = ['—', '—', '—', '—', '—'].map((code, i) => ({ id: `empty${i}`, code, remaining: null, status: null }));

// শুধু কালো ডিসপ্লে অংশটা — সেটআপ স্ক্রিনেও ব্যবহার হয়
export function LcdPanel({ rows: given, message, messageColor }: { rows: LcdRow[]; message: string; messageColor: string }) {
  const rows = given.length ? given : EMPTY_ROWS;
  const barHeight = rows.length > 5 ? 4 : 5;
  return (
    <View style={{ backgroundColor: lcd.bg, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#FFFFFF0F' }}>
      <Text style={{ color: lcd.label, fontSize: 10, textAlign: 'center', marginBottom: 6, letterSpacing: 0.4 }}>
        Welcome to water purifier
      </Text>
      {rows.map((r, i) => {
        const color = r.status ? statusColor(lcd, r.status) : '#FFFFFF';
        return (
          <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: r.status ? color : '#FFFFFFAA', width: 34, fontSize: 10, fontWeight: '800' }}>{r.code}</Text>
            <View style={{ flex: 1 }}>
              <SegmentBar
                fraction={r.remaining ?? 0}
                color={color}
                off={lcd.off}
                total={18}
                height={barHeight}
                delay={150 + i * 90}
                breathe={r.status === 'expired'}
              />
            </View>
          </View>
        );
      })}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: messageColor, boxShadow: `0 0 6px ${messageColor}` }} />
        <Text numberOfLines={1} style={{ flex: 1, color: messageColor, fontFamily: font.medium, fontSize: 11 }}>
          {message}
        </Text>
        {(['water-outline', 'sync-outline', 'flame-outline'] as const).map((icon, i) => (
          <Ionicons key={icon} name={icon} size={11} color={i === 2 ? lcd.red : '#FFFFFF66'} />
        ))}
      </View>
    </View>
  );
}

export function useLcdMessage(rows: LcdRow[]) {
  const { t } = useI18n();
  const expired = rows.filter((r) => r.status === 'expired').length;
  const soon = rows.filter((r) => r.status === 'soon').length;
  if (!rows.length || rows.every((r) => !r.status)) return { message: t('lcdWaiting'), color: '#FFFFFF66' };
  if (expired) return { message: t('lcdExpired', { n: expired }), color: lcd.red };
  if (soon) return { message: t('lcdSoon', { n: soon }), color: lcd.amber };
  return { message: t('lcdAllGood'), color: lcd.blue };
}

function Tap({ color }: { color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <LinearGradient
        colors={['#FFFFFF', '#C9CED4']}
        style={{ width: 34, height: 18, borderRadius: 7, alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 6px #0006' }}
      >
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      </LinearGradient>
      <LinearGradient colors={['#E6E9EC', '#9EA6AE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 7, height: 16 }} />
    </View>
  );
}

// হোম স্ক্রিনের পুরো মেশিন
export function MachineDisplay({ state }: { state: AppState }) {
  const rows = lcdRows(state.cartridges);
  const brand = state.purifier?.brand || 'Heron Queen';
  const { message, color } = useLcdMessage(rows);

  // মেশিনের পেছনে আস্তে আস্তে শ্বাস নেওয়া আভা
  const glow = useSharedValue(0.5);
  useEffect(() => {
    glow.set(withRepeat(withSequence(withTiming(1, { duration: 2400 }), withTiming(0.5, { duration: 2400 })), -1));
  }, [glow]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      {/* পেছনের আভা — ব্লার শ্যাডোর বদলে রেডিয়াল গ্রেডিয়েন্ট, তাই অ্যানিমেশন হালকা */}
      <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -30, left: 0, right: 0, alignItems: 'center' }, glowStyle]}>
        <Svg width={360} height={420}>
          <Defs>
            <RadialGradient id="machineGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={color} stopOpacity={0.45} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={180} cy={210} rx={180} ry={210} fill="url(#machineGlow)" />
        </Svg>
      </Animated.View>

      {/* শ্যাডো বাইরের View-এ, গ্রেডিয়েন্ট ভেতরে কেটে বসে — কোণা গোল থাকে */}
      <View style={{ width: 240, borderRadius: 26, boxShadow: '0 24px 40px #00000059' }}>
        <LinearGradient
          colors={lcd.body}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 26,
            padding: 14,
            paddingBottom: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#FFFFFF1A',
          }}
        >
          <HexPattern color="#FFFFFF12" scale={0.6} />
          <LcdPanel rows={rows} message={message} messageColor={color} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 18, paddingHorizontal: 20 }}>
            <Tap color="#3D9BE9" />
            <Tap color="#E5334B" />
          </View>

          {/* পানির ট্রের গ্রিল */}
          <View style={{ marginTop: 16, height: 22, borderRadius: 8, backgroundColor: '#140508', borderWidth: 1, borderColor: '#FFFFFF14', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {Array.from({ length: 18 }, (_, i) => (
              <View key={i} style={{ width: 1.5, height: 10, backgroundColor: '#FFFFFF2A' }} />
            ))}
          </View>

          <Text numberOfLines={1} style={{ color: '#FFFFFFB0', fontSize: 9, fontWeight: '800', letterSpacing: 2.5, marginTop: 12 }}>
            {brand.toUpperCase()}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}
