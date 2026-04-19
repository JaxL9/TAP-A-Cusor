import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { Upgrade, getUpgradeCost, formatNumber } from '@/services/gameService';
import { useGame } from '@/hooks/useGame';

interface Props {
  upgrade: Upgrade;
}

export const UpgradeCard = memo(function UpgradeCard({ upgrade }: Props) {
  const { robux, buyUpgrade } = useGame();
  const cost = getUpgradeCost(upgrade);
  const canAfford = robux >= cost;
  const scale = useSharedValue(1);

  const handlePress = useCallback(() => {
    const success = buyUpgrade(upgrade.id);
    if (success) {
      scale.value = withSpring(0.95, { damping: 10 }, () => {
        scale.value = withSpring(1, { damping: 12 });
      });
    }
  }, [buyUpgrade, upgrade.id]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.card,
          canAfford ? styles.cardAffordable : styles.cardLocked,
        ]}
      >
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{upgrade.emoji}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{upgrade.name}</Text>
            {upgrade.count > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{upgrade.count}</Text>
              </View>
            )}
          </View>
          <Text style={styles.description}>{upgrade.description}</Text>
          <View style={styles.statsRow}>
            {upgrade.baseRobuxPerSecond > 0 && (
              <Text style={styles.statChip}>
                +{formatNumber(upgrade.baseRobuxPerSecond * (upgrade.count + 1))}/s
              </Text>
            )}
            {upgrade.baseTapBonus > 0 && (
              <Text style={[styles.statChip, styles.tapChip]}>
                +{formatNumber(upgrade.baseTapBonus * (upgrade.count + 1))} tap
              </Text>
            )}
          </View>
        </View>

        <View style={styles.costContainer}>
          <Text style={styles.robuxSymbol}>R$</Text>
          <Text style={[styles.cost, canAfford ? styles.costAffordable : styles.costLocked]}>
            {formatNumber(cost)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 4,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cardAffordable: {
    backgroundColor: '#1a1a1a',
    borderColor: Colors.primary + '66',
  },
  cardLocked: {
    backgroundColor: '#111',
    borderColor: '#1e1e1e',
    opacity: 0.7,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 1,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#fff',
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  statChip: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.semiBold,
    backgroundColor: '#1e1500',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tapChip: {
    color: Colors.primaryGlow,
    backgroundColor: '#1e0808',
  },
  costContainer: {
    alignItems: 'flex-end',
  },
  robuxSymbol: {
    fontSize: FontSize.xs,
    color: Colors.goldDim,
    fontWeight: FontWeight.bold,
  },
  cost: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extraBold,
  },
  costAffordable: {
    color: Colors.gold,
  },
  costLocked: {
    color: Colors.textMuted,
  },
});
