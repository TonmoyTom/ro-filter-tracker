import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { HERON_TEMPLATE, PRESETS } from '../constants/presets';
import { addMonths } from './dates';
import { AppState, initialState, loadState } from './storage';

// সেটআপের আগে নমুনা দেখানোর জন্য — কখনো সেভ হয় না
const DEMO_DAYS_LEFT = [-12, 24, 135, 264, 45];

function demoState(): AppState {
  const today = new Date();
  return {
    ...initialState,
    purifier: { id: 'demo', name: '', brand: 'Heron Queen' },
    cartridges: HERON_TEMPLATE.map((presetId, i) => {
      const due = new Date(today);
      due.setDate(due.getDate() + DEMO_DAYS_LEFT[i]);
      const months = PRESETS[presetId].defaultMonths;
      return { id: `demo-${presetId}`, presetId, months, installedAt: addMonths(due, -months).toISOString(), history: [] };
    }),
  };
}

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const reload = useCallback(async () => {
    const s = await loadState();
    setIsDemo(!s.setupDone);
    setState(s.setupDone ? s : demoState());
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { state, isDemo, reload, setState };
}
