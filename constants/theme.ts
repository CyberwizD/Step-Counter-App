/**
 * Theme constants for the Step Counter App.
 * Colors, fonts, and design tokens for light and dark mode.
 */

import { Platform } from 'react-native';

// Fitness accent colors
export const Accent = {
  green: '#4ADE80',
  greenDark: '#22C55E',
  teal: '#2DD4BF',
  orange: '#FB923C',
  red: '#F87171',
  blue: '#60A5FA',
  purple: '#A78BFA',
};

const tintColorLight = Accent.greenDark;
const tintColorDark = Accent.green;

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    card: '#FFFFFF',
    border: '#E2E8F0',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    card: '#1E293B',
    border: '#334155',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    tabBar: '#1E293B',
    tabBarBorder: '#334155',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
