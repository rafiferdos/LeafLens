import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Mail, Save, UserCircle, Camera, Edit2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';

export default function ProfileScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const theme = NAV_THEME[colorScheme ?? 'light'];

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const savedName = await AsyncStorage.getItem('user_name');
            const savedEmail = await AsyncStorage.getItem('user_email');
            const savedImage = await AsyncStorage.getItem('user_photo');

            if (savedName) setName(savedName);
            if (savedEmail) setEmail(savedEmail);
            if (savedImage) setImageUri(savedImage);
        } catch (e) {
            console.error(e);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const saveProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            await AsyncStorage.setItem('user_name', name);
            await AsyncStorage.setItem('user_email', email);
            if (imageUri) {
                await AsyncStorage.setItem('user_photo', imageUri);
            }
            Alert.alert('Success', 'Profile saved successfully!');
            router.back();
        } catch (e) {
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    };

    const mutedColor = '#94a3b8';

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-border/50">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Edit Profile</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="items-center mb-8 relative">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <View className="w-32 h-32 bg-secondary rounded-full items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <UserCircle size={80} color={mutedColor} />
                            )}
                        </View>
                        <View className="absolute bottom-1 right-1 bg-primary p-2.5 rounded-full shadow-sm border-[3px] border-background">
                            <Camera size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-muted-foreground mt-4 text-sm font-medium">Change Profile Photo</Text>
                </View>

                <View className="gap-6 p-6 rounded-2xl bg-card border border-border">
                    <View className="gap-2">
                        <Text className="font-bold text-foreground ml-1 text-sm uppercase tracking-wide opacity-70">Full Name</Text>
                        <View className="flex-row items-center bg-background border border-border rounded-xl px-4 h-14">
                            <User size={20} color={mutedColor} className="mr-3" />
                            <TextInput
                                className="flex-1 text-foreground font-medium text-lg h-full"
                                placeholder="Enter your full name"
                                placeholderTextColor={mutedColor}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    <View className="gap-2">
                        <Text className="font-bold text-foreground ml-1 text-sm uppercase tracking-wide opacity-70">Email Address</Text>
                        <View className="flex-row items-center bg-background border border-border rounded-xl px-4 h-14">
                            <Mail size={20} color={mutedColor} className="mr-3" />
                            <TextInput
                                className="flex-1 text-foreground font-medium text-lg h-full"
                                placeholder="Enter your email"
                                placeholderTextColor={mutedColor}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>
                </View>

                <Button className="mt-8 h-14 rounded-xl shadow-md" onPress={saveProfile} disabled={loading}>
                    {loading ? (
                        <Text className="text-white font-bold text-lg">Saving...</Text>
                    ) : (
                        <>
                            <Save size={20} color="white" className="mr-2" />
                            <Text className="text-white font-bold text-lg">Save Profile</Text>
                        </>
                    )}
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}
