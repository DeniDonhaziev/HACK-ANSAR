import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { ScreenContainer, Button } from '../../components/common';
import { Card, StatCard, SectionHeader, Badge } from '../../components/ui';
import { useDataStore } from '../../stores';
import { getActiveBackend } from '../../services/firebase';
import { colors, spacing, typography } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

const INTEGRATIONS = [
  { name: '1С:Предприятие', status: 'offline', note: 'Ожидает подключения' },
  { name: 'Firebase', status: 'ready', note: 'Firestore + Auth (см. .env)' },
  { name: 'SAP ERP', status: 'offline', note: 'Не подключён' },
  { name: 'Power BI', status: 'offline', note: 'Не подключён' },
];

export function ItSystemsScreen() {
  const { goTo } = useAppNavigation();
  const { isDesktop } = useResponsive();
  const { auditEntries, documents, signatures, tasks } = useDataStore();

  const critical = auditEntries.filter((e) => e.isCritical).length;
  const firebaseActive = getActiveBackend() === 'firebase';

  return (
    <ScreenContainer title="ИТ-системы" subtitle="Мониторинг, журнал и интеграции">
      <Card>
        <Text style={styles.intName}>Firebase</Text>
        <Text style={styles.intNote}>
          {firebaseActive
            ? 'Подключён: данные синхронизируются с Firestore'
            : 'Не подключён: заполните .env и перезапустите приложение'}
        </Text>
      </Card>
      <View style={[styles.statsRow, !isDesktop && styles.statsRowMobile]}>
        <StatCard title="Записей в журнале" value={String(auditEntries.length)} icon="document-text-outline" color={colors.primary} onPress={() => goTo('AuditTrail')} />
        <StatCard title="Критичных событий" value={String(critical)} icon="warning-outline" color={colors.warning} onPress={() => goTo('AuditTrail')} />
      </View>
      <View style={[styles.statsRow, !isDesktop && styles.statsRowMobile]}>
        <StatCard title="Документов" value={String(documents.length)} icon="folder-open-outline" color={colors.secondary} onPress={() => goTo('Documents')} />
        <StatCard title="Подписей" value={String(signatures.length)} icon="create-outline" color={colors.info} onPress={() => goTo('Signatures')} />
      </View>

      <SectionHeader title="Интеграции" subtitle="Статус внешних систем" />
      {INTEGRATIONS.map((item) => (
        <Card key={item.name}>
          <View style={styles.intRow}>
            <Text style={styles.intName}>{item.name}</Text>
            <Badge label={item.status === 'ready' ? 'Готов' : 'Не подключён'} variant={item.status === 'ready' ? 'success' : 'default'} />
          </View>
          <Text style={styles.intNote}>{item.note}</Text>
        </Card>
      ))}

      <SectionHeader title="Задачи ИТ" subtitle={`${tasks.length} активных`} />
      <Button title="Открыть журнал изменений" onPress={() => goTo('AuditTrail')} variant="outline" icon="document-text-outline" fullWidth />
      <Button title="Структура отделов" onPress={() => goTo('Departments')} variant="ghost" icon="business-outline" fullWidth />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  statsRowMobile: { flexWrap: 'wrap' },
  intRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  intName: { ...typography.label, color: colors.text },
  intNote: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
