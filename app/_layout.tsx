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
import { useEffect, useMemo, useState } from 'react';

import LottieView from 'lottie-react-native';
import { View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    Kablammo_400Regular,
  });
  const [animationFinished, setAnimationFinished] = useState(false);

  // Memoize the theme value to prevent unnecessary re-renders and context loss
  const themeValue = useMemo(() => {
    return NAV_THEME[colorScheme ?? 'light'];
  }, [colorScheme]);

  useEffect(() => {
    if ((loaded || error)) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // IMPORTANT: Always wrap in ThemeProvider, even during loading
  // This prevents "Couldn't find navigation context" errors
  const isLoading = (!loaded && !error) || !animationFinished;

  return (
    <ThemeProvider value={themeValue}>
      <LanguageProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        {isLoading ? (
          <View className="flex-1 items-center justify-center bg-background">
            <LottieView
              source={require('../assets/animations/walking_pothos.json')}
              autoPlay
              loop={false}
              style={{ width: 200, height: 200 }}
              onAnimationFinish={() => setAnimationFinished(true)}
            />
          </View>
        ) : (
          <>
            <Stack screenOptions={{ headerShown: false }} />
            <PortalHost />
          </>
        )}
      </LanguageProvider>
    </ThemeProvider>
  );
}
