import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { formatNumber } from '@/services/gameService';
import { useGame } from '@/hooks/useGame';

export const StatsHeader = memo(function StatsHeader() {
  const { robux, robuxPerSecond, tapValue, rebirthLevel, totalEarned, comboMultiplier, comboColor } = useGame();

  return (
    <View style={styles.container}>
      <View style={styles.mainCounter}>
        <Text style={styles.robuxSymbol}>R$</Text>
        <Text style={styles.robuxValue}>{formatNumber(robux)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>per second</Text>
          <Text style={styles.statValue}>{formatNumber(robuxPerSecond)}/s</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>per tap</Text>
          <Text style={styles.statValue}>{formatNumber(tapValue)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>all time</Text>
          <Text style={styles.statValue}>{formatNumber(totalEarned)}</Text>
        </View>
        {comboMultiplier > 1 && (
          <>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>combo</Text>
              <Text style={[styles.statValue, { color: comboColor }]}>⚡ {comboMultiplier}x</Text>
            </View>
          </>
        )}
        {rebirthLevel > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>rebirth</Text>
              <Text style={[styles.statValue, styles.rebirthValue]}>🔥 x{rebirthLevel + 1}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  mainCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  robuxSymbol: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
  },
  robuxValue: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.gold,
    marginTop: 2,
  },
  rebirthValue: {
    color: '#FF5722',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#222',
  },
});
