import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { colors } from '../../constants/theme';

interface ContentWidthProps {
  children: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

/** Центрирует контент и ограничивает ширину на больших экранах (ПК). */
export function ContentWidth({ children, style, fullWidth }: ContentWidthProps) {
  const { isDesktop, contentMaxWidth, pagePadding } = useResponsive();

  return (
    <View
      style={[
        styles.outer,
        { paddingHorizontal: pagePadding },
        isDesktop && !fullWidth && styles.desktopOuter,
        style,
      ]}
    >
      <View style={[styles.inner, contentMaxWidth && !fullWidth && { maxWidth: contentMaxWidth }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  desktopOuter: {
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
});
