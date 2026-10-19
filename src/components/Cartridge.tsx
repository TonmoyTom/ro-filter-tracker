import { useId } from 'react';
import Svg, { ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import type { CartridgeKind } from '../constants/presets';
import { shade } from '../lib/color';

const W = 60;
const H = 150;

// নির্দিষ্ট বীজ থেকে "এলোমেলো" দানা — প্রতিবার একই রকম আঁকা হয়
function grains(count: number, seed: number) {
  const out: { x: number; y: number; r: number; o: number }[] = [];
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < count; i++) {
    out.push({ x: 18 + rand() * 24, y: 30 + rand() * 86, r: 0.6 + rand() * 1.3, o: 0.25 + rand() * 0.5 });
  }
  return out;
}
const GRAINS = grains(90, 7);
const BEADS = grains(26, 31).map((g) => ({ ...g, r: 2.2 + g.r }));

// গোল সিলিন্ডারের মতো আলো-ছায়া: দুই কিনারা গাঢ়, বাঁ দিকে উজ্জ্বল দাগ
function cylinderStops(base: string) {
  return [
    [0, shade(base, -0.45)],
    [0.18, shade(base, 0.35)],
    [0.32, shade(base, 0.6)],
    [0.62, base],
    [0.88, shade(base, -0.3)],
    [1, shade(base, -0.55)],
  ].map(([o, c]) => <Stop key={o} offset={o} stopColor={c as string} />);
}

