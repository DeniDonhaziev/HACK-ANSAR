import React from 'react';
import { Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/common';
import { Card, Badge, EmptyState } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDateTime } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';
import { saveJSON, STORAGE_KEYS } from '../../services/storageService';

export function NotificationsScreen() {
  const { notifications } = useDataStore();

  const markRead = async (id: string) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    await saveJSON(STORAGE_KEYS.notifications, updated);
    useDataStore.setState({ notifications: updated });
  };

  const markAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    await saveJSON(STORAGE_KEYS.notifications, updated);
    useDataStore.setState({ notifications: updated });
  };

  return (
    <ScreenContainer title="Уведомления" subtitle="Появляются при ваших действиях в системе">
      {notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" title="Уведомлений нет" message="Здесь будут отображаться события: новые задачи, визиты, согласования и др." />
      ) : (
        <>
          <TouchableOpacity onPress={markAllRead} style={styles.markAll}>
            <Text style={styles.markAllText}>Отметить все прочитанными</Text>
          </TouchableOpacity>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => markRead(item.id)}>
                <Card style={!item.read ? styles.unread : undefined}>
                  <Badge label={item.type} variant="info" />
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
