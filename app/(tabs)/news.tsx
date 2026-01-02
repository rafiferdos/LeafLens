import { View, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { fetchEggplantNews, Article } from '@/services/news';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NAV_THEME, THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { Calendar, User } from 'lucide-react-native';

export default function NewsScreen() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];

    const loadNews = async (pageNum: number, shouldRefresh: boolean = false) => {
        if (pageNum === 1) setLoading(true);

        // Pass page and limit (10)
        const newArticles = await fetchEggplantNews(pageNum, 10);

        if (shouldRefresh) {
            setArticles(newArticles);
        } else {
            setArticles(prev => [...prev, ...newArticles]);
        }

        setHasMore(newArticles.length === 10); // Assume more if we got a full page
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await loadNews(1, true);
        setRefreshing(false);
    };

    const onLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadNews(nextPage);
        }
    };

    useEffect(() => {
        loadNews(1, true);
    }, []);

    const renderItem = ({ item, index }: { item: Article; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
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

                    <Text className="text-lg font-bold leading-6" numberOfLines={2}>
                        {item.title}
                    </Text>

                    <Text className="text-muted-foreground text-sm" numberOfLines={3}>
                        {item.description}
                    </Text>

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

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <View className="px-6 pt-2 pb-4">
                <Text style={{ fontFamily: 'Kablammo_400Regular' }} className="text-3xl font-bold text-foreground">
                    Eggplant News
                </Text>
                <Text className="text-muted-foreground text-base mb-4">
                    Latest updates from the purple world
                </Text>

                {/* View Options */}
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        className="bg-primary px-4 py-2 rounded-full"
                        onPress={() => { }} // Could hook up to sort logic later
                    >
                        <Text className="text-primary-foreground font-bold text-xs">Latest</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-muted px-4 py-2 rounded-full border border-border/50"
                        onPress={() => { }}
                    >
                        <Text className="text-muted-foreground font-medium text-xs">Popular</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={articles}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    loading && articles.length > 0 ? (
                        <View className="py-4">
                            <Text className="text-center text-muted-foreground text-sm">Loading more...</Text>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    !loading ? (
                        <View className="items-center justify-center py-20">
                            <Text className="text-muted-foreground text-center">No news found.</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}
