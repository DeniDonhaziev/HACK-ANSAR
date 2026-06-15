import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, StatCard, EmptyState, FormModal, SectionHeader } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatCurrency, formatPercent } from '../../utils/format';
import { COPY } from '../../constants/copy';
import { colors, spacing, typography } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

export function AnalyticsScreen() {
  const { clients, visits, tasks, expenses, salesPlans, addSalesPlan, updateSalesPlan } = useDataStore();
  const { isDesktop } = useResponsive();
  const [modalVisible, setModalVisible] = useState(false);
  const [targetAmount, setTargetAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [saving, setSaving] = useState(false);

  const isEmpty = clients.length === 0 && visits.length === 0 && salesPlans.length === 0;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const plan = salesPlans[0];

  const handleSavePlan = async () => {
    if (!targetAmount) {
      Alert.alert('Ошибка', 'Укажите целевую сумму');
      return;
    }
    setSaving(true);
    if (plan) {
      await updateSalesPlan(plan.id, { targetAmount: parseFloat(targetAmount), period });
    } else {
      await addSalesPlan({ targetAmount: parseFloat(targetAmount), period, year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
    }
    setSaving(false);
    setModalVisible(false);
    setTargetAmount('');
  };

  const openPlanModal = () => {
    if (plan) {
      setTargetAmount(String(plan.targetAmount));
      setPeriod(plan.period);
    }
    setModalVisible(true);
  };

  return (
    <ScreenContainer title={COPY.analytics.title} subtitle={COPY.analytics.subtitle}>
      {isEmpty ? (
        <EmptyState icon="bar-chart-outline" title="Нет данных для аналитики" message={COPY.analytics.emptyMessage} actionLabel="Создать план продаж" onAction={() => setModalVisible(true)} />
      ) : (
        <>
          <View style={[styles.statsRow, !isDesktop && styles.statsRowMobile]}>
            <StatCard title="Аптеки" value={String(clients.length)} icon="storefront-outline" />
            <StatCard title="Визиты" value={String(visits.length)} icon="medical-outline" color={colors.secondary} />
          </View>
          <View style={[styles.statsRow, !isDesktop && styles.statsRowMobile]}>
            <StatCard title="Задачи" value={String(tasks.length)} icon="checkbox-outline" color={colors.info} />
            <StatCard title="Расходы" value={formatCurrency(totalExpenses)} icon="wallet-outline" color={colors.warning} />
          </View>

          <SectionHeader title="План продаж" action={{ label: plan ? 'Изменить' : 'Создать', onPress: openPlanModal }} />
          {plan ? (
            <Card>
              <Text style={styles.planValue}>{formatCurrency(plan.actualAmount)} / {formatCurrency(plan.targetAmount)}</Text>
              <Text style={styles.planDev}>Отклонение: {formatPercent(plan.deviationPercent)}</Text>
            </Card>
          ) : (
            <Card variant="outlined"><Text style={styles.emptyText}>План не задан — создайте свой</Text></Card>
          )}
        </>
      )}

      <FormModal visible={modalVisible} title={plan ? 'Изменить план' : 'План продаж'} onClose={() => setModalVisible(false)}>
        <Input label="Целевая сумма *" value={targetAmount} onChangeText={setTargetAmount} keyboardType="numeric" placeholder="1000000" />
        <Select label="Период" value={period} options={[{ label: 'Месяц', value: 'monthly' }, { label: 'Квартал', value: 'quarterly' }, { label: 'Год', value: 'yearly' }]} onChange={(v) => setPeriod(v as typeof period)} />
        <Button title="Сохранить" onPress={handleSavePlan} loading={saving} fullWidth />
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  statsRowMobile: { flexWrap: 'wrap' },
  planValue: { ...typography.h3, color: colors.text },
  planDev: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
