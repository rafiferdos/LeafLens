import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, ScanLine, Leaf } from 'lucide-react-native';

export default function HomeScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Function to Pick Image from Gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null); // Reset previous result
    }
  };

  // Placeholder for Camera (We will implement the real Vision Camera later)
  const openCamera = async () => {
    // For now, let's use the default picker camera just for UI testing
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  // Simulation of the AI mechanism
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate a 2-second delay for the "Senior" feel
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult("Early Blight Detected (Confidence: 94%)");
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6 py-8">

        {/* --- Header Section --- */}
        <View className="mb-8 items-center">
          <View className="bg-green-100 p-3 rounded-full mb-3">
            <Leaf size={32} color="#16a34a" />
          </View>
          <Text className="text-3xl font-bold text-zinc-900 tracking-tight">LeafLens</Text>
          <Text className="text-zinc-500 mt-2 text-center text-base">
            AI-powered plant disease detection.{'\n'}Instant results, offline.
          </Text>
        </View>

        {/* --- Main Image Display Area --- */}
        <View className="bg-zinc-50 border border-zinc-200 rounded-3xl h-80 w-full items-center justify-center overflow-hidden mb-8 shadow-sm">
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center opacity-50">
              <ImageIcon size={48} color="#71717a" />
              <Text className="text-zinc-400 mt-4 font-medium">No image selected</Text>
            </View>
          )}
        </View>

        {/* --- Action Buttons (Row) --- */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={openCamera}
            className="flex-1 bg-zinc-900 py-4 rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
          >
            <Camera size={20} color="white" />
            <Text className="text-white font-semibold text-lg">Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={pickImage}
            className="flex-1 bg-zinc-100 border border-zinc-200 py-4 rounded-xl flex-row items-center justify-center gap-2 active:bg-zinc-200"
          >
            <ImageIcon size={20} color="#18181b" />
            <Text className="text-zinc-900 font-semibold text-lg">Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* --- Analyze Section (Conditional) --- */}
        {selectedImage && (
          <View className="mt-2">
            {!result ? (
              <TouchableOpacity
                onPress={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center gap-2 shadow-sm ${isAnalyzing ? 'bg-zinc-300' : 'bg-green-600'
                  }`}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <ScanLine size={20} color="white" />
                    <Text className="text-white font-bold text-lg">Test This Image</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              // --- Result Card ---
              <View className="bg-green-50 border border-green-200 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
                <Text className="text-green-800 font-semibold text-sm uppercase tracking-wider mb-1">
                  Analysis Result
                </Text>
                <Text className="text-2xl font-bold text-green-900 mb-2">
                  {result}
                </Text>
                <Text className="text-green-700 leading-relaxed">
                  The leaf appears to show signs of fungal infection. Isolate this plant immediately.
                </Text>

                <TouchableOpacity
                  onPress={() => { setSelectedImage(null); setResult(null); }}
                  className="mt-4 bg-white border border-green-200 py-2 rounded-lg items-center"
                >
                  <Text className="text-green-700 font-medium">Scan Another</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}