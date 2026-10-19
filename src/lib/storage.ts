import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRESETS, PresetId } from '../constants/presets';
import { cancelAllReminders, rescheduleAll } from './notifications';

const KEY = 'heron_state_v1';

// পরে ডাটাবেসে গেলে purifier একটা তালিকা হবে — তাই আলাদা অবজেক্ট আর string id
export type Purifier = {
  id: string;
  name: string;
  brand: string;
};

export type Cartridge = {
  id: string;
  presetId: PresetId;
  customName?: string; // শুধু "অন্য ফিল্টার" হলে
  months: number; // কত মাস চলবে
  installedAt: string; // কবে কিনে লাগানো (ISO)
  history: string[]; // আগের তারিখগুলো, নতুন থেকে পুরনো
};

export type AppState = {
  setupDone: boolean;
  purifier: Purifier | null;
  cartridges: Cartridge[]; // ক্রম = মেশিনের ধাপ
  remindersOn: boolean;
  remindDaysBefore: number;
  dailyAfterExpiry: boolean;
};

export const initialState: AppState = {
  setupDone: false,
  purifier: null,
  cartridges: [],
  remindersOn: true,
  remindDaysBefore: 7,
  dailyAfterExpiry: true,
};

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const LEGACY_IDS: PresetId[] = ['pp', 'udf', 'cto', 'ro', 't33'];

// আগের সংস্করণে ৫টি নির্দিষ্ট ফিল্টার ছিল (filters/intervals) — সেগুলো কার্টিজে রূপান্তর
function migrate(raw: any): AppState {
  let purifier: Purifier | null = raw.purifier ?? null;
  let cartridges: Cartridge[] = Array.isArray(raw.cartridges) ? raw.cartridges : [];

  if (!raw.cartridges && raw.filters) {
    for (const id of LEGACY_IDS) {
      const r = raw.filters[id];
      if (!r?.installedAt) continue;
      cartridges.push({
        id: newId(),
        presetId: id,
        months: raw.intervals?.[id] ?? r.months ?? PRESETS[id].defaultMonths,
        installedAt: r.installedAt,
        history: Array.isArray(r.history) ? r.history : [],
      });
    }
    if (raw.setupDone && !purifier) purifier = { id: newId(), name: '', brand: 'Heron Queen' };
  }

  cartridges = cartridges.filter((c) => c && PRESETS[c.presetId] && c.installedAt);

  return {
    setupDone: !!raw.setupDone && cartridges.length > 0,
    purifier,
    cartridges,
    remindersOn: raw.remindersOn ?? initialState.remindersOn,
    remindDaysBefore: raw.remindDaysBefore ?? initialState.remindDaysBefore,
    dailyAfterExpiry: raw.dailyAfterExpiry ?? initialState.dailyAfterExpiry,
  };
}

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : initialState;
  } catch {
    return initialState;
  }
}

async function saveState(state: AppState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
  rescheduleAll(state).catch(() => { });
  return state;
}

function patchCartridge(state: AppState, id: string, fn: (c: Cartridge) => Cartridge) {
  return saveState({ ...state, cartridges: state.cartridges.map((c) => (c.id === id ? fn(c) : c)) });
}

export const replaceCartridgeToday = (state: AppState, id: string, date = new Date()) =>
  patchCartridge(state, id, (c) => ({ ...c, installedAt: date.toISOString(), history: [c.installedAt, ...c.history] }));

// ভুল তারিখ ঠিক করা — ইতিহাসে নতুন রেকর্ড যোগ হয় না
export const setInstallDate = (state: AppState, id: string, date: Date) =>
  patchCartridge(state, id, (c) => ({ ...c, installedAt: date.toISOString() }));

export const updateMonths = (state: AppState, id: string, months: number) =>
  patchCartridge(state, id, (c) => ({ ...c, months }));

export async function savePurifier(name: string, brand: string) {
  const prev = await loadState();
  return saveState({ ...prev, purifier: { id: prev.purifier?.id ?? newId(), name: name.trim(), brand: brand.trim() } });
}

export type CartridgeDraft = Omit<Cartridge, 'history'>;

// সেটআপ বা এডিট থেকে পুরো তালিকা সেভ — আগের কার্টিজের ইতিহাস থেকে যায়
export async function saveCartridges(drafts: CartridgeDraft[]) {
  const prev = await loadState();
  const old = new Map(prev.cartridges.map((c) => [c.id, c]));
  const cartridges = drafts.map((d) => ({ ...d, history: old.get(d.id)?.history ?? [] }));
  return saveState({ ...prev, setupDone: cartridges.length > 0, cartridges });
}

export function updateSettings(
  state: AppState,
  patch: Partial<Pick<AppState, 'remindersOn' | 'remindDaysBefore' | 'dailyAfterExpiry'>>,
) {
  return saveState({ ...state, ...patch });
}

export async function resetAll() {
  await cancelAllReminders();
  await AsyncStorage.removeItem(KEY);
}
