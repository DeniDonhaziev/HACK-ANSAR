import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer } from '../../components/common';
import { Card, Badge, SectionHeader } from '../../components/ui';
import { DEPARTMENTS, getDepartmentShortLabel } from '../../constants/departments';
import { loadJSON, STORAGE_KEYS } from '../../services/storageService';
import { User } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';

interface StoredUser extends User {
  password?: string;
}

export function EmployeesScreen() {
  const [users, setUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    (async () => {
      const list = await loadJSON<StoredUser[]>(STORAGE_KEYS.users, []);
      setUsers(list.map(({ password: _, ...u }) => u as StoredUser));
    })();
  }, []);

  const byDept = DEPARTMENTS.map((d) => ({
    dept: d,
    staff: users.filter((u) => (u.department ?? 'sales') === d.id),
  }));

  return (
    <ScreenContainer title="Сотрудники" subtitle={`${users.length} в системе`}>
      {users.length === 0 ? (
        <Card variant="outlined">
          <Text style={styles.empty}>Сотрудники появятся после регистрации в системе.</Text>
        </Card>
      ) : (
        byDept.filter(({ staff }) => staff.length > 0).map(({ dept, staff }) => (
          <View key={dept.id}>
            <SectionHeader title={dept.shortName} subtitle={`${staff.length} чел.`} />
            <FlatList
              data={staff}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card>
                  <View style={styles.row}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.email}>{item.email}</Text>
                      <Badge label={getDepartmentShortLabel(item.department ?? 'sales')} variant="primary" />
                    </View>
                  </View>
                </Card>
              )}
              scrollEnabled={false}
            />
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  row: { flexDirection: 'row', gap: spacing.md },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  info: { flex: 1 },
  name: { ...typography.label, color: colors.text },
  email: { ...typography.caption, color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm },
});
