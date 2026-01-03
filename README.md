<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
</p>

<h1 align="center">🌿 LeafLens Mobile</h1>

<p align="center">
  <strong>AI-Powered Plant Disease Detection for Android & iOS</strong>
</p>

<p align="center">
  <a href="https://github.com/rafiferdos/LeafLens/releases/latest">
    <img src="https://img.shields.io/github/v/release/rafiferdos/LeafLens?style=flat-square&color=green" alt="Latest Release"/>
  </a>
  <a href="https://github.com/rafiferdos/LeafLens/releases/latest">
    <img src="https://img.shields.io/badge/Download-APK-brightgreen?style=flat-square" alt="Download APK"/>
  </a>
</p>

---

## 📱 Overview

LeafLens Mobile is a cross-platform mobile application that uses computer vision and deep learning to identify plant diseases instantly. Simply take a photo of a plant leaf, and get detailed diagnosis with treatment recommendations.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔬 **AI Diagnosis** | ConvNeXt V2 model with 95%+ accuracy |
| 📸 **Camera Integration** | Capture photos directly or upload from gallery |
| 📊 **Confidence Scores** | View prediction probabilities for all detected diseases |
| 💊 **Treatment Guide** | Detailed remediation steps for each disease |
| 📜 **History** | Track all your past scans locally |
| 🌙 **Dark Mode** | Beautiful UI with light/dark theme support |
| 🌍 **Multi-language** | English and Bengali support |

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 52) + React Native
- **Styling**: [NativeWind](https://nativewind.dev/) (Tailwind CSS for RN)
- **Navigation**: [Expo Router](https://expo.dev/router) (File-based routing)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **UI Components**: [React Native Reusables](https://reactnativereusables.com)
- **State**: React Context + AsyncStorage
- **Icons**: [Lucide React Native](https://lucide.dev/)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
# Clone the repository
git clone https://github.com/rafiferdos/LeafLens.git
cd LeafLens/LeafLens-native

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Running the App

```bash
# Android Emulator
pnpm android

# iOS Simulator (macOS only)
pnpm ios

# Expo Go (scan QR code)
pnpm start
```

---

## 📦 Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Using EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

---

## 🔧 Configuration

### API Configuration

Update `lib/config.ts` to configure the backend API:

```typescript
// For local development
const DEV_API_URL = 'http://10.0.2.2:8000';  // Android Emulator

// For physical device testing
const PHYSICAL_DEVICE_URL = 'http://YOUR_LOCAL_IP:8000';

// For production
const PROD_API_URL = 'https://your-backend.com';
```

### Physical Device Testing

1. Ensure your phone and computer are on the **same WiFi network**
2. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Update `PHYSICAL_DEVICE_URL` in `lib/config.ts`
4. Rebuild the app

---

## 📁 Project Structure

```
LeafLens-native/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home - Scanner
│   │   ├── history.tsx    # Scan history
│   │   └── settings.tsx   # App settings
│   └── _layout.tsx        # Root layout
├── components/
│   └── ui/                # Reusable UI components
├── lib/
│   ├── config.ts          # App configuration
│   ├── disease-data.ts    # Disease information database
│   ├── language.ts        # i18n translations
│   └── theme.ts           # Theme configuration
├── assets/                # Images, fonts, animations
└── android/               # Native Android project
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 👨‍💻 Author

**Rafi Ferdos**  
Daffodil International University

<p align="center">
  <a href="https://github.com/rafiferdos">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
</p>

---

<p align="center">Made with ❤️ for sustainable agriculture</p>
