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
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];

    const loadNews = async () => {
        setLoading(true);
        const data = await fetchEggplantNews();
        setArticles(data);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNews();
        setRefreshing(false);
    };

    useEffect(() => {
        loadNews();
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
                <Text className="text-muted-foreground text-base">
                    Latest updates from the purple world
                </Text>
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
