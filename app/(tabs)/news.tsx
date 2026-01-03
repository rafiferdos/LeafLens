import { View, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { fetchNews, fetchMoreNews, clearNewsCache, hasMoreNews, Article } from '@/services/news';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NAV_THEME, THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { useLanguage } from '@/lib/language';
import { Calendar, User, Globe } from 'lucide-react-native';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function NewsScreen() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [showLanguageDialog, setShowLanguageDialog] = useState(false);

    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const { language, setLanguage, t, languageOptions, currentLanguageOption } = useLanguage();

    useFocusEffect(
        useCallback(() => {
            setAnimationKey(prev => prev + 1);
        }, [])
    );

    // Initial load
    const loadInitialNews = async () => {
        setLoading(true);
        const news = await fetchNews(language);
        setArticles(news);
        setLoading(false);
    };

    // Load more (infinite scroll)
    const loadMoreNews = async () => {
        if (loadingMore || !hasMoreNews(language)) return;

        setLoadingMore(true);
        const allArticles = await fetchMoreNews(language);
        setArticles(allArticles);
        setLoadingMore(false);
    };

    // Pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        clearNewsCache(language);
        const news = await fetchNews(language);
        setArticles(news);
        setRefreshing(false);
    };

    // Reload when language changes
    useEffect(() => {
        loadInitialNews();
    }, [language]);

    const handleLanguageChange = (langCode: string) => {
        setLanguage(langCode as any);
        setShowLanguageDialog(false);
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
        if (!hasMoreNews(language) && articles.length > 0) {
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
                <View className="flex-row justify-between items-center">
                    <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-3xl font-bold text-foreground">
                        {t('eggplantNews')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => setShowLanguageDialog(true)}
                        className="flex-row items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full"
                    >
                        <Globe size={16} color={theme.colors.primary} />
                        <Text className="text-sm font-medium text-foreground">{currentLanguageOption.nativeName}</Text>
                    </TouchableOpacity>
                </View>
                <Text className="text-muted-foreground text-base mb-4">
                    {t('latestUpdates')}
                </Text>

                {/* View Options */}
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        className="bg-primary px-4 py-2 rounded-full"
                        onPress={() => { }}
                    >
                        <Text className="text-primary-foreground font-bold text-xs">{t('latest')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-muted px-4 py-2 rounded-full border border-border/50"
                        onPress={() => { }}
                    >
                        <Text className="text-muted-foreground font-medium text-xs">{t('popular')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text className="text-muted-foreground mt-4">{t('loading')}</Text>
                </View>
            ) : (
                <FlatList
                    key={`${animationKey}-${language}`}
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
                        <DialogTitle>{t('selectLanguage')}</DialogTitle>
                    </DialogHeader>
                    <View className="gap-2 mt-4">
                        {languageOptions.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleLanguageChange(lang.code)}
                                className={`p-4 rounded-xl border ${language === lang.code
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-secondary/30 border-border'}`}
                            >
                                <View className="flex-row justify-between items-center">
                                    <View>
                                        <Text className={`font-bold ${language === lang.code ? 'text-primary' : 'text-foreground'}`}>
                                            {lang.nativeName}
                                        </Text>
                                        <Text className="text-muted-foreground text-xs">{lang.name}</Text>
                                    </View>
                                    {language === lang.code && (
                                        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                                            <Text className="text-white text-xs">✓</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </DialogContent>
            </Dialog>
        </SafeAreaView>
    );
}
