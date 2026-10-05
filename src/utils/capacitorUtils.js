import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

/**
 * Initializes native Android device features when running inside Capacitor APK
 */
export const initCapacitor = () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // 1. Native Status Bar Styling (#1b5e20 dark green)
  try {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#1B5E20' }).catch(() => {});
  } catch (err) {
    console.warn('[Capacitor] StatusBar init:', err);
  }

  // 2. Native Hardware Back Button Navigation Handling
  try {
    App.addListener('backButton', ({ canGoBack }) => {
      // If modal or subview is open or browser history exists, go back, else exit
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn('[Capacitor] BackButton init:', err);
  }
};
