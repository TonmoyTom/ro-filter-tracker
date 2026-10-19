export type Lang = 'bn' | 'en';
type L = Record<Lang, string>;

// কার্টিজ আঁকার ধরন — প্রতিটি দেখতে আলাদা
export type CartridgeKind = 'sediment' | 'granular' | 'block' | 'membrane' | 'inline' | 'fiber' | 'uv' | 'mineral';

export type PresetId = 'pp' | 'udf' | 'cto' | 'ro' | 't33' | 'uf' | 'uv' | 'mineral' | 'alkaline' | 'custom';

export type Preset = {
  id: PresetId;
  code: string;
  name: L;
  desc: L;
  defaultMonths: number;
  kind: CartridgeKind;
  cap: string; // ঢাকনার রং
};

// ড্রপডাউনে এই ক্রমেই দেখায়
export const PRESET_LIST: Preset[] = [
  {
    id: 'pp', code: 'PP', defaultMonths: 4, kind: 'sediment', cap: '#C9CED4',
    name: { bn: 'সেডিমেন্ট ফিল্টার', en: 'Sediment Filter' },
    desc: { bn: 'ময়লা ও বালি আটকায়', en: 'Traps dirt, rust and sand' },
  },
  {
    id: 'udf', code: 'UDF', defaultMonths: 6, kind: 'granular', cap: '#5E666E',
    name: { bn: 'কার্বন ফিল্টার', en: 'Carbon Filter' },
    desc: { bn: 'ক্লোরিন, গন্ধ ও রং দূর করে', en: 'Removes chlorine, odour and colour' },
  },
  {
    id: 'cto', code: 'CTO', defaultMonths: 6, kind: 'block', cap: '#2B2F34',
    name: { bn: 'কার্বন ব্লক ফিল্টার', en: 'Carbon Block Filter' },
    desc: { bn: 'সূক্ষ্ম ময়লা ও রাসায়নিক দূর করে', en: 'Removes fine particles and chemicals' },
  },
  {
    id: 'ro', code: 'RO', defaultMonths: 18, kind: 'membrane', cap: '#3D8FD6',
    name: { bn: 'মেমব্রেন', en: 'RO Membrane' },
    desc: { bn: 'দ্রবীভূত লবণ ও ভারী ধাতু আটকায়', en: 'Blocks dissolved salts and heavy metals' },
  },
  {
    id: 't33', code: 'T33', defaultMonths: 9, kind: 'inline', cap: '#A88690',
    name: { bn: 'টেস্ট অ্যান্ড ওডর ফিল্টার', en: 'Taste & Odour Filter' },
    desc: { bn: 'স্বাদ ও গন্ধ ঠিক করে', en: 'Polishes taste and smell' },
  },
  {
    id: 'uf', code: 'UF', defaultMonths: 12, kind: 'fiber', cap: '#3FA69B',
    name: { bn: 'ইউএফ মেমব্রেন', en: 'UF Membrane' },
    desc: { bn: 'ব্যাকটেরিয়া ও ঘোলাভাব দূর করে', en: 'Removes bacteria and cloudiness' },
  },
  {
    id: 'uv', code: 'UV', defaultMonths: 12, kind: 'uv', cap: '#7A5AD8',
    name: { bn: 'ইউভি ল্যাম্প', en: 'UV Lamp' },
    desc: { bn: 'জীবাণু ধ্বংস করে', en: 'Kills germs with UV light' },
  },
  {
    id: 'mineral', code: 'MIN', defaultMonths: 6, kind: 'mineral', cap: '#C49A5E',
    name: { bn: 'মিনারেল ফিল্টার', en: 'Mineral Filter' },
    desc: { bn: 'প্রয়োজনীয় খনিজ যোগ করে', en: 'Adds healthy minerals back' },
  },
  {
    id: 'alkaline', code: 'ALK', defaultMonths: 6, kind: 'mineral', cap: '#5FA86E',
    name: { bn: 'অ্যালকালাইন ফিল্টার', en: 'Alkaline Filter' },
    desc: { bn: 'পানির pH বাড়ায়', en: 'Raises the water pH' },
  },
  {
    id: 'custom', code: '', defaultMonths: 6, kind: 'inline', cap: '#8E959C',
    name: { bn: 'অন্য ফিল্টার', en: 'Other filter' },
    desc: { bn: 'তালিকায় না থাকলে নিজে নাম দিন', en: 'Not listed? Name it yourself' },
  },
];

export const PRESETS = Object.fromEntries(PRESET_LIST.map((p) => [p.id, p])) as Record<PresetId, Preset>;

// হেরন কুইনের ৫ ধাপ — এক চাপে বসানোর জন্য
export const HERON_TEMPLATE: PresetId[] = ['pp', 'udf', 'cto', 'ro', 't33'];

export const MIN_CARTRIDGES = 2;
export const MAX_CARTRIDGES = 7;
