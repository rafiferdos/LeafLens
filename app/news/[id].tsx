import { View, Image, ScrollView, TouchableOpacity, Linking, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Article, getArticleById } from '@/services/news';
import { ArrowLeft, ExternalLink, Clock, Share2 } from 'lucide-react-native';
import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function NewsDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [article, setArticle] = useState<Article | undefined>(undefined);
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        if (id) {
            const found = getArticleById(id);
            setArticle(found);
        }
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getReadTime = (content: string | null) => {
        if (!content) return '1 min read';
        const words = content.split(' ').length;
        const mins = Math.ceil(words / 200);
        return `${mins} min read`;
    };

    if (!article) {
        return (
            <View className="flex-1 bg-background items-center justify-center px-6">
                <Stack.Screen options={{ headerShown: false }} />
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-14 left-6"
                >
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text className="text-6xl mb-6">📰</Text>
                <Text className="text-xl font-bold text-foreground mb-2">Article Not Found</Text>
                <Text className="text-muted-foreground text-center">
                    This article may have been removed.
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Floating Header */}
            <Animated.View
                entering={FadeIn.delay(300)}
                className="absolute top-0 left-0 right-0 z-10"
            >
                <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="pt-12 pb-4 px-6">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 rounded-full bg-secondary/80 items-center justify-center"
                        >
                            <ArrowLeft size={20} color={theme.colors.text} />
                        </TouchableOpacity>

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                className="w-10 h-10 rounded-full bg-secondary/80 items-center justify-center"
                            >
                                <Share2 size={18} color={theme.colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => Linking.openURL(article.url)}
                                className="w-10 h-10 rounded-full bg-primary items-center justify-center"
                            >
                                <ExternalLink size={18} color={isDark ? '#000' : '#fff'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Animated.View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {/* Hero Image */}
                {article.urlToImage && (
                    <Image
                        source={{ uri: article.urlToImage }}
                        style={{ width, height: width * 0.7 }}
                        className="bg-muted"
                        resizeMode="cover"
                    />
                )}

                {/* Article Content */}
                <Animated.View
                    entering={FadeInUp.duration(500).springify()}
                    className={`px-6 ${article.urlToImage ? '-mt-8' : 'mt-24'}`}
                >
                    <View className={`bg-background ${article.urlToImage ? 'rounded-t-[28px] pt-8' : ''}`}>

                        {/* Source Badge */}
                        <View className="flex-row items-center gap-3 mb-5">
                            <View className="bg-primary px-3 py-1.5 rounded-full">
                                <Text className="text-primary-foreground text-xs font-bold">
                                    {article.source.name}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Clock size={12} color={theme.colors.text} style={{ opacity: 0.5 }} />
                                <Text className="text-muted-foreground text-xs">
                                    {getReadTime(article.content)}
                                </Text>
                            </View>
                        </View>

                        {/* Title */}
                        <Text
                            style={{ fontFamily: 'Kablammo_400Regular' }}
                            className="text-3xl text-foreground mb-4 leading-[44px]"
                        >
                            {article.title}
                        </Text>

                        {/* Meta Info */}
                        <View className="flex-row items-center gap-4 pb-6 mb-6 border-b border-border/30">
                            {article.author && (
                                <Text className="text-sm text-foreground">
                                    By <Text className="font-bold">{article.author}</Text>
                                </Text>
                            )}
                            <Text className="text-sm text-muted-foreground">
                                {formatDate(article.publishedAt)}
                            </Text>
                        </View>

                        {/* Description - Lead paragraph */}
                        {article.description && (
                            <Text className="text-xl leading-9 text-foreground mb-8 font-medium">
                                {article.description}
                            </Text>
                        )}

                        {/* Content */}
                        {article.content && (
                            <Text className="text-lg leading-8 text-muted-foreground mb-8">
                                {article.content.replace(/\[\+\d+ chars\]/, '').trim()}
                            </Text>
                        )}

                        {/* Continue Reading CTA */}
                        <View className="bg-secondary/30 rounded-2xl p-6 border border-border/30">
                            <Text className="text-sm text-muted-foreground mb-3">
                                Continue reading on {article.source.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => Linking.openURL(article.url)}
                                className="bg-foreground py-4 rounded-xl flex-row items-center justify-center gap-2"
                            >
                                <Text className="text-background font-bold">Read Full Article</Text>
                                <ExternalLink size={16} color={isDark ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>

                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
