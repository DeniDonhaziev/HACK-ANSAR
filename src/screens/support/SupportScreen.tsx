import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDateTime } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';
import { SupportTicket } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  open: 'Открыто', in_progress: 'В работе', resolved: 'Решено', closed: 'Закрыто',
};

const PRIORITIES = [
  { label: 'Низкий', value: 'low' },
  { label: 'Средний', value: 'medium' },
  { label: 'Высокий', value: 'high' },
];

export function SupportScreen() {
  const { clients, supportTickets, addSupportTicket, updateSupportTicket, removeSupportTicket } = useDataStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [saving, setSaving] = useState(false);

  const openCount = supportTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length;

  const handleSave = async () => {
    const name = clientId ? clients.find((c) => c.id === clientId)?.name ?? clientName : clientName;
    if (!name.trim() || !subject.trim()) {
      Alert.alert('Ошибка', 'Укажите аптеку и тему обращения');
      return;
    }
    setSaving(true);
    await addSupportTicket({
      clientId: clientId || undefined,
      clientName: name.trim(),
      subject: subject.trim(),
      description: description.trim(),
      priority,
    });
    setSaving(false);
    setModalVisible(false);
    setClientId(''); setClientName(''); setSubject(''); setDescription('');
  };

  const setStatus = async (ticket: SupportTicket, status: SupportTicket['status']) => {
    await updateSupportTicket({
      ...ticket,
      status,
      resolvedAt: status === 'resolved' || status === 'closed' ? new Date().toISOString() : ticket.resolvedAt,
    });
  };

  return (
    <View style={styles.wrap}>
      <ScreenContainer
        title="Обращения аптек"
        subtitle={openCount > 0 ? `${openCount} в работе` : 'Регистрация и обработка запросов'}
        fabSafe
      >
        {supportTickets.length === 0 ? (
          <EmptyState
            icon="headset-outline"
            title="Обращений нет"
            message="Здесь фиксируются звонки, письма и заявки от аптечных точек"
            actionLabel="Новое обращение"
            onAction={() => setModalVisible(true)}
          />
        ) : (
          <FlatList
            data={supportTickets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.row}>
                  <Badge label={STATUS_LABELS[item.status] ?? item.status} variant={item.status === 'resolved' ? 'success' : 'warning'} />
                  <Badge label={item.priority === 'high' ? 'Срочно' : 'Обычное'} variant={item.priority === 'high' ? 'error' : 'default'} />
                </View>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.client}>{item.clientName}</Text>
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
                <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
                {item.status === 'open' && (
                  <Button title="Взять в работу" onPress={() => setStatus(item, 'in_progress')} variant="outline" />
                )}
                {item.status === 'in_progress' && (
                  <Button title="Отметить решённым" onPress={() => setStatus(item, 'resolved')} icon="checkmark-circle-outline" />
                )}
                <Button title="Удалить" onPress={() => removeSupportTicket(item.id)} variant="ghost" icon="trash-outline" />
              </Card>
            )}
            scrollEnabled={false}
          />
        )}
      </ScreenContainer>
      <Fab onPress={() => setModalVisible(true)} icon="headset-outline" />
      <FormModal visible={modalVisible} title="Новое обращение" onClose={() => setModalVisible(false)}>
        {clients.length > 0 ? (
          <Select
            label="Аптека"
            value={clientId}
            options={[{ label: '— ввести вручную —', value: '' }, ...clients.map((c) => ({ label: c.name, value: c.id }))]}
            onChange={setClientId}
          />
        ) : null}
        {!clientId && (
          <Input label="Название аптеки *" value={clientName} onChangeText={setClientName} placeholder="ООО «Аптека №1»" />
        )}
        <Input label="Тема *" value={subject} onChangeText={setSubject} placeholder="Вопрос по заказу" />
        <Input label="Описание" value={description} onChangeText={setDescription} multiline placeholder="Детали обращения..." />
        <Select label="Приоритет" value={priority} options={PRIORITIES} onChange={(v) => setPriority(v as SupportTicket['priority'])} />
        <Button title="Зарегистрировать" onPress={handleSave} loading={saving} fullWidth />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  subject: { ...typography.h3, color: colors.text },
  client: { ...typography.label, color: colors.secondary, marginTop: 4 },
  desc: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4, marginBottom: spacing.sm },
});
