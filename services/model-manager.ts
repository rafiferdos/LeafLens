/**
 * Model Manager Hook
 * 
 * Handles model downloading, initialization, and status tracking.
 * Auto-initializes when the app starts.
 */

import { useState, useEffect, useCallback } from 'react';
import { onDeviceInference } from './inference';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MODEL_VERSION_KEY = 'leaflens_model_version';
const CURRENT_MODEL_VERSION = '1.0.0';

export interface ModelStatus {
    isReady: boolean;
    isDownloading: boolean;
    isInitializing: boolean;
    downloadProgress: number;
    error: string | null;
}

export function useModelManager() {
    const [status, setStatus] = useState<ModelStatus>({
        isReady: false,
        isDownloading: false,
        isInitializing: false,
        downloadProgress: 0,
        error: null,
    });

    const checkAndInitialize = useCallback(async () => {
        try {
            // Check if model is already downloaded
            const isDownloaded = await onDeviceInference.isModelDownloaded();
            const savedVersion = await AsyncStorage.getItem(MODEL_VERSION_KEY);

            // If model exists and version matches, just initialize
            if (isDownloaded && savedVersion === CURRENT_MODEL_VERSION) {
                console.log('Model already downloaded, initializing...');
                setStatus(prev => ({ ...prev, isInitializing: true }));

                await onDeviceInference.initialize();

                setStatus(prev => ({
                    ...prev,
                    isReady: true,
                    isInitializing: false,
                }));
                return;
            }

            // Download model
            console.log('Downloading model...');
            setStatus(prev => ({ ...prev, isDownloading: true, downloadProgress: 0 }));

            await onDeviceInference.downloadModel((progress) => {
                setStatus(prev => ({ ...prev, downloadProgress: progress }));
            });

            // Save version
            await AsyncStorage.setItem(MODEL_VERSION_KEY, CURRENT_MODEL_VERSION);

            setStatus(prev => ({ ...prev, isDownloading: false, isInitializing: true }));

            // Initialize model
            console.log('Initializing model...');
            await onDeviceInference.initialize();

            setStatus(prev => ({
                ...prev,
                isReady: true,
                isInitializing: false,
            }));

            console.log('Model ready for inference!');

        } catch (error) {
            console.error('Model initialization failed:', error);
            setStatus(prev => ({
                ...prev,
                isDownloading: false,
                isInitializing: false,
                error: error instanceof Error ? error.message : 'Failed to initialize model',
            }));
        }
    }, []);

    const retry = useCallback(() => {
        setStatus({
            isReady: false,
            isDownloading: false,
            isInitializing: false,
            downloadProgress: 0,
            error: null,
        });
        checkAndInitialize();
    }, [checkAndInitialize]);

    // Auto-initialize on mount
    useEffect(() => {
        checkAndInitialize();
    }, [checkAndInitialize]);

    return {
        ...status,
        retry,
    };
}

/**
 * Predict disease from image URI
 */
export async function predictDisease(imageUri: string) {
    return onDeviceInference.predict(imageUri);
}
