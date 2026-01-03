import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Camera, Droplets, Sun, Shield, Info, Check, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';

export interface PlantFormData {
    name: string;
    type: string;
    imageUri?: string;
    wateringFrequency: string;
    sunlight: string;
    difficulty: string;
    petSafe: boolean;
    location: string;
    notes: string;
    soilType: string;
    potSize: string;
}

interface PlantFormProps {
    initialData?: PlantFormData;
    onSubmit: (data: PlantFormData) => void;
    submitLabel: string;
}

export function PlantForm({ initialData, onSubmit, submitLabel }: PlantFormProps) {
    const { colorScheme } = useColorScheme();
    const colors = THEME[colorScheme ?? 'light'];

    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [wateringFrequency, setWateringFrequency] = useState('Weekly');
    const [sunlight, setSunlight] = useState('Partial');
    const [difficulty, setDifficulty] = useState('Easy');
    const [petSafe, setPetSafe] = useState(true);
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [soilType, setSoilType] = useState('');
    const [potSize, setPotSize] = useState(''); // Kept for future use if needed, though not in current UI

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setImageUri(initialData.imageUri ?? null);
            setWateringFrequency(initialData.wateringFrequency || 'Weekly');
            setSunlight(initialData.sunlight || 'Partial');
            setDifficulty(initialData.difficulty || 'Easy');
            setPetSafe(initialData.petSafe ?? true);
            setLocation(initialData.location || '');
            setNotes(initialData.notes || '');
            setSoilType(initialData.soilType || '');
            setPotSize(initialData.potSize || '');
        } else {
            resetForm();
        }
    }, [initialData]);

    const resetForm = () => {
        setName('');
        setType('');
        setImageUri(null);
        setWateringFrequency('Weekly');
        setSunlight('Partial');
        setDifficulty('Easy');
        setPetSafe(true);
        setLocation('');
        setNotes('');
        setSoilType('');
        setPotSize('');
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = () => {
        onSubmit({
            name,
            type,
            imageUri: imageUri || undefined,
            wateringFrequency,
            sunlight,
            difficulty,
            petSafe,
            location,
            notes,
            soilType,
            potSize,
        });
    };

    return (
        <View>
            <ScrollView
                className="max-h-[450px]"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 0 }}
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
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
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
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                            <View className="flex-1 gap-1.5">
                                <Text className="text-xs font-bold text-muted-foreground ml-1 uppercase">Type</Text>
                                <Select value={{ value: type, label: type }} onValueChange={(option) => {
                                    if (option) setType(option.value);
                                }}>
                                    <SelectTrigger className="w-full h-12 bg-secondary/30 border-border rounded-xl justify-center">
                                        <SelectValue
                                            className="text-muted-foreground text-sm font-bold"
                                            placeholder="Select Type"
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="max-w-26">
                                        <SelectGroup>
                                            <SelectLabel>Plant Types</SelectLabel>
                                            {['Indoor', 'Outdoor', 'Succulent', 'Vegetable', 'Herb', 'Flower', 'Tree', 'Cactus', 'Fern', 'Orchid'].map((t) => (
                                                <SelectItem key={t} label={t} value={t}>
                                                    {t}
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
                                    onPress={() => setWateringFrequency(freq)}
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
                                    onPress={() => setSunlight(level)}
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
                                        onPress={() => setDifficulty(diff)}
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
                            className="w-full bg-secondary/30 p-3 rounded-xl border border-border text-foreground text-xs min-h-[60px]"
                            placeholder="Add notes about your plant baby..."
                            placeholderTextColor={colors.mutedForeground}
                            multiline
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </View>
            </ScrollView>

            <View className="pt-4 border-t border-border/50 mt-2">
                <Button onPress={handleSubmit} className="w-full bg-primary rounded-xl h-12 flex-row gap-2">
                    {submitLabel.includes('Update') ? <Check size={18} color="white" /> : <Plus size={18} color="white" />}
                    <Text className="font-bold text-white text-base">
                        {submitLabel}
                    </Text>
                </Button>
            </View>
        </View>
    );
}
