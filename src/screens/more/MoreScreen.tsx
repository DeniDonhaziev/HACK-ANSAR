import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer, Button } from '../../components/common';
import { Card, Badge, SectionHeader } from '../../components/ui';
import { useAuthStore } from '../../stores';
import { getDepartmentShortLabel, getDepartmentInfo } from '../../constants/departments';
import { useDepartmentAccess } from '../../hooks/useDepartmentAccess';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { colors, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export function MoreScreen() {
  const { goTo } = useAppNavigation();
  const { user, logout } = useAuthStore();
  const { modules, isAdmin } = useDepartmentAccess();
  const deptInfo = user?.department ? getDepartmentInfo(user.department) : undefined;
  const sections = [...new Set(modules.map((m) => m.section))];

  if (modules.length === 0) {
    return (
      <ScreenContainer title="Профиль" subtitle={deptInfo?.description}>
        <Card>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? '?'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>
                {user?.department ? getDepartmentShortLabel(user.department) : 'Отдел не указан'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
          {user?.twoFactorEnabled && <Badge label="2FA включена" variant="success" />}
        </Card>
        <Button title="Выйти" onPress={logout} variant="danger" icon="log-out-outline" fullWidth />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Дополнительные модули" subtitle={deptInfo?.description ?? 'Разделы вашего отдела'}>
      <Card>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) ?? '?'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>
              {deptInfo?.name ?? (user?.department ? getDepartmentShortLabel(user.department) : 'Сотрудник')}
              {isAdmin ? ' · Полный доступ' : ''}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        {user?.twoFactorEnabled && <Badge label="2FA включена" variant="success" />}
      </Card>

      {sections.map((section) => (
        <View key={section}>
          <SectionHeader title={section} />
          {modules.filter((m) => m.section === section).map((item) => (
            <Card key={item.screen} onPress={() => goTo(item.screen)}>
              <View style={styles.menuRow}>
                <Ionicons name={item.icon} size={22} color={colors.primary} />
                <Text style={styles.menuItem}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>
      ))}

      <Button title="Выйти" onPress={logout} variant="danger" icon="log-out-outline" fullWidth />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.primary },
  profileInfo: { flex: 1 },
  userName: { ...typography.h3, color: colors.text },
  userRole: { ...typography.caption, color: colors.secondary, marginTop: 2 },
  userEmail: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuItem: { ...typography.body, color: colors.text, flex: 1, fontSize: 16 },
});
