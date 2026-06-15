import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDate } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';
import { DocumentCategory } from '../../types';

const CATEGORIES = [
  { label: 'Договор', value: 'contract' }, { label: 'Счёт', value: 'invoice' },
  { label: 'Сертификат', value: 'certificate' }, { label: 'Отчёт', value: 'report' },
  { label: 'Согласие', value: 'consent' },
];

const CAT_LABELS: Record<string, string> = {
  contract: 'Договор', invoice: 'Счёт', certificate: 'Сертификат', report: 'Отчёт', consent: 'Согласие',
};

export function DocumentsScreen() {
  const { documents, addDocument } = useDataStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('contract');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Укажите название документа');
      return;
    }
    setSaving(true);
    await addDocument({ title: title.trim(), category });
    setSaving(false);
    setModalVisible(false);
    setTitle('');
  };

  return (
    <View style={styles.wrap}>
      <ScreenContainer title="Документы" subtitle="Ваше хранилище документов" fabSafe>
        {documents.length === 0 ? (
          <EmptyState icon="folder-open-outline" title="Документов нет" message="Добавьте договоры, сертификаты и другие документы" actionLabel="Добавить документ" onAction={() => setModalVisible(true)} />
        ) : (
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card>
                <Badge label={CAT_LABELS[item.category] ?? item.category} variant="info" />
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>v{item.version} • {formatDate(item.uploadedAt)} • {item.uploadedBy}</Text>
              </Card>
            )}
            scrollEnabled={false}
          />
        )}
      </ScreenContainer>
      <Fab onPress={() => setModalVisible(true)} />
      <FormModal visible={modalVisible} title="Новый документ" onClose={() => setModalVisible(false)}>
        <Input label="Название *" value={title} onChangeText={setTitle} />
        <Select label="Категория" value={category} options={CATEGORIES} onChange={(v) => setCategory(v as DocumentCategory)} />
        <Button title="Сохранить" onPress={handleSave} loading={saving} fullWidth />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  title: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
