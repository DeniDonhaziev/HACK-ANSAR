import React from 'react';
import { Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { AppScreenName } from '../../constants/departmentAccess';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { ScreenContainer } from '../../components/common';
import { Card, Badge, EmptyState } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDateTime } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';

const TYPE_LABELS: Record<string, string> = {
  task: 'Задача',
  visit: 'Визит',
  approval: 'Согласование',
  client: 'Аптека',
  consent: 'Согласие',
  expense: 'Расход',
  document: 'Документ',
};

export function NotificationsScreen() {
  const { goTo } = useAppNavigation();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDataStore();

  const openNotification = async (id: string, entityType?: string) => {
    await markNotificationRead(id);
    const routes: Record<string, AppScreenName> = {
      visit: 'Visits',
      task: 'Tasks',
      approval: 'Approvals',
      pharmacy: 'Clients',
      consent: 'Consents',
      expense: 'Expenses',
      document: 'Documents',
      support: 'Support',
      batch: 'Warehouse',
      shipment: 'Warehouse',
    };
    if (entityType && routes[entityType]) {
      goTo(routes[entityType]);
    }
  };

  return (
    <ScreenContainer title="Уведомления" subtitle="Появляются при ваших действиях в системе">
      {notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" title="Уведомлений нет" message="Здесь будут отображаться события: новые задачи, визиты, согласования и др." />
      ) : (
        <>
          <TouchableOpacity onPress={markAllNotificationsRead} style={styles.markAll}>
            <Text style={styles.markAllText}>Отметить все прочитанными</Text>
          </TouchableOpacity>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => openNotification(item.id, item.entityType)} activeOpacity={0.75}>
                <Card style={!item.read ? styles.unread : undefined}>
                  <Badge label={TYPE_LABELS[item.type] ?? item.type} variant="info" />
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.time}>{formatDateTime(item.timestamp)}</Text>
                </Card>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  unread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  markAll: { marginBottom: spacing.md },
  markAllText: { ...typography.label, color: colors.primary },
  title: { ...typography.label, color: colors.text, marginTop: spacing.sm },
  message: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  time: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
