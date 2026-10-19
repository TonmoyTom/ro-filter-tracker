import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { font } from '../constants/theme';
import { SevenSeg } from './SevenSeg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RingProgress({
  fraction, color, track, days, label, sub, subColor, size = 180,
}: {
  fraction: number; color: string; track: string; days: number; label: string; sub: string; subColor: string; size?: number;
}) {
  const stroke = 13;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const f = Math.max(0, Math.min(1, fraction));
  const center = size / 2;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(0);
    progress.set(withTiming(f, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [f, progress]);

  const arc = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - progress.value) }));

  const ring = (width: number, opacity: number, key: string) => (
    <AnimatedCircle
      key={key}
      cx={center} cy={center} r={r}
      stroke={color} strokeWidth={width} strokeOpacity={opacity} fill="none" strokeLinecap="round"
      strokeDasharray={`${c} ${c}`}
      animatedProps={arc}
      transform={`rotate(-90 ${center} ${center})`}
    />
  );

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={center} cy={center} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle cx={center} cy={center} r={r - stroke - 4} stroke={track} strokeWidth={1} fill="none" />
        {/* চওড়া হালকা স্তরগুলো আভার মতো দেখায় */}
        {ring(stroke + 14, 0.08, 'g2')}
        {ring(stroke + 6, 0.18, 'g1')}
        {ring(stroke, 1, 'main')}
      </Svg>
      <SevenSeg value={days} color={color} size={size * 0.2} digits={2} />
      <Text style={{ color, fontFamily: font.semibold, fontSize: 15, marginTop: 4 }}>{label}</Text>
      <Text style={{ color: subColor, fontFamily: font.regular, fontSize: 12 }}>{sub}</Text>
    </View>
  );
}
