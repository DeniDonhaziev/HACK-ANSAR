import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDate, normalizeToISO } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';
import { Task } from '../../types';
import { COPY } from '../../constants/copy';

const PRIORITIES = [
  { label: 'Низкий', value: 'low' },
  { label: 'Средний', value: 'medium' },
  { label: 'Высокий', value: 'high' },
  { label: 'Срочный', value: 'urgent' },
];

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Низкий', medium: 'Средний', high: 'Высокий', urgent: 'Срочный',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Новая', in_progress: 'В работе', completed: 'Выполнена', cancelled: 'Отменена',
};

export function TasksScreen() {
  const tasks = useDataStore((s) => s.tasks);
  const clients = useDataStore((s) => s.clients);
  const addTask = useDataStore((s) => s.addTask);
  const updateTask = useDataStore((s) => s.updateTask);
  const removeTask = useDataStore((s) => s.removeTask);
  const syncTasks = useDataStore((s) => s.syncTasks);
  const hydrated = useDataStore((s) => s.hydrated);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [clientId, setClientId] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const clientMap = useMemo(
    () => new Map(clients.map((c) => [c.id, c.name])),
    [clients],
  );

  useFocusEffect(
    useCallback(() => {
      if (!hydrated) return;
      let active = true;
      (async () => {
        setSyncing(true);
        try {
          await syncTasks();
        } finally {
          if (active) setSyncing(false);
        }
      })();
      return () => { active = false; };
    }, [hydrated, syncTasks]),
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setClientId('');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(COPY.common.error, COPY.tasks.errorFields);
      return;
    }
    setSaving(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: normalizeToISO(dueDate),
        priority,
        clientId: clientId || undefined,
      });
      setModalVisible(false);
      resetForm();
    } catch {
      Alert.alert(COPY.common.error, 'Не удалось сохранить задачу');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    await updateTask({ ...task, status: task.status === 'completed' ? 'new' : 'completed' });
  };

  const isLoading = !hydrated || syncing;
  const isEmpty = !isLoading && tasks.length === 0;

  return (
    <View style={styles.wrap}>
      <ScreenContainer
        title={COPY.tasks.title}
        subtitle={tasks.length > 0 ? COPY.tasks.subtitleCount(tasks.length) : COPY.tasks.subtitleEmpty}
        fabSafe
      >
        {isLoading ? (
          <Text style={styles.loading}>Загрузка задач...</Text>
        ) : isEmpty ? (
          <EmptyState
            icon="checkbox-outline"
            title={COPY.tasks.emptyTitle}
            message={COPY.tasks.emptyMessage}
            actionLabel={COPY.tasks.addBtn}
            onAction={() => setModalVisible(true)}
          />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.row}>
                  <Badge label={PRIORITY_LABELS[item.priority] ?? item.priority} variant={item.priority === 'urgent' ? 'error' : 'default'} />
                  <Badge label={STATUS_LABELS[item.status] ?? item.status} variant={item.status === 'completed' ? 'success' : 'info'} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                {item.clientId && clientMap.has(item.clientId) ? (
                  <Text style={styles.client}>Аптека: {clientMap.get(item.clientId)}</Text>
                ) : null}
                {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
                <Text style={styles.meta}>до {formatDate(item.dueDate)}</Text>
                <Button title={item.status === 'completed' ? 'Вернуть в работу' : 'Выполнено'} onPress={() => toggleComplete(item)} variant="outline" />
                <Button title="Удалить" onPress={() => removeTask(item.id)} variant="ghost" icon="trash-outline" />
              </Card>
            )}
            scrollEnabled={false}
          />
        )}
      </ScreenContainer>
      {!isLoading && <Fab onPress={() => setModalVisible(true)} />}
      <FormModal visible={modalVisible} title={COPY.tasks.modalTitle} onClose={() => !saving && setModalVisible(false)}>
        <Input label="Название *" value={title} onChangeText={setTitle} placeholder="Подготовить отчёт" />
        <Input label="Описание" value={description} onChangeText={setDescription} multiline placeholder="Детали..." />
        <Input label="Срок" value={dueDate} onChangeText={setDueDate} placeholder="2026-06-20" />
        <Select label="Приоритет" value={priority} options={PRIORITIES} onChange={(v) => setPriority(v as Task['priority'])} />
        {clients.length > 0 ? (
          <Select
            label="Аптека (необязательно)"
            value={clientId}
            options={[{ label: 'Без привязки', value: '' }, ...clients.map((c) => ({ label: c.name, value: c.id }))]}
            onChange={setClientId}
          />
        ) : null}
        <Button title="Сохранить" onPress={handleSave} loading={saving} fullWidth />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  loading: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  title: { ...typography.h3, color: colors.text },
  client: { ...typography.caption, color: colors.accentDark, marginTop: 4, fontWeight: '600' },
  desc: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4, marginBottom: spacing.sm },
});
