import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withSpring, withSequence, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { EGG_COSTS, formatNumber, RARITY_COLORS, EGG_RATES } from '@/services/gameService';
import { PetCard } from '@/components/ui/PetCard';
import { useGame } from '@/hooks/useGame';

const EGG_TYPES: { type: 'basic' | 'premium' | 'legendary'; label: string; emoji: string; color: string }[] = [
  { type: 'basic', label: 'Basic Egg', emoji: '🥚', color: '#AAAAAA' },
  { type: 'premium', label: 'Premium Egg', emoji: '💎', color: '#29B6F6' },
  { type: 'legendary', label: 'Legend Egg', emoji: '👑', color: '#FFD700' },
];

export default function PetsScreen() {
  const { pets, robux, buyEgg, toggleEquipPet } = useGame();
  const [lastHatch, setLastHatch] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const eggScale = useSharedValue(1);

  const equippedPets = pets.filter(p => p.equipped && p.owned > 0);
  const ownedPets = pets.filter(p => p.owned > 0);
  const notOwnedPets = pets.filter(p => p.owned === 0);

  const handleBuyEgg = (type: 'basic' | 'premium' | 'legendary') => {
    const petId = buyEgg(type);
    if (!petId) return;
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    setLastHatch(petId);
    setShowResult(true);
    eggScale.value = withSequence(
      withTiming(1.3, { duration: 200 }),
      withSpring(1, { damping: 8 })
    );
  };

  const eggAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: eggScale.value }],
  }));

  const hatchedPet = pets.find(p => p.id === lastHatch);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.header}>
        <Text style={styles.title}>🐾 Pet Collection</Text>
        <Text style={styles.subtitle}>
          {equippedPets.length}/3 pets equipped • {ownedPets.length} owned
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Egg Shop */}
        <Text style={styles.sectionLabel}>🥚 Egg Shop</Text>
        <View style={styles.eggRow}>
          {EGG_TYPES.map(egg => {
            const canAfford = robux >= EGG_COSTS[egg.type];
            return (
              <Pressable
                key={egg.type}
                onPress={() => handleBuyEgg(egg.type)}
                style={[styles.eggCard, { borderColor: egg.color + '55' }, !canAfford && styles.eggCardLocked]}
              >
                <Animated.View style={eggAnimStyle}>
                  <Image
                    source={require('@/assets/images/pet_egg.png')}
                    style={styles.eggImage}
                    contentFit="contain"
                  />
                </Animated.View>
                <Text style={[styles.eggEmoji]}>{egg.emoji}</Text>
                <Text style={[styles.eggLabel, { color: egg.color }]}>{egg.label}</Text>
                <Text style={[styles.eggCost, !canAfford && styles.eggCostLocked]}>
                  R$ {formatNumber(EGG_COSTS[egg.type])}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Equipped */}
        {equippedPets.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>⚡ Equipped (max 3)</Text>
            {equippedPets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </>
        )}

        {/* Owned not equipped */}
        {ownedPets.filter(p => !p.equipped).length > 0 && (
          <>
            <Text style={styles.sectionLabel}>📦 Inventory</Text>
            {ownedPets.filter(p => !p.equipped).map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </>
        )}

        {/* Locked / undiscovered */}
        <Text style={styles.sectionLabel}>🔒 Undiscovered</Text>
        {notOwnedPets.map(pet => (
          <PetCard key={pet.id} pet={pet} />
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Hatch result modal */}
      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, hatchedPet && { borderColor: RARITY_COLORS[hatchedPet.rarity] }]}>
            <Text style={styles.modalTitle}>✨ You hatched!</Text>
            {hatchedPet && (
              <>
                <Text style={styles.modalEmoji}>{hatchedPet.emoji}</Text>
                <Text style={[styles.modalName, { color: RARITY_COLORS[hatchedPet.rarity] }]}>
                  {hatchedPet.name}
                </Text>
                <Text style={[styles.modalRarity, { color: RARITY_COLORS[hatchedPet.rarity] }]}>
                  {hatchedPet.rarity.toUpperCase()}
                </Text>
                <Text style={styles.modalDesc}>{hatchedPet.description}</Text>
                <View style={styles.modalStats}>
                  {hatchedPet.tapMultiplier > 1 && (
                    <Text style={styles.modalStat}>🖱️ x{hatchedPet.tapMultiplier} Tap Power</Text>
                  )}
                  {hatchedPet.rpsMultiplier > 1 && (
                    <Text style={styles.modalStat}>⚡ x{hatchedPet.rpsMultiplier} Income</Text>
                  )}
                </View>
              </>
            )}
            <Pressable onPress={() => setShowResult(false)} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>AWESOME!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  scroll: { flex: 1 },
  content: { paddingTop: Spacing.md },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  eggRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  eggCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  eggCardLocked: {
    opacity: 0.5,
  },
  eggImage: {
    width: 52,
    height: 52,
  },
  eggEmoji: {
    fontSize: 20,
    marginTop: -8,
  },
  eggLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  eggCost: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: FontWeight.semiBold,
  },
  eggCostLocked: {
    color: Colors.textMuted,
  },
  bottomPad: { height: Spacing.xl },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000cc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalBox: {
    backgroundColor: '#141414',
    borderRadius: Radius.lg,
    borderWidth: 2,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extraBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  modalEmoji: {
    fontSize: 72,
    marginBottom: Spacing.sm,
  },
  modalName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    marginBottom: 4,
  },
  modalRarity: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalStats: {
    gap: 4,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  modalStat: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
  },
  modalBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  modalBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.extraBold,
    color: '#fff',
    letterSpacing: 1,
  },
});
