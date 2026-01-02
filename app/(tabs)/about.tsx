import React from 'react';
import { View, Image, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Leaf, Heart } from 'lucide-react-native';
import { NAV_THEME, THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';

const RafiImage = require('../../assets/images/rafi.jpg');
const MimImage = require('../../assets/images/mim.jpg');

export default function AboutScreen() {
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View className="items-center mt-8 mb-12">
                    <View className="bg-primary/10 p-5 rounded-3xl mb-6 shadow-sm">
                        <Leaf size={48} color={theme.colors.primary} />
                    </View>
                    <Text className="text-4xl font-bold tracking-tight text-center mb-2">
                        LeafLens
                    </Text>
                    <Text className="text-muted-foreground text-center text-lg max-w-[280px]">
                        Nurturing nature with the power of vision.
                    </Text>
                </View>

                {/* Mission Section */}
                <View className="mb-12">
                    <Text className="text-xl font-semibold mb-3">Our Mission</Text>
                    <Text className="text-muted-foreground leading-7 text-lg">
                        We believe that every plant deserves to thrive. LeafLens empowers you to understand your green companions better, bringing expert botanical knowledge to your fingertips instantly.
                    </Text>
                </View>

                {/* The Team Section */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold mb-6 flex-row items-center">
                        Built with <Heart size={20} color={isDark ? '#f472b6' : '#ec4899'} fill={isDark ? '#f472b6' : '#ec4899'} /> by
                    </Text>

                    <View className="gap-6">
                        {/* Rafi's Card */}
                        <View className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm flex-row items-center gap-4">
                            <Image
                                source={RafiImage}
                                className="w-20 h-20 rounded-2xl bg-muted"
                                resizeMode="cover"
                            />
                            <View className="flex-1">
                                <Text className="text-xl font-bold mb-1">Rafi Ferdos</Text>
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
                                <Text className="text-xl font-bold mb-1">Siam Akter Mim</Text>
                                <Text className="text-muted-foreground mb-2">Researcher & Partner</Text>
                                <Text className="text-xs text-muted-foreground/80 italic">Making things beautiful</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="items-center mt-4">
                    <Text className="text-sm text-muted-foreground/60">
                        Version 1.0.0 (Native)
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
