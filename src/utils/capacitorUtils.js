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
      // 1) First check if an open MUI Dialog/Modal is active (stack unwinding)
      const openDialog = document.querySelector('.MuiDialog-root');
      if (openDialog) {
        const closeBtn =
          openDialog.querySelector('button[aria-label="close"]') ||
          openDialog.querySelector('button[aria-label="Close"]') ||
          openDialog.querySelector('.MuiIconButton-root');
        if (closeBtn) {
          closeBtn.click();
          return;
        }
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          bubbles: true
        });
        document.dispatchEvent(escEvent);
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
