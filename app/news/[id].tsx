import { View, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Article, getArticleById } from '@/services/news';
import { ArrowLeft, Calendar, ExternalLink, Share2, User } from 'lucide-react-native';
import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NewsDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [article, setArticle] = useState<Article | undefined>(undefined);
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];

    useEffect(() => {
        if (id) {
            getArticleById(id).then(setArticle);
        }
    }, [id]);

    if (!article) {
        return (
            <SafeAreaView className="flex-1 bg-background items-center justify-center">
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Image */}
                <View className="relative">
                    <Image
                        source={{ uri: article.urlToImage || 'https://via.placeholder.com/800x600' }}
                        className="w-full h-80 bg-muted"
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-12 left-4 w-10 h-10 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
                    >
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <Animated.View
                    entering={FadeInDown.duration(600).springify()}
                    className="px-6 -mt-12 pt-8 bg-background rounded-t-[40px] flex-1"
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="bg-primary/10 px-3 py-1 rounded-full">
                            <Text className="text-primary text-xs font-bold uppercase">
                                {article.source.name}
                            </Text>
                        </View>
                        <Text className="text-muted-foreground text-xs font-medium">
                            {new Date(article.publishedAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>

                    <Text className="text-2xl font-bold text-foreground mb-4 leading-8">
                        {article.title}
                    </Text>

                    {article.author && (
                        <View className="flex-row items-center gap-2 mb-6 border-b border-border/50 pb-6">
                            <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
                                <User size={16} color={theme.colors.text} />
                            </View>
                            <Text className="text-sm font-medium text-foreground">
                                By {article.author}
                            </Text>
                        </View>
                    )}

                    <Text className="text-lg leading-8 text-foreground mb-6">
                        {article.description}
                    </Text>

                    <Text className="text-base leading-7 text-muted-foreground mb-8">
                        {article.content ? article.content.replace(/\[\+\d+ chars\]/, '') : 'No content available.'}
                    </Text>

                    <TouchableOpacity
                        onPress={() => Linking.openURL(article.url)}
                        className="bg-primary p-4 rounded-2xl flex-row items-center justify-center gap-2 mb-8 shadow-sm"
                    >
                        <Text className="text-primary-foreground font-bold text-lg">Read Full Article</Text>
                        <ExternalLink size={20} color={theme.colors.background} />
                    </TouchableOpacity>

                </Animated.View>
            </ScrollView>
        </View>
    );
}
