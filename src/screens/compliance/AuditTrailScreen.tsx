import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Button } from '../../components/common';
import { Card, EmptyState } from '../../components/ui';
import { useDataStore } from '../../stores';
import { COPY } from '../../constants/copy';
import { formatDateTime } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export function AuditTrailScreen() {
  const { auditEntries } = useDataStore();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (auditEntries.length === 0) {
      Alert.alert(COPY.common.error, COPY.audit.exportEmpty);
      return;
    }
    setExporting(true);
    const path = `${FileSystem.cacheDirectory}audit_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(auditEntries, null, 2));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
    setExporting(false);
  };

  return (
    <View style={styles.wrap}>
      <ScreenContainer title={COPY.audit.title} subtitle={COPY.audit.subtitle}>
        <Button title="Экспорт" onPress={handleExport} loading={exporting} variant="outline" icon="download-outline" />
        {auditEntries.length === 0 ? (
          <EmptyState icon="document-text-outline" title="Журнал пуст" message={COPY.audit.emptyMessage} />
        ) : (
          <FlatList
            data={auditEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card>
                <Text style={styles.entity}>{item.action}: {item.entityType}</Text>
                <Text style={styles.meta}>{item.userName} • {formatDateTime(item.timestamp)}</Text>
                {item.newValue ? <Text style={styles.val}>→ {item.newValue}</Text> : null}
                {item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}
              </Card>
            )}
            scrollEnabled={false}
          />
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  entity: { ...typography.label, color: colors.text, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  val: { ...typography.caption, color: colors.text, marginTop: 2 },
  reason: { ...typography.caption, color: colors.warning, marginTop: 4, fontStyle: 'italic' },
});
