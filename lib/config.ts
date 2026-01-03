/**
 * Application Configuration for LeafLens Native App
 * 
 * This centralizes all environment-based configuration.
 * Update API_URL to your deployed backend for production builds.
 */

import { Platform } from 'react-native';

// Backend API Configuration
// For local development:
//   - Android Emulator: http://10.0.2.2:8000
//   - iOS Simulator: http://localhost:8000
//   - Physical Device: Use your computer's IP (e.g., http://192.168.1.5:8000)
// For production: Use your deployed backend URL

const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

// ⚠️ FOR PHYSICAL DEVICE TESTING:
// 1. Make sure your phone and computer are on the SAME WiFi network
// 2. Update this IP to your computer's local IP address
// 3. Run: ipconfig (Windows) or ifconfig (Mac/Linux) to find it
const PHYSICAL_DEVICE_URL = 'http://10.10.10.93:8000';

// Set this to your production backend URL when building release APK
const PROD_API_URL = PHYSICAL_DEVICE_URL; // Using local network for now

export const config = {
    // API URL - uses production URL in release builds
    apiUrl: __DEV__ ? DEV_API_URL : PROD_API_URL,

    // App metadata
    appName: "LeafLens",
    appVersion: "1.0.0",

    // Feature flags
    enableAnalytics: !__DEV__,
} as const;

export type Config = typeof config;
