import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { useGame } from '@/hooks/useGame';

export function TapButton() {
  const { tap, combo, comboLabel, comboColor, comboMultiplier } = useGame();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const comboScale = useSharedValue(1);

  const handlePress = useCallback((event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    tap(pageX, pageY);

    scale.value = withSequence(
      withTiming(0.88, { duration: 70 }),
      withSpring(1.06, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    glow.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 280 })
    );
    comboScale.value = withSequence(
      withTiming(1.4, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 250 })
    );
  }, [tap]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.7,
  }));

  const comboAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: comboScale.value }],
  }));

  const isComboActive = comboMultiplier > 1;

  return (
    <View style={styles.container}>
      {/* Glow ring */}
      <Animated.View style={[styles.glowRing, glowStyle, isComboActive && { backgroundColor: comboColor }]} />

      <Pressable onPress={handlePress} style={styles.pressable}>
        <Animated.View style={[styles.buttonWrapper, animStyle]}>
          <View style={[styles.circle, isComboActive && { borderColor: comboColor }]}>
            <Image
              source={require('@/assets/images/tap_cursor.png')}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
          </View>
        </Animated.View>
      </Pressable>

      {/* Combo meter */}
      <Animated.View style={[styles.comboContainer, comboAnimStyle]}>
        {combo > 0 ? (
          <View style={[styles.comboBadge, { backgroundColor: comboColor + '22', borderColor: comboColor }]}>
            <Text style={[styles.comboLabel, { color: comboColor }]}>{comboLabel} COMBO</Text>
            <Text style={[styles.comboCount, { color: comboColor }]}>{combo} taps</Text>
          </View>
        ) : (
          <Text style={styles.tapHint}>TAP TO EARN ROBUX</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.primary,
    zIndex: 0,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: Colors.primary,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 170,
    height: 170,
  },
  comboContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  comboBadge: {
    borderRadius: Radius.full,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  comboLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  comboCount: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    opacity: 0.8,
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#444',
    textTransform: 'uppercase',
  },
});
