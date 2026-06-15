import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { spacing } from '../../constants/theme';

interface ResponsiveGridProps {
  children: React.ReactNode;
  style?: ViewStyle;
  minItemWidth?: number;
}

/** Адаптивная сетка: 1 колонка на телефоне, 2–4 на ПК. */
export function ResponsiveGrid({ children, style, minItemWidth = 220 }: ResponsiveGridProps) {
  const { width, isDesktop, pagePadding, contentMaxWidth } = useResponsive();
  const maxW = contentMaxWidth ?? width;
  const available = Math.min(width, maxW) - pagePadding * 2;
  const cols = Math.max(1, Math.floor(available / minItemWidth));
  const gap = isDesktop ? spacing.md : spacing.sm;

  return (
    <View style={[styles.grid, { gap }, style]}>
      {React.Children.map(children, (child) => (
        <View style={[styles.item, { width: cols === 1 ? '100%' : `${100 / cols}%` as unknown as number, minWidth: cols === 1 ? undefined : minItemWidth }]}>
          {child}
        </View>
      ))}
    </View>
  );
}

interface ResponsiveRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ResponsiveRow({ children, style }: ResponsiveRowProps) {
  const { isDesktop } = useResponsive();
  return (
    <View style={[styles.row, isDesktop && styles.rowDesktop, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  item: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
