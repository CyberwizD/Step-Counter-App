import { Accent } from '@/constants/theme';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from './themed-text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
    current: number;
    goal: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
}

export function CircularProgress({
    current,
    goal,
    size = 220,
    strokeWidth = 14,
    color = Accent.green,
    backgroundColor = 'rgba(148, 163, 184, 0.15)',
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = useSharedValue(0);

    useEffect(() => {
        const percent = goal > 0 ? Math.min(current / goal, 1) : 0;
        progress.value = withTiming(percent, {
            duration: 1200,
            easing: Easing.out(Easing.cubic),
        });
    }, [current, goal]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const percent = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <View style={styles.innerContent}>
                <ThemedText style={styles.stepsText}>{current.toLocaleString()}</ThemedText>
                <ThemedText
                    style={styles.labelText}
                    lightColor="#64748B"
                    darkColor="#94A3B8"
                >
                    / {goal.toLocaleString()} steps
                </ThemedText>
                <ThemedText
                    style={[styles.percentText, { color }]}
                >
                    {percent}%
                </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerContent: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepsText: {
        fontSize: 33,
        fontWeight: '800',
        letterSpacing: -1,
    },
    labelText: {
        fontSize: 13,
        marginTop: 2,
    },
    percentText: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },
});
