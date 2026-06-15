import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common';
import { Card, StatCard, Badge, SectionHeader, EmptyState } from '../../components/ui';
import { useAuthStore, useDataStore } from '../../stores';
import { formatCurrency } from '../../utils/format';
import { COPY } from '../../constants/copy';
import { getDepartmentShortLabel } from '../../constants/departments';
import { colors, spacing, typography } from '../../constants/theme';

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const { clients, visits, tasks, salesPlans, notifications, approvals } = useDataStore();

  const unread = notifications.filter((n) => !n.read).length;
  const todayVisits = visits.filter((v) => v.status === 'planned' || v.status === 'in_progress').length;
  const pendingApprovals = approvals.filter((a) => a.status === 'pending' || a.status === 'in_review').length;
  const plan = salesPlans[0];
  const isEmpty = clients.length === 0 && visits.length === 0 && tasks.length === 0;
  const firstName = user?.name?.split(' ')[1] ?? user?.name?.split(' ')[0] ?? '';

  return (
    <ScreenContainer
      title={COPY.dashboard.greeting(firstName)}
      subtitle={user?.department ? getDepartmentShortLabel(user.department) : COPY.dashboard.subtitleDefault}
    >
      {isEmpty ? (
        <EmptyState
          icon="analytics-outline"
          title={COPY.dashboard.emptyTitle}
          message={COPY.dashboard.emptyMessage}
          actionLabel={COPY.pharmacy.addBtn}
          onAction={() => navigation.navigate('Clients')}
        />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard title={COPY.dashboard.pharmacies} value={String(clients.length)} icon="storefront-outline" color={colors.primary} />
            <StatCard title={COPY.dashboard.visits} value={String(todayVisits)} subtitle={COPY.dashboard.visitsActive} icon="medical-outline" color={colors.secondary} />
          </View>
          <View style={styles.statsRow}>
            <StatCard title={COPY.dashboard.tasks} value={String(tasks.length)} icon="checkbox-outline" color={colors.info} />
            <StatCard title={COPY.dashboard.approvals} value={String(pendingApprovals)} subtitle={COPY.dashboard.approvalsPending} icon="checkmark-circle-outline" color={colors.warning} />
          </View>

          {plan && (
            <Card>
              <Text style={styles.planLabel}>{COPY.dashboard.salesPlan}</Text>
              <Text style={styles.planValue}>{formatCurrency(plan.actualAmount)} / {formatCurrency(plan.targetAmount)}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, (plan.actualAmount / plan.targetAmount) * 100)}%` }]} />
              </View>
            </Card>
          )}
        </>
      )}

      <SectionHeader title={COPY.dashboard.notifications} subtitle={unread > 0 ? COPY.dashboard.notificationsUnread(unread) : undefined} />
      {notifications.length === 0 ? (
        <Card variant="outlined">
          <Text style={styles.emptyText}>{COPY.dashboard.noNotifications}</Text>
        </Card>
      ) : (
        notifications.slice(0, 5).map((n) => (
          <Card key={n.id}>
            <View style={styles.notifRow}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              {!n.read && <Badge label="Новое" variant="primary" />}
            </View>
            <Text style={styles.notifMsg}>{n.message}</Text>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  planLabel: { ...typography.caption, color: colors.textSecondary },
  planValue: { ...typography.h3, color: colors.text, marginVertical: spacing.sm },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { ...typography.label, color: colors.text },
  notifMsg: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
