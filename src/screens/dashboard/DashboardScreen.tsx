import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui';
import {
  DashboardBreadcrumb, InlineStat, ScheduleWidget,
  KpiChartWidget, StatusBarWidget, MiniActionCard, DataTableWidget, TableRow,
} from '../../components/dashboard/DashboardWidgets';
import { useAuthStore, useDataStore } from '../../stores';
import { formatCurrency } from '../../utils/format';
import { useDepartmentAccess } from '../../hooks/useDepartmentAccess';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { colors, spacing, typography } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';
import { Department } from '../../types';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function formatDateRu(): string {
  return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
}

function hasDepartmentData(dept: Department | undefined, data: ReturnType<typeof useDataStore.getState>): boolean {
  switch (dept) {
    case 'customer_support': return data.supportTickets.length > 0 || data.clients.length > 0;
    case 'warehouse': return data.batches.length > 0 || data.shipments.length > 0;
    case 'marketing': return data.expenses.length > 0 || data.approvals.length > 0;
    case 'sales': return data.clients.length > 0 || data.visits.length > 0;
    case 'it': return data.auditEntries.length > 0;
    case 'accounting': return data.expenses.length > 0 || data.approvals.length > 0;
    case 'hr': return true;
    default: return data.clients.length > 0 || data.visits.length > 0;
  }
}

