import { View, Image, TouchableOpacity, ScrollView, FlatList, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ArrowLeft, Plus, Sprout, Trash2, Camera, X, Check } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GardenPlant {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
    imageUri?: string;
}

export default function MyGardenScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const [plants, setPlants] = useState<GardenPlant[]>([]);
    const [animationKey, setAnimationKey] = useState(0);
    const [plantToDelete, setPlantToDelete] = useState<string | null>(null);

    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newPlantName, setNewPlantName] = useState('');
    const [newPlantType, setNewPlantType] = useState('');
    const [newPlantImage, setNewPlantImage] = useState<string | null>(null);

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

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setNewPlantImage(result.assets[0].uri);
        }
    };

    const handleSavePlant = async () => {
        if (!newPlantName.trim()) {
            Alert.alert("Name Required", "Please give your plant a name!");
            return;
        }

        const newPlant: GardenPlant = {
            id: Date.now().toString(),
            name: newPlantName,
            type: newPlantType || 'Indoor Plant',
            dateAdded: new Date().toISOString(),
            imageUri: newPlantImage || undefined
        };

        const updatedPlants = [newPlant, ...plants];
        setPlants(updatedPlants);
        await AsyncStorage.setItem('myGarden', JSON.stringify(updatedPlants));

        // Reset and close
        setNewPlantName('');
        setNewPlantType('');
        setNewPlantImage(null);
        setIsModalVisible(false);
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
                    onPress={() => setIsModalVisible(true)}
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
                            onPress={() => setIsModalVisible(true)}
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
                            className="bg-card mb-4 rounded-3xl p-4 border border-border shadow-sm flex-row items-center gap-4 overflow-hidden"
                        >
                            <View className="w-20 h-20 rounded-2xl bg-muted items-center justify-center overflow-hidden border border-border/50">
                                {item.imageUri ? (
                                    <Image source={{ uri: item.imageUri }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <View className="w-full h-full bg-green-100 dark:bg-green-900/20 items-center justify-center">
                                        <Sprout size={32} color={theme.colors.primary} />
                                    </View>
                                )}
                            </View>
                            <View className="flex-1 justify-center">
                                <Text className="font-bold text-xl mb-1">{item.name}</Text>
                                <Text className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{item.type}</Text>
                                <Text className="text-muted-foreground/60 text-[10px] mt-2">Added {new Date(item.dateAdded).toLocaleDateString()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => deletePlant(item.id)}
                                className="w-10 h-10 bg-destructive/10 rounded-full items-center justify-center"
                            >
                                <Trash2 size={18} color={theme.colors.notification} />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                />
            )}

            {/* Add Plant Dialog */}
            <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
                <DialogContent className='sm:max-w-[425px] bg-background'>
                    <DialogHeader>
                        <DialogTitle>New Plant Baby</DialogTitle>
                        <DialogDescription>
                            Add a new plant to your collection.
                        </DialogDescription>
                    </DialogHeader>

                    <View className="gap-6 py-4">
                        <View className="items-center">
                            <TouchableOpacity
                                onPress={pickImage}
                                className="w-32 h-32 rounded-full bg-secondary/50 border-2 border-dashed border-border items-center justify-center overflow-hidden shadow-sm"
                            >
                                {newPlantImage ? (
                                    <Image source={{ uri: newPlantImage }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <View className="items-center gap-2">
                                        <Camera size={32} color={theme.colors.mutedForeground} />
                                        <Text className="text-xs text-muted-foreground font-medium">Add Photo</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="gap-4">
                            <View className="gap-1.5">
                                <Text className="text-sm font-medium text-foreground ml-1">Plant Name</Text>
                                <TextInput
                                    className="w-full bg-secondary/30 p-3.5 rounded-xl border border-border text-foreground font-semibold"
                                    placeholder="e.g. Mr. Monstera"
                                    placeholderTextColor={theme.colors.mutedForeground}
                                    value={newPlantName}
                                    onChangeText={setNewPlantName}
                                    returnKeyType="next"
                                />
                            </View>
                            <View className="gap-1.5">
                                <Text className="text-sm font-medium text-foreground ml-1">Plant Type</Text>
                                <TextInput
                                    className="w-full bg-secondary/30 p-3.5 rounded-xl border border-border text-foreground"
                                    placeholder="e.g. Indoor, Succulent"
                                    placeholderTextColor={theme.colors.mutedForeground}
                                    value={newPlantType}
                                    onChangeText={setNewPlantType}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSavePlant}
                                />
                            </View>
                        </View>
                    </View>

                    <DialogFooter>
                        <Button onPress={handleSavePlant} className="w-full">
                            <Text className="text-primary-foreground font-bold">Welcome Home</Text>
                        </Button>
                    </DialogFooter>
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
