import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Input, Button, Select } from '../../components/common';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { useAuthStore } from '../../stores';
import { COPY, ROLE_OPTIONS } from '../../constants/copy';
import { DEPARTMENT_SELECT_OPTIONS } from '../../constants/departments';
import { colors, spacing, typography } from '../../constants/theme';
import { UserRole, Department } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

function AuthHero() {
  const { isDesktop } = useResponsive();

  return (
    <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>Rx</Text>
      </View>
      <Text style={styles.appName}>{COPY.app.name}</Text>
      <Text style={[styles.tagline, isDesktop && styles.taglineDesktop]}>{COPY.app.tagline}</Text>
      <Text style={[styles.subtitle, isDesktop && styles.subtitleDesktop]}>{COPY.app.subtitle}</Text>
    </View>
  );
}

function AuthModeTabs({
  isRegister,
  onSelectLogin,
  onSelectRegister,
}: {
  isRegister: boolean;
  onSelectLogin: () => void;
  onSelectRegister: () => void;
}) {
  const { isDesktop } = useResponsive();

  return (
    <View style={[styles.tabs, isDesktop && styles.tabsDesktop]}>
      <TouchableOpacity
        style={[styles.tab, !isRegister && styles.tabActive]}
        onPress={onSelectLogin}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, !isRegister && styles.tabTextActive]}>{COPY.auth.loginTitle}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, isRegister && styles.tabActive]}
        onPress={onSelectRegister}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, isRegister && styles.tabTextActive]}>{COPY.auth.registerTitle}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function LoginScreen() {
  const { isDesktop } = useResponsive();
  const { login, register, hasUsers, hydrated } = useAuthStore();
  const [isRegister, setIsRegister] = useState(!hasUsers);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('medical_rep');
  const [department, setDepartment] = useState<Department>('sales');
  const [twoFA, setTwoFA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (hydrated) setIsRegister(!hasUsers);
  }, [hydrated, hasUsers]);

  const switchMode = (registerMode: boolean) => {
    setIsRegister(registerMode);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    if (isRegister) {
      const result = await register({ name, email, password, role, department, twoFactorEnabled: twoFA });
      if (!result.ok) setError(result.error ?? 'Не удалось завершить регистрацию.');
    } else {
      const result = await login(email, password);
      if (!result.ok) setError(result.error ?? COPY.auth.wrongCredentials);
    }
    setLoading(false);
  };

  return (
    <AuthLayout hero={<AuthHero />}>
      {hasUsers ? (
        <AuthModeTabs
          isRegister={isRegister}
          onSelectLogin={() => switchMode(false)}
          onSelectRegister={() => switchMode(true)}
        />
      ) : (
        <Text style={styles.formTitle}>{COPY.auth.registerTitle}</Text>
      )}

      {!hasUsers && (
        <Text style={styles.hint}>{COPY.auth.firstRunHint}</Text>
      )}

      {isRegister && (
        <Input
          label={COPY.auth.nameLabel}
          value={name}
          onChangeText={setName}
          placeholder={COPY.auth.namePlaceholder}
        />
      )}

      <View style={isDesktop && isRegister ? styles.fieldRow : undefined}>
        <View style={isDesktop && isRegister ? styles.fieldHalf : undefined}>
          <Input
            label={COPY.auth.emailLabel}
            value={email}
            onChangeText={setEmail}
            placeholder={COPY.auth.emailPlaceholder}
            keyboardType="email-address"
          />
        </View>
        <View style={isDesktop && isRegister ? styles.fieldHalf : undefined}>
          <Input
            label={COPY.auth.passwordLabel}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder={COPY.auth.passwordPlaceholder}
          />
        </View>
      </View>

      {isRegister && (
        <>
          <Select
            label={`${COPY.auth.departmentLabel} *`}
            value={department}
            options={DEPARTMENT_SELECT_OPTIONS}
            onChange={(v) => setDepartment(v as Department)}
          />
          <Select
            label={COPY.auth.roleLabel}
            value={role}
            options={ROLE_OPTIONS}
            onChange={(v) => setRole(v as UserRole)}
          />
          <TouchableOpacity style={styles.checkRow} onPress={() => setTwoFA(!twoFA)}>
            <View style={[styles.checkbox, twoFA && styles.checkboxOn]}>
              {twoFA ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={styles.checkLabel}>{COPY.auth.twoFaLabel}</Text>
          </TouchableOpacity>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={isRegister ? COPY.auth.registerBtn : COPY.auth.loginBtn}
        onPress={handleSubmit}
        loading={loading}
        fullWidth
        icon="log-in-outline"
      />

      {hasUsers && !isDesktop && (
        <TouchableOpacity onPress={() => switchMode(!isRegister)}>
          <Text style={styles.switch}>
            {isRegister ? COPY.auth.hasAccount : COPY.auth.noAccount}
          </Text>
        </TouchableOpacity>
      )}
    </AuthLayout>
  );
}

export function TwoFactorScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const verifyTwoFactor = useAuthStore((s) => s.verifyTwoFactor);
  const cancelTwoFactor = useAuthStore((s) => s.cancelTwoFactor);
  const user = useAuthStore((s) => s.user);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    const success = await verifyTwoFactor(code);
    if (!success) setError(COPY.auth.invalidCode);
    setLoading(false);
  };

  return (
    <AuthLayout
      hero={
        <View style={styles.twoFaHero}>
          <Text style={styles.twoFaIcon}>🔐</Text>
          <Text style={styles.twoFaBrandTitle}>{COPY.auth.twoFaTitle}</Text>
        </View>
      }
    >
      <Text style={styles.formTitle}>{COPY.auth.twoFaTitle}</Text>
      <Text style={styles.hint}>{COPY.auth.twoFaHint} {user?.email}</Text>
      <Input
        label={COPY.auth.codeLabel}
        value={code}
        onChangeText={setCode}
        placeholder="000000"
        keyboardType="numeric"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={COPY.auth.confirmBtn} onPress={handleVerify} loading={loading} fullWidth />
      <Button title="Вернуться к входу" onPress={cancelTwoFactor} variant="ghost" fullWidth />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  heroDesktop: {
    marginHorizontal: 0,
    marginTop: 0,
    flex: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: colors.white },
  appName: { fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5 },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    marginTop: spacing.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  taglineDesktop: { fontSize: 16, textAlign: 'left' },
  subtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  subtitleDesktop: { textAlign: 'left', fontSize: 14, lineHeight: 20 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabsDesktop: {
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  tabText: { ...typography.label, color: colors.textMuted, fontSize: 14 },
  tabTextActive: { color: colors.accentDark },
  formTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  error: { color: colors.error, marginBottom: spacing.md, textAlign: 'center' },
  switch: { ...typography.body, color: colors.accentDark, textAlign: 'center', marginTop: spacing.lg },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkMark: { color: colors.white, fontSize: 14, fontWeight: '700' },
  checkLabel: { ...typography.body, color: colors.text, flex: 1 },
  twoFaHero: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  twoFaIcon: { fontSize: 56, marginBottom: spacing.md },
  twoFaBrandTitle: { ...typography.h2, color: colors.white, textAlign: 'center' },
});
