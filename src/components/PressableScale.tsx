import * as Haptics from 'expo-haptics';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// চাপ দিলে একটু ছোট হয়ে আবার ফিরে আসে — বাটনগুলো জীবন্ত লাগে
export function PressableScale({
  style,
  haptic = true,
  onPress,
  ...rest
}: Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; haptic?: boolean }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={() => scale.set(withSpring(0.96, { duration: 150 }))}
      onPressOut={() => scale.set(withSpring(1, { duration: 250 }))}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => { });
        onPress?.(e);
      }}
      style={[style, anim]}
    />
  );
}
