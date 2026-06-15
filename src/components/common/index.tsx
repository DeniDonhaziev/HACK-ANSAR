import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../../constants/theme';
import { ContentWidth } from '../layout/ContentWidth';
import { useResponsive } from '../../hooks/useResponsive';
import { LAYOUT } from '../../hooks/useResponsive';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, fullWidth }: ButtonProps) {
  const isPrimary = variant === 'primary';

  if (isPrimary) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[styles.button, styles.primaryBtn, fullWidth && styles.fullWidth, disabled && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={styles.btnInner}>
            {icon ? <Ionicons name={icon} size={18} color={colors.white} /> : null}
            <Text style={[styles.buttonText, styles.primaryText]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: { bg: colors.secondary, text: colors.white, border: colors.secondary },
    outline: { bg: 'transparent', text: colors.accentDark, border: colors.border },
    danger: { bg: colors.errorLight, text: colors.error, border: colors.errorLight },
    ghost: { bg: 'transparent', text: colors.textSecondary, border: 'transparent' },
  };
  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.btnInner}>
          {icon ? <Ionicons name={icon} size={18} color={v.text} /> : null}
          <Text style={[styles.buttonText, { color: v.text }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, multiline, error, keyboardType }: InputProps) {
  return (
    <View style={styles.inputContainer}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <View style={styles.inputContainer}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.selectRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.selectChip, value === opt.value && styles.selectChipActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.selectChipText, value === opt.value && styles.selectChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

interface ScreenContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scrollable?: boolean;
  noPadding?: boolean;
  fabSafe?: boolean;
}

export function ScreenContainer({ children, title, subtitle, scrollable = true, noPadding, fabSafe }: ScreenContainerProps) {
  const { isDesktop, isMobile, pagePadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const fabPadding = fabSafe && !isDesktop ? 72 + insets.bottom : 0;
  const topPad = isMobile ? Math.max(insets.top, spacing.sm) : isDesktop ? spacing.lg : spacing.md;

  const content = (
    <View style={[styles.container, noPadding && styles.noPadding, { paddingTop: topPad }]}>
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, isDesktop && styles.titleDesktop, isMobile && styles.titleMobile]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]} numberOfLines={isMobile ? 3 : undefined}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );

  const wrapped = (
    <ContentWidth fullWidth={noPadding}>
      {content}
    </ContentWidth>
  );

  if (scrollable) {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scroll, { paddingBottom: (isDesktop ? spacing.xxl : spacing.xxl) + fabPadding }]}
          showsVerticalScrollIndicator={isDesktop}
          keyboardShouldPersistTaps="handled"
        >
          {wrapped}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return <View style={styles.flex}>{wrapped}</View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.md },
  noPadding: { padding: 0 },
  scroll: { flexGrow: 1 },
  header: { marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.text, fontSize: 26 },
  titleDesktop: { fontSize: 32 },
  titleMobile: { fontSize: 22 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  subtitleMobile: { fontSize: 14, lineHeight: 20 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  primaryBtn: { borderWidth: 0, backgroundColor: colors.primary },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { ...typography.label, fontSize: 15 },
  primaryText: { color: colors.white },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  inputContainer: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: colors.error },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  selectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  selectChipActive: { backgroundColor: colors.accentLight, borderColor: colors.accent },
  selectChipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '500' },
  selectChipTextActive: { color: colors.accentDark, fontWeight: '600' },
});
