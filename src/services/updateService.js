import { appConfig } from '../config/appConfig';

/**
 * Compares two semantic version strings (e.g. "1.0.1" vs "1.0.0")
 * Returns:
 *   1 if v1 > v2 (newer)
 *  -1 if v1 < v2 (older)
 *   0 if equal
 */
export const compareVersions = (v1, v2) => {
  if (!v1 || !v2) return 0;
  const clean1 = String(v1).replace(/^v/i, '').trim();
  const clean2 = String(v2).replace(/^v/i, '').trim();

  const parts1 = clean1.split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = clean2.split('.').map((n) => parseInt(n, 10) || 0);

  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
};

// In-memory cache to prevent redundant network fetches
let cachedUpdateResult = null;
let lastCheckTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Checks for new updates directly from the app's own static version descriptor (/version.json)
 * and backend API (/api/version).
 *
 * NOTE: This completely avoids GitHub API rate limits (60 req/hr per IP) by querying
 * the app's own CDN / static assets, ensuring unlimited, lightning-fast requests for all farmers.
 */
export const checkForAppUpdate = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedUpdateResult && now - lastCheckTimestamp < CACHE_TTL_MS) {
    return cachedUpdateResult;
  }

  const currentVersion = appConfig.appVersion || '1.0.0';

  // Candidate app-hosted endpoints (Zero GitHub rate limits)
  const candidateUrls = [
    '/version.json',
    `${appConfig.host || ''}/version.json`,
    '/api/version',
    `${appConfig.host || ''}/api/version`
  ].filter(Boolean);

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-cache'
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (!data || !data.version) {
        continue;
      }

      const latestVersion = String(data.version).replace(/^v/i, '').trim();
      const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;
      const downloadUrl = data.apkDownloadUrl || appConfig.apkDownloadUrl;

      const result = {
        hasUpdate,
        currentVersion,
        latestVersion,
        downloadUrl,
        releaseName: data.releaseName || `किसान साथी v${latestVersion}`,
        releaseNotes: data.releaseNotes || 'नवीनतम कृषि फीचर्स व सुधार',
        updatedAt: data.updatedAt || new Date().toISOString(),
        error: false,
        message: hasUpdate
          ? `नया संस्करण v${latestVersion} उपलब्ध है!`
          : `आप पहले से ही नवीनतम संस्करण (v${currentVersion}) पर हैं।`
      };

      cachedUpdateResult = result;
      lastCheckTimestamp = now;
      return result;
    } catch (err) {
      // Continue to next local candidate without breaking UI
    }
  }

  // Graceful offline fallback
  const fallbackResult = {
    hasUpdate: false,
    currentVersion,
    latestVersion: currentVersion,
    downloadUrl: appConfig.apkDownloadUrl,
    error: false,
    message: `आप पहले से ही नवीनतम संस्करण (v${currentVersion}) पर हैं।`
  };

  return fallbackResult;
};
