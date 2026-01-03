import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { LanguageProvider } from '@/lib/language';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

import { useFonts, Kablammo_400Regular } from '@expo-google-fonts/kablammo';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { useState } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    Kablammo_400Regular,
  });
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    if ((loaded || error)) {
      // Hide the native splash screen as soon as fonts are loaded
      // We will show our Lottie view instead
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if ((!loaded && !error) || !animationFinished) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        {/* If fonts aren't loaded yet, show nothing or native splash. 
                 Once fonts are loaded (even if animation isn't finished), we show the animation. 
                 This check ensures LottieView renders only after we are mostly ready, 
                 or we can render it along with font loading.
                 Actually, simpler: just show Lottie until it finishes.
             */}
        <LottieView
          source={require('../assets/animations/walking_pothos.json')}
          autoPlay
          loop={false}
          style={{ width: 200, height: 200 }}
          onAnimationFinish={() => setAnimationFinished(true)}
        />
      </View>
    );
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
      <LanguageProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </LanguageProvider>
    </ThemeProvider>
  );
}
