import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { api } from './use-api';

interface PedometerState {
    liveSteps: number;
    isAvailable: boolean;
    permissionGranted: boolean;
}

/**
 * Hook that manages the device pedometer.
 * - Requests permissions
 * - Watches live step count
 * - Periodically syncs steps to the backend
 */
export function usePedometer() {
    const [state, setState] = useState<PedometerState>({
        liveSteps: 0,
        isAvailable: false,
        permissionGranted: false,
    });

    const lastSyncedSteps = useRef(0);
    const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;

        const init = async () => {
            try {
                // Request permission on Android
                if (Platform.OS === 'android') {
                    const { status } = await Pedometer.requestPermissionsAsync();
                    if (status !== 'granted') {
                        setState(prev => ({ ...prev, permissionGranted: false }));
                        return;
                    }
                }

                const isAvailable = await Pedometer.isAvailableAsync();
                setState(prev => ({
                    ...prev,
                    isAvailable,
                    permissionGranted: true,
                }));

                if (isAvailable) {
                    subscription = Pedometer.watchStepCount(result => {
                        setState(prev => ({ ...prev, liveSteps: result.steps }));
                    });
                }
            } catch (error) {
                console.error('Pedometer init error:', error);
            }
        };

        init();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    // Sync steps to backend every 30 seconds
    useEffect(() => {
        syncInterval.current = setInterval(() => {
            const currentSteps = state.liveSteps;
            const newSteps = currentSteps - lastSyncedSteps.current;

            if (newSteps > 0) {
                api.logSteps(newSteps).catch(err =>
                    console.warn('Failed to sync steps:', err)
                );
                lastSyncedSteps.current = currentSteps;
            }
        }, 30000);

        return () => {
            if (syncInterval.current) {
                clearInterval(syncInterval.current);
            }
        };
    }, [state.liveSteps]);

    // Sync remaining steps on unmount
    useEffect(() => {
        return () => {
            const remaining = state.liveSteps - lastSyncedSteps.current;
            if (remaining > 0) {
                api.logSteps(remaining).catch(() => { });
            }
        };
    }, []);

    return state;
}
