import React, { useState } from 'react';
import { Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatCurrency } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';
import { ExpenseType } from '../../types';

const TYPES = [
  { label: 'Подарок', value: 'gift' }, { label: 'Питание', value: 'meal' },
  { label: 'Поездка', value: 'travel' }, { label: 'Образование', value: 'education' },
];

export function ExpensesScreen() {
  const { clients, expenses, addExpense } = useDataStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<ExpenseType>('gift');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [hcpId, setHcpId] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || !description.trim()) { Alert.alert('Ошибка', 'Укажите сумму и описание'); return; }
    setSaving(true);
    const client = clients.find((c) => c.id === hcpId);
    await addExpense({ type, amount: parseFloat(amount), description: description.trim(), hcpId: hcpId || undefined, hcpName: client?.name });
    setSaving(false);
    setModalVisible(false);
    setAmount(''); setDescription(''); setHcpId('');
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <ScreenContainer title="Маркетинговые расходы" subtitle={expenses.length > 0 ? `Всего: ${formatCurrency(total)}` : 'Учёт расходов на аптечную сеть'}>
      {expenses.length === 0 ? (
        <EmptyState icon="wallet-outline" title="Расходы не зарегистрированы" message="Учитывайте промо-активности, мерчандайзинг и иные расходы, связанные с аптечной сетью." actionLabel="Добавить расход" onAction={() => setModalVisible(true)} />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card>
              <Badge label={item.type} variant="info" />
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              {item.hcpName && <Text style={styles.hcp}>{item.hcpName}</Text>}
            </Card>
          )}
          scrollEnabled={false}
        />
      )}
      <Fab onPress={() => setModalVisible(true)} />
      <FormModal visible={modalVisible} title="Новый расход" onClose={() => setModalVisible(false)}>
        <Select label="Тип" value={type} options={TYPES} onChange={(v) => setType(v as ExpenseType)} />
        <Input label="Сумма *" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="5000" />
        <Input label="Описание *" value={description} onChangeText={setDescription} />
        {clients.length > 0 && <Select label="Аптека" value={hcpId} options={[{ label: '—', value: '' }, ...clients.map((c) => ({ label: c.name, value: c.id }))]} onChange={setHcpId} />}
        <Button title="Сохранить" onPress={handleSave} loading={saving} fullWidth />
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  amount: { ...typography.h3, color: colors.primary, marginTop: spacing.sm },
  desc: { ...typography.body, color: colors.text, marginTop: 4 },
  hcp: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
