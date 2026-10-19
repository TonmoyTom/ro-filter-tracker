import { Lang, PRESETS, Preset } from '../constants/presets';
import { getFilterState } from './dates';
import type { Cartridge } from './storage';

export const presetOf = (c: Pick<Cartridge, 'presetId'>): Preset => PRESETS[c.presetId] ?? PRESETS.custom;

export function cartridgeName(c: Pick<Cartridge, 'presetId' | 'customName'>, lang: Lang) {
  const custom = c.customName?.trim();
  return c.presetId === 'custom' && custom ? custom : presetOf(c).name[lang];
}

// ডিসপ্লেতে ছোট কোড — নিজের নাম দিলে প্রথম ৪ অক্ষর, বাংলা হলে F১, F২…
export function cartridgeCode(c: Pick<Cartridge, 'presetId' | 'customName'>, index: number) {
  const p = presetOf(c);
  if (p.id !== 'custom') return p.code;
  const n = c.customName?.replace(/\s+/g, '') ?? '';
  return /^[A-Za-z0-9]/.test(n) ? n.slice(0, 4).toUpperCase() : `F${index + 1}`;
}

export const cartridgeState = (c: Pick<Cartridge, 'installedAt' | 'months'>) => getFilterState(c.installedAt, c.months);
