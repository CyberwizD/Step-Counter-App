import { Accent } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';

interface PermissionModalProps {
    visible: boolean;
    onAllow: () => void;
    onDismiss: () => void;
}

export function PermissionModal({ visible, onAllow, onDismiss }: PermissionModalProps) {
    const cardBg = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onDismiss}
        >
            <TouchableWithoutFeedback onPress={onDismiss}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                            {/* Icon */}
                            <View style={styles.iconCircle}>
                                <IconSymbol name="figure.walk" size={32} color="#FFFFFF" />
                            </View>

                            {/* Title */}
                            <ThemedText style={styles.title}>
                                Allow Activity Tracking
                            </ThemedText>

                            {/* Description */}
                            <ThemedText
                                style={styles.description}
                                lightColor="#64748B"
                                darkColor="#94A3B8"
                            >
                                This app needs access to your device's motion sensors to count your steps and track your daily activity.
                            </ThemedText>

                            {/* Features list */}
                            <View style={styles.featureList}>
                                <FeatureItem icon="figure.walk" text="Count your steps automatically" />
                                <FeatureItem icon="flame.fill" text="Track calories burned" />
                                <FeatureItem icon="map.fill" text="Measure distance walked" />
                            </View>

                            {/* Buttons */}
                            <TouchableOpacity
                                style={styles.allowBtn}
                                onPress={onAllow}
                                activeOpacity={0.85}
                            >
                                <ThemedText style={styles.allowBtnText}>Allow</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dismissBtn}
                                onPress={onDismiss}
                                activeOpacity={0.7}
                            >
                                <ThemedText
                                    style={styles.dismissBtnText}
                                    lightColor="#94A3B8"
                                    darkColor="#64748B"
                                >
                                    Not Now
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
    return (
        <View style={styles.featureRow}>
            <View style={styles.featureDot}>
                <IconSymbol name={icon as any} size={14} color={Accent.green} />
            </View>
            <ThemedText style={styles.featureText} lightColor="#475569" darkColor="#CBD5E1">
                {text}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Accent.green,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    featureList: {
        alignSelf: 'stretch',
        marginBottom: 24,
        gap: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureDot: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: Accent.green + '18',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 13,
        fontWeight: '500',
    },
    allowBtn: {
        backgroundColor: Accent.green,
        paddingVertical: 14,
        borderRadius: 14,
        alignSelf: 'stretch',
        alignItems: 'center',
        marginBottom: 10,
    },
    allowBtnText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '700',
    },
    dismissBtn: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    dismissBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
