import React, { useState } from 'react';
import { View, Image, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ScanLine, Leaf, RefreshCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Backend URL - Adjust 10.0.2.2 for Android Emulator, localhost for iOS Simulator
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export default function ScanScreen() {
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
                imageUri // Saving URI only - might need base64 for persistence across sessions if tmp file is cleared, but for now URI is standard for RN
            };
            await AsyncStorage.setItem('scanHistory', JSON.stringify([newItem, ...parsedHistory]));
        } catch (e) {
            console.error("Failed to save history", e);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6 py-8">

                <View className="mb-8 items-center">
                    <View className="bg-primary/10 p-3 rounded-full mb-3">
                        <Leaf size={32} className="text-primary" color="#16a34a" />
                    </View>
                    <Text className="text-3xl font-bold tracking-tight text-center">LeafLens</Text>
                    <Text className="text-muted-foreground mt-2 text-center text-base">
                        AI-powered plant disease detection.
                    </Text>
                </View>

                <View className="bg-muted/30 border border-border rounded-3xl h-80 w-full items-center justify-center overflow-hidden mb-8 shadow-sm">
                    {selectedImage ? (
                        <Image
                            source={{ uri: selectedImage }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="items-center opacity-50">
                            <ImageIcon size={48} className="text-muted-foreground" color="#71717a" />
                            <Text className="text-muted-foreground mt-4 font-medium">No image selected</Text>
                        </View>
                    )}
                </View>

                <View className="flex-row gap-4 mb-6">
                    <Button onPress={openCamera} className="flex-1" variant="outline">
                        <Camera size={20} className="text-foreground" color="black" />
                        <Text>Camera</Text>
                    </Button>

                    <Button onPress={pickImage} className="flex-1" variant="secondary">
                        <ImageIcon size={20} className="text-secondary-foreground" color="black" />
                        <Text>Gallery</Text>
                    </Button>
                </View>

                {selectedImage && (
                    <View className="mt-2">
                        {!result ? (
                            <Button
                                onPress={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full"
                                size="lg"
                            >
                                {isAnalyzing ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <ScanLine size={20} color="white" />
                                        <Text className="text-primary-foreground">Test This Image</Text>
                                    </>
                                )}
                            </Button>
                        ) : (
                            <View className="bg-card border border-border p-5 rounded-2xl animate-in fade-in">
                                <Text className={cn(
                                    "font-semibold text-sm uppercase tracking-wider mb-1",
                                    result.class.toLowerCase() === 'healthy' ? "text-green-600" : "text-destructive"
                                )}>
                                    {result.class.toLowerCase() === 'healthy' ? "Healthy Plant" : "Disease Detected"}
                                </Text>

                                <Text className="text-2xl font-bold mb-2 capitalize">
                                    {result.class.replace(/([A-Z])/g, ' $1').trim()}
                                </Text>

                                <Text className="text-muted-foreground mb-4">
                                    Confidence: {(result.confidence * 100).toFixed(1)}%
                                </Text>

                                <View className="space-y-2 mb-6">
                                    {result.all_predictions?.slice(0, 3).map((pred: any) => (
                                        <View key={pred.class} className="flex-row items-center gap-2">
                                            <View className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <View
                                                    className="h-full bg-primary"
                                                    style={{ width: `${pred.confidence * 100}%` }}
                                                />
                                            </View>
                                            <Text className="text-xs w-24 text-right" numberOfLines={1}>
                                                {pred.class.replace(/([A-Z])/g, ' $1').trim()}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <Button
                                    onPress={() => { setSelectedImage(null); setResult(null); }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <RefreshCcw size={16} className="mr-2 text-foreground" color="black" />
                                    <Text>Scan Another</Text>
                                </Button>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
