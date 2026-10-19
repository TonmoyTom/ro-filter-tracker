import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font } from '../constants/theme';
import { useTheme } from '../lib/ThemeContext';

// নিচ থেকে ওঠা শিট — শিরোনাম, বন্ধের বাটন আর স্ক্রল করা যায় এমন ভেতরের অংশ
export function Sheet({
  visible, title, subtitle, onClose, onBack, children,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => void; // দিলে বাঁ দিকে পেছনের তীর দেখায়
  children: ReactNode;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onBack ?? onClose} statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={{ flex: 1, backgroundColor: '#000000AA' }} onPress={onClose} />
        <View style={{ maxHeight: '90%', backgroundColor: theme.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: theme.border }}>
          <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: theme.border, marginTop: 10 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 12 }}>
            {onBack && (
              <Pressable onPress={onBack} hitSlop={10}>
                <Ionicons name="chevron-back" size={24} color={theme.blue} />
              </Pressable>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontFamily: font.bold, fontSize: 21 }}>{title}</Text>
              {subtitle ? <Text style={{ color: theme.textDim, fontFamily: font.regular, fontSize: 14 }}>{subtitle}</Text> : null}
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.tile, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={22} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, paddingTop: 14, paddingBottom: 20 + insets.bottom }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
