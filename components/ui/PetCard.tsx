import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Colors, FontSize, FontWeight, Spacing, Radius,
} from '@/constants/theme';
import { Pet, RARITY_COLORS, RARITY_BG, formatNumber } from '@/services/gameService';
import { useGame } from '@/hooks/useGame';

interface Props {
  pet: Pet;
}

export const PetCard = memo(function PetCard({ pet }: Props) {
  const { toggleEquipPet, robux, buyEgg } = useGame();
  const scale = useSharedValue(1);
  const rarityColor = RARITY_COLORS[pet.rarity];
  const rarityBg = RARITY_BG[pet.rarity];

  const handleEquip = useCallback(() => {
    toggleEquipPet(pet.id);
    scale.value = withSpring(0.92, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
  }, [toggleEquipPet, pet.id]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const notOwned = pet.owned === 0;

  return (
    <Animated.View style={animStyle}>
      <View style={[styles.card, { backgroundColor: rarityBg, borderColor: rarityColor + (notOwned ? '33' : '88') }]}>
        <View style={[styles.iconBox, { borderColor: rarityColor + '44' }]}>
          <Text style={styles.emoji}>{pet.emoji}</Text>
          {pet.owned > 1 && (
            <View style={[styles.ownedBadge, { backgroundColor: rarityColor }]}>
              <Text style={styles.ownedText}>x{pet.owned}</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, notOwned && styles.nameLocked]}>{pet.name}</Text>
            <Text style={[styles.rarity, { color: rarityColor }]}>
              {pet.rarity.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.description}>{pet.description}</Text>
          <View style={styles.statsRow}>
            {pet.tapMultiplier > 1 && (
              <Text style={styles.statChip}>🖱️ x{pet.tapMultiplier} tap</Text>
            )}
            {pet.rpsMultiplier > 1 && (
              <Text style={[styles.statChip, styles.rpsChip]}>⚡ x{pet.rpsMultiplier} RPS</Text>
            )}
          </View>
        </View>

        {!notOwned ? (
          <Pressable
            onPress={handleEquip}
            style={[
              styles.equipBtn,
              pet.equipped ? { backgroundColor: rarityColor } : { borderColor: rarityColor, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.equipText, !pet.equipped && { color: rarityColor }]}>
              {pet.equipped ? 'Equipped' : 'Equip'}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>Not owned</Text>
          </View>
        )}
      </View>
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
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  emoji: {
    fontSize: 28,
  },
  ownedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: Radius.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  ownedText: {
    fontSize: 9,
    fontWeight: FontWeight.extraBold,
    color: '#000',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  nameLocked: {
    color: Colors.textMuted,
  },
  rarity: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
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
  rpsChip: {
    color: '#29B6F6',
    backgroundColor: '#051520',
  },
  equipBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignItems: 'center',
    minWidth: 64,
  },
  equipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#000',
  },
  lockedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    backgroundColor: '#111',
  },
  lockedText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
});
