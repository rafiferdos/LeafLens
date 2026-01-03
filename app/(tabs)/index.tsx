import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ScanLine, Leaf, RefreshCcw, ArrowRight, Sun, Droplets, Thermometer, Search, AlertCircle, CheckCircle, Smartphone, Globe, User, ChevronRight, Stethoscope, Sprout, Pill, CloudRain, Layers, Scissors, Bug, Wind, Download, Cpu } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { NAV_THEME, THEME } from '@/lib/theme';
import { useLanguage } from '@/lib/language';
import { useRouter } from 'expo-router';

import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { diseaseDatabase, DiseaseData } from '@/lib/disease-data';
import { useModelManager, predictDisease } from '@/services/model-manager';

// On-device inference - no backend required!

export default function HomeScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [userName, setUserName] = useState<string | null>(null);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    // On-device AI model - auto-downloads and initializes
    const modelStatus = useModelManager();

    // Load profile data on mount and when theme changes
    useEffect(() => {
        loadUserProfile();
    }, [colorScheme]);

    const loadUserProfile = async () => {
        try {
            const name = await AsyncStorage.getItem('user_name');
            const photo = await AsyncStorage.getItem('user_photo');
            setUserName(name);
            setUserPhoto(photo);
        } catch (e) {
            console.error(e);
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
        if (!modelStatus.isReady) {
            Alert.alert('Model Not Ready', 'Please wait for the AI model to finish downloading.');
            return;
        }

        setIsAnalyzing(true);
        try {
            // Run on-device inference - no server needed!
            const data = await predictDisease(selectedImage);
            setResult(data);
            saveToHistory(data, selectedImage);

        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert('Analysis Error', 'Failed to analyze the image. Please try again.');
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

    const resetScan = () => {
        setSelectedImage(null);
        setResult(null);
    };

    const getDiseaseInfo = (className: string): DiseaseData | null => {
        const key = Object.keys(diseaseDatabase).find(k => k.toLowerCase() === className.toLowerCase()) || className;
        return diseaseDatabase[key] || null;
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View className="pt-2">

                    {/* 1. Header Section */}
                    <View className="px-6 flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-muted-foreground text-sm font-medium mb-1">
                                {t('welcomeBack')} 👋
                            </Text>
                            <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-3xl text-foreground" numberOfLines={1}>
                                {userName || t('plantParent')}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/profile')} className="bg-primary/10 rounded-full border border-primary/20 overflow-hidden w-12 h-12 items-center justify-center">
                            {userPhoto ? (
                                <Image source={{ uri: userPhoto }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <User size={24} color={theme.colors.primary} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* 2. Main Scanner Card / Result View */}
                    <View className="mx-6 bg-secondary/30 rounded-[32px] p-1 border border-border/50 shadow-sm mb-8 overflow-hidden">

                        {!selectedImage ? (
                            <View className="p-5">
                                <View className="flex-row items-center gap-2 mb-2 px-2">
                                    <ScanLine size={24} color={theme.colors.primary} />
                                    <Text className="font-bold text-xl">{t('aiPowered')}</Text>
                                </View>

                                <View className="items-center justify-center py-6 px-4">
                                    {/* Hero Visual */}
                                    <View className="relative mb-8 mt-2">
                                        <View className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
                                        <View className="w-28 h-28 bg-primary/10 rounded-full items-center justify-center shadow-lg shadow-primary/20 border-[6px] border-background">
                                            <ScanLine size={48} color={theme.colors.primary} strokeWidth={2.5} />
                                        </View>
                                        <View className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full shadow-sm border border-border/10">
                                            <Leaf size={24} color={theme.colors.primary} fill={theme.colors.primary} />
                                        </View>
                                    </View>

                                    <Text className="text-center font-black text-2xl text-foreground mb-2">
                                        Check Plant Health
                                    </Text>
                                    <Text className="text-center text-muted-foreground text-base px-2 mb-8 leading-6">
                                        Take a photo of any leaf to instantly identify potential diseases and get treatment tips.
                                    </Text>

                                    <View className="w-full gap-4">
                                        <Button className="w-full h-16 rounded-2xl shadow-lg bg-primary active:scale-95 transition-all" onPress={openCamera}>
                                            <Camera size={24} color="white" className="mr-3" />
                                            <Text className="text-white text-lg font-bold">Take Photo</Text>
                                        </Button>
                                        <Button className="w-full h-16 rounded-2xl border-2 border-border/50 bg-background/50 active:scale-95 transition-all" variant="outline" onPress={pickImage}>
                                            <ImageIcon size={24} color={theme.colors.text} className="mr-3" />
                                            <Text className="text-foreground text-lg font-semibold">Select from Gallery</Text>
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            // Result View
                            <View className="bg-background">
                                <View className="h-72 w-full relative">
                                    <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                                    <View className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
                                    <TouchableOpacity
                                        onPress={resetScan}
                                        className="absolute top-4 right-4 bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10"
                                    >
                                        <RefreshCcw size={20} color="white" />
                                    </TouchableOpacity>
                                </View>

                                <View className="-mt-12 px-5 pb-6">
                                    {/* Result Header Card */}
                                    <Animated.View entering={FadeInUp.duration(500).springify()} className="bg-card rounded-[24px] p-5 border border-border/50 shadow-lg shadow-black/5">
                                        {!result && !isAnalyzing ? (
                                            <View className="gap-4">
                                                <Text className="text-center font-bold text-lg">Ready to Analyze</Text>
                                                <Button size="lg" className="w-full h-14 rounded-xl" onPress={handleAnalyze} disabled={isAnalyzing}>
                                                    {isAnalyzing ? <ActivityIndicator color="white" /> : <><Search size={20} color="white" className="mr-2" /><Text className="text-white font-bold text-lg">Diagnose Plant</Text></>}
                                                </Button>
                                            </View>
                                        ) : isAnalyzing ? (
                                            <View className="py-8 items-center gap-4">
                                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                                <Text className="text-muted-foreground font-medium">Analyzing plant data...</Text>
                                            </View>
                                        ) : (
                                            /* STABLE CONTINOUS VERTICAL LAYOUT (No Tabs) */
                                            <View>
                                                {/* Header Badges */}
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <View className={cn(
                                                        "flex-row items-center gap-1.5 px-3 py-1 rounded-full",
                                                        result.class.toLowerCase() === 'healthy'
                                                            ? "bg-green-100 dark:bg-green-900/40"
                                                            : "bg-red-100 dark:bg-red-900/40"
                                                    )}>
                                                        <View className={cn("w-2 h-2 rounded-full", result.class.toLowerCase() === 'healthy' ? "bg-green-600" : "bg-red-600")} />
                                                        <Text className={cn(
                                                            "text-[10px] font-bold uppercase tracking-wider",
                                                            result.class.toLowerCase() === 'healthy' ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                                                        )}>
                                                            {result.class.toLowerCase() === 'healthy' ? "Healthy" : "Infected"}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-xs font-semibold text-muted-foreground">
                                                        {(result.confidence * 100).toFixed(0)}% Confidence
                                                    </Text>
                                                </View>

                                                <Text className="text-2xl font-black text-foreground capitalize mb-6">
                                                    {result.class.replace(/([A-Z])/g, ' $1').trim()}
                                                </Text>

                                                {/* CONTENT 1: OVERVIEW */}
                                                <View className="mb-6 bg-secondary/20 p-4 rounded-2xl border border-border/50">
                                                    <View className="flex-row gap-3 mb-2">
                                                        <Sprout size={18} color={theme.colors.primary} />
                                                        <Text className="font-bold text-foreground">About this condition</Text>
                                                    </View>
                                                    <Text className="text-muted-foreground leading-6 text-sm">
                                                        {getDiseaseInfo(result.class)?.description || "No description available."}
                                                    </Text>
                                                </View>

                                                {/* CONTENT 2: SYMPTOMS (If not healthy) */}
                                                {result.class.toLowerCase() !== 'healthy' && (
                                                    <View className="mb-6 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/20">
                                                        <View className="flex-row gap-3 mb-2">
                                                            <Stethoscope size={18} color="#f97316" />
                                                            <Text className="font-bold text-foreground">Common Symptoms</Text>
                                                        </View>
                                                        <View className="gap-2.5">
                                                            {getDiseaseInfo(result.class)?.symptoms.map((s, i) => (
                                                                <View key={i} className="flex-row gap-2.5">
                                                                    <View className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                                                                    <Text className="text-muted-foreground text-sm flex-1">{s}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    </View>
                                                )}

                                                {/* CONTENT 3: TREATMENT (If not healthy) */}
                                                {result.class.toLowerCase() !== 'healthy' && (
                                                    <View className="mb-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                                        <View className="flex-row gap-3 mb-2">
                                                            <Pill size={18} color="#3b82f6" />
                                                            <Text className="font-bold text-foreground">Recommended Treatment</Text>
                                                        </View>
                                                        <View className="gap-2.5">
                                                            {getDiseaseInfo(result.class)?.control.map((s, i) => (
                                                                <View key={i} className="flex-row gap-2.5">
                                                                    <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                                                                    <Text className="text-muted-foreground text-sm flex-1">{s}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    </View>
                                                )}

                                                {getDiseaseInfo(result.class)?.link && (
                                                    <TouchableOpacity
                                                        onPress={() => { const link = getDiseaseInfo(result.class)?.link; if (link) Linking.openURL(link); }}
                                                        className="flex-row items-center justify-center gap-2 mt-2 py-3 border-t border-border/50"
                                                    >
                                                        <Text className="font-semibold text-primary">Read Full Article</Text>
                                                        <ChevronRight size={16} color={theme.colors.primary} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}
                                    </Animated.View>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* 3. Plant Care Essentials Section */}
                    <Text className="text-xl font-bold text-foreground mb-4 opacity-90 px-6">{t('plantCareEssentials')}</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 16, paddingBottom: 24 }}
                    >
                        {/* Sunlight Card */}
                        <View className="w-44 h-56 bg-orange-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm hover:shadow-lg transition-all">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                                <Sun size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Sun size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Sunlight</Text>
                                <Text className="text-orange-50 text-xs font-medium leading-5">Most indoor plants prefer bright, indirect light.</Text>
                            </View>
                        </View>

                        {/* Watering Card */}
                        <View className="w-44 h-56 bg-blue-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform -rotate-12">
                                <Droplets size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Droplets size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Watering</Text>
                                <Text className="text-blue-50 text-xs font-medium leading-5">Check soil moisture before watering to avoid rot.</Text>
                            </View>
                        </View>

                        {/* Temp Card */}
                        <View className="w-44 h-56 bg-red-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-6">
                                <Thermometer size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Thermometer size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Temperature</Text>
                                <Text className="text-red-50 text-xs font-medium leading-5">Keep plants away from cold drafts and heaters.</Text>
                            </View>
                        </View>

                        {/* Humidity Card */}
                        <View className="w-44 h-56 bg-cyan-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                                <CloudRain size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <CloudRain size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Humidity</Text>
                                <Text className="text-cyan-50 text-xs font-medium leading-5">Tropical plants thrive in 40-60% humidity.</Text>
                            </View>
                        </View>

                        {/* Soil Card */}
                        <View className="w-44 h-56 bg-stone-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform -rotate-6">
                                <Layers size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Layers size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Soil</Text>
                                <Text className="text-stone-50 text-xs font-medium leading-5">Use well-draining potting mix for best results.</Text>
                            </View>
                        </View>

                        {/* Fertilizer Card */}
                        <View className="w-44 h-56 bg-green-600 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-45">
                                <Sprout size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Sprout size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Fertilizer</Text>
                                <Text className="text-green-50 text-xs font-medium leading-5">Feed monthly during spring and summer.</Text>
                            </View>
                        </View>

                        {/* Pruning Card */}
                        <View className="w-44 h-56 bg-teal-600 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform -rotate-45">
                                <Scissors size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Scissors size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Pruning</Text>
                                <Text className="text-teal-50 text-xs font-medium leading-5">Trim dead leaves to encourage new growth.</Text>
                            </View>
                        </View>

                        {/* Pests Card */}
                        <View className="w-44 h-56 bg-rose-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                                <Bug size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Bug size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Pests</Text>
                                <Text className="text-rose-50 text-xs font-medium leading-5">Check undersides of leaves for bugs regularly.</Text>
                            </View>
                        </View>

                        {/* Repotting Card */}
                        <View className="w-44 h-56 bg-indigo-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-180">
                                <RefreshCcw size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <RefreshCcw size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Repotting</Text>
                                <Text className="text-indigo-50 text-xs font-medium leading-5">Repot every 1-2 years when roots crowd.</Text>
                            </View>
                        </View>

                        {/* Airflow Card */}
                        <View className="w-44 h-56 bg-sky-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-sm">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-6">
                                <Wind size={120} color="white" />
                            </View>
                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Wind size={24} color="white" />
                            </View>
                            <View>
                                <Text className="font-bold text-white text-lg mb-2">Airflow</Text>
                                <Text className="text-sky-50 text-xs font-medium leading-5">Ensure good air circulation to prevent mold.</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
