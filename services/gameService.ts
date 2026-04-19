export interface Upgrade {
  id: string;
  name: string;
  description: string;
  emoji: string;
  baseCost: number;
  baseRobuxPerSecond: number;
  baseTapBonus: number;
  count: number;
  maxCount: number;
}

export interface Pet {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  emoji: string;
  tapMultiplier: number;
  rpsMultiplier: number;
  owned: number;
  equipped: boolean;
}

export interface SavedGame {
  robux: number;
  totalEarned: number;
  upgrades: Upgrade[];
  rebirthLevel: number;
  pets: Pet[];
  lastSaved: number;
}

export const UPGRADES_TEMPLATE: Upgrade[] = [
  {
    id: 'noob',
    name: 'Noob Clicker',
    description: 'A noob helps you tap. Slowly.',
    emoji: '🟥',
    baseCost: 15,
    baseRobuxPerSecond: 0.1,
    baseTapBonus: 0,
    count: 0,
    maxCount: 999,
  },
  {
    id: 'cursor',
    name: 'Auto Cursor',
    description: 'Clicks on its own every second.',
    emoji: '🖱️',
    baseCost: 100,
    baseRobuxPerSecond: 0.5,
    baseTapBonus: 0,
    count: 0,
    maxCount: 999,
  },
  {
    id: 'robofarm',
    name: 'Robo Farm',
    description: 'Robots farming Robux 24/7.',
    emoji: '🤖',
    baseCost: 500,
    baseRobuxPerSecond: 2,
    baseTapBonus: 0,
    count: 0,
    maxCount: 999,
  },
  {
    id: 'goldtap',
    name: 'Golden Finger',
    description: 'Each tap earns way more Robux.',
    emoji: '✨',
    baseCost: 250,
    baseRobuxPerSecond: 0,
    baseTapBonus: 2,
    count: 0,
    maxCount: 999,
  },
  {
    id: 'obby',
    name: 'Obby Course',
    description: 'Players run your obby and pay up.',
    emoji: '🏃',
    baseCost: 2000,
    baseRobuxPerSecond: 8,
    baseTapBonus: 0,
    count: 0,
    maxCount: 999,
  },
  {
    id: 'gamepass',
    name: 'Game Pass',
    description: 'Sell game passes. Passive income.',
    emoji: '🎮',
    baseCost: 10000,
    baseRobuxPerSecond: 35,
    baseTapBonus: 0,
    count: 0,
    maxCount: 999,
  },
  {
    id: 'devex',
    name: 'DevEx Machine',
    description: 'Convert Robux to real money and back.',
    emoji: '💰',
    baseCost: 50000,
    baseRobuxPerSecond: 150,
    baseTapBonus: 0,
    count: 0,
    maxCount: 999,
  },
  {
    id: 'bloxfruit',
    name: 'Blox Fruit Farm',
    description: 'Millions grinding your fruit game.',
    emoji: '🍎',
    baseCost: 200000,
    baseRobuxPerSecond: 600,
    baseTapBonus: 0,
    count: 0,
    maxCount: 999,
  },
];

export const PETS_TEMPLATE: Pet[] = [
  {
    id: 'noob_pet',
    name: 'Baby Noob',
    rarity: 'common',
    description: 'A tiny noob companion. Adds a small tap boost.',
    emoji: '🟥',
    tapMultiplier: 1.1,
    rpsMultiplier: 1.0,
    owned: 0,
    equipped: false,
  },
  {
    id: 'cat_pet',
    name: 'Lucky Cat',
    rarity: 'common',
    description: 'Brings good fortune. Slight RPS boost.',
    emoji: '🐱',
    tapMultiplier: 1.0,
    rpsMultiplier: 1.15,
    owned: 0,
    equipped: false,
  },
  {
    id: 'dragon_pet',
    name: 'Fire Dragon',
    rarity: 'rare',
    description: 'Burns through numbers. Big tap power.',
    emoji: '🐉',
    tapMultiplier: 1.5,
    rpsMultiplier: 1.1,
    owned: 0,
    equipped: false,
  },
  {
    id: 'unicorn_pet',
    name: 'Unicorn',
    rarity: 'epic',
    description: 'Magical beast. Huge RPS multiplier.',
    emoji: '🦄',
    tapMultiplier: 1.2,
    rpsMultiplier: 2.0,
    owned: 0,
    equipped: false,
  },
  {
    id: 'dominus_pet',
    name: 'Dominus',
    rarity: 'legendary',
    description: 'The rarest Roblox hat. Godlike multipliers.',
    emoji: '👑',
    tapMultiplier: 3.0,
    rpsMultiplier: 3.0,
    owned: 0,
    equipped: false,
  },
];

