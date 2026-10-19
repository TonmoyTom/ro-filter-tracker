import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { font, Status, statusColor, statusTint } from '../constants/theme';
import { useTheme } from '../lib/ThemeContext';

// মেয়াদ শেষ বা শীঘ্রই হলে বিন্দুটার চারপাশে ঢেউ ওঠে
export function StatusPill({ status, label, size = 'md' }: { status: Status; label: string; size?: 'sm' | 'md' }) {
  const { theme } = useTheme();
  const color = statusColor(theme, status);
  const p = useSharedValue(0);

  useEffect(() => {
    p.set(status === 'ok' ? 0 : withRepeat(withTiming(1, { duration: status === 'expired' ? 1100 : 1700 }), -1));
  }, [status, p]);

  const halo = useAnimatedStyle(() => ({
    opacity: status === 'ok' ? 0 : 0.6 * (1 - p.value),
    transform: [{ scale: 1 + p.value * 1.6 }],
  }));

  const sm = size === 'sm';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: statusTint(theme, status),
        borderColor: color + '66',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: sm ? 10 : 12,
        paddingVertical: sm ? 3 : 5,
      }}
    >
      <View style={{ width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: color }, halo]} />
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
      </View>
      <Text style={{ color, fontFamily: font.semibold, fontSize: sm ? 12 : 13 }}>{label}</Text>
    </View>
  );
}
