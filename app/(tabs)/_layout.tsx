import { Tabs } from 'expo-router';
import { Leaf, History, Info } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { View, Platform } from 'react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';

export default function TabLayout() {
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    borderTopWidth: 0,
                    height: 85, // Taller to look distinct
                    backgroundColor: 'transparent', // Important for BlurView
                    paddingTop: 10,
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={80}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflow: 'hidden',
                            // Fallback for Android if native blur isn't enabled
                            backgroundColor: Platform.OS === 'android' ? (colorScheme === 'dark' ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)') : 'transparent',
                        }}
                        tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    >
                        {/* Extra overlay for that "liquid" glass sheen */}
                        <View style={{
                            flex: 1,
                            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'
                        }} />
                    </BlurView>
                ),
                tabBarLabelStyle: {
                    fontFamily: 'Kablammo_400Regular', // Use the fun font for labels too? Or maybe keep it clean. Let's keep it clean but maybe slightly bolder.
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 5,
                },
                tabBarItemStyle: {
                    // Add some spacing
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                            padding: 8,
                            borderRadius: 20,
                            width: 50,
                            height: 36 // oblong pill
                        }}>
                            <Leaf color={color} size={24} fill={focused ? color : 'transparent'} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                            padding: 8,
                            borderRadius: 20,
                            width: 50,
                            height: 36
                        }}>
                            <History color={color} size={24} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="about"
                options={{
                    title: 'About',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: focused ? (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent',
                            padding: 8,
                            borderRadius: 20,
                            width: 50,
                            height: 36
                        }}>
                            <Info color={color} size={24} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
