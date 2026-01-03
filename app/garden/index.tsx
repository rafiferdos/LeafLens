import { View, Image, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ArrowLeft, Plus, Sprout, Trash2, Shield, Droplets, Sun, Info, MapPin } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME, THEME } from '@/lib/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlantForm, PlantFormData } from '@/components/garden/plant-form';

interface GardenPlant {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
    imageUri?: string;
    wateringFrequency?: string;
    sunlight?: string;
    difficulty?: string;
    petSafe?: boolean;
    location?: string;
    notes?: string;
    soilType?: string;
    potSize?: string;
}

export default function MyGardenScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const colors = THEME[colorScheme ?? 'light'];
    const [plants, setPlants] = useState<GardenPlant[]>([]);
    const [animationKey, setAnimationKey] = useState(0);
    const [plantToDelete, setPlantToDelete] = useState<string | null>(null);

    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPlantId, setEditingPlantId] = useState<string | null>(null);


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



    const resetForm = () => {
        setEditingPlantId(null);
        setIsModalVisible(false);
    };

    const handleEditPlant = (plant: GardenPlant) => {
        setEditingPlantId(plant.id);
        setIsModalVisible(true);
    };

    const handleSavePlant = async (data: PlantFormData) => {
        if (!data.name.trim()) {
            Alert.alert("Name Required", "Please give your plant a name!");
            return;
        }

        let updatedPlants: GardenPlant[];

        if (editingPlantId) {
            updatedPlants = plants.map(p => p.id === editingPlantId ? {
                ...p,
                ...data,
                imageUri: data.imageUri || undefined,
            } : p);
        } else {
            const newPlant: GardenPlant = {
                id: Date.now().toString(),
                dateAdded: new Date().toISOString(),
                ...data,
                imageUri: data.imageUri || undefined,
            };
            updatedPlants = [newPlant, ...plants];
        }

        setPlants(updatedPlants);
        await AsyncStorage.setItem('myGarden', JSON.stringify(updatedPlants));
        resetForm();
    };

    const confirmDeletePlant = async () => {
        if (!plantToDelete) return;
        const updatedPlants = plants.filter(p => p.id !== plantToDelete);
        setPlants(updatedPlants);
        await AsyncStorage.setItem('myGarden', JSON.stringify(updatedPlants));
        setPlantToDelete(null);
    };

    const deletePlant = (id: string) => {
        setPlantToDelete(id);
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
                    onPress={() => {
                        resetForm();
                        setIsModalVisible(true);
                    }}
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
                            onPress={() => {
                                resetForm();
                                setIsModalVisible(true);
                            }}
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
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    renderItem={({ item, index }) => (
                        <Animated.View
                            entering={FadeInDown.delay(index * 100).springify()}
                            className="bg-card mb-4 rounded-[20px] shadow-sm overflow-hidden border border-border"
                        >
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => handleEditPlant(item)}
                                className="flex-row gap-3 p-2.5"
                            >
                                <View className="w-24 h-32 rounded-2xl bg-muted items-center justify-center overflow-hidden border border-border/50 shadow-sm relative">
                                    {item.imageUri ? (
                                        <Image source={{ uri: item.imageUri }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <View className="w-full h-full bg-green-50 dark:bg-green-900/10 items-center justify-center">
                                            <Sprout size={40} color={colors.primary} />
                                        </View>
                                    )}
                                    {item.petSafe && (
                                        <View className="absolute top-2 left-2 bg-green-500/90 w-6 h-6 rounded-full items-center justify-center shadow-sm">
                                            <Shield size={12} color="white" />
                                        </View>
                                    )}
                                </View>

                                <View className="flex-1 py-0.5 justify-between h-32">
                                    <View>
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1 mr-2">
                                                <Text className="font-bold text-lg leading-tight text-foreground" numberOfLines={1}>{item.name}</Text>
                                                <Text className="text-primary font-bold text-[10px] uppercase tracking-wider">{item.type}</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => deletePlant(item.id)}
                                                className="w-7 h-7 bg-destructive/5 rounded-full items-center justify-center -mt-1 -mr-1"
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Trash2 size={14} color={colors.destructive} />
                                            </TouchableOpacity>
                                        </View>

                                        <View className="flex-row flex-wrap gap-1.5 mt-2">
                                            {item.wateringFrequency && (
                                                <View className="flex-row items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/30">
                                                    <Droplets size={10} color="#3b82f6" />
                                                    <Text className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{item.wateringFrequency}</Text>
                                                </View>
                                            )}
                                            {item.sunlight && (
                                                <View className="flex-row items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md border border-orange-100 dark:border-orange-900/30">
                                                    <Sun size={10} color="#f97316" />
                                                    <Text className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">{item.sunlight}</Text>
                                                </View>
                                            )}
                                            {item.location && (
                                                <View className="flex-row items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded-md border border-purple-100 dark:border-purple-900/30">
                                                    <MapPin size={10} color="#9333ea" />
                                                    <Text className="text-[10px] font-semibold text-purple-600 dark:text-purple-400" numberOfLines={1}>{item.location}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between items-end">
                                        <View className="flex-row items-center gap-1">
                                            {item.difficulty && (
                                                <Text className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${item.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200' :
                                                    item.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200' :
                                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200'
                                                    }`}>
                                                    {item.difficulty}
                                                </Text>
                                            )}
                                        </View>
                                        <Text className="text-muted-foreground/40 text-[9px] font-medium">
                                            Added {new Date(item.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                />
            )}

            {/* Add Plant Dialog */}
            <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
                <DialogContent className='sm:max-w-[425px] bg-background'>
                    <DialogHeader>
                        <DialogTitle>{editingPlantId ? 'Edit Plant Details' : 'New Plant Baby'}</DialogTitle>
                        <DialogDescription>
                            {editingPlantId ? 'Update your plant details below.' : 'Add a new plant to your collection.'}
                        </DialogDescription>
                    </DialogHeader>

                    <PlantForm
                        initialData={editingPlantId ? plants.find(p => p.id === editingPlantId) as unknown as PlantFormData : undefined}
                        onSubmit={handleSavePlant}
                        submitLabel={editingPlantId ? 'Update Plant' : 'Add Plant'}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!plantToDelete} onOpenChange={(open) => !open && setPlantToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Remove Plant</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this plant from your garden? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <View className="flex-row gap-2 justify-end">
                            <Button variant="outline" onPress={() => setPlantToDelete(null)}>
                                <Text>Cancel</Text>
                            </Button>
                            <Button variant="destructive" onPress={confirmDeletePlant}>
                                <Text className="text-destructive-foreground">Remove</Text>
                            </Button>
                        </View>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SafeAreaView>
    );
}
