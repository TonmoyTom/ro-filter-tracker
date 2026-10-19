import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { font } from '../constants/theme';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/ThemeContext';
import { IconButton } from './Button';

// পুরো সেটআপ মডাল বন্ধ করে হোমে ফেরে
export const leaveSetup = () => (router.canGoBack() ? router.dismissTo('/') : router.replace('/'));

// সেটআপে: "ধাপ ১/২" + পরে করব; সেটিংস থেকে এডিটে: শুধু পেছনের বাটন
export function SetupHeader({ step, editing, back }: { step: number; editing: boolean; back?: boolean }) {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {(editing || back) && <IconButton icon="chevron-back" onPress={() => router.back()} />}
      {!editing && (
        <>
          <View style={{ borderColor: theme.blue + '55', backgroundColor: theme.blueTint, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ color: theme.blue, fontFamily: font.semibold, fontSize: 13 }}>{t('stepOf', { n: step, t: 2 })}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Pressable onPress={leaveSetup} hitSlop={10}>
            <Text style={{ color: theme.text, fontFamily: font.semibold, fontSize: 16 }}>{t('later')}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
