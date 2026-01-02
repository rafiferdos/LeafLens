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
                tabBarShowLabel: false, // Just icons
                tabBarActiveTintColor: theme.colors.primary,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20, // Floating effect
                    left: 20,
                    right: 20,
                    elevation: 0,
                    borderTopWidth: 0,
                    height: 60, // Compact height
                    backgroundColor: 'transparent',
                    borderRadius: 35, // Fully rounded for liquid/pill look
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    paddingBottom: 0, // Ensure no safe area padding pushes icons up
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={20} // Less blur as requested
                        style={{
                            flex: 1,
                            overflow: 'hidden',
                            borderRadius: 35, // Match tab bar
                            backgroundColor: 'transparent',
                        }}
                        tint={colorScheme === 'dark' ? 'systemThinMaterialDark' : 'systemThinMaterialLight'} // Thin material for glass effect
                        experimentalBlurMethod='dimezisBlurView'
                    >
                        {/* Liquid Glass Sheen */}
                        <View style={{
                            flex: 1,
                            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)', // Slightly milky
                            borderColor: 'rgba(255,255,255,0.2)',
                            borderWidth: 1,
                            borderRadius: 35,
                        }} />
                    </BlurView>
                ),
                tabBarItemStyle: {
                    height: 60, // Match bar height
                    padding: 0, // Remove padding
                    margin: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
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
