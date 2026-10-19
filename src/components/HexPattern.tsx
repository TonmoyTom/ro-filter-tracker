import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

const R = 18;
const H = (R * Math.sqrt(3)) / 2;
// একটা টাইলে একটি ষড়ভুজ আর পাশের সংযোগ রেখা — পাশাপাশি বসালে মৌচাক হয়
const TILE = `M0 ${H} L${R / 2} 0 L${R * 1.5} 0 L${R * 2} ${H} L${R * 1.5} ${H * 2} L${R / 2} ${H * 2} Z M${R * 2} ${H} L${R * 3} ${H}`;

export function HexPattern({ color, scale = 1 }: { color: string; scale?: number }) {
  const id = `hex${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={R * 3}
          height={H * 2}
          patternTransform={`scale(${scale})`}
        >
          <Path d={TILE} stroke={color} strokeWidth={1} fill="none" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
