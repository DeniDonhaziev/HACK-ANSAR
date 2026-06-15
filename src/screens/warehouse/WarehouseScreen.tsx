import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer, Input, Button } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal, SectionHeader } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDate, normalizeToISO } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';

const STATUS_LABELS: Record<string, string> = {
  available: 'В наличии', reserved: 'Резерв', blocked: 'Заблокировано', expired: 'Просрочено',
  created: 'Создана', in_transit: 'В пути', delivered: 'Доставлена',
};

export function WarehouseScreen() {
  const batches = useDataStore((s) => s.batches);
  const shipments = useDataStore((s) => s.shipments);
  const addBatch = useDataStore((s) => s.addBatch);
  const addShipment = useDataStore((s) => s.addShipment);
  const syncWarehouse = useDataStore((s) => s.syncWarehouse);
  const hydrated = useDataStore((s) => s.hydrated);

  const [batchModal, setBatchModal] = useState(false);
  const [shipModal, setShipModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [shipNumber, setShipNumber] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [route, setRoute] = useState('');
  const [carrier, setCarrier] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!useDataStore.getState().hydrated) return;
      let active = true;
      (async () => {
        setSyncing(true);
        try {
          await syncWarehouse();
        } finally {
          if (active) setSyncing(false);
        }
      })();
      return () => { active = false; };
    }, [syncWarehouse]),
  );

  const resetBatchForm = () => {
    setProductName('');
    setBatchNumber('');
    setQuantity('');
    setExpiryDate('');
    setWarehouseName('');
  };

  const resetShipForm = () => {
    setShipNumber('');
    setRecipientName('');
    setRoute('');
    setCarrier('');
  };

  const saveBatch = async () => {
    const qty = parseInt(quantity, 10);
    if (!productName.trim() || !batchNumber.trim() || !quantity.trim() || Number.isNaN(qty) || qty <= 0) {
      Alert.alert('Ошибка', 'Заполните препарат, серию и корректное количество');
      return;
    }
    setSaving(true);
    try {
      await addBatch({
        productName: productName.trim(),
        batchNumber: batchNumber.trim(),
        quantity: qty,
        expiryDate: normalizeToISO(expiryDate),
        warehouseName: warehouseName.trim() || 'Склад',
      });
      setBatchModal(false);
      resetBatchForm();
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить серию. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const saveShipment = async () => {
    if (!shipNumber.trim() || !recipientName.trim()) {
      Alert.alert('Ошибка', 'Укажите номер и получателя');
      return;
    }
    setSaving(true);
    try {
      await addShipment({
        number: shipNumber.trim(),
        recipientName: recipientName.trim(),
        route: route.trim() || '—',
        carrier: carrier.trim() || '—',
      });
      setShipModal(false);
      resetShipForm();
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить поставку. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = hydrated && !syncing && batches.length === 0 && shipments.length === 0;

  const openFabMenu = () => {
    Alert.alert('Добавить', 'Выберите тип записи', [
      { text: 'Серия препарата', onPress: () => setBatchModal(true) },
      { text: 'Поставка', onPress: () => setShipModal(true) },
      { text: 'Отмена', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <ScreenContainer title="Склад и логистика" subtitle="Учёт серий и поставок" fabSafe>
        {!hydrated || syncing ? (
          <Text style={styles.loading}>Загрузка данных склада...</Text>
        ) : isEmpty ? (
          <EmptyState
            icon="cube-outline"
            title="Данных склада нет"
            message="Добавьте серии препаратов и поставки — они сохранятся автоматически"
            actionLabel="Добавить серию"
            onAction={() => setBatchModal(true)}
          />
        ) : (
          <>
            <SectionHeader title={`Серии (${batches.length})`} action={{ label: 'Добавить', onPress: () => setBatchModal(true) }} />
            {batches.length === 0 ? (
              <Text style={styles.sectionEmpty}>Серий пока нет</Text>
            ) : (
              batches.map((b) => (
                <Card key={b.id}>
                  <Badge label={STATUS_LABELS[b.status] ?? b.status} variant="success" />
                  <Text style={styles.name}>{b.productName}</Text>
                  <Text style={styles.meta}>
                    Серия {b.batchNumber} • {b.available} шт. • {b.warehouseName} • до {formatDate(b.expiryDate)}
                  </Text>
                </Card>
              ))
            )}
            <SectionHeader title={`Поставки (${shipments.length})`} action={{ label: 'Добавить', onPress: () => setShipModal(true) }} />
            {shipments.length === 0 ? (
              <Text style={styles.sectionEmpty}>Поставок пока нет</Text>
            ) : (
              shipments.map((s) => (
                <Card key={s.id}>
                  <Badge label={STATUS_LABELS[s.status] ?? s.status} variant="info" />
                  <Text style={styles.name}>{s.number}</Text>
                  <Text style={styles.meta}>{s.recipientName} • {s.route}</Text>
                </Card>
              ))
            )}
          </>
        )}
      </ScreenContainer>

      {hydrated && !syncing && <Fab onPress={openFabMenu} icon="add" />}

      <FormModal visible={batchModal} title="Новая серия" onClose={() => !saving && setBatchModal(false)}>
        <Input label="Препарат *" value={productName} onChangeText={setProductName} />
        <Input label="Номер серии *" value={batchNumber} onChangeText={setBatchNumber} />
        <Input label="Количество *" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
        <Input label="Срок годности" value={expiryDate} onChangeText={setExpiryDate} placeholder="2028-01-01" />
        <Input label="Склад" value={warehouseName} onChangeText={setWarehouseName} placeholder="Склад №1" />
        <Button title="Сохранить" onPress={saveBatch} loading={saving} fullWidth />
      </FormModal>

      <FormModal visible={shipModal} title="Новая поставка" onClose={() => !saving && setShipModal(false)}>
        <Input label="Номер *" value={shipNumber} onChangeText={setShipNumber} />
        <Input label="Получатель *" value={recipientName} onChangeText={setRecipientName} />
        <Input label="Маршрут" value={route} onChangeText={setRoute} />
        <Input label="Перевозчик" value={carrier} onChangeText={setCarrier} />
        <Button title="Сохранить" onPress={saveShipment} loading={saving} fullWidth />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  loading: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  sectionEmpty: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md, paddingLeft: spacing.xs },
  name: { ...typography.label, color: colors.text, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
