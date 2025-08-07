import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import i18n from '../locales/i18n';

const RTL_SETUP_KEY = '@app_rtl_setup_complete';
const RTL_LANGS = ['ar', 'fa', 'he', 'ur'];

/**
 * Makes sure the app is running with the correct RTL/LTR layout direction.
 *
 * @returns `true` when it’s safe to render the React tree,
 *          `false` when the app is about to restart.
 */
export async function ensureRTLReady(): Promise<boolean> {
  try {
    const alreadySetup = await AsyncStorage.getItem(RTL_SETUP_KEY);

    const lang = i18n.language || 'en';
    const shouldBeRTL = RTL_LANGS.includes(lang);

    // Only force a restart the very first cold‑start if direction is wrong
    if (!alreadySetup && shouldBeRTL !== I18nManager.isRTL) {
      await AsyncStorage.setItem(RTL_SETUP_KEY, 'true');
      await I18nManager.forceRTL(shouldBeRTL);
      await I18nManager.allowRTL(shouldBeRTL);

      setTimeout(() => RNRestart.Restart(), 100);
      return false; // app will restart, nothing to render now
    }

    return true; // layout direction is already correct
  } catch (err) {
    console.error('ensureRTLReady error:', err);
    return true; // fail‑open so the user isn’t blocked
  }
}