export function Cartridge({ kind, cap, height = 80 }: { kind: CartridgeKind; cap: string; height?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n: string) => `${n}${uid}`;
  const url = (n: string) => `url(#${id(n)})`;

  const body =
    kind === 'block' ? '#3A3F45'
      : kind === 'membrane' ? '#E9F2FA'
        : kind === 'granular' || kind === 'mineral' || kind === 'uv' ? '#D5DEE5'
          : '#EEF1F4';

  return (
    <Svg width={(height * W) / H} height={height} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id={id('cap')} x1="0" y1="0" x2="1" y2="0">
          {cylinderStops(cap)}
        </LinearGradient>
        <LinearGradient id={id('body')} x1="0" y1="0" x2="1" y2="0">
          {cylinderStops(body)}
        </LinearGradient>
        <LinearGradient id={id('core')} x1="0" y1="0" x2="1" y2="0">
          {cylinderStops(kind === 'granular' ? '#2B2E33' : '#1C1F22')}
        </LinearGradient>
        <LinearGradient id={id('shine')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <Stop offset="0.15" stopColor="#FFFFFF" stopOpacity="0.85" />
          <Stop offset="0.85" stopColor="#FFFFFF" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
        <ClipPath id={id('clip')}>
          <Rect x={14} y={26} width={32} height={94} />
        </ClipPath>
      </Defs>

      {/* নিচের ছায়া */}
      <Ellipse cx={30} cy={146} rx={20} ry={3} fill="#000" opacity={0.35} />

      {/* পাইপ সংযোগ */}
      <Rect x={25} y={1} width={10} height={12} rx={2} fill={url('cap')} />
      <Rect x={25} y={136} width={10} height={10} rx={2} fill={url('cap')} />

      {/* বডি */}
      <Rect x={14} y={26} width={32} height={94} fill={url('body')} />

      <G clipPath={url('clip')}>
        {kind === 'sediment' &&
          // স্পান পলিপ্রোপিলিনের সুতার দাগ
          Array.from({ length: 23 }, (_, i) => (
            <Line key={i} x1={14} x2={46} y1={29 + i * 4} y2={29 + i * 4} stroke="#8B969F" strokeOpacity={0.22} strokeWidth={1} />
          ))}

        {kind === 'granular' && (
          <>
            {/* স্বচ্ছ খোলের ভেতরে কার্বনের দানা */}
            <Rect x={17} y={29} width={26} height={88} rx={2} fill={url('core')} />
            {GRAINS.map((g, i) => (
              <Ellipse key={i} cx={g.x} cy={g.y} rx={g.r} ry={g.r * 0.8} fill="#9AA3AC" opacity={g.o} />
            ))}
            <Rect x={14} y={26} width={32} height={94} fill={url('body')} opacity={0.28} />
          </>
        )}

        {kind === 'block' && (
          <>
            {/* কালো কার্বন ব্লকের ওপর ছিদ্রওয়ালা জালি */}
            {Array.from({ length: 16 }, (_, r) =>
              Array.from({ length: 5 }, (_, c) => (
                <Ellipse key={`${r}-${c}`} cx={18 + c * 6 + (r % 2) * 3} cy={31 + r * 5.6} rx={1.1} ry={0.9} fill="#000" opacity={0.5} />
              )),
            )}
          </>
        )}

        {kind === 'membrane' && (
          <>
            {/* পেঁচানো মেমব্রেনের আঁশ */}
            {Array.from({ length: 16 }, (_, i) => (
              <Line key={i} x1={14} x2={46} y1={20 + i * 7} y2={34 + i * 7} stroke="#3D8FD6" strokeOpacity={0.18} strokeWidth={1.4} />
            ))}
            <Rect x={14} y={60} width={32} height={26} fill="#2F7FC1" opacity={0.92} />
            <Rect x={14} y={60} width={32} height={26} fill={url('body')} opacity={0.25} />
            <SvgText x={30} y={77} fontSize={10} fontWeight="bold" fill="#FFFFFF" textAnchor="middle">RO</SvgText>
          </>
        )}

        {kind === 'inline' && (
          <>
            {/* T33 — দুই প্রান্তে খাঁজ আর মাঝে লেবেল */}
            {[34, 38, 108, 112].map((y) => (
              <Line key={y} x1={14} x2={46} y1={y} y2={y} stroke="#6D767E" strokeOpacity={0.45} strokeWidth={1.2} />
            ))}
            <Rect x={14} y={58} width={32} height={30} fill={cap} opacity={0.35} />
          </>
        )}
        {kind === 'fiber' && (
          <>
            {/* ইউএফ — লম্বা লম্বা ফাঁপা আঁশ */}
            {Array.from({ length: 9 }, (_, i) => (
              <Line key={i} x1={16 + i * 3.6} x2={16 + i * 3.6} y1={26} y2={120} stroke={cap} strokeOpacity={0.28} strokeWidth={1.6} />
            ))}
            <Rect x={14} y={64} width={32} height={18} fill={cap} opacity={0.85} />
            <SvgText x={30} y={77} fontSize={9} fontWeight="bold" fill="#FFFFFF" textAnchor="middle">UF</SvgText>
          </>
        )}

        {kind === 'uv' && (
          <>
            {/* স্বচ্ছ নলের ভেতরে জ্বলন্ত ইউভি বাতি */}
            <Rect x={20} y={28} width={20} height={90} rx={10} fill={cap} opacity={0.25} />
            <Rect x={25} y={30} width={10} height={86} rx={5} fill="#C9B8FF" />
            <Rect x={28} y={32} width={4} height={82} rx={2} fill="#FFFFFF" opacity={0.85} />
            <Rect x={14} y={26} width={32} height={94} fill={url('body')} opacity={0.3} />
          </>
        )}

        {kind === 'mineral' && (
          <>
            {/* খনিজ পাথরের দানা */}
            {BEADS.map((g, i) => (
              <Ellipse key={i} cx={g.x} cy={g.y} rx={g.r} ry={g.r * 0.9} fill={shade(cap, (i % 3) * 0.2 - 0.15)} opacity={0.9} />
            ))}
            <Rect x={14} y={26} width={32} height={94} fill={url('body')} opacity={0.35} />
          </>
        )}
      </G>

      {/* আলোর দাগ */}
      <Rect x={18.5} y={30} width={3.5} height={86} rx={1.75} fill={url('shine')} opacity={kind === 'block' ? 0.35 : 0.7} />

      {/* উপর-নিচের ঢাকনা */}
      <Path d="M12 26 L12 16 Q12 10 18 10 L42 10 Q48 10 48 16 L48 26 Z" fill={url('cap')} />
      <Path d="M12 120 L48 120 L48 130 Q48 136 42 136 L18 136 Q12 136 12 130 Z" fill={url('cap')} />
      <Rect x={12} y={24} width={36} height={2} fill="#000" opacity={0.25} />
      <Rect x={12} y={120} width={36} height={2} fill="#000" opacity={0.25} />
    </Svg>
  );
}
