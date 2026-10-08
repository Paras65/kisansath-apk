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

  const permissionsAndQueries = `
    <!-- Kisan Saathi Agricultural Modules Hardware & System Permissions -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    <uses-feature android:name="android.hardware.microphone" android:required="false" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.bluetooth_le" android:required="false" />

    <!-- Android 11+ Package Visibility Queries for Dial, SMS, WhatsApp, and Speech Recognition -->
    <queries>
        <intent>
            <action android:name="android.intent.action.DIAL" />
            <data android:scheme="tel" />
        </intent>
        <intent>
            <action android:name="android.intent.action.SENDTO" />
            <data android:scheme="smsto" />
        </intent>
        <intent>
            <action android:name="android.intent.action.SENDTO" />
            <data android:scheme="sms" />
        </intent>
        <intent>
            <action android:name="android.speech.RecognitionService" />
        </intent>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
    </queries>
`;

  if (!content.includes('android.permission.RECORD_AUDIO')) {
    content = content.replace('</manifest>', `${permissionsAndQueries}\n</manifest>`);
    console.log('[Manifest] Added Mic, Location, Camera, Bluetooth, and Speech queries to AndroidManifest.xml.');
  }

  if (!content.includes('android:usesCleartextTraffic')) {
    content = content.replace('<application', '<application android:usesCleartextTraffic="true"');
    console.log('[Manifest] Enabled usesCleartextTraffic in application element.');
  }

  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log('[Manifest] ✅ AndroidManifest.xml configured successfully for native hardware modules.');
}

