import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores';
import { COPY } from '../../constants/copy';
import { getDepartmentShortLabel } from '../../constants/departments';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { LAYOUT } from '../../hooks/useResponsive';

type NavItem = {
  label: string;
  screen: string;
  icon: keyof typeof Ionicons.glyphMap;
  section?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Главная', screen: 'Dashboard', icon: 'grid-outline', section: 'Основное' },
  { label: 'Визиты в аптеки', screen: 'Visits', icon: 'storefront-outline', section: 'Основное' },
  { label: 'Задачи', screen: 'Tasks', icon: 'checkbox-outline', section: 'Основное' },
  { label: 'Уведомления', screen: 'Notifications', icon: 'notifications-outline', section: 'Основное' },
  { label: 'Аптеки', screen: 'Clients', icon: 'medical-outline', section: 'Аптечная сеть' },
  { label: 'Карта и маршрут', screen: 'Map', icon: 'map-outline', section: 'Аптечная сеть' },
  { label: 'Аналитика', screen: 'Analytics', icon: 'bar-chart-outline', section: 'Аптечная сеть' },
  { label: 'Журнал изменений', screen: 'AuditTrail', icon: 'document-text-outline', section: 'Compliance' },
  { label: 'Подписи', screen: 'Signatures', icon: 'create-outline', section: 'Compliance' },
  { label: 'Согласования', screen: 'Approvals', icon: 'checkmark-circle-outline', section: 'Compliance' },
  { label: 'Согласия', screen: 'Consents', icon: 'shield-checkmark-outline', section: 'Compliance' },
  { label: 'Расходы', screen: 'Expenses', icon: 'wallet-outline', section: 'Compliance' },
  { label: 'Склад', screen: 'Warehouse', icon: 'cube-outline', section: 'Логистика' },
  { label: 'Документы', screen: 'Documents', icon: 'folder-open-outline', section: 'Логистика' },
  { label: 'Отделы', screen: 'Departments', icon: 'business-outline', section: 'Компания' },
];

const SECTIONS = [...new Set(NAV_ITEMS.map((i) => i.section).filter(Boolean))] as string[];

export function DesktopSidebar() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const activeScreen = useNavigationState((state) => {
    if (!state) return 'Dashboard';
    const route = state.routes[state.index];
    return route?.name ?? 'Dashboard';
  });

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>Rx</Text>
        </View>
        <View>
          <Text style={styles.brandName}>{COPY.app.name}</Text>
          <Text style={styles.brandSub}>B2B · Аптечная сеть</Text>
        </View>
      </View>

      {user && (
        <View style={styles.userCard}>
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          <Text style={styles.userDept} numberOfLines={1}>
            {user.department ? getDepartmentShortLabel(user.department) : 'Сотрудник'}
          </Text>
        </View>
      )}

      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View key={section}>
            <Text style={styles.sectionTitle}>{section}</Text>
            {NAV_ITEMS.filter((i) => i.section === section).map((item) => {
              const active = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <Ionicons name={item.icon} size={20} color={active ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: LAYOUT.sidebarWidth,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    height: '100%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.white, fontSize: 20, fontWeight: '800' },
  brandName: { ...typography.label, fontSize: 16, color: colors.text },
  brandSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  userCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  userName: { ...typography.label, color: colors.text },
  userDept: { ...typography.caption, color: colors.primary, marginTop: 2 },
  nav: { flex: 1 },
  sectionTitle: {
    ...typography.overline,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  navItemActive: { backgroundColor: colors.primaryLight },
  navLabel: { ...typography.body, fontSize: 14, color: colors.textSecondary, flex: 1 },
  navLabelActive: { color: colors.primary, fontWeight: '600' },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  logoutText: { ...typography.label, color: colors.error },
});
