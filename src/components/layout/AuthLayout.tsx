import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useResponsive, LAYOUT } from '../../hooks/useResponsive';
import { colors, spacing, borderRadius } from '../../constants/theme';

interface AuthLayoutProps {
  hero: React.ReactNode;
  children: React.ReactNode;
}

/** Адаптивная обёртка для входа и регистрации: на ПК — карточка с прокруткой формы. */
export function AuthLayout({ hero, children }: AuthLayoutProps) {
  const { isDesktop, height } = useResponsive();
  const cardMaxHeight = Math.min(height * 0.92, 860);

  if (!isDesktop) {
    return (
      <KeyboardAvoidingView
        style={styles.mobileRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.mobileScroll}
          contentContainerStyle={styles.mobileContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {hero}
          <View style={styles.mobileForm}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.desktopPage}>
      <View style={[styles.desktopCard, { maxHeight: cardMaxHeight }]}>
        <View style={styles.desktopSplit}>
          <View style={styles.brandPanel}>{hero}</View>
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mobileScroll: {
    flex: 1,
  },
  mobileContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  mobileForm: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  desktopPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  desktopCard: {
    width: '100%',
    maxWidth: LAYOUT.authSplitMaxWidth,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 12px 40px rgba(15, 76, 117, 0.12)',
      },
      default: {
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
      },
    }),
  },
  desktopSplit: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  brandPanel: {
    width: LAYOUT.authBrandWidth,
    backgroundColor: colors.primaryDark,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  formScroll: {
    flex: 1,
    maxWidth: LAYOUT.authSplitMaxWidth - LAYOUT.authBrandWidth,
  },
  formScrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
});
