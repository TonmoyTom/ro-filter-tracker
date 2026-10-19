import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { font } from '../constants/theme';
import { useTheme } from '../lib/ThemeContext';
import { PressableScale } from './PressableScale';

type IconName = keyof typeof Ionicons.glyphMap;

export function PrimaryButton({
  icon, label, onPress, variant = 'solid',
}: {
  icon: IconName; label: string; onPress: () => void; variant?: 'solid' | 'outline' | 'ghost';
}) {
  const { theme } = useTheme();
  const solid = variant === 'solid';
  const fg = solid ? theme.onBlue : variant === 'outline' ? theme.blue : theme.text;
  return (
    <PressableScale
      onPress={onPress}
      style={{
        flex: solid ? undefined : 1,
        backgroundColor: solid ? theme.blue : variant === 'ghost' ? theme.card : 'transparent',
        borderWidth: solid ? 0 : 1,
        borderColor: variant === 'outline' ? theme.blue + '99' : theme.border,
        borderRadius: 20,
        paddingVertical: solid ? 16 : 13,
        paddingHorizontal: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        boxShadow: solid ? `0 6px 22px ${theme.blue}55` : undefined,
      }}
    >
      <Ionicons name={icon} size={solid ? 22 : 18} color={fg} />
      <Text numberOfLines={1} style={{ color: fg, fontFamily: font.bold, fontSize: solid ? 17 : 15 }}>{label}</Text>
    </PressableScale>
  );
}

// হেডারের গোল-কোণা আইকন বাটন
export function IconButton({ icon, onPress }: { icon: IconName; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      hitSlop={6}
      style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={icon} size={22} color={theme.blue} />
    </PressableScale>
  );
}
