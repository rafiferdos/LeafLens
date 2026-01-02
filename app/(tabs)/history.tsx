import React, { useState, useCallback } from 'react';
import { View, Image, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Trash2, Calendar, Clock } from 'lucide-react-native';

export default function HistoryScreen() {
    const [history, setHistory] = useState<any[]>([]);

    const loadHistory = async () => {
        try {
            const data = await AsyncStorage.getItem('scanHistory');
            if (data) {
                setHistory(JSON.parse(data));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const clearHistory = async () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete all scan history?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem('scanHistory');
                        setHistory([]);
                    }
                }
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-border/50">
                <View>
                    <Text className="text-3xl font-bold tracking-tight">History</Text>
                    <Text className="text-muted-foreground">{history.length} scans recorded</Text>
                </View>
                {history.length > 0 && (
                    <Button variant="ghost" size="icon" onPress={clearHistory}>
                        <Trash2 size={20} className="text-destructive" color="#ef4444" />
                    </Button>
                )}
            </View>

            {history.length === 0 ? (
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-muted-foreground text-center">No history yet. Scan a leaf to get started!</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    renderItem={({ item }) => (
                        <View className="flex-row bg-card border border-border rounded-xl overflow-hidden p-3 gap-4">
                            <Image
                                source={{ uri: item.imageUri }}
                                className="w-20 h-20 rounded-lg bg-muted"
                                resizeMode="cover"
                            />
                            <View className="flex-1 justify-between py-1">
                                <View>
                                    <Text className="font-bold text-lg capitalize" numberOfLines={1}>
                                        {item.result.class.replace(/([A-Z])/g, ' $1').trim()}
                                    </Text>
                                    <Text className="text-muted-foreground text-xs">
                                        Confidence: {(item.result.confidence * 100).toFixed(0)}%
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-3 mt-2">
                                    <View className="flex-row items-center gap-1">
                                        <Calendar size={12} className="text-muted-foreground" color="gray" />
                                        <Text className="text-xs text-muted-foreground">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <Clock size={12} className="text-muted-foreground" color="gray" />
                                        <Text className="text-xs text-muted-foreground">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
