// #RRGGBB রংকে হালকা (amt > 0) বা গাঢ় (amt < 0) করে
export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1, 7), 16);
  const mix = (c: number) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
