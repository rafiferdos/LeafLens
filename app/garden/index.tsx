import { View, Image, TouchableOpacity, ScrollView, FlatList, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ArrowLeft, Plus, Sprout, Trash2, Camera, X, Check, Droplets, Sun, Shield, Info, MapPin } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME, THEME } from '@/lib/theme';
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
    const [newPlantName, setNewPlantName] = useState('');
    const [newPlantType, setNewPlantType] = useState('');
    const [newPlantImage, setNewPlantImage] = useState<string | null>(null);

    // New Properties State
    const [wateringFrequency, setWateringFrequency] = useState<GardenPlant['wateringFrequency']>('Weekly');
    const [sunlight, setSunlight] = useState<GardenPlant['sunlight']>('Partial');
    const [difficulty, setDifficulty] = useState<GardenPlant['difficulty']>('Easy');
    const [petSafe, setPetSafe] = useState(true);
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [soilType, setSoilType] = useState('');
    const [potSize, setPotSize] = useState('');


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

    const resetForm = () => {
        setNewPlantName('');
        setNewPlantType('');
        setNewPlantImage(null);
        setWateringFrequency('Weekly');
        setSunlight('Partial');
        setDifficulty('Easy');
        setPetSafe(true);
        setLocation('');
        setNotes('');
        setSoilType('');
        setPotSize('');
        setEditingPlantId(null);
        setIsModalVisible(false);
    };

    const handleEditPlant = (plant: GardenPlant) => {
        setEditingPlantId(plant.id);
        setNewPlantName(plant.name);
        setNewPlantType(plant.type);
        setNewPlantImage(plant.imageUri ?? null);
        if (plant.wateringFrequency) setWateringFrequency(plant.wateringFrequency);
        if (plant.sunlight) setSunlight(plant.sunlight);
        if (plant.difficulty) setDifficulty(plant.difficulty);
        setPetSafe(plant.petSafe ?? true);
        setLocation(plant.location ?? '');
        setNotes(plant.notes ?? '');
        setSoilType(plant.soilType ?? '');
        setPotSize(plant.potSize ?? '');
        setIsModalVisible(true);
    };

    const handleSavePlant = async () => {
        if (!newPlantName.trim()) {
            Alert.alert("Name Required", "Please give your plant a name!");
            return;
        }

        let updatedPlants: GardenPlant[];

        if (editingPlantId) {
            updatedPlants = plants.map(p => p.id === editingPlantId ? {
                ...p,
                name: newPlantName,
                type: newPlantType || 'Indoor Plant',
                imageUri: newPlantImage || undefined,
                wateringFrequency,
                sunlight,
                difficulty,
                petSafe,
                location,
                notes,
                soilType,
                potSize,
            } : p);
        } else {
            const newPlant: GardenPlant = {
                id: Date.now().toString(),
                name: newPlantName,
                type: newPlantType || 'Indoor Plant',
                dateAdded: new Date().toISOString(),
                imageUri: newPlantImage || undefined,
                wateringFrequency,
                sunlight,
                difficulty,
                petSafe,
                location,
                notes,
                soilType,
                potSize,
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

                    <ScrollView
                        className="max-h-[600px]"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="gap-6 py-4">
                            {/* Image & Basic Info */}
                            <View className="items-center mb-2">
                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="w-28 h-28 rounded-full bg-secondary/50 border-4 border-background shadow-sm items-center justify-center overflow-hidden mb-4"
                                    style={{ elevation: 5 }}
                                >
                                    {newPlantImage ? (
                                        <Image source={{ uri: newPlantImage }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <View className="items-center gap-2">
                                            <Camera size={28} color={colors.mutedForeground} />
                                            <Text className="text-[10px] text-muted-foreground font-medium">Add Photo</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <View className="w-full flex-row gap-4 mb-2">
                                    <View className="flex-1 gap-1.5">
                                        <Text className="text-xs font-bold text-muted-foreground ml-1 uppercase">Name</Text>
                                        <TextInput
                                            className="w-full h-12 bg-secondary/30 px-3 rounded-xl border border-border text-foreground font-bold"
                                            placeholder="Mr. Monstera"
                                            placeholderTextColor={colors.mutedForeground}
                                            value={newPlantName}
                                            onChangeText={setNewPlantName}
                                        />
                                    </View>
                                    <View className="flex-1 gap-1.5">
                                        <Text className="text-xs font-bold text-muted-foreground ml-1 uppercase">Type</Text>
                                        <Select value={{ value: newPlantType, label: newPlantType }} onValueChange={(option) => {
                                            if (option) setNewPlantType(option.value);
                                        }}>
                                            <SelectTrigger className="w-full h-12 bg-secondary/30 px-3 border-border rounded-xl justify-center">
                                                <SelectValue
                                                    className="text-foreground text-sm native:text-base font-bold"
                                                    placeholder="Select Type"
                                                />
                                            </SelectTrigger>
                                            <SelectContent className="w-[200px]">
                                                <SelectGroup>
                                                    <SelectLabel>Plant Types</SelectLabel>
                                                    {['Indoor', 'Outdoor', 'Succulent', 'Vegetable', 'Herb', 'Flower', 'Tree', 'Cactus', 'Fern', 'Orchid'].map((type) => (
                                                        <SelectItem key={type} label={type} value={type}>
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </View>
                                </View>
                            </View>

                            {/* Divider */}
                            <View className="h-px bg-border/50 w-full" />

                            {/* Care Requirements */}
                            <View className="gap-3">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Droplets size={16} color={colors.primary} />
                                    <Text className="text-sm font-bold text-foreground">Watering Frequency</Text>
                                </View>
                                <View className="flex-row flex-wrap gap-2">
                                    {['Daily', 'Weekly', 'Bi-weekly', 'Monthly'].map((freq) => (
                                        <TouchableOpacity
                                            key={freq}
                                            onPress={() => setWateringFrequency(freq as any)}
                                            className={`px-4 py-2 rounded-full border ${wateringFrequency === freq
                                                ? 'bg-primary border-primary'
                                                : 'bg-transparent border-border'
                                                }`}
                                        >
                                            <Text className={`text-xs font-medium ${wateringFrequency === freq ? 'text-white' : 'text-muted-foreground'
                                                }`}>{freq}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="gap-3">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Sun size={16} color="orange" />
                                    <Text className="text-sm font-bold text-foreground">Sunlight Needs</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    {['Low', 'Partial', 'Direct'].map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            onPress={() => setSunlight(level as any)}
                                            className={`flex-1 py-2 rounded-xl border items-center justify-center ${sunlight === level
                                                ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-500'
                                                : 'bg-transparent border-border'
                                                }`}
                                        >
                                            <Text className={`text-xs font-bold ${sunlight === level ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'
                                                }`}>{level}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="flex-row gap-4 items-end">
                                <View className="flex-1 gap-2">
                                    <Text className="text-xs font-bold text-muted-foreground uppercase ml-1">Difficulty</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                                            <TouchableOpacity
                                                key={diff}
                                                onPress={() => setDifficulty(diff as any)}
                                                className={`px-3 py-2 rounded-lg border ${difficulty === diff
                                                    ? 'bg-secondary border-foreground/20'
                                                    : 'bg-transparent border-border'
                                                    }`}
                                            >
                                                <Text className={`text-xs ${difficulty === diff ? 'font-bold text-foreground' : 'text-muted-foreground'
                                                    }`}>{diff}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => setPetSafe(!petSafe)}
                                        className={`flex-row items-center gap-2 px-3 py-2 rounded-lg border ${petSafe ? 'bg-green-100 dark:bg-green-900/30 border-green-500' : 'bg-transparent border-border'
                                            }`}
                                    >
                                        <Shield size={14} color={petSafe ? colors.primary : colors.mutedForeground} />
                                        <Text className={`text-xs ${petSafe ? 'text-green-700 dark:text-green-400 font-bold' : 'text-muted-foreground'}`}>
                                            Pet Safe
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Detailed Info */}
                            <View className="gap-3 mt-2">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Info size={14} color={colors.mutedForeground} />
                                    <Text className="text-sm font-bold text-foreground">Details</Text>
                                </View>
                                <View className="flex-row gap-3">
                                    <TextInput
                                        className="flex-1 bg-secondary/30 p-3 rounded-xl border border-border text-foreground text-xs"
                                        placeholder="Living Room (Location)"
                                        placeholderTextColor={colors.mutedForeground}
                                        value={location}
                                        onChangeText={setLocation}
                                    />
                                    <TextInput
                                        className="flex-1 bg-secondary/30 p-3 rounded-xl border border-border text-foreground text-xs"
                                        placeholder="Loam/Peat (Soil)"
                                        placeholderTextColor={colors.mutedForeground}
                                        value={soilType}
                                        onChangeText={setSoilType}
                                    />
                                </View>
                                <TextInput
                                    className="bg-secondary/30 p-3 rounded-xl border border-border text-foreground text-xs h-24"
                                    placeholder="Add notes about care history, distinct markers, or sentimental value..."
                                    placeholderTextColor={colors.mutedForeground}
                                    multiline
                                    textAlignVertical="top"
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </View>

                        </View>
                    </ScrollView>

                    <DialogFooter>
                        <Button onPress={handleSavePlant} className="w-full bg-primary rounded-xl h-12 flex-row gap-2">
                            {editingPlantId ? <Check size={18} color="white" /> : <Plus size={18} color="white" />}
                            <Text className="font-bold text-white text-base">
                                {editingPlantId ? 'Update Plant' : 'Add Plant'}
                            </Text>
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
