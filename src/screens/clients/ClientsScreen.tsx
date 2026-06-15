import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore, useAuthStore } from '../../stores';
import { COPY, PHARMACY_CATEGORIES } from '../../constants/copy';
import { colors, spacing, typography } from '../../constants/theme';
import { Client, Task } from '../../types';
import { formatDate, normalizeToISO } from '../../utils/format';

const TASK_PRIORITIES = [
  { label: 'Низкий', value: 'low' },
  { label: 'Средний', value: 'medium' },
  { label: 'Высокий', value: 'high' },
  { label: 'Срочный', value: 'urgent' },
];

const TASK_STATUS_LABELS: Record<string, string> = {
  new: 'Новая', in_progress: 'В работе', completed: 'Выполнена', cancelled: 'Отменена',
};

export function ClientsScreen() {
  const clients = useDataStore((s) => s.clients);
  const tasks = useDataStore((s) => s.tasks);
  const addClient = useDataStore((s) => s.addClient);
  const removeClient = useDataStore((s) => s.removeClient);
  const addTask = useDataStore((s) => s.addTask);
  const addAuditEntry = useDataStore((s) => s.addAuditEntry);
  const user = useAuthStore((s) => s.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskClientId, setTaskClientId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('medium');
  const [name, setName] = useState('');
  const [inn, setInn] = useState('');
  const [ogrn, setOgrn] = useState('');
  const [bik, setBik] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState<Client['category']>('B');
  const [saving, setSaving] = useState(false);
  const [taskSaving, setTaskSaving] = useState(false);

  const tasksByClient = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.clientId) continue;
      const list = map.get(task.clientId) ?? [];
      list.push(task);
      map.set(task.clientId, list);
    }
    return map;
  }, [tasks]);

  const resetForm = () => {
    setName(''); setInn(''); setOgrn(''); setBik(''); setPhone('');
    setAddress(''); setCity(''); setRegion(''); setCategory('B');
  };

  const resetTaskForm = () => {
    setTaskClientId('');
    setTaskTitle('');
    setTaskDueDate('');
    setTaskPriority('medium');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(COPY.common.error, COPY.pharmacy.errorName);
      return;
    }
    if (!inn.trim()) {
      Alert.alert(COPY.common.error, COPY.pharmacy.errorInn);
      return;
    }
    if (!phone.trim()) {
      Alert.alert(COPY.common.error, COPY.pharmacy.errorPhone);
      return;
    }
    setSaving(true);
    try {
      await addClient({
        name: name.trim(),
        type: 'pharmacy',
        inn: inn.trim(),
        ogrn: ogrn.trim() || undefined,
        bik: bik.trim() || undefined,
        phone: phone.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        region: region.trim() || undefined,
        category,
      });
      if (user) {
        await addAuditEntry({
          entityType: 'pharmacy',
          entityId: 'new',
          action: 'create',
          userId: user.id,
          userName: user.name,
          newValue: name.trim(),
        });
      }
      resetForm();
      setModalVisible(false);
    } catch {
      Alert.alert(COPY.common.error, 'Не удалось сохранить аптеку');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTask = async () => {
    if (!taskClientId || !taskTitle.trim()) {
      Alert.alert(COPY.common.error, 'Выберите аптеку и укажите название задачи');
      return;
    }
    setTaskSaving(true);
    try {
      await addTask({
        title: taskTitle.trim(),
        dueDate: normalizeToISO(taskDueDate),
        priority: taskPriority,
        clientId: taskClientId,
        description: 'Задача по аптечной точке из клиентской базы',
      });
      setTaskModalVisible(false);
      resetTaskForm();
    } catch {
      Alert.alert(COPY.common.error, 'Не удалось сохранить задачу');
    } finally {
      setTaskSaving(false);
    }
  };

  const openTaskModal = (client: Client) => {
    setTaskClientId(client.id);
    setTaskTitle(`Работа с аптекой: ${client.name}`);
    setTaskDueDate('');
    setTaskPriority('medium');
    setTaskModalVisible(true);
  };

  const handleDelete = (client: Client) => {
    Alert.alert(COPY.pharmacy.deleteConfirm, client.name, [
      { text: COPY.common.cancel },
      { text: COPY.common.delete, style: 'destructive', onPress: () => removeClient(client.id) },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <ScreenContainer
        title={COPY.pharmacy.title}
        subtitle={clients.length > 0 ? COPY.pharmacy.subtitleCount(clients.length) : COPY.pharmacy.subtitleEmpty}
        fabSafe
      >
        {clients.length === 0 ? (
          <EmptyState
            icon="storefront-outline"
            title={COPY.pharmacy.emptyTitle}
            message={COPY.pharmacy.emptyMessage}
            actionLabel={COPY.pharmacy.addBtn}
            onAction={() => setModalVisible(true)}
          />
        ) : (
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const clientTasks = tasksByClient.get(item.id) ?? [];
              const openTasks = clientTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
              return (
                <Card>
                  <View style={styles.row}>
                    <Badge label={COPY.pharmacy.badge} variant="primary" />
                    {item.category ? <Badge label={`Кат. ${item.category}`} variant="info" /> : null}
                    {openTasks.length > 0 ? (
                      <Badge label={`${openTasks.length} задач`} variant="warning" />
                    ) : null}
                  </View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.rowText}>ИНН: {item.inn}</Text>
                  {item.ogrn ? <Text style={styles.rowText}>ОГРН: {item.ogrn}</Text> : null}
                  {item.bik ? <Text style={styles.rowText}>БИК: {item.bik}</Text> : null}
                  <Text style={styles.rowText}>Тел.: {item.phone}</Text>
                  {item.address ? <Text style={styles.address}>{item.address}{item.city ? `, ${item.city}` : ''}</Text> : null}

                  {clientTasks.length > 0 && (
                    <View style={styles.tasksBlock}>
                      <Text style={styles.tasksTitle}>Задачи по аптеке</Text>
                      {clientTasks.slice(0, 3).map((task) => (
                        <View key={task.id} style={styles.taskRow}>
                          <Text style={styles.taskName} numberOfLines={1}>{task.title}</Text>
                          <Text style={styles.taskMeta}>
                            {TASK_STATUS_LABELS[task.status] ?? task.status} · до {formatDate(task.dueDate)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.actions}>
                    <Button title="Добавить задачу" onPress={() => openTaskModal(item)} variant="outline" icon="checkbox-outline" />
                    <Button title={COPY.common.delete} onPress={() => handleDelete(item)} variant="ghost" icon="trash-outline" />
                  </View>
                </Card>
              );
            }}
            scrollEnabled={false}
          />
        )}
      </ScreenContainer>

      <Fab onPress={() => setModalVisible(true)} />

      <FormModal visible={modalVisible} title={COPY.pharmacy.modalTitle} onClose={() => !saving && setModalVisible(false)}>
        <Input label={`${COPY.pharmacy.nameLabel} *`} value={name} onChangeText={setName} placeholder={COPY.pharmacy.namePlaceholder} />
        <Input label={`${COPY.pharmacy.innLabel} *`} value={inn} onChangeText={setInn} placeholder={COPY.pharmacy.innPlaceholder} keyboardType="numeric" />
        <Input label={COPY.pharmacy.ogrnLabel} value={ogrn} onChangeText={setOgrn} placeholder={COPY.pharmacy.ogrnPlaceholder} keyboardType="numeric" />
        <Input label={COPY.pharmacy.bikLabel} value={bik} onChangeText={setBik} placeholder={COPY.pharmacy.bikPlaceholder} keyboardType="numeric" />
        <Input label={`${COPY.pharmacy.phoneLabel} *`} value={phone} onChangeText={setPhone} placeholder={COPY.pharmacy.phonePlaceholder} keyboardType="phone-pad" />
        <Input label={COPY.pharmacy.addressLabel} value={address} onChangeText={setAddress} placeholder={COPY.pharmacy.addressPlaceholder} />
        <Input label={COPY.pharmacy.cityLabel} value={city} onChangeText={setCity} placeholder={COPY.pharmacy.cityPlaceholder} />
        <Input label={COPY.pharmacy.regionLabel} value={region} onChangeText={setRegion} placeholder={COPY.pharmacy.regionPlaceholder} />
        <Select label={COPY.pharmacy.categoryLabel} value={category ?? 'B'} options={PHARMACY_CATEGORIES} onChange={(v) => setCategory(v as Client['category'])} />
        <Text style={styles.hint}>После сохранения автоматически создастся задача на первичный контакт</Text>
        <Button title={COPY.pharmacy.saveBtn} onPress={handleSave} loading={saving} fullWidth icon="checkmark" />
      </FormModal>

      <FormModal visible={taskModalVisible} title="Задача по аптеке" onClose={() => !taskSaving && setTaskModalVisible(false)}>
        <Select
          label="Аптека *"
          value={taskClientId}
          options={clients.map((c) => ({ label: c.name, value: c.id }))}
          onChange={setTaskClientId}
        />
        <Input label="Название *" value={taskTitle} onChangeText={setTaskTitle} placeholder="Подготовить договор" />
        <Input label="Срок" value={taskDueDate} onChangeText={setTaskDueDate} placeholder="2026-06-20" />
        <Select label="Приоритет" value={taskPriority} options={TASK_PRIORITIES} onChange={(v) => setTaskPriority(v as Task['priority'])} />
        <Button title="Сохранить задачу" onPress={handleSaveTask} loading={taskSaving} fullWidth />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  name: { ...typography.h3, color: colors.text },
  rowText: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  address: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  tasksBlock: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tasksTitle: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  taskRow: { marginBottom: spacing.xs },
  taskName: { ...typography.body, color: colors.text, fontSize: 14 },
  taskMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  actions: { marginTop: spacing.sm, gap: spacing.xs },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md, marginTop: spacing.xs },
});
