import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { formatNumber } from '@/services/gameService';
import { useGame } from '@/hooks/useGame';

interface FloatingItemProps {
  id: number;
  value: number;
  x: number;
  y: number;
}

function FloatingItem({ id, value, x, y }: FloatingItemProps) {
  const { removeFloatingText } = useGame();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(-80, { duration: 900 });
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 700 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.floating, { left: x - 30, top: y - 60 }, animStyle]}>
      <Text style={styles.text}>+R$ {formatNumber(value)}</Text>
    </Animated.View>
  );
}

export function FloatingTexts() {
  const { floatingTexts } = useGame();

  return (
    <>
      {floatingTexts.map(ft => (
        <FloatingItem key={ft.id} {...ft} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    zIndex: 999,
    pointerEvents: 'none',
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gold,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
