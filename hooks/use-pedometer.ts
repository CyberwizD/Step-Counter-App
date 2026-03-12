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
 * - Requests permissions (both platforms)
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
                // Always request permissions first (works on both iOS and Android)
                const { status: permStatus } = await Pedometer.requestPermissionsAsync();

                if (permStatus !== 'granted') {
                    setState(prev => ({
                        ...prev,
                        permissionGranted: false,
                        status: 'denied',
                    }));
                    return;
                }

                // Permission granted — now check availability
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
                // If permission request itself fails (e.g. Expo Go limitations),
                // still try to check availability directly
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
