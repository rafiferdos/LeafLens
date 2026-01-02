import React, { useState, useCallback } from 'react';
import { View, Image, ScrollView, Linking, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Leaf, Heart, Moon, Sun, Monitor, Palette } from 'lucide-react-native';
import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const RafiImage = require('../../assets/images/rafi.jpg');
const MimImage = require('../../assets/images/mim.jpg');

export default function AboutScreen() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [animationKey, setAnimationKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setAnimationKey(prev => prev + 1);
        }, [])
    );
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                key={animationKey}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    className="items-center mt-4 mb-8"
                >
                    <View className="bg-primary/10 p-5 rounded-3xl mb-6 shadow-sm">
                        <Leaf size={48} color={theme.colors.primary} />
                    </View>
                    <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-4xl font-bold tracking-tight text-center mb-2">
                        LeafLens
                    </Text>
                    <Text className="text-muted-foreground text-center text-lg max-w-[280px]">
                        Nurturing nature with the power of vision.
                    </Text>
                </Animated.View>

                {/* Appearance Section */}
                <Animated.View
                    entering={FadeInUp.delay(100).duration(800).springify()}
                    className="mb-8"
                >
                    <View className="flex-row items-center gap-2 mb-4">
                        <Palette size={20} color={theme.colors.text} />
                        <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold text-foreground">Appearance</Text>
                    </View>

                    <View className="bg-card border border-border rounded-3xl p-2 flex-row shadow-sm">
                        {/* Light Option */}
                        <TouchableOpacity
                            onPress={() => setColorScheme('light')}
                            className={`flex-1 p-4 rounded-2xl items-center justify-center gap-2 ${colorScheme === 'light' ? 'bg-background shadow-sm border border-border/50' : ''}`}
                        >
                            <Sun size={24} color={colorScheme === 'light' ? theme.colors.primary : theme.colors.text} className={colorScheme !== 'light' ? 'opacity-50' : ''} />
                            <Text className={`font-medium ${colorScheme === 'light' ? 'text-foreground' : 'text-muted-foreground'}`}>Light</Text>
                        </TouchableOpacity>

                        {/* Dark Option */}
                        <TouchableOpacity
                            onPress={() => setColorScheme('dark')}
                            className={`flex-1 p-4 rounded-2xl items-center justify-center gap-2 ${colorScheme === 'dark' ? 'bg-secondary shadow-sm border border-border/50' : ''}`}
                        >
                            <Moon size={24} color={colorScheme === 'dark' ? theme.colors.primary : theme.colors.text} className={colorScheme !== 'dark' ? 'opacity-50' : ''} />
                            <Text className={`font-medium ${colorScheme === 'dark' ? 'text-foreground' : 'text-muted-foreground'}`}>Dark</Text>
                        </TouchableOpacity>

                        {/* System Option */}
                        <TouchableOpacity
                            onPress={() => setColorScheme('system')}
                            className={`flex-1 p-4 rounded-2xl items-center justify-center gap-2 ${!colorScheme ? 'bg-background shadow-sm border border-border/50' : ''}`}
                        >
                            <Monitor size={24} color={!colorScheme ? theme.colors.primary : theme.colors.text} className={colorScheme ? 'opacity-50' : ''} />
                            <Text className={`font-medium ${!colorScheme ? 'text-foreground' : 'text-muted-foreground'}`}>System</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Mission Section */}
                <Animated.View
                    entering={FadeInUp.delay(200).duration(800).springify()}
                    className="mb-10"
                >
                    <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold mb-3 text-foreground">Our Mission</Text>
                    <Text className="text-muted-foreground leading-7 text-lg">
                        We believe that every plant deserves to thrive. LeafLens empowers you to understand your green companions better, bringing expert botanical knowledge to your fingertips instantly.
                    </Text>
                </Animated.View>

                {/* The Team Section */}
                <Animated.View
                    entering={FadeInUp.delay(400).duration(800).springify()}
                    className="mb-8"
                >
                    <View className="mb-6 flex-row items-center">
                        <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold text-foreground">Built with </Text>
                        <Heart size={20} color={isDark ? '#f472b6' : '#ec4899'} fill={isDark ? '#f472b6' : '#ec4899'} className="mx-1" />
                        <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold text-foreground"> by</Text>
                    </View>

                    <View className="gap-6">
                        {/* Rafi's Card */}
                        <View className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm flex-row items-center gap-4">
                            <Image
                                source={RafiImage}
                                className="w-20 h-20 rounded-2xl bg-muted"
                                resizeMode="cover"
                            />
                            <View className="flex-1">
                                <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold mb-1">Rafi Ferdos</Text>
                                <Text className="text-muted-foreground mb-2">Creator & Engineer</Text>
                                <TouchableOpacity onPress={() => Linking.openURL('https://rafiferdos.vercel.app')}>
                                    <Text className="text-primary font-medium">Visit Website &rarr;</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Mim's Card */}
                        <View className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm flex-row items-center gap-4">
                            <Image
                                source={MimImage}
                                className="w-20 h-20 rounded-2xl bg-muted"
                                resizeMode="cover"
                            />
                            <View className="flex-1">
                                <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold mb-1">Siam Akter Mim</Text>
                                <Text className="text-muted-foreground mb-2">Researcher & Partner</Text>
                                <Text className="text-xs text-muted-foreground/80 italic">Making things beautiful</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View
                    entering={FadeIn.delay(600).duration(1000)}
                    className="items-center mt-4"
                >
                    <Text className="text-sm text-muted-foreground/60">
                        Version 1.0.0 (Native)
                    </Text>
                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    );
}