function setupNativeTTSAndMediaSettings() {
  const rootDir = process.cwd();
  const mainActivityPath = path.join(
    rootDir,
    'android',
    'app',
    'src',
    'main',
    'java',
    'in',
    'co',
    'init65',
    'kisan',
    'MainActivity.java'
  );

  if (!fs.existsSync(mainActivityPath)) {
    console.warn(`[MainActivity] MainActivity not found at: ${mainActivityPath}`);
    return;
  }

  const code = `package in.co.init65.kisan;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.getcapacitor.BridgeActivity;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private TextToSpeech tts;
    private boolean isTtsReady = false;
    private String pendingSpeechText = null;
    private SpeechRecognizer speechRecognizer = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Auto-request runtime hardware permissions on Android 6+ (API 23+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String[] requiredPerms = new String[] {
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.RECORD_AUDIO
            };
            boolean needsPrompt = false;
            for (String p : requiredPerms) {
                if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                    needsPrompt = true;
                    break;
                }
            }
            if (needsPrompt) {
                requestPermissions(requiredPerms, 1001);
            }
        }

        // Initialize Native Android Hardware Text-to-Speech Engine
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS && tts != null) {
                int res = tts.setLanguage(new Locale("hi", "IN"));
                if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts.setLanguage(Locale.getDefault());
                }
                isTtsReady = true;
                if (pendingSpeechText != null) {
                    tts.speak(pendingSpeechText, TextToSpeech.QUEUE_FLUSH, null, "kisan_tts_init");
                    pendingSpeechText = null;
                }
            }
        });

        // Configure WebView media settings & native bridges
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
            webView.getSettings().setGeolocationEnabled(true);
            webView.getSettings().setDatabaseEnabled(true);
            webView.getSettings().setDomStorageEnabled(true);

            webView.addJavascriptInterface(new AndroidTTSBridge(), "AndroidTTS");
            webView.addJavascriptInterface(new AndroidDeviceBridge(), "AndroidBridge");
            webView.addJavascriptInterface(new AndroidSpeechBridge(), "AndroidSpeech");
        }
    }

    private void sendJsEvent(String jsCode) {
        runOnUiThread(() -> {
            try {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    webView.evaluateJavascript(jsCode, null);
                }
            } catch (Exception ignored) {}
        });
    }

    public class AndroidTTSBridge {
        @JavascriptInterface
        public void speak(String text) {
            if (text == null || text.trim().isEmpty()) return;
            if (isTtsReady && tts != null) {
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kisan_tts_" + System.currentTimeMillis());
            } else {
                pendingSpeechText = text;
            }
        }

        @JavascriptInterface
        public void stop() {
            pendingSpeechText = null;
            if (tts != null) {
                tts.stop();
            }
        }

        @JavascriptInterface
        public boolean isAvailable() {
            return tts != null;
        }
    }

    public class AndroidSpeechBridge {
        @JavascriptInterface
        public boolean isAvailable() {
            return SpeechRecognizer.isRecognitionAvailable(MainActivity.this);
        }

        @JavascriptInterface
        public void startListening() {
            runOnUiThread(() -> {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 2001);
                            sendJsEvent("window._kisanOnNativeSpeechError && window._kisanOnNativeSpeechError('permission_needed')");
                            return;
                        }
                    }

                    if (speechRecognizer != null) {
                        try {
                            speechRecognizer.destroy();
                        } catch (Exception ignored) {}
                        speechRecognizer = null;
                    }

                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(MainActivity.this);
                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN");
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "hi-IN");
                    intent.putExtra("android.speech.extra.EXTRA_ADDITIONAL_LANGUAGES", new String[]{"hi-IN", "en-IN"});
                    intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                    intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);

                    speechRecognizer.setRecognitionListener(new RecognitionListener() {
                        @Override
                        public void onReadyForSpeech(Bundle params) {
                            sendJsEvent("window._kisanOnNativeSpeechState && window._kisanOnNativeSpeechState('ready')");
                        }
                        @Override
                        public void onBeginningOfSpeech() {
                            sendJsEvent("window._kisanOnNativeSpeechState && window._kisanOnNativeSpeechState('beginning')");
                        }
                        @Override
                        public void onRmsChanged(float rmsdB) {}
                        @Override
                        public void onBufferReceived(byte[] buffer) {}
                        @Override
                        public void onEndOfSpeech() {
                            sendJsEvent("window._kisanOnNativeSpeechState && window._kisanOnNativeSpeechState('end')");
                        }
                        @Override
                        public void onError(int error) {
                            sendJsEvent("window._kisanOnNativeSpeechError && window._kisanOnNativeSpeechError(" + error + ")");
                        }
                        @Override
                        public void onResults(Bundle results) {
                            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                String top = matches.get(0).replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", " ");
                                sendJsEvent("window._kisanOnNativeSpeechResult && window._kisanOnNativeSpeechResult(\\\"" + top + "\\\")");
                            } else {
                                sendJsEvent("window._kisanOnNativeSpeechError && window._kisanOnNativeSpeechError(7)");
                            }
                        }
                        @Override
                        public void onPartialResults(Bundle partialResults) {
                            ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if (matches != null && !matches.isEmpty()) {
                                String part = matches.get(0).replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"").replace("\\n", " ");
                                sendJsEvent("window._kisanOnNativeSpeechPartial && window._kisanOnNativeSpeechPartial(\\\"" + part + "\\\")");
                            }
                        }
                        @Override
                        public void onEvent(int eventType, Bundle params) {}
                    });

                    speechRecognizer.startListening(intent);
                } catch (Exception e) {
                    e.printStackTrace();
                    sendJsEvent("window._kisanOnNativeSpeechError && window._kisanOnNativeSpeechError(-1)");
                }
            });
        }

        @JavascriptInterface
        public void stopListening() {
            runOnUiThread(() -> {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer.stopListening();
                    } catch (Exception ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void cancel() {
            runOnUiThread(() -> {
                if (speechRecognizer != null) {
                    try {
                        speechRecognizer.cancel();
                    } catch (Exception ignored) {}
                }
            });
        }
    }

    public class AndroidDeviceBridge {
        @JavascriptInterface
        public boolean isNative() {
            return true;
        }

        @JavascriptInterface
        public String getNativeLocation() {
            try {
                LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
                if (lm == null) return null;
                Location best = null;
                List<String> providers = lm.getProviders(true);
                for (String provider : providers) {
                    try {
                        Location l = lm.getLastKnownLocation(provider);
                        if (l == null) continue;
                        if (best == null || l.getAccuracy() < best.getAccuracy()) {
                            best = l;
                        }
                    } catch (SecurityException ignored) {}
                }
                if (best != null) {
                    return "{\\\"lat\\\":" + best.getLatitude() + ",\\\"lon\\\":" + best.getLongitude() + ",\\\"accuracy\\\":" + best.getAccuracy() + "}";
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }

        @JavascriptInterface
        public void requestLocationPermission() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    requestPermissions(new String[]{
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    }, 1002);
                }
            });
        }

        @JavascriptInterface
        public void requestMicPermission() {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    requestPermissions(new String[]{
                        Manifest.permission.RECORD_AUDIO
                    }, 1003);
                }
            });
        }

        @JavascriptInterface
        public void openDialer(String phone) {
            if (phone == null || phone.trim().isEmpty()) return;
            try {
                String clean = phone.replaceAll("[^0-9+]", "");
                Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + clean));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void openSms(String phone, String body) {
            try {
                String clean = phone != null ? phone.replaceAll("[^0-9+]", "") : "";
                Uri uri = Uri.parse("smsto:" + clean);
                Intent intent = new Intent(Intent.ACTION_SENDTO, uri);
                if (body != null) {
                    intent.putExtra("sms_body", body);
                    intent.putExtra(Intent.EXTRA_TEXT, body);
                    intent.putExtra("android.intent.extra.TEXT", body);
                }
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                try {
                    String clean = phone != null ? phone.replaceAll("[^0-9+]", "") : "";
                    String encoded = body != null ? URLEncoder.encode(body, "UTF-8") : "";
                    Intent fallback = new Intent(Intent.ACTION_VIEW, Uri.parse("sms:" + clean + "?body=" + encoded));
                    fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(fallback);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        }

        @JavascriptInterface
        public void openWhatsApp(String phone, String message) {
            try {
                String clean = phone != null ? phone.replaceAll("[^0-9]", "") : "";
                String encoded = message != null ? URLEncoder.encode(message, "UTF-8") : "";
                String url = "https://api.whatsapp.com/send?phone=" + clean + "&text=" + encoded;
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                intent.setPackage("com.whatsapp");
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            } catch (Exception e) {
                try {
                    String clean = phone != null ? phone.replaceAll("[^0-9]", "") : "";
                    String encoded = message != null ? URLEncoder.encode(message, "UTF-8") : "";
                    Intent fallback = new Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/" + clean + "?text=" + encoded));
                    fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(fallback);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        }

        @JavascriptInterface
        public void shareText(String title, String text) {
            try {
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_SUBJECT, title != null ? title : "किसान साथी");
                intent.putExtra(Intent.EXTRA_TEXT, text != null ? text : "");
                Intent chooser = Intent.createChooser(intent, title != null ? title : "शेयर करें");
                chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(chooser);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void vibrate(long ms) {
            try {
                Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        v.vibrate(VibrationEffect.createOneShot(ms > 0 ? ms : 100, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        v.vibrate(ms > 0 ? ms : 100);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void setKeepScreenOn(boolean keepOn) {
            runOnUiThread(() -> {
                if (keepOn) {
                    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                } else {
                    getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        @JavascriptInterface
        public void printDocument(String title, String htmlContent) {
            runOnUiThread(() -> {
                try {
                    PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                    if (printManager != null) {
                        WebView printWebView = new WebView(MainActivity.this);
                        printWebView.setWebViewClient(new WebViewClient() {
                            @Override
                            public void onPageFinished(WebView view, String url) {
                                PrintDocumentAdapter adapter = printWebView.createPrintDocumentAdapter(title != null ? title : "Kisan_Report");
                                printManager.print(title != null ? title : "Kisan_Report", adapter, new PrintAttributes.Builder().build());
                            }
                        });
                        printWebView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });
        }
    }

    @Override
    public void onDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }
        super.onDestroy();
    }
}
`;

  fs.writeFileSync(mainActivityPath, code, 'utf8');
  console.log('[MainActivity] ✅ Native Android TTS, SpeechRecognizer, Hardware GPS Location, Dialer, SMS, & MediaPlayback enabled in MainActivity.java.');
}

setupIcons();
setupManifestPermissions();
setupNativeTTSAndMediaSettings();

