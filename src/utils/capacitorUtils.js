import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

/**
 * Check if the application is currently running as a native Android/iOS APK
 */
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Safely open Android phone dialer with a given phone number
 */
export const openNativeDialer = (phone) => {
  if (!phone) return;
  const clean = phone.replace(/[^0-9+]/g, '');
  window.location.href = `tel:${clean}`;
};

/**
 * Safely open native SMS composer
 */
export const openNativeSms = (phone, body = '') => {
  const clean = (phone || '').replace(/[^0-9+]/g, '');
  const encoded = encodeURIComponent(body);
  const uri = clean ? `sms:${clean}?body=${encoded}` : `sms:?body=${encoded}`;
  window.location.href = uri;
};

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

  // 2. Native Hardware Back Button Navigation Handling (Modal-Aware)
  try {
    App.addListener('backButton', ({ canGoBack }) => {
      // 1) First check if an open MUI Dialog/Modal is active
      const openDialog = document.querySelector('.MuiDialog-root');
      if (openDialog) {
        // Attempt to click the close button in the dialog header
        const closeBtn =
          openDialog.querySelector('button[aria-label="close"]') ||
          openDialog.querySelector('button[aria-label="Close"]') ||
          openDialog.querySelector('.MuiIconButton-root');
        if (closeBtn) {
          closeBtn.click();
          return;
        }
        // Fallback: Dispatch Escape key to trigger onClose
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          bubbles: true
        });
        document.dispatchEvent(escEvent);
        return;
      }

      // 2) If browser history has entries or canGoBack is true, pop state
      if (canGoBack || (typeof window !== 'undefined' && window.history.length > 1)) {
        window.history.back();
      } else {
        // 3) At root home screen, cleanly exit application
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn('[Capacitor] BackButton init:', err);
  }
};