export function DashboardScreen() {
  const { goTo } = useAppNavigation();
  const { isDesktop, isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const data = useDataStore();
  const { empty, isAdmin, canAccess } = useDepartmentAccess();

  const dept = user?.department;
  const showData = isAdmin || hasDepartmentData(dept, data);
  const firstName = user?.name?.split(' ')[1] ?? user?.name?.split(' ')[0] ?? 'коллега';

  const openTickets = data.supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;
  const pendingApprovals = data.approvals.filter((a) => a.status === 'pending' || a.status === 'in_review').length;
  const activeVisits = data.visits.filter((v) => v.status === 'planned' || v.status === 'in_progress').length;
  const plan = data.salesPlans[0];
  const kpiPercent = plan ? Math.min(100, (plan.actualAmount / plan.targetAmount) * 100) : 68;

  const scheduleVisits = useMemo(() => data.visits.slice(0, 5).map((v) => ({
    id: v.id, title: v.clientName, time: new Date(v.plannedDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), tag: 'Визит',
  })), [data.visits]);

  const scheduleTasks = useMemo(() => data.tasks.slice(0, 5).map((t) => ({
    id: t.id, title: t.title, time: new Date(t.dueDate).toLocaleDateString('ru-RU'), tag: 'Задача',
  })), [data.tasks]);

  const tableRows: TableRow[] = useMemo(() => {
    if (dept === 'hr' || isAdmin) {
      return data.clients.slice(0, 5).map((c) => ({
        id: c.id, name: c.name, sub: c.inn, role: 'Аптека', email: c.phone, status: 'Активна', date: '', dept: c.city ?? '—',
      }));
    }
    if (dept === 'customer_support') {
      return data.supportTickets.slice(0, 5).map((t) => ({
        id: t.id, name: t.clientName, sub: t.subject, role: 'Обращение', email: '—', status: t.status === 'resolved' ? 'Решено' : 'Открыто', date: '', dept: 'Поддержка',
      }));
    }
    return data.clients.slice(0, 5).map((c) => ({
      id: c.id, name: c.name, sub: c.inn, role: `Кат. ${c.category ?? 'B'}`, email: c.phone, status: 'Активна', date: '', dept: c.city ?? '—',
    }));
  }, [dept, isAdmin, data.clients, data.supportTickets]);

  const miniCards = useMemo(() => {
    switch (dept) {
      case 'warehouse':
        return [
          { title: 'Серии', value: `${data.batches.length} шт.`, action: 'Открыть', screen: 'Warehouse' as const },
          { title: 'Поставки', value: `${data.shipments.length}`, action: 'Смотреть', screen: 'Warehouse' as const },
          { title: 'Аптеки', value: `${data.clients.length}`, action: 'Список', screen: 'Clients' as const },
          { title: 'Задачи', value: `${data.tasks.length}`, action: 'Открыть', screen: 'Tasks' as const },
          { title: 'Маршруты', value: `${data.visits.length}`, action: 'Карта', screen: 'Map' as const },
        ];
      case 'accounting':
        return [
          { title: 'Расходы', value: formatCurrency(data.expenses.reduce((s, e) => s + e.amount, 0)), action: 'Детали', screen: 'Expenses' as const },
          { title: 'Согласования', value: `${pendingApprovals}`, action: 'Проверить', screen: 'Approvals' as const },
          { title: 'Документы', value: `${data.documents.length}`, action: 'Архив', screen: 'Documents' as const },
          { title: 'Аптеки', value: `${data.clients.length}`, action: 'База', screen: 'Clients' as const },
          { title: 'Аналитика', value: 'Отчёт', action: 'Открыть', screen: 'Analytics' as const },
        ];
      default:
        return [
          { title: 'Аптеки', value: `${data.clients.length}`, action: 'Список', screen: 'Clients' as const },
          { title: 'Визиты', value: `${activeVisits}`, action: 'План', screen: 'Visits' as const },
          { title: 'Задачи', value: `${data.tasks.length}`, action: 'Открыть', screen: 'Tasks' as const },
          { title: 'Согласования', value: `${pendingApprovals}`, action: 'Проверить', screen: 'Approvals' as const },
          { title: 'Уведомления', value: `${data.notifications.filter((n) => !n.read).length}`, action: 'Все', screen: 'Notifications' as const },
        ];
    }
  }, [dept, data, pendingApprovals, activeVisits]);

  const statusItems = dept === 'warehouse'
    ? [
        { label: 'В наличии', percent: 49, color: colors.chartYellow },
        { label: 'Резерв', percent: 31, color: colors.chartDark },
        { label: 'Ожидание', percent: 20, color: colors.chartGrey },
      ]
    : [
        { label: 'Активные', percent: 49, color: colors.chartYellow },
        { label: 'В работе', percent: 31, color: colors.chartDark },
        { label: 'Новые', percent: 20, color: colors.chartGrey },
      ];

  const bottomPad = isMobile ? 72 + insets.bottom : spacing.xxl;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.page, isDesktop && styles.pageDesktop]}>
        {isDesktop && <DashboardBreadcrumb />}

        <View style={[styles.heroRow, isMobile && styles.heroCol]}>
          <View style={styles.heroLeft}>
            <Text style={[styles.greeting, isDesktop && styles.greetingDesktop]}>{getGreeting()}, {firstName}</Text>
            <Text style={styles.date} numberOfLines={isMobile ? 2 : undefined}>{formatDateRu()}</Text>
            <View style={[styles.inlineStats, isMobile && styles.inlineStatsGrid]}>
              {(dept === 'warehouse' ? [
                { icon: 'cube-outline' as const, value: String(data.batches.length), label: 'Серий' },
                { icon: 'car-outline' as const, value: String(data.shipments.length), label: 'Поставок' },
                { icon: 'storefront-outline' as const, value: String(data.clients.length), label: 'Аптек' },
                { icon: 'checkbox-outline' as const, value: String(data.tasks.length), label: 'Задач' },
              ] : [
                { icon: 'people-outline' as const, value: String(data.clients.length), label: 'Аптек' },
                { icon: 'checkbox-outline' as const, value: String(data.tasks.length), label: 'Задач' },
                { icon: 'checkmark-circle-outline' as const, value: String(pendingApprovals), label: 'Согласований' },
                ...(dept === 'customer_support' ? [{ icon: 'headset-outline' as const, value: String(openTickets), label: 'Обращений' }] : []),
              ]).map((stat) => (
                <InlineStat key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} />
              ))}
            </View>
          </View>
        </View>

        {!showData ? (
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            message={empty.message}
            actionLabel={empty.actionLabel}
            onAction={() => canAccess(empty.actionScreen) && goTo(empty.actionScreen)}
          />
        ) : (
          <>
            {isMobile ? (
              <View style={styles.widgetStack}>
                <ScheduleWidget visits={scheduleVisits} tasks={scheduleTasks} />
                <KpiChartWidget percent={kpiPercent} label="Средний KPI команды" />
                <StatusBarWidget
                  items={statusItems}
                  totalLabel={`${data.clients.length + data.tasks.length} активных записей`}
                />
              </View>
            ) : (
              <View style={[styles.widgetRow, !isDesktop && styles.widgetCol]}>
                <ScheduleWidget visits={scheduleVisits} tasks={scheduleTasks} />
                <KpiChartWidget percent={kpiPercent} label="Средний KPI команды" />
                <StatusBarWidget
                  items={statusItems}
                  totalLabel={`${data.clients.length + data.tasks.length} активных записей`}
                />
              </View>
            )}

            {isMobile ? (
              <View style={styles.miniGrid}>
                {miniCards.map((card) => (
                  <MiniActionCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    action={card.action}
                    compact
                    onPress={() => canAccess(card.screen) && goTo(card.screen)}
                  />
                ))}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miniRow} contentContainerStyle={styles.miniRowContent}>
                {miniCards.map((card) => (
                  <MiniActionCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    action={card.action}
                    onPress={() => canAccess(card.screen) && goTo(card.screen)}
                  />
                ))}
              </ScrollView>
            )}

            <DataTableWidget
              title={dept === 'customer_support' ? 'Обращения' : dept === 'hr' ? 'Сотрудники и аптеки' : 'Список аптек'}
              rows={tableRows}
              onRowPress={() => {
                if (dept === 'customer_support') goTo('Support');
                else goTo('Clients');
              }}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  page: { padding: spacing.md, paddingTop: spacing.sm, width: '100%' },
  pageDesktop: { padding: spacing.xl, maxWidth: 1400, alignSelf: 'center', width: '100%' },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg, gap: spacing.md },
  heroCol: { flexDirection: 'column' },
  heroLeft: { flex: 1, width: '100%' },
  greeting: { ...typography.h1, color: colors.text, fontSize: 22 },
  greetingDesktop: { fontSize: 28 },
  date: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  inlineStats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  inlineStatsGrid: { width: '100%', justifyContent: 'space-between' },
  widgetStack: { width: '100%', flexDirection: 'column' },
  widgetRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md, width: '100%' },
  widgetCol: { flexDirection: 'column' },
  miniRow: { marginBottom: spacing.lg },
  miniRowContent: { gap: spacing.sm, paddingVertical: spacing.xs },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', marginBottom: spacing.lg, gap: spacing.sm },
});
