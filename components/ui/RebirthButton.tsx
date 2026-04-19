import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';
import { formatNumber } from '@/services/gameService';
import { useGame } from '@/hooks/useGame';
import { useAlert } from '@/template';

export const RebirthButton = memo(function RebirthButton() {
  const { canRebirth, rebirth, rebirthLevel, rebirthThreshold, totalEarned } = useGame();
  const { showAlert } = useAlert();

  const handleRebirth = () => {
    showAlert(
      '🔥 Rebirth!',
      `You will lose all Robux and upgrades, but gain a permanent x${rebirthLevel + 2} multiplier on everything!\n\nYour PETS are kept forever.\n\nAre you sure?`,
      [
        { text: 'Not yet', style: 'cancel' },
        { text: 'REBIRTH!', style: 'destructive', onPress: rebirth },
      ]
    );
  };

  const progress = Math.min(totalEarned / rebirthThreshold, 1);

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        <Text style={styles.label}>
          🔥 Rebirth {rebirthLevel > 0 ? `(Level ${rebirthLevel})` : ''}
        </Text>
        <Text style={styles.progressText}>
          {formatNumber(totalEarned)} / {formatNumber(rebirthThreshold)}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>
      <Text style={styles.hint}>
        {canRebirth
          ? `Ready! Rebirth for x${rebirthLevel + 2} multiplier on tap + income`
          : `Earn ${formatNumber(rebirthThreshold - totalEarned)} more R$ to rebirth`}
      </Text>
      {canRebirth && (
        <Pressable onPress={handleRebirth} style={styles.button}>
          <Text style={styles.buttonText}>🔥 REBIRTH NOW (x{rebirthLevel + 2} everything)</Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#110500',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#3a1500',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    color: '#FF7043',
    fontWeight: FontWeight.bold,
  },
  progressText: {
    fontSize: FontSize.xs,
    color: Colors.goldDim,
    fontWeight: FontWeight.medium,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1e0a00',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5722',
    borderRadius: 3,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF5722',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extraBold,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
