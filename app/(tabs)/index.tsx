import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ScanLine, Leaf, RefreshCcw, ArrowRight, Sun, Droplets, Thermometer } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { useLanguage } from '@/lib/language';
import Animated, { FadeInDown, FadeInUp, FadeIn, LayoutAnimationConfig } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
// Using the icon as the logo element, but smaller
const AppIcon = require('../../assets/images/icon.png');

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';

export default function ScanScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [recentScan, setRecentScan] = useState<any>(null);
    const [animationKey, setAnimationKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            setAnimationKey(prev => prev + 1);
        }, [])
    );

    // Load recent scan on mount
    useEffect(() => {
        loadRecentScan();
    }, [result]); // Reload when result changes

    const loadRecentScan = async () => {
        try {
            const history = await AsyncStorage.getItem('scanHistory');
            if (history) {
                const parsed = JSON.parse(history);
                if (parsed.length > 0) {
                    setRecentScan(parsed[0]);
                }
            }
        } catch (e) {
            console.log("Error loading history", e);
        }
    };

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
            // Prepare the image URI for the platform
            const imageUri = Platform.OS === 'android'
                ? selectedImage
                : selectedImage.replace('file://', '');

            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                name: 'photo.jpg',
                type: 'image/jpeg',
            } as any);

            console.log('Sending request to:', `${API_URL}/predict`);

            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                body: formData,
                // Note: Don't set Content-Type header for multipart/form-data - 
                // fetch will set it automatically with the boundary
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            console.log('Result:', data);
            setResult(data);
            saveToHistory(data, selectedImage);

        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert(
                'Connection Error',
                'Could not connect to the analysis server. Please check:\n\n• Backend server is running\n• Network connection is stable\n• API URL is correct'
            );
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
            loadRecentScan();
        } catch (e) {
            console.error("Failed to save history", e);
        }
    };

    // If analyzing or showing result, use a focused view
    if (selectedImage) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 px-6 py-4">
                    <View className="flex-row items-center justify-between mb-6">
                        <TouchableOpacity
                            onPress={() => { setSelectedImage(null); setResult(null); }}
                            className="p-2 bg-secondary/50 rounded-full"
                        >
                            <ArrowRight size={24} className="rotate-180 text-foreground" color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold">Analysis</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <Animated.View
                        entering={FadeIn.duration(400)}
                        className="flex-1 rounded-3xl overflow-hidden bg-muted relative border border-border"
                    >
                        <Image
                            source={{ uri: selectedImage }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />

                        {!result && (
                            <BlurView intensity={20} className="absolute bottom-0 w-full p-6 pb-10">
                                <View className="bg-black/60 rounded-2xl p-4 backdrop-blur-md">
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
                                                <ScanLine size={20} color="white" className="mr-2" />
                                                <Text className="text-white font-bold">Analyze Plant</Text>
                                            </>
                                        )}
                                    </Button>
                                </View>
                            </BlurView>
                        )}

                        {result && (
                            <BlurView intensity={90} tint={colorScheme === 'dark' ? 'dark' : 'light'} className="absolute bottom-0 w-full p-6 pb-8 border-t border-white/10">
                                <Animated.View entering={FadeInUp.springify()}>
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className={cn(
                                            "px-3 py-1 rounded-full",
                                            result.class.toLowerCase() === 'healthy'
                                                ? "bg-green-500/10"
                                                : "bg-red-500/10"
                                        )}>
                                            <Text className={cn(
                                                "text-xs font-bold uppercase tracking-wider",
                                                result.class.toLowerCase() === 'healthy'
                                                    ? "text-green-600 dark:text-green-400"
                                                    : "text-red-600 dark:text-red-400"
                                            )}>
                                                {result.class.toLowerCase() === 'healthy' ? "Healthy" : "Attention Needed"}
                                            </Text>
                                        </View>
                                        <Text className="text-muted-foreground text-xs font-medium">
                                            {(result.confidence * 100).toFixed(0)}% Confidence
                                        </Text>
                                    </View>

                                    <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-3xl font-extrabold capitalize mb-2 text-foreground">
                                        {result.class.replace(/([A-Z])/g, ' $1').trim()}
                                    </Text>

                                    <Text className="text-muted-foreground leading-5 mb-6 text-sm">
                                        {result.class.toLowerCase() === 'healthy'
                                            ? "Your plant looks healthy and vibrant! Keep up the good work."
                                            : `This plant shows signs of ${result.class}. Isolate it from other plants and check our care guide.`
                                        }
                                    </Text>

                                    <Button
                                        onPress={() => { setSelectedImage(null); setResult(null); }}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <RefreshCcw size={16} className="mr-2 text-foreground" color={theme.colors.text} />
                                        <Text>Scan Another</Text>
                                    </Button>
                                </Animated.View>
                            </BlurView>
                        )}
                    </Animated.View>
                </View>
            </SafeAreaView>
        );
    }

    // Default Home Screen
    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView
                key={animationKey}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <Animated.View entering={FadeInDown.duration(600).springify()} className="flex-row items-center gap-3">
                        <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center overflow-hidden border border-primary/20">
                            <Image source={AppIcon} className="w-6 h-6" resizeMode="contain" />
                        </View>
                        <View>
                            <Text className="text-sm text-muted-foreground">{t('welcomeBack')}</Text>
                            <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-xl font-bold text-foreground">{t('plantParent')}</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Hero / CTA Section */}
                <View className="px-6 mt-4">
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(600).springify()}
                        className="bg-primary rounded-3xl p-6 relative overflow-hidden h-auto min-h-[192px] justify-between shadow-lg shadow-primary/20"
                    >
                        {/* decorative background circles */}
                        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                        <View className="absolute top-20 right-10 w-20 h-20 bg-white/5 rounded-full" />

                        <View>
                            <View className="bg-white/20 self-start px-3 py-1 rounded-full mb-3">
                                <Text className="text-white text-xs font-bold">{t('aiPowered')}</Text>
                            </View>
                            <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-white text-2xl font-bold w-2/3 leading-tight">
                                {t('diagnoseInstantly')}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={openCamera}
                            activeOpacity={0.9}
                            className="bg-white px-5 py-3 self-start rounded-xl flex-row items-center gap-2 mt-4"
                        >
                            <Camera size={18} color={theme.colors.primary} />
                            <Text className="text-primary font-bold">{t('snapPhoto')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Quick Actions Grid */}
                <View className="px-6 mt-6 flex-row gap-4">
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} className="flex-1">
                        <TouchableOpacity
                            onPress={pickImage}
                            className="bg-secondary/30 p-4 rounded-2xl border border-secondary items-center justify-center gap-3 h-32"
                        >
                            <View className="w-12 h-12 rounded-full bg-background items-center justify-center shadow-sm">
                                <ImageIcon size={24} color={theme.colors.text} />
                            </View>
                            <Text className="font-semibold text-foreground">{t('upload')}</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300).duration(600)} className="flex-1">
                        <TouchableOpacity
                            onPress={() => router.push('/garden' as any)}
                            className="bg-secondary/30 p-4 rounded-2xl border border-secondary items-center justify-center gap-3 h-32"
                        >
                            <View className="w-12 h-12 rounded-full bg-background items-center justify-center shadow-sm">
                                <Leaf size={24} color={theme.colors.text} />
                            </View>
                            <Text className="font-semibold text-foreground">{t('myGarden')}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Recent scan snippet */}
                {recentScan && (
                    <Animated.View entering={FadeInDown.delay(400)} className="px-6 mt-8">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-lg font-bold">{t('recentScan')}</Text>
                            <TouchableOpacity>
                                <Text className="text-primary text-sm">{t('viewAll')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="bg-card p-4 rounded-2xl border border-border flex-row items-center gap-4 shadow-sm">
                            <Image
                                source={{ uri: recentScan.imageUri }}
                                className="w-16 h-16 rounded-xl bg-muted"
                            />
                            <View className="flex-1">
                                <Text className="font-bold text-base capitalize">{recentScan.result.class}</Text>
                                <Text className="text-muted-foreground text-xs">{new Date(recentScan.timestamp).toLocaleDateString()}</Text>
                            </View>
                            <View className={cn(
                                "h-3 w-3 rounded-full",
                                recentScan.result.class.toLowerCase() === 'healthy' ? "bg-green-500" : "bg-red-500"
                            )} />
                        </View>
                    </Animated.View>
                )}

                {/* Plant Care Tips - "Comfort" Content */}
                <Animated.View entering={FadeInDown.delay(500)} className="px-6 mt-8 mb-6">
                    <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-lg font-bold mb-4">{t('plantCareEssentials')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 gap-4">
                        <View className="w-40 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/40 mr-4">
                            <View className="bg-orange-100 dark:bg-orange-900/50 w-10 h-10 rounded-full items-center justify-center mb-3">
                                <Sun size={20} color="#ea580c" />
                            </View>
                            <Text className="font-bold text-orange-900 dark:text-orange-100 mb-1">{t('sunlight')}</Text>
                            <Text className="text-xs text-orange-800/70 dark:text-orange-200/70 leading-4">{t('sunlightTip')}</Text>
                        </View>

                        <View className="w-40 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 mr-4">
                            <View className="bg-blue-100 dark:bg-blue-900/50 w-10 h-10 rounded-full items-center justify-center mb-3">
                                <Droplets size={20} color="#0284c7" />
                            </View>
                            <Text className="font-bold text-blue-900 dark:text-blue-100 mb-1">{t('watering')}</Text>
                            <Text className="text-xs text-blue-800/70 dark:text-blue-200/70 leading-4">{t('wateringTip')}</Text>
                        </View>

                        <View className="w-40 bg-green-50 dark:bg-green-950/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/40">
                            <View className="bg-green-100 dark:bg-green-900/50 w-10 h-10 rounded-full items-center justify-center mb-3">
                                <Thermometer size={20} color="#16a34a" />
                            </View>
                            <Text className="font-bold text-green-900 dark:text-green-100 mb-1">{t('temp')}</Text>
                            <Text className="text-xs text-green-800/70 dark:text-green-200/70 leading-4">{t('tempTip')}</Text>
                        </View>
                    </ScrollView>
                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    );
}
