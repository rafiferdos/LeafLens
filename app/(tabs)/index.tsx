import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ScanLine, Leaf, RefreshCcw, ArrowRight, Sun, Droplets, Thermometer, Search, AlertCircle, CheckCircle, Smartphone, Globe, User } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { NAV_THEME, THEME } from '@/lib/theme';
import { useLanguage } from '@/lib/language';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFocusEffect, useRouter } from 'expo-router';
import { diseaseDatabase, DiseaseData } from '@/lib/disease-data';

// IMPORTANT: For Android Emulator, use 'http://10.0.2.2:8000'
// For Physical Device, use your computer's IP address (e.g., 'http://192.168.1.5:8000')
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export default function HomeScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    const [userName, setUserName] = useState<string | null>(null);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            setAnimationKey(prev => prev + 1);
            loadUserProfile();
        }, [])
    );

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

        setIsAnalyzing(true);
        try {
            const imageUri = Platform.OS === 'android' ? selectedImage : selectedImage.replace('file://', '');
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                name: 'photo.jpg',
                type: 'image/jpeg',
            } as any);

            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Analysis failed: ' + errorText);
            }

            const data = await response.json();
            setResult(data);
            saveToHistory(data, selectedImage);

        } catch (error) {
            console.error('Analysis error:', error);
            Alert.alert('Connection Error', 'Could not connect to analysis server.\n\nRunning on device? Change API_URL to your PC IP.');
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

                    {/* 2. Main Scanner Card */}
                    <View className="mx-6 bg-secondary/30 rounded-[32px] p-6 border border-border/50 shadow-sm mb-8">
                        <View className="flex-row items-center gap-2 mb-2">
                            <ScanLine size={24} color={theme.colors.primary} />
                            <Text className="font-bold text-xl">{t('aiPowered')}</Text>
                        </View>

                        {!selectedImage ? (
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

                                {/* Headlines */}
                                <Text className="text-center font-black text-2xl text-foreground mb-2">
                                    Check Plant Health
                                </Text>
                                <Text className="text-center text-muted-foreground text-base px-2 mb-8 leading-6">
                                    Take a photo of any leaf to instantly identify potential diseases and get treatment tips.
                                </Text>

                                {/* Action Buttons */}
                                <View className="w-full gap-4">
                                    <Button
                                        className="w-full h-16 rounded-2xl shadow-lg bg-primary active:scale-95 transition-all"
                                        onPress={openCamera}
                                    >
                                        <Camera size={24} color="white" className="mr-3" />
                                        <Text className="text-white text-lg font-bold">Take Photo</Text>
                                    </Button>

                                    <Button
                                        className="w-full h-16 rounded-2xl border-2 border-border/50 bg-background/50 active:scale-95 transition-all"
                                        variant="outline"
                                        onPress={pickImage}
                                    >
                                        <ImageIcon size={24} color={theme.colors.text} className="mr-3" />
                                        <Text className="text-foreground text-lg font-semibold">Select from Gallery</Text>
                                    </Button>
                                </View>
                            </View>
                        ) : (
                            // Scan Result View (Embedded)
                            <View className="gap-4">
                                <View className="rounded-[24px] overflow-hidden bg-black/5 h-80 border border-border/50 relative shadow-inner">
                                    <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="cover" />
                                    {!result && !isAnalyzing && (
                                        <TouchableOpacity onPress={resetScan} className="absolute top-4 right-4 bg-black/50 p-2.5 rounded-full backdrop-blur-md">
                                            <RefreshCcw size={20} color="white" />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {!result ? (
                                    <View className="gap-3 mt-2">
                                        <Button size="lg" className="w-full h-14 rounded-2xl" onPress={handleAnalyze} disabled={isAnalyzing}>
                                            {isAnalyzing ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <>
                                                    <Search size={20} color="white" className="mr-2" />
                                                    <Text className="text-white font-bold text-lg">{t('diagnoseInstantly')}</Text>
                                                </>
                                            )}
                                        </Button>
                                        <Button variant="ghost" className="h-12" onPress={resetScan} disabled={isAnalyzing}>
                                            <Text className="text-muted-foreground font-medium">Remove Image</Text>
                                        </Button>
                                    </View>
                                ) : (
                                    <Animated.View entering={FadeInUp.duration(600).springify()} className="gap-6 mt-4">

                                        {/* Status & Name Header */}
                                        <View className="items-center mb-2">
                                            <View className={cn(
                                                "flex-row items-center gap-2 px-6 py-2 rounded-full border mb-4",
                                                result.class.toLowerCase() === 'healthy'
                                                    ? "bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800"
                                                    : "bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800"
                                            )}>
                                                {result.class.toLowerCase() === 'healthy' ? (
                                                    <CheckCircle size={16} color="#15803d" />
                                                ) : (
                                                    <AlertCircle size={16} color="#b91c1c" />
                                                )}
                                                <Text className={cn(
                                                    "font-bold uppercase tracking-widest text-xs",
                                                    result.class.toLowerCase() === 'healthy' ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                                                )}>
                                                    {result.class.toLowerCase() === 'healthy' ? "Healthy Plant" : "Disease Detected"}
                                                </Text>
                                            </View>

                                            <Text className="text-3xl font-black text-center text-foreground capitalize mb-1 leading-8">
                                                {result.class.replace(/([A-Z])/g, ' $1').trim()}
                                            </Text>

                                            <Text className="text-muted-foreground font-medium text-sm">
                                                Confidence: {(result.confidence * 100).toFixed(0)}% Match
                                            </Text>
                                        </View>

                                        {/* Main Info Card */}
                                        {getDiseaseInfo(result.class) && (
                                            <View className="gap-4">
                                                {/* Description */}
                                                <View className="bg-background/80 p-5 rounded-3xl border border-border/50 shadow-sm">
                                                    <View className="flex-row items-center gap-3 mb-3 pb-3 border-b border-border/10">
                                                        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                                                            <ScanLine size={16} color={theme.colors.primary} />
                                                        </View>
                                                        <Text className="font-bold text-base text-foreground">Overview</Text>
                                                    </View>
                                                    <Text className="text-muted-foreground leading-6">
                                                        {getDiseaseInfo(result.class)?.description}
                                                    </Text>
                                                </View>

                                                {/* Details Grid */}
                                                {result.class.toLowerCase() !== 'healthy' && (
                                                    <View className="flex-row items-start gap-4">
                                                        <View className="flex-1 bg-background/80 p-5 rounded-3xl border border-border/50 shadow-sm min-h-[160px]">
                                                            <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mb-3">
                                                                <AlertCircle size={20} color="#f97316" />
                                                            </View>
                                                            <Text className="font-bold text-sm mb-2 opacity-80">Symptoms</Text>
                                                            <View className="gap-1.5">
                                                                {getDiseaseInfo(result.class)?.symptoms.slice(0, 2).map((s, i) => (
                                                                    <Text key={i} className="text-[11px] text-muted-foreground leading-4" numberOfLines={2}>• {s}</Text>
                                                                ))}
                                                            </View>
                                                        </View>

                                                        <View className="flex-1 bg-background/80 p-5 rounded-3xl border border-border/50 shadow-sm min-h-[160px]">
                                                            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-3">
                                                                <Droplets size={20} color="#3b82f6" />
                                                            </View>
                                                            <Text className="font-bold text-sm mb-2 opacity-80">Treatment</Text>
                                                            <View className="gap-1.5">
                                                                {getDiseaseInfo(result.class)?.control.slice(0, 2).map((c, i) => (
                                                                    <Text key={i} className="text-[11px] text-muted-foreground leading-4" numberOfLines={2}>• {c}</Text>
                                                                ))}
                                                            </View>
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {/* Action Buttons */}
                                        <View className="gap-3 mt-2">
                                            <Button
                                                className="h-14 rounded-2xl shadow-sm bg-foreground"
                                                onPress={() => { const link = getDiseaseInfo(result.class)?.link; if (link) Linking.openURL(link); }}
                                            >
                                                <Globe size={18} color={theme.colors.background} className="mr-2" />
                                                <Text className="text-background font-bold text-base">Read Full Guide</Text>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                className="h-14 rounded-2xl border-border/50 bg-transparent"
                                                onPress={resetScan}
                                            >
                                                <RefreshCcw size={18} className="mr-2" color={theme.colors.text} />
                                                <Text className="text-muted-foreground font-medium">Analyze Another Plant</Text>
                                            </Button>
                                        </View>

                                    </Animated.View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* 3. Plant Care Essentials Section */}
                    <Text className="text-xl font-bold text-foreground mb-4 opacity-90 px-6">{t('plantCareEssentials')}</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 16, paddingBottom: 24 }}
                        className="-mx-6"
                    >
                        {/* Sunlight */}
                        <View className="w-40 bg-orange-100/50 dark:bg-orange-900/20 p-5 rounded-[24px] items-center gap-3 border border-orange-200/50">
                            <View className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-full items-center justify-center">
                                <Sun size={24} color="#f97316" />
                            </View>
                            <Text className="font-bold text-sm text-center">{t('sunlight')}</Text>
                            <Text className="text-xs text-center text-muted-foreground leading-4">{t('sunlightTip')}</Text>
                        </View>
                        {/* Watering */}
                        <View className="w-40 bg-blue-100/50 dark:bg-blue-900/20 p-5 rounded-[24px] items-center gap-3 border border-blue-200/50">
                            <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full items-center justify-center">
                                <Droplets size={24} color="#3b82f6" />
                            </View>
                            <Text className="font-bold text-sm text-center">{t('watering')}</Text>
                            <Text className="text-xs text-center text-muted-foreground leading-4">{t('wateringTip')}</Text>
                        </View>
                        {/* Temp */}
                        <View className="w-40 bg-red-100/50 dark:bg-red-900/20 p-5 rounded-[24px] items-center gap-3 border border-red-200/50">
                            <View className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full items-center justify-center">
                                <Thermometer size={24} color="#ef4444" />
                            </View>
                            <Text className="font-bold text-sm text-center">{t('temp')}</Text>
                            <Text className="text-xs text-center text-muted-foreground leading-4">{t('tempTip')}</Text>
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
