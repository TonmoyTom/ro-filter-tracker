import { Text, View } from 'react-native';
import { font } from '../constants/theme';

// সেভেন-সেগমেন্ট সংখ্যা — পেছনে নিভে থাকা "8" দেখায়, আসল ডিসপ্লের মতো
export function SevenSeg({
  value,
  color,
  size,
  digits,
  ghost = '#FFFFFF10',
  glow = true,
}: {
  value: number | string;
  color: string;
  size: number;
  digits?: number;
  ghost?: string;
  glow?: boolean;
}) {
  const text = String(value);
  const width = Math.max(digits ?? 0, text.length);
  const style = { fontFamily: font.seg, fontSize: size, lineHeight: size * 1.15 };
  return (
    <View>
      <Text style={[style, { color: ghost }]}>{'8'.repeat(width)}</Text>
      <Text
        style={[
          style,
          {
            position: 'absolute',
            right: 0,
            color,
            textShadowColor: glow ? color : 'transparent',
            textShadowRadius: glow ? size / 3 : 0,
            textShadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}
