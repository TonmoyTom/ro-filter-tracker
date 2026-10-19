export const dark = {
  bg: '#110A0D',
  bgGlow: '#2A1218',
  card: '#1F1317',
  cardHi: '#2A1A1F',
  border: '#36242A',
  hex: '#FFFFFF0A',
  text: '#FFFFFF',
  textDim: '#A8979E',
  blue: '#8FD3FF',
  amber: '#FFB547',
  red: '#FF5468',
  blueTint: '#8FD3FF1F',
  amberTint: '#FFB5471F',
  redTint: '#FF546824',
  onBlue: '#04131F',
  tile: '#0E070A',
  segOff: '#FFFFFF14',
};

export const light: Theme = {
  bg: '#F6F1F2',
  bgGlow: '#FBE9EC',
  card: '#FFFFFF',
  cardHi: '#FBF8F9',
  border: '#EADDE1',
  hex: '#5A1A2610',
  text: '#1C1216',
  textDim: '#6E6166',
  blue: '#1F7BC4',
  amber: '#C27A00',
  red: '#D92D44',
  blueTint: '#1F7BC41A',
  amberTint: '#C27A001F',
  redTint: '#D92D441A',
  onBlue: '#FFFFFF',
  tile: '#F3EDEF',
  segOff: '#1C121614',
};

export type Theme = typeof dark;

// মেশিনের ডিসপ্লে সবসময় কালো, তাই রং থিম থেকে আলাদা
export const lcd = {
  bg: '#030405',
  label: '#8FB4CF',
  blue: dark.blue,
  amber: dark.amber,
  red: dark.red,
  off: '#FFFFFF12',
  body: ['#6B1F2D', '#3A0F18', '#250A10'] as const,
};

export type Status = 'ok' | 'soon' | 'expired';

export const statusColor = (t: { blue: string; amber: string; red: string }, s: Status) =>
  s === 'expired' ? t.red : s === 'soon' ? t.amber : t.blue;

export const statusTint = (t: Theme, s: Status) =>
  s === 'expired' ? t.redTint : s === 'soon' ? t.amberTint : t.blueTint;

export const font = {
  regular: 'HindSiliguri_400Regular',
  medium: 'HindSiliguri_500Medium',
  semibold: 'HindSiliguri_600SemiBold',
  bold: 'HindSiliguri_700Bold',
  seg: 'DSEG7',
} as const;
