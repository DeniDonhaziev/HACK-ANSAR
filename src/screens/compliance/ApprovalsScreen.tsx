import React, { useState } from 'react';
import { Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';
import { ApprovalType } from '../../types';

const TYPES: { label: string; value: ApprovalType }[] = [
  { label: 'Скидка', value: 'discount' }, { label: 'Договор', value: 'contract' },
  { label: 'Промо', value: 'promo_material' }, { label: 'Мероприятие', value: 'event' },
  { label: 'Бюджет', value: 'budget' }, { label: 'Подарок', value: 'gift_expense' },
];

export function ApprovalsScreen() {
  const { approvals, addApproval, decideApproval } = useDataStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<ApprovalType>('discount');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) { Alert.alert('Ошибка', 'Укажите название'); return; }
    setSaving(true);
    await addApproval({ type, title: title.trim(), description: description.trim(), amount: amount ? parseFloat(amount) : undefined });
    setSaving(false);
    setModalVisible(false);
    setTitle(''); setDescription(''); setAmount('');
  };

  return (
    <ScreenContainer title="Согласования" subtitle="Создавайте заявки на согласование">
      {approvals.length === 0 ? (
        <EmptyState icon="checkmark-circle-outline" title="Согласований нет" message="Создайте заявку на скидку, договор или мероприятие" actionLabel="Новая заявка" onAction={() => setModalVisible(true)} />
      ) : (
        <FlatList
          data={approvals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card>
              <Badge label={item.status} variant={item.status === 'approved' ? 'success' : 'warning'} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              {item.amount ? <Text style={styles.amount}>{formatCurrency(item.amount)}</Text> : null}
              <Text style={styles.meta}>{item.requesterName} • {formatDateTime(item.createdAt)}</Text>
              {item.status === 'pending' && (
                <Button title="Одобрить" onPress={() => decideApproval(item.id, 'approved')} variant="outline" />
              )}
            </Card>
          )}
          scrollEnabled={false}
        />
      )}
      <Fab onPress={() => setModalVisible(true)} />
      <FormModal visible={modalVisible} title="Новая заявка" onClose={() => setModalVisible(false)}>
        <Select label="Тип" value={type} options={TYPES} onChange={(v) => setType(v as ApprovalType)} />
        <Input label="Название *" value={title} onChangeText={setTitle} />
        <Input label="Описание" value={description} onChangeText={setDescription} multiline />
        <Input label="Сумма" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Button title="Создать" onPress={handleSave} loading={saving} fullWidth />
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  desc: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  amount: { ...typography.label, color: colors.primary, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
