import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common';
import { Card, Badge, SectionHeader } from '../../components/ui';
import { DEPARTMENTS } from '../../constants/departments';
import { loadJSON, STORAGE_KEYS } from '../../services/storageService';
import { User, Department } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';

interface StoredUser extends User {
  password?: string;
}

export function DepartmentsScreen() {
  const [userCounts, setUserCounts] = useState<Record<Department, number>>({
    customer_support: 0, warehouse: 0, marketing: 0, sales: 0, it: 0, accounting: 0, hr: 0,
  });

  useEffect(() => {
    (async () => {
      const users = await loadJSON<StoredUser[]>(STORAGE_KEYS.users, []);
      const counts = DEPARTMENTS.reduce((acc, d) => {
        acc[d.id] = users.filter((u) => (u.department ?? 'sales') === d.id).length;
        return acc;
      }, {} as Record<Department, number>);
      setUserCounts(counts);
    })();
  }, []);

  return (
    <ScreenContainer title="Отделы компании" subtitle="Структура организации">
      <SectionHeader title={`${DEPARTMENTS.length} отделов`} />

      <FlatList
        data={DEPARTMENTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.desc}>{item.description}</Text>
                <Badge
                  label={userCounts[item.id] > 0 ? `${userCounts[item.id]} сотр.` : 'Нет сотрудников'}
                  variant={userCounts[item.id] > 0 ? 'primary' : 'default'}
                />
              </View>
            </View>
          </Card>
        )}
        scrollEnabled={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { ...typography.label, color: colors.text, fontSize: 15 },
  desc: { ...typography.caption, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
});
