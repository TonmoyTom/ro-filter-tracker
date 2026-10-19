import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Lang, Preset } from '../constants/presets';
import { MONTHS, STRINGS, StringKey, WEEKDAYS } from '../constants/strings';
import { cartridgeName } from './cartridges';
import type { Cartridge } from './storage';

const KEY = 'heron_lang';
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
export const num = (lang: Lang, n: number | string) => (lang === 'bn' ? toBn(n) : String(n));

export function translate(lang: Lang, key: StringKey, params?: Record<string, string | number>) {
  let s = STRINGS[lang][key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(`{${k}}`, typeof v === 'number' ? num(lang, v) : v);
    }
  }
  return s;
}

export const formatDate = (lang: Lang, d: Date) =>
  `${num(lang, d.getDate())} ${MONTHS[lang][d.getMonth()]} ${num(lang, d.getFullYear())}`;

export async function getStoredLang(): Promise<Lang> {
  const v = await AsyncStorage.getItem(KEY).catch(() => null);
  return v === 'en' ? 'en' : 'bn';
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: StringKey, params?: Record<string, string | number>) => string;
  n: (v: number | string) => string;
  date: (d: Date) => string;
  dateShort: (d: Date) => string;
  cName: (c: Pick<Cartridge, 'presetId' | 'customName'>) => string;
  pName: (p: Preset) => string;
  pDesc: (p: Preset) => string;
  months: string[];
  weekdays: string[];
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children, onChange }: { children: React.ReactNode; onChange?: (l: Lang) => void }) {
  const [lang, setLangState] = useState<Lang>('bn');

  useEffect(() => {
    getStoredLang().then(setLangState);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(KEY, l)
      .then(() => onChange?.(l))
      .catch(() => { });
  };

  const value: Ctx = {
    lang,
    setLang,
    t: (key, params) => translate(lang, key, params),
    n: (v) => num(lang, v),
    date: (d) => formatDate(lang, d),
    dateShort: (d) => `${num(lang, d.getDate())} ${MONTHS[lang][d.getMonth()]}`,
    cName: (c) => cartridgeName(c, lang),
    pName: (p) => p.name[lang],
    pDesc: (p) => p.desc[lang],
    months: MONTHS[lang],
    weekdays: WEEKDAYS[lang],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
