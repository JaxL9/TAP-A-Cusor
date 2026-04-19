import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { UpgradeCard } from '@/components/ui/UpgradeCard';
import { RebirthButton } from '@/components/ui/RebirthButton';
import { useGame } from '@/hooks/useGame';
import { formatNumber } from '@/services/gameService';

export default function ShopScreen() {
  const { upgrades, robuxPerSecond, offlineEarnings, dismissOffline } = useGame();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <View style={styles.header}>
        <Text style={styles.title}>🏪 Upgrade Shop</Text>
        <Text style={styles.subtitle}>
          {robuxPerSecond > 0
            ? `Earning R$ ${formatNumber(robuxPerSecond)}/s passively`
            : 'Buy auto-tappers to earn passively'}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <RebirthButton />

        <Text style={styles.sectionLabel}>AUTO-TAPPERS</Text>
        {upgrades.filter(u => u.baseRobuxPerSecond > 0).map(upgrade => (
          <UpgradeCard key={upgrade.id} upgrade={upgrade} />
        ))}

        <Text style={styles.sectionLabel}>TAP BOOSTERS</Text>
        {upgrades.filter(u => u.baseTapBonus > 0).map(upgrade => (
          <UpgradeCard key={upgrade.id} upgrade={upgrade} />
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* Offline earnings modal */}
      <Modal visible={offlineEarnings > 0} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>💤 Welcome Back!</Text>
            <Text style={styles.modalDesc}>While you were away, your auto-tappers kept working...</Text>
            <Text style={styles.modalAmount}>+R$ {formatNumber(offlineEarnings)}</Text>
            <Pressable onPress={dismissOffline} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>COLLECT!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.md,
  },
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
  bottomPad: {
    height: Spacing.xl,
  },
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
    borderWidth: 1,
    borderColor: Colors.gold + '55',
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalAmount: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extraBold,
    color: Colors.gold,
    marginBottom: Spacing.lg,
  },
  modalBtn: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  modalBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.extraBold,
    color: '#000',
    letterSpacing: 1,
  },
});