export const EGG_COSTS = {
  basic: 500,
  premium: 5000,
  legendary: 50000,
};

export const EGG_RATES: Record<string, Record<string, number>> = {
  basic: {
    noob_pet: 0.5,
    cat_pet: 0.4,
    dragon_pet: 0.08,
    unicorn_pet: 0.02,
    dominus_pet: 0.0,
  },
  premium: {
    noob_pet: 0.2,
    cat_pet: 0.3,
    dragon_pet: 0.3,
    unicorn_pet: 0.15,
    dominus_pet: 0.05,
  },
  legendary: {
    noob_pet: 0.05,
    cat_pet: 0.1,
    dragon_pet: 0.3,
    unicorn_pet: 0.3,
    dominus_pet: 0.25,
  },
};

export function rollEgg(eggType: 'basic' | 'premium' | 'legendary'): string {
  const rates = EGG_RATES[eggType];
  const rand = Math.random();
  let cumulative = 0;
  for (const [petId, rate] of Object.entries(rates)) {
    cumulative += rate;
    if (rand <= cumulative) return petId;
  }
  return 'noob_pet';
}

export function getUpgradeCost(upgrade: Upgrade): number {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.count));
}

export function getTotalRobuxPerSecond(upgrades: Upgrade[], pets: Pet[], rebirthLevel: number): number {
  const base = upgrades.reduce((total, u) => total + u.baseRobuxPerSecond * u.count, 0);
  const petMult = getEquippedPetRpsMult(pets);
  return base * petMult * (rebirthLevel + 1);
}

export function getTapValue(upgrades: Upgrade[], pets: Pet[], rebirthLevel: number): number {
  const base = 1;
  const bonus = upgrades.reduce((total, u) => total + u.baseTapBonus * u.count, 0);
  const petMult = getEquippedPetTapMult(pets);
  return (base + bonus) * petMult * (rebirthLevel + 1);
}

export function getEquippedPetTapMult(pets: Pet[]): number {
  return pets.filter(p => p.equipped && p.owned > 0).reduce((mult, p) => mult * p.tapMultiplier, 1);
}

export function getEquippedPetRpsMult(pets: Pet[]): number {
  return pets.filter(p => p.equipped && p.owned > 0).reduce((mult, p) => mult * p.rpsMultiplier, 1);
}

export function formatNumber(n: number): string {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Qa';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return Math.floor(n).toString();
}

export function getRebirthThreshold(level: number): number {
  return Math.floor(1000000 * Math.pow(10, level));
}

export const COMBO_LEVELS = [
  { threshold: 5, multiplier: 2, label: 'x2', color: '#66BB6A' },
  { threshold: 15, multiplier: 5, label: 'x5', color: '#29B6F6' },
  { threshold: 30, multiplier: 10, label: 'x10', color: '#AB47BC' },
  { threshold: 50, multiplier: 25, label: 'x25', color: '#FFA726' },
  { threshold: 75, multiplier: 50, label: 'x50', color: '#FF5722' },
  { threshold: 100, multiplier: 100, label: 'x100', color: '#FFD700' },
];

export function getComboMultiplier(combo: number): { multiplier: number; label: string; color: string } {
  let result = { multiplier: 1, label: 'x1', color: '#555' };
  for (const level of COMBO_LEVELS) {
    if (combo >= level.threshold) {
      result = { multiplier: level.multiplier, label: level.label, color: level.color };
    }
  }
  return result;
}

export const RARITY_COLORS = {
  common: '#AAAAAA',
  rare: '#29B6F6',
  epic: '#AB47BC',
  legendary: '#FFD700',
};

export const RARITY_BG = {
  common: '#1a1a1a',
  rare: '#071520',
  epic: '#120720',
  legendary: '#1a1400',
};
