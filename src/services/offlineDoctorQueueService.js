// किसान साथी - Offline Crop Doctor Scan Queue & Auto-Sync Engine
// Allows farmers with zero internet in the field to queue leaf photos.
// Automatically evaluates via Gemini Vision when 4G/Wi-Fi connectivity is restored.

const STORAGE_KEY = 'kisan_offline_scans';
const MAX_PENDING_SCANS = 3; // Bounded collection limit to prevent device storage bloat

/**
 * Get all queued offline scans
 */
export const getOfflineScans = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('[OfflineDoctorQueue] Error reading storage:', e);
    return [];
  }
};

/**
 * Queue a new plant scan photo taken offline in the field
 */
export const saveOfflineScan = ({ imageBase64, cropId = 'paddy', district = 'रायपुर' }) => {
  try {
    const existing = getOfflineScans();

    // Evict oldest if queue exceeds maximum limit
    const trimmed = existing.slice(-(MAX_PENDING_SCANS - 1));

    const newScan = {
      id: `offline-${Date.now()}`,
      imageBase64,
      cropId,
      district,
      createdAt: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending' // 'pending' | 'syncing' | 'completed'
    };

    const updated = [...trimmed, newScan];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newScan;
  } catch (e) {
    console.error('[OfflineDoctorQueue] Error saving offline scan:', e);
    return null;
  }
};

/**
 * Remove a specific queued scan
 */
export const removeOfflineScan = (id) => {
  try {
    const existing = getOfflineScans();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('[OfflineDoctorQueue] Error removing scan:', e);
    return [];
  }
};

/**
 * Clear all queued offline scans
 */
export const clearOfflineScans = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
};
