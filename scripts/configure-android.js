#!/usr/bin/env node
/**
 * Kisan Saathi Android Configuration Script (Node.js)
 * Automatically configures 3D app launcher icons, native module permissions,
 * and clears duplicate AAPT2 resources before Gradle compiles the APK.
 */

import fs from 'fs';
import path from 'path';

function setupIcons() {
  const rootDir = process.cwd();
  const iconSrc = path.join(rootDir, 'public', 'icons', 'kisan-icon-512.png');
  const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

  if (!fs.existsSync(iconSrc)) {
    console.warn(`[Icon] Source icon not found at: ${iconSrc}`);
    return;
  }

  if (!fs.existsSync(resDir)) {
    console.warn(`[Icon] Android res directory not found at: ${resDir}`);
    return;
  }

  const entries = fs.readdirSync(resDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('mipmap-')) {
      const dirPath = path.join(resDir, entry.name);

      // STRICT CHECK: Skip all anydpi folders to avoid AAPT2 duplicate resource errors with XML files
      if (entry.name.includes('anydpi')) {
        const filesInAnydpi = fs.readdirSync(dirPath);
        for (const file of filesInAnydpi) {
          if (file.endsWith('.png')) {
            const pngPath = path.join(dirPath, file);
            try {
              fs.unlinkSync(pngPath);
              console.log(`[Icon] Removed duplicate PNG from anydpi folder: ${file}`);
            } catch (err) {
              console.warn(`[Icon] Could not remove ${pngPath}: ${err.message}`);
            }
          }
        }
        continue;
      }

      // Standard DPI folders (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
      const targetFiles = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];
      for (const targetName of targetFiles) {
        const targetPath = path.join(dirPath, targetName);
        try {
          fs.copyFileSync(iconSrc, targetPath);
          console.log(`[Icon] Copied 3D icon to: ${entry.name}/${targetName}`);
        } catch (err) {
          console.warn(`[Icon] Failed to copy to ${targetPath}: ${err.message}`);
        }
      }
    }
  }

  console.log('[Icon] ✅ 3D Launcher icons configured successfully across all DPI directories.');
}

function setupManifestPermissions() {
  const rootDir = process.cwd();
  const manifestPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

  if (!fs.existsSync(manifestPath)) {
    console.warn(`[Manifest] Manifest file not found at: ${manifestPath}`);
    return;
  }

  let content = fs.readFileSync(manifestPath, 'utf8');

  const permissions = `
    <!-- Kisan Saathi Agricultural Modules Hardware & System Permissions -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.bluetooth_le" android:required="false" />
`;

  if (!content.includes('android.permission.CAMERA')) {
    content = content.replace('</manifest>', `${permissions}\n</manifest>`);
    console.log('[Manifest] Added Camera, Location, Vibration, and Storage permissions.');
  }

  if (!content.includes('android:usesCleartextTraffic')) {
    content = content.replace('<application', '<application android:usesCleartextTraffic="true"');
    console.log('[Manifest] Enabled usesCleartextTraffic in application element.');
  }

  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log('[Manifest] ✅ AndroidManifest.xml configured successfully for native hardware modules.');
}

setupIcons();
setupManifestPermissions();
