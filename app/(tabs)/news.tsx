import { View, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { fetchNews, fetchMoreNews, clearNewsCache, hasMoreNews, Article, NewsCategory, NewsLanguage, NewsCountry } from '@/services/news';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NAV_THEME, THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { useLanguage } from '@/lib/language';
import { Calendar, User, Utensils, HeartPulse, Sparkles, Globe, MapPin, Languages, ChevronDown, Check } from 'lucide-react-native';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Category options
const CATEGORIES: { key: NewsCategory; icon: any; label: string }[] = [
    { key: 'food', icon: Utensils, label: 'Food' },
    { key: 'health', icon: HeartPulse, label: 'Health' },
    { key: 'lifestyle', icon: Sparkles, label: 'Lifestyle' },
];

// Language options (local filter, not global app language)
const NEWS_LANGUAGES: { code: NewsLanguage; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ur', label: 'Urdu', native: 'اردو' },
];

// Country options
const NEWS_COUNTRIES: { code: NewsCountry; label: string; flag: string }[] = [
    { code: 'in', label: 'India', flag: '🇮🇳' },
    { code: 'pk', label: 'Pakistan', flag: '🇵🇰' },
    { code: 'bd', label: 'Bangladesh', flag: '🇧🇩' },
];

export default function NewsScreen() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Local filters (NOT global app language)
    const [category, setCategory] = useState<NewsCategory>('food');
    const [newsLanguage, setNewsLanguage] = useState<NewsLanguage>('en');
    const [country, setCountry] = useState<NewsCountry>('bd');

    // Dialogs
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);
    const [showCountryDialog, setShowCountryDialog] = useState(false);

    const [animationKey, setAnimationKey] = useState(0);

    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const { t } = useLanguage(); // Global app translations (NOT affected by news filter)

    // Get current selections for display
    const currentLang = NEWS_LANGUAGES.find(l => l.code === newsLanguage) || NEWS_LANGUAGES[0];
    const currentCountry = NEWS_COUNTRIES.find(c => c.code === country) || NEWS_COUNTRIES[0];

    useFocusEffect(
        useCallback(() => {
            setAnimationKey(prev => prev + 1);
        }, [])
    );

    // Initial load
    const loadInitialNews = async () => {
        setLoading(true);
        const news = await fetchNews(category, newsLanguage, country);
        setArticles(news);
        setLoading(false);
    };

    // Load more (infinite scroll)
    const loadMoreNews = async () => {
        if (loadingMore || !hasMoreNews(category, newsLanguage, country)) return;

        setLoadingMore(true);
        const allArticles = await fetchMoreNews(category, newsLanguage, country);
        setArticles(allArticles);
        setLoadingMore(false);
    };

    // Pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        clearNewsCache(category, newsLanguage, country);
        const news = await fetchNews(category, newsLanguage, country);
        setArticles(news);
        setRefreshing(false);
    };

    // Reload when any filter changes
    useEffect(() => {
        loadInitialNews();
    }, [category, newsLanguage, country]);

    // Filter change handlers
    const handleCategoryChange = (newCategory: NewsCategory) => {
        if (newCategory === category) return;
        setCategory(newCategory);
        setAnimationKey(prev => prev + 1);
    };

    const handleLanguageChange = (newLanguage: NewsLanguage) => {
        if (newLanguage === newsLanguage) return;
        setNewsLanguage(newLanguage);
        setShowLanguageDialog(false);
        setAnimationKey(prev => prev + 1);
    };

    const handleCountryChange = (newCountry: NewsCountry) => {
        if (newCountry === country) return;
        setCountry(newCountry);
        setShowCountryDialog(false);
        setAnimationKey(prev => prev + 1);
    };

    const renderItem = ({ item, index }: { item: Article; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(Math.min(index * 50, 300)).springify()}
            className="mb-4"
        >
            <TouchableOpacity
                onPress={() => router.push({ pathname: '/news/[id]', params: { id: item.id } })}
                className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm"
                activeOpacity={0.9}
            >
                {item.urlToImage && (
                    <Image
                        source={{ uri: item.urlToImage }}
                        className="w-full h-48 bg-muted"
                        resizeMode="cover"
                    />
                )}
                <View className="p-4 gap-2">
                    {item.source.name && (
                        <View className="flex-row justify-between items-start">
                            <Text className="text-xs font-bold text-primary uppercase tracking-wider">
                                {item.source.name}
                            </Text>
                            <View className="flex-row items-center gap-1">
                                <Calendar size={12} color={THEME[colorScheme ?? 'light'].mutedForeground} />
                                <Text className="text-xs text-muted-foreground">
                                    {new Date(item.publishedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    )}

                    <Text className="text-lg font-bold leading-6" numberOfLines={2}>
                        {item.title}
                    </Text>

                    {item.description && (
                        <Text className="text-muted-foreground text-sm" numberOfLines={3}>
                            {item.description}
                        </Text>
                    )}

                    {item.author && (
                        <View className="flex-row items-center gap-1 mt-2">
                            <User size={12} color={THEME[colorScheme ?? 'light'].mutedForeground} />
                            <Text className="text-xs text-muted-foreground italic">
                                {item.author}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const ListFooter = () => {
        if (loadingMore) {
            return (
                <View className="py-6 items-center">
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text className="text-muted-foreground text-sm mt-2">{t('loadingMore')}</Text>
                </View>
            );
        }
        if (!hasMoreNews(category, newsLanguage, country) && articles.length > 0) {
            return (
                <View className="py-6 items-center">
                    <Text className="text-muted-foreground text-sm">No more articles</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-6 pt-2 pb-4">
                {/* Header */}
                <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-3xl font-bold text-foreground mb-1">
                    {t('eggplantNews')}
                </Text>
                <Text className="text-muted-foreground text-base mb-4">
                    {t('latestUpdates')}
                </Text>

                {/* Filter Dropdowns Row */}
                <View className="flex-row gap-2 mb-3">
                    {/* Language Dropdown */}
                    <TouchableOpacity
                        onPress={() => setShowLanguageDialog(true)}
                        className="flex-row items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full border border-border/50 flex-1"
                    >
                        <Languages size={14} color={theme.colors.primary} />
                        <Text className="text-xs font-medium text-foreground flex-1" numberOfLines={1}>{currentLang.native}</Text>
                        <ChevronDown size={12} color={theme.colors.text} />
                    </TouchableOpacity>

                    {/* Country Dropdown */}
                    <TouchableOpacity
                        onPress={() => setShowCountryDialog(true)}
                        className="flex-row items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full border border-border/50 flex-1"
                    >
                        <MapPin size={14} color={theme.colors.primary} />
                        <Text className="text-xs font-medium text-foreground flex-1" numberOfLines={1}>{currentCountry.flag} {currentCountry.label}</Text>
                        <ChevronDown size={12} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Category Filter */}
                <View className="flex-row gap-2">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = category === cat.key;
                        return (
                            <TouchableOpacity
                                key={cat.key}
                                className={`flex-row items-center gap-2 px-4 py-2 rounded-full flex-1 justify-center ${isActive
                                    ? 'bg-primary'
                                    : 'bg-muted border border-border/50'
                                    }`}
                                onPress={() => handleCategoryChange(cat.key)}
                            >
                                <Icon
                                    size={14}
                                    color={isActive ? '#fff' : theme.colors.text}
                                />
                                <Text className={`font-bold text-xs ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                                    }`}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text className="text-muted-foreground mt-4">{t('loading')}</Text>
                </View>
            ) : (
                <FlatList
                    key={`${animationKey}-${category}-${newsLanguage}-${country}`}
                    data={articles}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                    onEndReached={loadMoreNews}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={<ListFooter />}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-4xl mb-4">📰</Text>
                            <Text className="text-muted-foreground text-center">{t('noNewsFound')}</Text>
                        </View>
                    }
                />
            )}

            {/* Language Selector Dialog */}
            <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
                <DialogContent className="sm:max-w-[300px]">
                    <DialogHeader>
                        <DialogTitle>Select Language</DialogTitle>
                    </DialogHeader>
                    <View className="gap-2 mt-4">
                        {NEWS_LANGUAGES.map((lang) => {
                            const isActive = newsLanguage === lang.code;
                            return (
                                <TouchableOpacity
                                    key={lang.code}
                                    onPress={() => handleLanguageChange(lang.code)}
                                    className={`p-4 rounded-xl border flex-row justify-between items-center ${isActive
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-secondary/30 border-border'
                                        }`}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <Languages size={18} color={isActive ? theme.colors.primary : theme.colors.text} />
                                        <View>
                                            <Text className={`font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                                {lang.native}
                                            </Text>
                                            <Text className="text-muted-foreground text-xs">{lang.label}</Text>
                                        </View>
                                    </View>
                                    {isActive && (
                                        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                                            <Check size={14} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </DialogContent>
            </Dialog>

            {/* Country Selector Dialog */}
            <Dialog open={showCountryDialog} onOpenChange={setShowCountryDialog}>
                <DialogContent className="sm:max-w-[300px]">
                    <DialogHeader>
                        <DialogTitle>Select Country</DialogTitle>
                    </DialogHeader>
                    <View className="gap-2 mt-4">
                        {NEWS_COUNTRIES.map((c) => {
                            const isActive = country === c.code;
                            return (
                                <TouchableOpacity
                                    key={c.code}
                                    onPress={() => handleCountryChange(c.code)}
                                    className={`p-4 rounded-xl border flex-row justify-between items-center ${isActive
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-secondary/30 border-border'
                                        }`}
                                >
                                    <View className="flex-row items-center gap-3">
                                        <Text className="text-2xl">{c.flag}</Text>
                                        <Text className={`font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                            {c.label}
                                        </Text>
                                    </View>
                                    {isActive && (
                                        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                                            <Check size={14} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </DialogContent>
            </Dialog>
        </SafeAreaView>
    );
}
