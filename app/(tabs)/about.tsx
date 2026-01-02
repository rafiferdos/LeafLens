import React from 'react';
import { View, Image, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Globe, Github, Info } from 'lucide-react-native';

export default function AboutScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>

                <View className="items-center mb-10 mt-4">
                    <View className="bg-primary/10 p-4 rounded-full mb-4">
                        <Info size={40} className="text-primary" color="#16a34a" />
                    </View>
                    <Text className="text-3xl font-bold text-center">LeafLens</Text>
                    <Text className="text-muted-foreground mt-2">v1.0.0 (Native)</Text>
                </View>

                <View className="bg-card border border-border rounded-xl p-6 mb-8">
                    <Text className="text-lg font-semibold mb-2">About The Project</Text>
                    <Text className="text-muted-foreground leading-6">
                        LeafLens is an advanced AI-powered application designed to detect plant diseases from leaf images.
                        Using state-of-the-art computer vision models, it helps farmers and gardeners identify issues early
                        and take preventative action.
                    </Text>
                </View>

                <Text className="text-lg font-semibold mb-4">Developers</Text>

                <View className="bg-card border border-border rounded-xl overflow-hidden mb-6">
                    <View className="h-24 bg-primary/20 items-center justify-center">
                        <Text className="font-bold text-primary text-xl">Rafi Ferdos</Text>
                    </View>
                    <View className="p-4 items-center">
                        <Text className="text-center text-muted-foreground mb-4">
                            Lead Developer & Creator. Passionate about AI solutions.
                        </Text>
                        <View className="flex-row gap-4">
                            <Button variant="outline" size="sm" onPress={() => Linking.openURL('https://github.com/rafiferdos')}>
                                <Github size={16} className="text-foreground mr-2" color="black" />
                                <Text>GitHub</Text>
                            </Button>
                            <Button variant="outline" size="sm" onPress={() => Linking.openURL('https://rafiferdos.com')}>
                                <Globe size={16} className="text-foreground mr-2" color="black" />
                                <Text>Website</Text>
                            </Button>
                        </View>
                    </View>
                </View>

                <View className="bg-card border border-border rounded-xl overflow-hidden">
                    <View className="h-24 bg-muted items-center justify-center">
                        <Text className="font-bold text-foreground text-xl">Siam Akter Mim</Text>
                    </View>
                    <View className="p-4 items-center">
                        <Text className="text-center text-muted-foreground">
                            Team Member & Researcher.
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
