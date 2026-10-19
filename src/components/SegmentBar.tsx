import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';

const GAP = 3;

// ডিসপ্লের মতো খোপের বার। খোপগুলো একটি SVG-তে আঁকা, আর আভা পুরো বারে একটাই —
// প্রতিটি খোপে আলাদা শ্যাডো দিলে স্ক্রল ভারী হয়ে যায়।
export function SegmentBar({
  fraction,
  color,
  off,
  total = 20,
  height = 6,
  delay = 0,
  breathe = false,
  glow = true,
}: {
  fraction: number;
  color: string;
  off: string;
  total?: number;
  height?: number;
  delay?: number;
  breathe?: boolean;
  glow?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const filled = Math.max(0, Math.min(total, Math.ceil(fraction * total)));
  const seg = width > 0 ? (width - GAP * (total - 1)) / total : 0;
  const target = filled === 0 ? 0 : filled * seg + (filled - 1) * GAP;

  const w = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    w.set(withDelay(delay, withTiming(target, { duration: 900, easing: Easing.out(Easing.cubic) })));
  }, [target, delay, w]);

  useEffect(() => {
    pulse.set(breathe
      ? withRepeat(withSequence(withTiming(0.35, { duration: 900 }), withTiming(1, { duration: 900 })), -1)
      : withTiming(1));
  }, [breathe, pulse]);

  const clip = useAnimatedStyle(() => ({ width: w.value, opacity: pulse.value }));

  const rects = (fill: string) => (
    <Svg width={width} height={height}>
      {Array.from({ length: total }, (_, i) => (
        <Rect key={i} x={i * (seg + GAP)} y={0} width={seg} height={height} rx={Math.min(2, height / 2)} fill={fill} />
      ))}
    </Svg>
  );

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: height + 8, justifyContent: 'center' }}>
      {width > 0 && (
        <>
          {rects(off)}
          {glow && (
            <Animated.View
              pointerEvents="none"
              style={[{ position: 'absolute', left: 0, height, borderRadius: height / 2, boxShadow: `0 0 8px ${color}` }, clip]}
            />
          )}
          <Animated.View style={[{ position: 'absolute', left: 0, height, overflow: 'hidden' }, clip]}>
            {rects(color)}
          </Animated.View>
        </>
      )}
    </View>
  );
}
