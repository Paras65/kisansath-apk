import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';
import { notify } from '../services/notificationService';

let currentTabState = 'home';
let navigateHomeCallback = null;
let lastBackPressTime = 0;

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
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.openDialer === 'function') {
    try {
      window.AndroidBridge.openDialer(clean);
      return;
    } catch (e) {
      console.warn('[Dialer] AndroidBridge fallback:', e);
    }
  }
  window.location.href = `tel:${clean}`;
};

/**
 * Safely open native SMS composer
 */
export const openNativeSms = (phone, body = '') => {
  const clean = (phone || '').replace(/[^0-9+]/g, '');
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.openSms === 'function') {
    try {
      window.AndroidBridge.openSms(clean, body);
      return;
    } catch (e) {
      console.warn('[SMS] AndroidBridge fallback:', e);
    }
  }
  const encoded = encodeURIComponent(body);
  const uri = clean ? `sms:${clean}?body=${encoded}` : `sms:?body=${encoded}`;
  window.location.href = uri;
};

/**
 * Safely open WhatsApp with phone and pre-filled message
 */
export const openNativeWhatsApp = (phone, message = '') => {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  const cleanPhone = clean.length === 10 ? `91${clean}` : clean;
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.openWhatsApp === 'function') {
    try {
      window.AndroidBridge.openWhatsApp(cleanPhone, message);
      return;
    } catch (e) {
      console.warn('[WhatsApp] AndroidBridge fallback:', e);
    }
  }
  const encoded = encodeURIComponent(message);
  const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
};

/**
 * Native hardware vibration / haptic feedback
 */
export const vibrateDevice = (ms = 100) => {
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.vibrate === 'function') {
    try {
      window.AndroidBridge.vibrate(ms);
      return;
    } catch (e) {
      // fallback
    }
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Keep screen on during field walk tracking
 */
export const setNativeKeepScreenOn = (keepOn = true) => {
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.setKeepScreenOn === 'function') {
    try {
      window.AndroidBridge.setKeepScreenOn(keepOn);
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Synchronize current tab state and navigation callback with native back button handler
 */
export const setNativeNavContext = ({ currentTab = 'home', onNavigateHome = null }) => {
  currentTabState = currentTab;
  navigateHomeCallback = onNavigateHome;
};

/**
 * Displays a lightweight native toast across mobile devices and triggers global notification
 */
export const showExitToast = (message = 'ऐप से बाहर निकलने के लिए दोबारा बैक दबाएं') => {
  notify.info(message, null, 2000);

  const toast = document.createElement('div');
  toast.id = 'kisan-exit-toast';
  toast.innerText = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 84px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.94);
    color: #ffffff;
    padding: 10px 22px;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 700;
    z-index: 99999;
    box-shadow: 0 4px 18px rgba(0,0,0,0.35);
    pointer-events: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', sans-serif;
    transition: opacity 0.25s ease;
    text-align: center;
    white-space: nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 1800);
};

/**
 * Initializes native Android device features when running inside Capacitor APK
 */
export const initCapacitor = () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // 1. Native Status Bar Styling (#134e19 dark green)
  try {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#134E19' }).catch(() => {});
  } catch (err) {
    console.warn('[Capacitor] StatusBar init:', err);
  }

  // 2. Native Hardware Back Button Navigation & Exit Handling (Standard Android Double-Tap Exit)
  try {
    App.addListener('backButton', () => {
      // 1) First check if an open MUI Dialog/Modal is active (safe stack unwinding)
      const openDialog = document.querySelector('.MuiDialog-root');
      if (openDialog) {
        const closeBtn =
          openDialog.querySelector('button[aria-label="close"]') ||
          openDialog.querySelector('button[aria-label="Close"]') ||
          openDialog.querySelector('button[data-action="close"]') ||
          openDialog.querySelector('button[data-testid="close"]');
        if (closeBtn) {
          closeBtn.click();
          return;
        }

        // Try cancel / dismiss button
        const cancelBtn = Array.from(openDialog.querySelectorAll('button')).find(
          (b) => b.textContent && (b.textContent.includes('रद्द करें') || b.textContent.includes('बंद करें') || b.textContent.includes('बाद में'))
        );
        if (cancelBtn) {
          cancelBtn.click();
          return;
        }

        // Fallback: Dispatch Escape keydown to trigger MUI Dialog onClose
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(escEvent);

        // Also trigger backdrop click if dialog supports backdrop dismissal
        const backdrop = openDialog.querySelector('.MuiBackdrop-root');
        if (backdrop) {
          backdrop.click();
        }
        return;
      }

      // 2) If not on Home tab, smoothly return to Home tab
      if (currentTabState !== 'home') {
        if (navigateHomeCallback) {
          navigateHomeCallback('home');
        }
        return;
      }

      // 3) Already on Home screen with no open modal -> Double-tap back to cleanly exit APK
      const now = Date.now();
      if (now - lastBackPressTime < 2000) {
        App.exitApp();
      } else {
        lastBackPressTime = now;
        showExitToast('ऐप से बाहर निकलने के लिए दोबारा बैक दबाएं');
      }
    });
  } catch (err) {
    console.warn('[Capacitor] BackButton init:', err);
  }
};
