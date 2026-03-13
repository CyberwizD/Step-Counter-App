import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { api } from './use-api';

interface PedometerState {
    liveSteps: number;
    isAvailable: boolean;
    permissionGranted: boolean;
    status: 'loading' | 'active' | 'unavailable' | 'denied';
}

/**
 * Hook that manages the device pedometer.
 * - Requests permissions directly (triggers OS dialog on first launch)
 * - Watches live step count
 * - Periodically syncs steps to the backend
 */
export function usePedometer() {
    const [state, setState] = useState<PedometerState>({
        liveSteps: 0,
        isAvailable: false,
        permissionGranted: false,
        status: 'loading',
    });

    const lastSyncedSteps = useRef(0);
    const syncInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let subscription: ReturnType<typeof Pedometer.watchStepCount> | null = null;

        const init = async () => {
            try {
                // Request permission — this is what triggers the standard OS dialog
                // on first launch. This was the approach that worked before.
                const { status: permStatus } = await Pedometer.requestPermissionsAsync();

                if (permStatus !== 'granted') {
                    setState(prev => ({
                        ...prev,
                        permissionGranted: false,
                        status: 'denied',
                    }));
                    return;
                }

                // Permission granted — check hardware availability
                const isAvailable = await Pedometer.isAvailableAsync();

                setState(prev => ({
                    ...prev,
                    isAvailable,
                    permissionGranted: true,
                    status: isAvailable ? 'active' : 'unavailable',
                }));

                if (isAvailable) {
                    subscription = Pedometer.watchStepCount(result => {
                        setState(prev => ({ ...prev, liveSteps: result.steps }));
                    });
                }
            } catch (error) {
                console.error('Pedometer init error:', error);
                // Fallback — try without permission request (some devices/Expo Go versions)
                try {
                    const isAvailable = await Pedometer.isAvailableAsync();
                    setState(prev => ({
                        ...prev,
                        isAvailable,
                        permissionGranted: isAvailable,
                        status: isAvailable ? 'active' : 'unavailable',
                    }));
                    if (isAvailable) {
                        subscription = Pedometer.watchStepCount(result => {
                            setState(prev => ({ ...prev, liveSteps: result.steps }));
                        });
                    }
                } catch {
                    setState(prev => ({ ...prev, status: 'unavailable' }));
                }
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
