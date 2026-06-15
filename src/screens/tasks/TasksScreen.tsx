import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDate } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';
import { Task } from '../../types';

const PRIORITIES = [
  { label: 'Низкий', value: 'low' },
  { label: 'Средний', value: 'medium' },
  { label: 'Высокий', value: 'high' },
  { label: 'Срочный', value: 'urgent' },
];

export function TasksScreen() {
  const { tasks, addTask, updateTask, removeTask } = useDataStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !dueDate.trim()) {
      Alert.alert('Ошибка', 'Укажите название и срок');
      return;
    }
    setSaving(true);
    await addTask({ title: title.trim(), description: description.trim() || undefined, dueDate: new Date(dueDate).toISOString(), priority });
    setSaving(false);
    setModalVisible(false);
    setTitle(''); setDescription(''); setDueDate('');
  };

  const toggleComplete = async (task: Task) => {
    await updateTask({ ...task, status: task.status === 'completed' ? 'new' : 'completed' });
  };

  return (
    <View style={styles.wrap}>
      <ScreenContainer title="Задачи" subtitle={tasks.length > 0 ? `${tasks.length} задач` : 'Создайте свои задачи'}>
        {tasks.length === 0 ? (
          <EmptyState icon="checkbox-outline" title="Задач пока нет" message="Добавьте задачи для планирования работы" actionLabel="Добавить задачу" onAction={() => setModalVisible(true)} />
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.row}>
                  <Badge label={item.priority} variant={item.priority === 'urgent' ? 'error' : 'default'} />
                  <Badge label={item.status} variant={item.status === 'completed' ? 'success' : 'info'} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
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
      <Fab onPress={() => setModalVisible(true)} />
      <FormModal visible={modalVisible} title="Новая задача" onClose={() => setModalVisible(false)}>
        <Input label="Название *" value={title} onChangeText={setTitle} placeholder="Подготовить отчёт" />
        <Input label="Описание" value={description} onChangeText={setDescription} multiline placeholder="Детали..." />
        <Input label="Срок *" value={dueDate} onChangeText={setDueDate} placeholder="2026-06-20" />
        <Select label="Приоритет" value={priority} options={PRIORITIES} onChange={(v) => setPriority(v as Task['priority'])} />
        <Button title="Сохранить" onPress={handleSave} loading={saving} fullWidth />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  title: { ...typography.h3, color: colors.text },
  desc: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4, marginBottom: spacing.sm },
});
