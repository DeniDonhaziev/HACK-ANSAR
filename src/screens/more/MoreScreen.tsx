import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer, Button } from '../../components/common';
import { Card, Badge, SectionHeader } from '../../components/ui';
import { useAuthStore } from '../../stores';
import { getDepartmentShortLabel } from '../../constants/departments';
import { COPY } from '../../constants/copy';
import { colors, spacing, typography } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const menuItems = [
  { title: 'Отделы компании', screen: 'Departments', icon: 'business-outline' as const, section: 'Компания' },
  { title: 'Аптеки', screen: 'Clients', icon: 'storefront-outline' as const, section: 'Аптечная сеть' },
  { title: 'Журнал изменений', screen: 'AuditTrail', icon: 'document-text-outline' as const, section: 'Compliance' },
  { title: 'Электронные подписи', screen: 'Signatures', icon: 'create-outline' as const, section: 'Compliance' },
  { title: 'Согласования', screen: 'Approvals', icon: 'checkmark-circle-outline' as const, section: 'Compliance' },
  { title: 'Согласия', screen: 'Consents', icon: 'shield-checkmark-outline' as const, section: 'Compliance' },
  { title: 'Расходы', screen: 'Expenses', icon: 'wallet-outline' as const, section: 'Compliance' },
  { title: 'Склад', screen: 'Warehouse', icon: 'cube-outline' as const, section: 'Логистика' },
  { title: 'Карта', screen: 'Map', icon: 'map-outline' as const, section: 'Полевая работа' },
  { title: 'Документы', screen: 'Documents', icon: 'folder-open-outline' as const, section: 'Документы' },
  { title: 'Аналитика', screen: 'Analytics', icon: 'bar-chart-outline' as const, section: 'Аналитика' },
];

export function MoreScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const sections = [...new Set(menuItems.map((m) => m.section))];

  return (
    <ScreenContainer title="Модули системы" subtitle={COPY.app.subtitle}>
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

      {sections.map((section) => (
        <View key={section}>
          <SectionHeader title={section} />
          {menuItems.filter((m) => m.section === section).map((item) => (
            <Card key={item.screen} onPress={() => navigation.navigate(item.screen)}>
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
