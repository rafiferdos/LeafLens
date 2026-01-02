import React, { useState } from 'react';
import { View, Image, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ScanLine, Leaf, RefreshCcw, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';

// Backend URL - Adjust 10.0.2.2 for Android Emulator, localhost for iOS Simulator
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const LogoImage = require('../../assets/images/logo.png');

export default function ScanScreen() {
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setResult(null);
        }
    };

    const openCamera = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: selectedImage,
                name: 'photo.jpg',
                type: 'image/jpeg',
                // @ts-ignore
                uri: Platform.OS === 'android' ? selectedImage : selectedImage.replace('file://', ''),
            } as any);

            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setResult(data);
            saveToHistory(data, selectedImage);

        } catch (error) {
            Alert.alert('Error', 'Failed to analyze image. Ensure backend is running.');
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveToHistory = async (result: any, imageUri: string) => {
        try {
            const history = await AsyncStorage.getItem('scanHistory');
            const parsedHistory = history ? JSON.parse(history) : [];
            const newItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                result,
                imageUri
            };
            await AsyncStorage.setItem('scanHistory', JSON.stringify([newItem, ...parsedHistory]));
        } catch (e) {
            console.error("Failed to save history", e);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
                {!selectedImage ? (
                    <View className="flex-1 justify-center items-center py-12">
                        <View className="bg-primary/5 p-8 rounded-[40px] mb-8 shadow-2xl shadow-primary/20">
                            <Image
                                source={LogoImage}
                                className="w-32 h-32 rounded-2xl"
                                resizeMode="contain"
                            />
                        </View>

                        <Text className="text-4xl font-extrabold tracking-tight text-center mb-3 font-heading">
                            LeafLens
                        </Text>
                        <Text className="text-muted-foreground text-center text-lg max-w-[280px] leading-relaxed mb-12">
                            Instantly identify plant diseases with just a photo.
                        </Text>

                        <View className="w-full gap-4 max-w-sm">
                            <TouchableOpacity
                                onPress={openCamera}
                                activeOpacity={0.8}
                                className="bg-primary p-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/25"
                            >
                                <Camera size={24} color="white" className="mr-3" />
                                <Text className="text-primary-foreground font-bold text-lg">Take a Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={pickImage}
                                activeOpacity={0.8}
                                className="bg-secondary p-5 rounded-2xl flex-row items-center justify-center"
                            >
                                <ImageIcon size={24} color={theme.colors.foreground} className="mr-3" />
                                <Text className="text-secondary-foreground font-semibold text-lg">Upload from Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 py-8">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-2xl font-bold">Analysis</Text>
                            {!result && (
                                <TouchableOpacity onPress={() => setSelectedImage(null)}>
                                    <Text className="text-primary font-medium">Cancel</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="bg-muted/30 border border-border rounded-3xl h-[400px] w-full items-center justify-center overflow-hidden mb-8 shadow-sm relative">
                            <Image
                                source={{ uri: selectedImage }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            {!result && (
                                <View className="absolute bottom-0 w-full bg-black/40 p-6 backdrop-blur-md">
                                    <Button
                                        onPress={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="w-full rounded-xl"
                                        size="lg"
                                    >
                                        {isAnalyzing ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <>
                                                <ScanLine size={20} color="white" className="mr-2" />
                                                <Text className="text-primary-foreground font-bold">Analyze Plant</Text>
                                            </>
                                        )}
                                    </Button>
                                </View>
                            )}
                        </View>

                        {result && (
                            <View className="animate-in slide-in-from-bottom-10 fade-in duration-500">
                                <View className="bg-card border border-border p-6 rounded-3xl shadow-sm mb-6">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className={cn(
                                            "font-bold text-sm uppercase tracking-wider px-3 py-1 rounded-full overflow-hidden",
                                            result.class.toLowerCase() === 'healthy'
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        )}>
                                            {result.class.toLowerCase() === 'healthy' ? "Healthy" : "Infected"}
                                        </Text>
                                        <Text className="text-muted-foreground font-medium">
                                            {(result.confidence * 100).toFixed(0)}% Match
                                        </Text>
                                    </View>

                                    <Text className="text-3xl font-extrabold mb-1 capitalize text-foreground">
                                        {result.class.replace(/([A-Z])/g, ' $1').trim()}
                                    </Text>

                                    {result.class.toLowerCase() !== 'healthy' && (
                                        <Text className="text-muted-foreground leading-6 mt-2">
                                            This plant shows distinct signs of {result.class}. Recommended actions include isolating the plant and checking for specific treatments.
                                        </Text>
                                    )}
                                </View>

                                <Button
                                    onPress={() => { setSelectedImage(null); setResult(null); }}
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl border-2"
                                >
                                    <RefreshCcw size={18} className="mr-2 text-foreground" color={theme.colors.foreground} />
                                    <Text className="font-semibold text-lg">Scan Another Plant</Text>
                                </Button>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
