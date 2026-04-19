import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

type SoundType = 'tap' | 'buy' | 'combo' | 'rebirth' | 'hatch';

class SoundService {
  private sounds: Partial<Record<SoundType, Audio.Sound>> = {};
  private enabled = true;

  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (e) {
      // Silent fail
    }
  }

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  async play(type: SoundType) {
    // Always do haptics as primary feedback
    try {
      if (type === 'tap') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (type === 'buy') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'combo') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (type === 'rebirth' || type === 'hatch') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (e) {
      // Haptics not available
    }
  }

  async cleanup() {
    for (const sound of Object.values(this.sounds)) {
      try {
        await sound?.unloadAsync();
      } catch (e) {}
    }
    this.sounds = {};
  }
}

export const soundService = new SoundService();
