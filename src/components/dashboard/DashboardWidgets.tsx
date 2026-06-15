import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

export function DashboardBreadcrumb({ current = 'Главная' }: { current?: string }) {
  return (
    <View style={styles.breadcrumb}>
      <Text style={styles.breadcrumbText}>Главная / {current}</Text>
      <View style={styles.breadcrumbActions}>
        <TouchableOpacity style={styles.iconBtn}><Ionicons name="calendar-outline" size={18} color={colors.textSecondary} /></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}><Ionicons name="share-outline" size={18} color={colors.textSecondary} /></TouchableOpacity>
      </View>
    </View>
  );
}

export function InlineStat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { isMobile } = useResponsive();
  if (isMobile) {
    return (
      <View style={styles.statChip}>
        <Ionicons name={icon} size={18} color={colors.accentDark} />
        <Text style={styles.statChipValue}>{value}</Text>
        <Text style={styles.statChipLabel}>{label}</Text>
      </View>
    );
  }
  return (
    <View style={styles.inlineStat}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={styles.inlineStatValue}>{value}</Text>
      <Text style={styles.inlineStatLabel}>{label}</Text>
    </View>
  );
}

type ScheduleItem = { id: string; title: string; time: string; tag?: string };

export function ScheduleWidget({ visits, tasks }: { visits: ScheduleItem[]; tasks: ScheduleItem[] }) {
  const [tab, setTab] = useState<'meetings' | 'tasks' | 'events'>('meetings');
  const { isMobile } = useResponsive();
  const items = tab === 'tasks' ? tasks : visits;

  return (
    <View style={[styles.widgetCard, isMobile ? styles.widgetCardMobile : styles.widgetCardDesktop]}>
      <View style={styles.tabRow}>
        {(['meetings', 'tasks', 'events'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'meetings' ? 'Визиты' : t === 'tasks' ? 'Задачи' : 'События'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {items.length === 0 ? (
        <Text style={styles.widgetEmpty}>Нет запланированных записей</Text>
      ) : (
        items.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.scheduleItem}>
            <View style={styles.scheduleDot} />
            <View style={styles.scheduleBody}>
              <Text style={styles.scheduleTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.scheduleMeta}>{item.time}{item.tag ? ` · ${item.tag}` : ''}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

export function KpiChartWidget({ percent, label }: { percent: number; label: string }) {
  const { isMobile } = useResponsive();
  const months = ['Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const heights = [45, 52, 48, 65, 58, 70];
  const barMax = isMobile ? 48 : 70;

  return (
    <View style={[styles.widgetCard, isMobile ? styles.widgetCardMobile : styles.widgetCardDesktop]}>
      <Text style={styles.widgetTitle}>{label}</Text>
      <Text style={[styles.kpiBig, isMobile && styles.kpiBigMobile]}>{percent.toFixed(1).replace('.', ',')}%</Text>
      <View style={[styles.chartRow, isMobile && styles.chartRowMobile]}>
        {months.map((m, i) => (
          <View key={m} style={styles.chartCol}>
            <View style={[styles.chartBar, {
              height: (heights[i] / barMax) * (isMobile ? 48 : 70),
              backgroundColor: i === 5 ? colors.accent : colors.chartGrey,
            }]} />
            <Text style={styles.chartLabel}>{m}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function StatusBarWidget({ items, totalLabel }: { items: { label: string; percent: number; color: string }[]; totalLabel: string }) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <View style={[styles.widgetCard, styles.widgetCardMobile]}>
        <Text style={styles.widgetTitle}>Статусы</Text>
        <Text style={styles.statusTotalMobile}>{totalLabel}</Text>
        <View style={styles.statusListMobile}>
          {items.map((item) => (
            <View key={item.label} style={styles.statusRowMobile}>
              <View style={styles.statusRowHead}>
                <Text style={styles.statusRowLabel}>{item.label}</Text>
                <Text style={styles.statusRowPct}>{item.percent}%</Text>
              </View>
              <View style={styles.statusTrack}>
                <View style={[styles.statusFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.widgetCard, styles.widgetCardDesktop]}>
      <Text style={styles.widgetTitle}>Статусы</Text>
      <Text style={styles.statusTotal}>{totalLabel}</Text>
      <View style={styles.barChartRow}>
        {items.map((item) => (
          <View key={item.label} style={styles.barCol}>
            <View style={[styles.barVert, { height: Math.max(24, item.percent * 1.2), backgroundColor: item.color }]} />
            <Text style={styles.barPct}>{item.percent}%</Text>
            <Text style={styles.barLbl}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function MiniActionCard({ title, value, action, onPress, compact }: { title: string; value: string; action: string; onPress?: () => void; compact?: boolean }) {
  return (
    <TouchableOpacity style={[styles.miniCard, compact && styles.miniCardCompact]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.miniTitle}>{title}</Text>
      <Text style={styles.miniValue} numberOfLines={1}>{value}</Text>
      <View style={styles.miniAction}>
        <Text style={styles.miniActionText}>{action}</Text>
        <Ionicons name="arrow-forward" size={14} color={colors.accentDark} />
      </View>
    </TouchableOpacity>
  );
}

export type TableRow = { id: string; name: string; sub: string; role: string; email: string; status: string; date: string; dept: string };

export function DataTableWidget({ title, rows, onRowPress }: { title: string; rows: TableRow[]; onRowPress?: (id: string) => void }) {
  const { isMobile } = useResponsive();

  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableTitle}>{title}</Text>
        {!isMobile && (
          <View style={styles.tableSearch}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <Text style={styles.tableSearchText}>Поиск</Text>
          </View>
        )}
      </View>

      {rows.length === 0 ? (
        <Text style={styles.widgetEmpty}>Нет данных для отображения</Text>
      ) : isMobile ? (
        rows.slice(0, 5).map((row) => (
          <TouchableOpacity key={row.id} style={styles.mobileRow} onPress={() => onRowPress?.(row.id)} activeOpacity={0.75}>
            <View style={styles.tableAvatar}><Text style={styles.tableAvatarText}>{row.name.charAt(0)}</Text></View>
            <View style={styles.mobileRowBody}>
              <Text style={styles.tdName} numberOfLines={1}>{row.name}</Text>
              <Text style={styles.tdSub} numberOfLines={1}>{row.sub}</Text>
              <Text style={styles.mobileMeta}>{row.role} · {row.dept}</Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>{row.status}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <>
          <View style={styles.tableCols}>
            <Text style={[styles.th, { flex: 2 }]}>Имя</Text>
            <Text style={styles.th}>Роль</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Статус</Text>
            <Text style={styles.th}>Отдел</Text>
          </View>
          {rows.slice(0, 5).map((row) => (
            <TouchableOpacity key={row.id} style={styles.tr} onPress={() => onRowPress?.(row.id)}>
              <View style={[styles.td, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <View style={styles.tableAvatar}><Text style={styles.tableAvatarText}>{row.name.charAt(0)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tdName} numberOfLines={1}>{row.name}</Text>
                  <Text style={styles.tdSub} numberOfLines={1}>{row.sub}</Text>
                </View>
              </View>
              <Text style={[styles.td, styles.tdMuted]} numberOfLines={1}>{row.role}</Text>
              <View style={[styles.td, { flex: 1.2 }]}>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>{row.status}</Text>
                </View>
              </View>
              <Text style={[styles.td, styles.tdMuted]} numberOfLines={1}>{row.dept}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  breadcrumb: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  breadcrumbText: { ...typography.caption, color: colors.textMuted },
  breadcrumbActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.sm },
  inlineStat: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: spacing.lg },
  inlineStatValue: { ...typography.label, color: colors.text, fontSize: 15 },
  inlineStatLabel: { ...typography.caption, color: colors.textMuted },
  statChip: {
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  statChipValue: { ...typography.h3, color: colors.text, marginTop: spacing.xs },
  statChipLabel: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  widgetCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    overflow: 'hidden',
  },
  widgetCardDesktop: { flex: 1, minWidth: 200 },
  widgetCardMobile: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: spacing.md,
  },
  widgetTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  widgetEmpty: { ...typography.caption, color: colors.textMuted, paddingVertical: spacing.lg, textAlign: 'center' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  tab: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: borderRadius.full },
  tabActive: { backgroundColor: colors.primaryLight },
  tabText: { ...typography.caption, color: colors.textMuted, fontWeight: '500', fontSize: 12 },
  tabTextActive: { color: colors.text, fontWeight: '600' },
  scheduleItem: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  scheduleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6 },
  scheduleBody: { flex: 1 },
  scheduleTitle: { ...typography.label, color: colors.text, fontSize: 14 },
  scheduleMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  kpiBig: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  kpiBigMobile: { fontSize: 22, marginBottom: spacing.sm },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 80 },
  chartRowMobile: { height: 56 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 14, borderRadius: 6, marginBottom: 4 },
  chartLabel: { fontSize: 10, color: colors.textMuted },
  statusTotal: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  statusTotalMobile: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  statusListMobile: { gap: spacing.sm },
  statusRowMobile: { marginBottom: spacing.xs },
  statusRowHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statusRowLabel: { ...typography.caption, color: colors.text, fontWeight: '600' },
  statusRowPct: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  statusTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  statusFill: { height: '100%', borderRadius: 4 },
  barChartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', minHeight: 100 },
  barCol: { alignItems: 'center' },
  barVert: { width: 36, borderRadius: 8, marginBottom: 6 },
  barPct: { ...typography.label, fontSize: 12, color: colors.text },
  barLbl: { ...typography.caption, fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  miniCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, minWidth: 120, ...shadows.sm },
  miniCardCompact: { flexBasis: '48%', flexGrow: 0, flexShrink: 0, marginBottom: spacing.sm },
  miniTitle: { ...typography.caption, color: colors.textMuted, fontSize: 11 },
  miniValue: { ...typography.h3, color: colors.text, marginVertical: spacing.xs, fontSize: 15 },
  miniAction: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  miniActionText: { ...typography.caption, color: colors.accentDark, fontWeight: '600', fontSize: 11 },
  tableCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.sm, width: '100%', alignSelf: 'stretch' },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  tableTitle: { ...typography.h3, color: colors.text },
  tableSearch: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  tableSearchText: { ...typography.caption, color: colors.textMuted },
  tableCols: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, marginBottom: spacing.sm },
  th: { flex: 1, ...typography.overline, fontSize: 10, color: colors.textMuted },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  td: { flex: 1 },
  tdName: { ...typography.label, fontSize: 13, color: colors.text },
  tdSub: { ...typography.caption, fontSize: 11, color: colors.textMuted },
  tdMuted: { ...typography.caption, color: colors.textSecondary, fontSize: 12 },
  mobileRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  mobileRowBody: { flex: 1, minWidth: 0 },
  mobileMeta: { ...typography.caption, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  tableAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  tableAvatarText: { fontWeight: '700', color: colors.accentDark, fontSize: 14 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  statusPillText: { fontSize: 10, fontWeight: '600', color: colors.success },
});
