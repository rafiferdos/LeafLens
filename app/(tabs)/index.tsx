import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ScanLine, Leaf, RefreshCcw, ArrowRight, Sun, Droplets, Thermometer, Search, AlertCircle, CheckCircle, Smartphone, Globe, User, ChevronRight, Stethoscope, Sprout, Pill } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { NAV_THEME, THEME } from '@/lib/theme';
import { useLanguage } from '@/lib/language';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { diseaseDatabase, DiseaseData } from '@/lib/disease-data';

// IMPORTANT: For Android Emulator, use 'http://10.0.2.2:8000'
// For Physical Device, use your computer's IP address (e.g., 'http://192.168.1.5:8000')
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export default function HomeScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'symptoms' | 'treatment'>('overview');

    const [userName, setUserName] = useState<string | null>(null);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setAnimationKey(prev => prev + 1);
            loadUserProfile();
        });
        return unsubscribe;
    }, [navigation]);

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
            setActiveTab('overview');
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
            setActiveTab('overview');
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
        setActiveTab('overview');
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
                            // ===========================================
                            // NEW RESULT DESIGN STARTS HERE
                            // ===========================================
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
                                            /* Actual Result Content */
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

                                                {/* TABS */}
                                                <View className="flex-row bg-secondary/50 p-1 rounded-xl mb-6">
                                                    <TouchableOpacity
                                                        onPress={() => setActiveTab('overview')}
                                                        className={cn("flex-1 py-2 items-center rounded-lg transition-all", activeTab === 'overview' && "bg-background shadow-sm")}
                                                    >
                                                        <Text className={cn("font-bold text-xs", activeTab === 'overview' ? "text-foreground" : "text-muted-foreground")}>Overview</Text>
                                                    </TouchableOpacity>

                                                    {result.class.toLowerCase() !== 'healthy' && (
                                                        <>
                                                            <TouchableOpacity
                                                                onPress={() => setActiveTab('symptoms')}
                                                                className={cn("flex-1 py-2 items-center rounded-lg transition-all", activeTab === 'symptoms' && "bg-background shadow-sm")}
                                                            >
                                                                <Text className={cn("font-bold text-xs", activeTab === 'symptoms' ? "text-foreground" : "text-muted-foreground")}>Symptoms</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                onPress={() => setActiveTab('treatment')}
                                                                className={cn("flex-1 py-2 items-center rounded-lg transition-all", activeTab === 'treatment' && "bg-background shadow-sm")}
                                                            >
                                                                <Text className={cn("font-bold text-xs", activeTab === 'treatment' ? "text-foreground" : "text-muted-foreground")}>Cure</Text>
                                                            </TouchableOpacity>
                                                        </>
                                                    )}
                                                </View>

                                                {/* CONTENT AREA */}
                                                <View className="min-h-[120px]">
                                                    {activeTab === 'overview' && (
                                                        <Animated.View entering={FadeInDown.duration(300)}>
                                                            <View className="flex-row gap-3 mb-2">
                                                                <Sprout size={18} color={theme.colors.primary} />
                                                                <Text className="font-bold">About this condition</Text>
                                                            </View>
                                                            <Text className="text-muted-foreground leading-6 text-sm">
                                                                {getDiseaseInfo(result.class)?.description || "No description available."}
                                                            </Text>
                                                        </Animated.View>
                                                    )}

                                                    {activeTab === 'symptoms' && (
                                                        <Animated.View entering={FadeInDown.duration(300)}>
                                                            <View className="flex-row gap-3 mb-2">
                                                                <Stethoscope size={18} color="#f97316" />
                                                                <Text className="font-bold">Common Symptoms</Text>
                                                            </View>
                                                            <View className="gap-2">
                                                                {getDiseaseInfo(result.class)?.symptoms.map((s, i) => (
                                                                    <View key={i} className="flex-row gap-2">
                                                                        <View className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                                                                        <Text className="text-muted-foreground text-sm flex-1">{s}</Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        </Animated.View>
                                                    )}

                                                    {activeTab === 'treatment' && (
                                                        <Animated.View entering={FadeInDown.duration(300)}>
                                                            <View className="flex-row gap-3 mb-2">
                                                                <Pill size={18} color="#3b82f6" />
                                                                <Text className="font-bold">Recommended Treatment</Text>
                                                            </View>
                                                            <View className="gap-2">
                                                                {getDiseaseInfo(result.class)?.control.map((s, i) => (
                                                                    <View key={i} className="flex-row gap-2">
                                                                        <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5" />
                                                                        <Text className="text-muted-foreground text-sm flex-1">{s}</Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        </Animated.View>
                                                    )}
                                                </View>

                                                {getDiseaseInfo(result.class)?.link && (
                                                    <TouchableOpacity
                                                        onPress={() => { const link = getDiseaseInfo(result.class)?.link; if (link) Linking.openURL(link); }}
                                                        className="flex-row items-center justify-center gap-2 mt-6 py-3 border-t border-border/50"
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
                        className="-mx-6"
                    >
                        {/* Sunlight Card */}
                        <View className="w-44 h-56 bg-orange-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-lg shadow-orange-500/40">
                            {/* Background Pattern */}
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                                <Sun size={120} color="white" />
                            </View>

                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Sun size={24} color="white" />
                            </View>

                            <View>
                                <Text className="font-bold text-white text-lg mb-2">{t('sunlight')}</Text>
                                <Text className="text-orange-50 text-xs font-medium leading-5">
                                    {t('sunlightTip')}
                                </Text>
                            </View>
                        </View>

                        {/* Watering Card */}
                        <View className="w-44 h-56 bg-blue-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-lg shadow-blue-500/40">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform -rotate-12">
                                <Droplets size={120} color="white" />
                            </View>

                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Droplets size={24} color="white" />
                            </View>

                            <View>
                                <Text className="font-bold text-white text-lg mb-2">{t('watering')}</Text>
                                <Text className="text-blue-50 text-xs font-medium leading-5">
                                    {t('wateringTip')}
                                </Text>
                            </View>
                        </View>

                        {/* Temp Card */}
                        <View className="w-44 h-56 bg-red-500 rounded-[32px] p-6 justify-between relative overflow-hidden shadow-lg shadow-red-500/40">
                            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-6">
                                <Thermometer size={120} color="white" />
                            </View>

                            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center backdrop-blur-md">
                                <Thermometer size={24} color="white" />
                            </View>

                            <View>
                                <Text className="font-bold text-white text-lg mb-2">{t('temp')}</Text>
                                <Text className="text-red-50 text-xs font-medium leading-5">
                                    {t('tempTip')}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
