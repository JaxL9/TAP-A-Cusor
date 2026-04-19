import React, { createContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UPGRADES_TEMPLATE,
  PETS_TEMPLATE,
  Upgrade,
  Pet,
  SavedGame,
  getUpgradeCost,
  getTotalRobuxPerSecond,
  getTapValue,
  getRebirthThreshold,
  rollEgg,
  EGG_COSTS,
  getComboMultiplier,
  COMBO_LEVELS,
} from '@/services/gameService';
import { soundService } from '@/services/soundService';

const SAVE_KEY = '@roblox_tapper_save';
const COMBO_RESET_MS = 2000;
const MAX_EQUIPPED_PETS = 3;

interface FloatingText {
  id: number;
  value: number;
  x: number;
  y: number;
}

interface GameContextType {
  robux: number;
  totalEarned: number;
  robuxPerSecond: number;
  tapValue: number;
  upgrades: Upgrade[];
  pets: Pet[];
  rebirthLevel: number;
  floatingTexts: FloatingText[];
  combo: number;
  comboMultiplier: number;
  comboLabel: string;
  comboColor: string;
  tap: (x: number, y: number) => void;
  buyUpgrade: (id: string) => boolean;
  rebirth: () => void;
  canRebirth: boolean;
  rebirthThreshold: number;
  removeFloatingText: (id: number) => void;
  buyEgg: (type: 'basic' | 'premium' | 'legendary') => string | null;
  toggleEquipPet: (id: string) => void;
  offlineEarnings: number;
  dismissOffline: () => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

let floatingId = 0;

export function GameProvider({ children }: { children: ReactNode }) {
  const [robux, setRobux] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(UPGRADES_TEMPLATE.map(u => ({ ...u })));
  const [pets, setPets] = useState<Pet[]>(PETS_TEMPLATE.map(p => ({ ...p })));
  const [rebirthLevel, setRebirthLevel] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [combo, setCombo] = useState(0);
  const [offlineEarnings, setOfflineEarnings] = useState(0);

  const robuxRef = useRef(robux);
  const upgradesRef = useRef(upgrades);
  const petsRef = useRef(pets);
  const rebirthRef = useRef(rebirthLevel);
  const comboRef = useRef(combo);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  useEffect(() => { robuxRef.current = robux; }, [robux]);
  useEffect(() => { upgradesRef.current = upgrades; }, [upgrades]);
  useEffect(() => { petsRef.current = pets; }, [pets]);
  useEffect(() => { rebirthRef.current = rebirthLevel; }, [rebirthLevel]);
  useEffect(() => { comboRef.current = combo; }, [combo]);

  // Load save on mount
  useEffect(() => {
    soundService.init();
    loadGame();
    return () => { soundService.cleanup(); };
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveGame();
    }, 30000);
    return () => clearInterval(interval);
  }, [robux, totalEarned, upgrades, rebirthLevel, pets]);

  const saveGame = useCallback(async () => {
    try {
      const save: SavedGame = {
        robux: robuxRef.current,
        totalEarned: totalEarned,
        upgrades: upgradesRef.current,
        rebirthLevel: rebirthRef.current,
        pets: petsRef.current,
        lastSaved: Date.now(),
      };
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (e) {}
  }, [totalEarned]);

  const loadGame = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const save: SavedGame = JSON.parse(raw);

      // Calculate offline earnings
      const elapsed = (Date.now() - save.lastSaved) / 1000; // seconds
      const cappedElapsed = Math.min(elapsed, 3600 * 8); // max 8 hours offline
      const rps = getTotalRobuxPerSecond(save.upgrades, save.pets, save.rebirthLevel);
      const earned = rps * cappedElapsed;

      setRobux(save.robux + earned);
      setTotalEarned(save.totalEarned + earned);
      setUpgrades(save.upgrades);
      setRebirthLevel(save.rebirthLevel);
      // Merge saved pets with template (in case new pets were added)
      const mergedPets = PETS_TEMPLATE.map(template => {
        const saved = save.pets?.find(p => p.id === template.id);
        return saved ? { ...template, owned: saved.owned, equipped: saved.equipped } : template;
      });
      setPets(mergedPets);

      if (earned > 0) {
        setOfflineEarnings(earned);
      }
    } catch (e) {}
  }, []);

  // Passive income tick every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      const rps = getTotalRobuxPerSecond(upgradesRef.current, petsRef.current, rebirthRef.current);
      if (rps > 0) {
        const gain = rps / 10;
        setRobux(prev => prev + gain);
        setTotalEarned(prev => prev + gain);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Combo reset timer
  const resetComboTimer = useCallback(() => {
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, COMBO_RESET_MS);
  }, []);

  const tap = useCallback((x: number, y: number) => {
    const newCombo = comboRef.current + 1;
    setCombo(newCombo);
    resetComboTimer();

    const comboInfo = getComboMultiplier(newCombo);
    const baseValue = getTapValue(upgradesRef.current, petsRef.current, rebirthRef.current);
    const value = baseValue * comboInfo.multiplier;

    setRobux(prev => prev + value);
    setTotalEarned(prev => prev + value);

    soundService.play('tap');

    // Combo milestone sound
    const isComboMilestone = COMBO_LEVELS.some(l => l.threshold === newCombo);
    if (isComboMilestone) {
      soundService.play('combo');
    }

    const id = floatingId++;
    setFloatingTexts(prev => [...prev, { id, value, x, y }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  }, [resetComboTimer]);

  const buyUpgrade = useCallback((id: string): boolean => {
    const upgrade = upgradesRef.current.find(u => u.id === id);
    if (!upgrade) return false;
    const cost = getUpgradeCost(upgrade);
    if (robuxRef.current < cost) return false;

    setRobux(prev => prev - cost);
    setUpgrades(prev => prev.map(u => u.id === id ? { ...u, count: u.count + 1 } : u));
    soundService.play('buy');
    return true;
  }, []);

  const rebirthThreshold = getRebirthThreshold(rebirthLevel);
  const canRebirth = totalEarned >= rebirthThreshold;

  const rebirth = useCallback(async () => {
    if (!canRebirth) return;
    soundService.play('rebirth');
    const newLevel = rebirthRef.current + 1;
    setRebirthLevel(newLevel);
    setRobux(0);
    setTotalEarned(0);
    setUpgrades(UPGRADES_TEMPLATE.map(u => ({ ...u })));
    setCombo(0);
    // Keep pets on rebirth
    // Auto-save after rebirth
    try {
      const save: SavedGame = {
        robux: 0,
        totalEarned: 0,
        upgrades: UPGRADES_TEMPLATE.map(u => ({ ...u })),
        rebirthLevel: newLevel,
        pets: petsRef.current,
        lastSaved: Date.now(),
      };
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (e) {}
  }, [canRebirth]);

  const buyEgg = useCallback((type: 'basic' | 'premium' | 'legendary'): string | null => {
    const cost = EGG_COSTS[type];
    if (robuxRef.current < cost) return null;

    setRobux(prev => prev - cost);
    const petId = rollEgg(type);

    setPets(prev => prev.map(p => p.id === petId ? { ...p, owned: p.owned + 1 } : p));
    soundService.play('hatch');
    return petId;
  }, []);

  const toggleEquipPet = useCallback((id: string) => {
    setPets(prev => {
      const pet = prev.find(p => p.id === id);
      if (!pet || pet.owned === 0) return prev;

      if (pet.equipped) {
        return prev.map(p => p.id === id ? { ...p, equipped: false } : p);
      }

      const equippedCount = prev.filter(p => p.equipped).length;
      if (equippedCount >= MAX_EQUIPPED_PETS) return prev;

      return prev.map(p => p.id === id ? { ...p, equipped: true } : p);
    });
  }, []);

  const dismissOffline = useCallback(() => {
    setOfflineEarnings(0);
  }, []);

  const removeFloatingText = useCallback((id: number) => {
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
  }, []);

  const comboInfo = getComboMultiplier(combo);
  const robuxPerSecond = getTotalRobuxPerSecond(upgrades, pets, rebirthLevel);
  const tapValue = getTapValue(upgrades, pets, rebirthLevel);

  return (
    <GameContext.Provider value={{
      robux,
      totalEarned,
      robuxPerSecond,
      tapValue,
      upgrades,
      pets,
      rebirthLevel,
      floatingTexts,
      combo,
      comboMultiplier: comboInfo.multiplier,
      comboLabel: comboInfo.label,
      comboColor: comboInfo.color,
      tap,
      buyUpgrade,
      rebirth,
      canRebirth,
      rebirthThreshold,
      removeFloatingText,
      buyEgg,
      toggleEquipPet,
      offlineEarnings,
      dismissOffline,
    }}>
      {children}
    </GameContext.Provider>
  );
}
