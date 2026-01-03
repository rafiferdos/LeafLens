import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Sprout, Plus, Leaf, Droplets, Sun, Calendar, MoreVertical, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { PlantForm, PlantFormData } from '@/components/garden/plant-form';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function GardenScreen() {
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const [plants, setPlants] = useState<PlantFormData[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadPlants();
            setAnimationKey(prev => prev + 1);
        }, [])
    );

    const loadPlants = async () => {
        try {
            const savedPlants = await AsyncStorage.getItem('my_garden');
            if (savedPlants) {
                setPlants(JSON.parse(savedPlants));
            }
        } catch (e) {
            console.error('Failed to load plants', e);
        }
    };

    const handleAddPlant = async (data: PlantFormData) => {
        try {
            const newPlants = [data, ...plants];
            setPlants(newPlants);
            await AsyncStorage.setItem('my_garden', JSON.stringify(newPlants));
            setShowAddDialog(false);
            Alert.alert('Success', 'Plant baby added to your garden! 🌱');
        } catch (e) {
            Alert.alert('Error', 'Failed to save plant');
        }
    };

    const handleDeletePlant = async (index: number) => {
        Alert.alert(
            'Remove Plant',
            'Are you sure you want to remove this plant from your garden?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        const newPlants = plants.filter((_, i) => i !== index);
                        setPlants(newPlants);
                        await AsyncStorage.setItem('my_garden', JSON.stringify(newPlants));
                    }
                }
            ]
        );
    };

    const renderPlantItem = ({ item, index }: { item: PlantFormData; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            className="bg-card mb-4 rounded-3xl overflow-hidden border border-border/50 shadow-sm"
        >
            <View className="flex-row">
                {/* Image Section */}
                <View className="w-32 h-32 bg-secondary">
                    {item.imageUri ? (
                        <Image source={{ uri: item.imageUri }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-primary/10">
                            <Leaf size={32} color={theme.colors.primary} />
                        </View>
                    )}
                </View>

                {/* Content Section */}
                <View className="flex-1 p-4 justify-between">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="font-bold text-lg text-foreground" numberOfLines={1}>{item.name}</Text>
                            <Text className="text-sm text-muted-foreground">{item.type || 'Plant'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeletePlant(index)} className="p-1">
                            <Trash2 size={16} color={theme.colors.destructive} opacity={0.5} />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-3 mt-2">
                        <View className="flex-row items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                            <Droplets size={12} color="#3b82f6" />
                            <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">{item.wateringFrequency}</Text>
                        </View>
                        <View className="flex-row items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
                            <Sun size={12} color="#f97316" />
                            <Text className="text-xs font-medium text-orange-600 dark:text-orange-400">{item.sunlight}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="flex-1">
                {/* Header */}
                <View className="px-6 pt-2 pb-4 flex-row justify-between items-end">
                    <View>
                        <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-3xl font-bold text-foreground">
                            My Garden
                        </Text>
                        <Text className="text-muted-foreground mt-1">
                            {plants.length} {plants.length === 1 ? 'Plant' : 'Plants'} growing
                        </Text>
                    </View>
                    <Button size="icon" className="w-12 h-12 rounded-full" onPress={() => setShowAddDialog(true)}>
                        <Plus size={24} color="white" />
                    </Button>
                </View>

                {/* Plant List */}
                <FlatList
                    key={animationKey}
                    data={plants}
                    renderItem={renderPlantItem}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                                <Sprout size={48} color={theme.colors.primary} />
                            </View>
                            <Text className="text-xl font-bold text-foreground text-center mb-2">
                                Your garden is empty
                            </Text>
                            <Text className="text-muted-foreground text-center mb-8 px-8">
                                Start your plant journey by adding a new green friend!
                            </Text>
                            <Button className="h-14 px-8 rounded-xl" onPress={() => setShowAddDialog(true)}>
                                <Plus size={20} color="white" className="mr-2" />
                                <Text className="text-white font-bold">Add Baby Plant</Text>
                            </Button>
                        </View>
                    }
                />

                {/* Add Plant Dialog */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent className="max-h-[90%] w-[90%] p-0 overflow-hidden bg-card border-border">
                        <DialogHeader className="px-6 pt-6 pb-2">
                            <DialogTitle className="text-2xl font-bold">Add New Plant</DialogTitle>
                        </DialogHeader>
                        <View className="flex-1 px-6 pb-6">
                            <PlantForm
                                onSubmit={handleAddPlant}
                                submitLabel="Add to Garden"
                            />
                        </View>
                    </DialogContent>
                </Dialog>
            </View>
        </SafeAreaView>
    );
}
