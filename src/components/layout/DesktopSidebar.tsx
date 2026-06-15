import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores';
import { COPY } from '../../constants/copy';
import { getDepartmentShortLabel, getDepartmentInfo } from '../../constants/departments';
import { useDepartmentAccess } from '../../hooks/useDepartmentAccess';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { LAYOUT } from '../../hooks/useResponsive';

export function DesktopSidebar() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { sidebarItems, isAdmin } = useDepartmentAccess();
  const deptInfo = user?.department ? getDepartmentInfo(user.department) : undefined;
  const [search, setSearch] = useState('');
  const [modulesOpen, setModulesOpen] = useState(true);

  const activeScreen = useNavigationState((state) => {
    if (!state) return 'Dashboard';
    const route = state.routes[state.index];
    return route?.name ?? 'Dashboard';
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sidebarItems;
    return sidebarItems.filter((i) => i.title.toLowerCase().includes(q));
  }, [sidebarItems, search]);

  const gridItems = filtered.slice(0, 6);
  const listItems = filtered.slice(6);

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="medical" size={20} color={colors.white} />
        </View>
        <Text style={styles.brandName}>{COPY.app.name}</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {gridItems.map((item) => {
            const active = activeScreen === item.screen;
            return (
              <TouchableOpacity
                key={item.screen}
                style={[styles.gridItem, active && styles.gridItemActive]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Ionicons name={item.icon} size={22} color={active ? colors.white : colors.textSecondary} />
                <Text style={[styles.gridLabel, active && styles.gridLabelActive]} numberOfLines={2}>
                  {item.title.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {listItems.length > 0 && (
          <View style={styles.listSection}>
            <TouchableOpacity style={styles.listHeader} onPress={() => setModulesOpen(!modulesOpen)}>
              <Text style={styles.listHeaderText}>Модули</Text>
              <Ionicons name={modulesOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
            </TouchableOpacity>
            {modulesOpen && listItems.map((item) => {
              const active = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[styles.listItem, active && styles.listItemActive]}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={[styles.listDot, { backgroundColor: active ? colors.accent : colors.chartGrey }]} />
                  <Text style={[styles.listLabel, active && styles.listLabelActive]}>{item.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {user && (
        <View style={styles.profile}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{user.name}</Text>
            <Text style={styles.profileRole} numberOfLines={1}>
              {deptInfo?.shortName ?? 'Сотрудник'}{isAdmin ? ' · Админ' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color={colors.textMuted} />
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: LAYOUT.sidebarWidth,
    backgroundColor: colors.sidebar,
    height: '100%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRightWidth: 0,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, paddingHorizontal: spacing.xs },
  logo: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  brandName: { ...typography.label, fontSize: 16, color: colors.text, fontWeight: '700' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'web' ? 10 : 8,
    marginBottom: spacing.lg, ...shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, padding: 0 },
  nav: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  gridItem: {
    width: '47%', aspectRatio: 1.1,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    padding: spacing.sm, ...shadows.sm,
  },
  gridItemActive: { backgroundColor: colors.primary },
  gridLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', textAlign: 'center', fontSize: 11 },
  gridLabelActive: { color: colors.white },
  listSection: { marginTop: spacing.sm },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  listHeaderText: { ...typography.label, color: colors.text },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10, paddingHorizontal: spacing.sm, borderRadius: borderRadius.md },
  listItemActive: { backgroundColor: colors.surface },
  listDot: { width: 8, height: 8, borderRadius: 2 },
  listLabel: { ...typography.body, fontSize: 14, color: colors.textSecondary },
  listLabelActive: { color: colors.text, fontWeight: '600' },
  profile: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    padding: spacing.md, marginTop: spacing.sm, ...shadows.sm,
  },
  profileAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  profileAvatarText: { fontSize: 16, fontWeight: '700', color: colors.accentDark },
  profileInfo: { flex: 1 },
  profileName: { ...typography.label, fontSize: 13, color: colors.text },
  profileRole: { ...typography.caption, fontSize: 11, color: colors.textMuted, marginTop: 1 },
  bellBtn: { padding: 4 },
  logout: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, marginTop: spacing.sm },
  logoutText: { ...typography.caption, color: colors.textMuted },
});
