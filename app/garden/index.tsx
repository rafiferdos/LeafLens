import { View, Image, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ArrowLeft, Plus, Sprout, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GardenPlant {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
}

export default function MyGardenScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const [plants, setPlants] = useState<GardenPlant[]>([]);
    const [animationKey, setAnimationKey] = useState(0);

    const loadGarden = async () => {
        try {
            const data = await AsyncStorage.getItem('myGarden');
            if (data) {
                setPlants(JSON.parse(data));
            }
        } catch (e) {
            console.error("Failed to load garden", e);
        }
    };

    const addPlant = async () => {
        // In a full app, this would open a form. 
        // For this prototype, we'll add a default plant to demonstrate storage.
        const newPlant: GardenPlant = {
            id: Date.now().toString(),
            name: `My Plant ${plants.length + 1}`,
            type: 'Indoor Plant',
            dateAdded: new Date().toISOString()
        };

        const updatedPlants = [newPlant, ...plants];
        setPlants(updatedPlants);
        await AsyncStorage.setItem('myGarden', JSON.stringify(updatedPlants));
    };

    const deletePlant = async (id: string) => {
        const updatedPlants = plants.filter(p => p.id !== id);
        setPlants(updatedPlants);
        await AsyncStorage.setItem('myGarden', JSON.stringify(updatedPlants));
    };

    useFocusEffect(
        useCallback(() => {
            loadGarden();
            setAnimationKey(prev => prev + 1);
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-border/50">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-secondary/50 items-center justify-center"
                >
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold">My Garden</Text>
                <TouchableOpacity
                    onPress={addPlant}
                    className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20"
                >
                    <Plus size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {plants.length === 0 ? (
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                    <Animated.View
                        entering={FadeInDown.springify()}
                        className="items-center justify-center gap-6"
                    >
                        <View className="w-40 h-40 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center mb-4 relative overflow-hidden">
                            <View className="absolute bottom-0 w-full h-1/2 bg-green-200/50 dark:bg-green-800/30" />
                            <Sprout size={80} color={theme.colors.primary} />
                        </View>

                        <Text className="text-2xl font-bold text-center">
                            Your Garden is Empty
                        </Text>

                        <Text className="text-muted-foreground text-center text-base leading-6">
                            This is where your plants live. {'\n'}
                            Add your plant babies here to track their health journey, save diagnosis history, and get care reminders.
                        </Text>

                        <TouchableOpacity
                            onPress={addPlant}
                            className="bg-primary px-8 py-4 rounded-full shadow-lg shadow-primary/30 mt-4 flex-row items-center gap-2"
                            activeOpacity={0.9}
                        >
                            <Plus size={20} color="white" />
                            <Text className="text-white font-bold text-lg">Add Your First Plant</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            ) : (
                <FlatList
                    key={animationKey}
                    data={plants}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24 }}
                    renderItem={({ item, index }) => (
                        <Animated.View
                            entering={FadeInDown.delay(index * 100).springify()}
                            className="bg-card mb-4 rounded-2xl p-4 border border-border shadow-sm flex-row items-center gap-4"
                        >
                            <View className="w-16 h-16 rounded-xl bg-green-100 dark:bg-green-900/20 items-center justify-center">
                                <Sprout size={32} color={theme.colors.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-lg">{item.name}</Text>
                                <Text className="text-muted-foreground text-xs">{item.type}</Text>
                                <Text className="text-muted-foreground text-[10px] mt-1">Added {new Date(item.dateAdded).toLocaleDateString()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => deletePlant(item.id)}
                                className="p-2 bg-destructive/10 rounded-full"
                            >
                                <Trash2 size={18} color={theme.colors.notification} />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
