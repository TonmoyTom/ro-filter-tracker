import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, Theme } from '../constants/theme';

export type Mode = 'system' | 'dark' | 'light';
type Ctx = { theme: Theme; isDark: boolean; mode: Mode; setMode: (m: Mode) => void };

const KEY = 'heron_theme_mode';
const ThemeContext = createContext<Ctx>({
  theme: dark, isDark: true, mode: 'dark', setMode: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [mode, setModeState] = useState<Mode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === 'system' || v === 'dark' || v === 'light') setModeState(v);
    });
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => { });
  };

  const isDark = mode === 'system' ? scheme !== 'light' : mode === 'dark';

  return (
    <ThemeContext.Provider value={{ theme: isDark ? dark : light, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
