// किसान साथी - ग्लोबल कंसिस्टेंट नोटिफिकेशन सेवा (Global Notification Service)
// Zero-Redundancy DRY Architecture: Works inside and outside React components

const listeners = new Set();
let activeToast = null;
let lastMessage = null;
let lastTimestamp = 0;

/**
 * Subscribe a component (e.g. GlobalNotification) to notification events
 */
export const subscribeNotifications = (callback) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const emit = (notification) => {
  activeToast = notification;
  listeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (err) {
      console.warn('[NotificationService] Listener error:', err);
    }
  });
};

/**
 * Core notification trigger
 * @param {Object} options
 * @param {string} options.message - Hindi notification text
 * @param {'success'|'info'|'warning'|'error'} [options.severity='info']
 * @param {number} [options.duration=3200] - Duration in ms
 * @param {string} [options.title] - Optional bold title
 */
export const showNotification = ({
  message,
  severity = 'info',
  duration = 3200,
  title = null
}) => {
  if (!message) return;

  // Deduplication guard: ignore exact duplicate within 1200ms
  const now = Date.now();
  if (lastMessage === message && now - lastTimestamp < 1200) {
    return;
  }
  lastMessage = message;
  lastTimestamp = now;

  emit({
    id: `notif-${now}-${Math.random().toString(36).substring(2, 6)}`,
    message,
    severity,
    duration,
    title,
    open: true
  });
};

/**
 * Dismiss currently visible global notification
 */
export const hideNotification = () => {
  emit(null);
};

/**
 * Convenience helper methods
 */
export const notify = {
  success: (message, title = null, duration = 3200) =>
    showNotification({ message, severity: 'success', title, duration }),

  error: (message, title = null, duration = 4000) =>
    showNotification({ message, severity: 'error', title, duration }),

  warning: (message, title = null, duration = 3500) =>
    showNotification({ message, severity: 'warning', title, duration }),

  info: (message, title = null, duration = 3200) =>
    showNotification({ message, severity: 'info', title, duration }),

  close: hideNotification
};
