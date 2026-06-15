import React, { useState } from 'react';
import { Text, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer, Input, Button } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal, SectionHeader } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDate } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';

export function WarehouseScreen() {
  const { batches, shipments, addBatch, addShipment } = useDataStore();
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

  const saveBatch = async () => {
    if (!productName || !batchNumber || !quantity) return;
    setSaving(true);
    await addBatch({ productName, batchNumber, quantity: parseInt(quantity, 10), expiryDate: expiryDate || new Date().toISOString(), warehouseName: warehouseName || 'Склад' });
    setSaving(false);
    setBatchModal(false);
    setProductName(''); setBatchNumber(''); setQuantity(''); setExpiryDate(''); setWarehouseName('');
  };

  const saveShipment = async () => {
    if (!shipNumber || !recipientName) return;
    setSaving(true);
    await addShipment({ number: shipNumber, recipientName, route: route || '—', carrier: carrier || '—' });
    setSaving(false);
    setShipModal(false);
    setShipNumber(''); setRecipientName(''); setRoute(''); setCarrier('');
  };

  const isEmpty = batches.length === 0 && shipments.length === 0;

  return (
    <ScreenContainer title="Склад и логистика" subtitle="Учёт серий и поставок">
      {isEmpty ? (
        <EmptyState icon="cube-outline" title="Данных склада нет" message="Добавьте серии препаратов и поставки" actionLabel="Добавить серию" onAction={() => setBatchModal(true)} />
      ) : (
        <>
          <SectionHeader title="Серии" action={{ label: 'Добавить', onPress: () => setBatchModal(true) }} />
          {batches.map((b) => (
            <Card key={b.id}>
              <Badge label={b.status} variant="success" />
              <Text style={styles.name}>{b.productName}</Text>
              <Text style={styles.meta}>Серия {b.batchNumber} • {b.available} шт. • до {formatDate(b.expiryDate)}</Text>
            </Card>
          ))}
          <SectionHeader title="Поставки" action={{ label: 'Добавить', onPress: () => setShipModal(true) }} />
          {shipments.map((s) => (
            <Card key={s.id}>
              <Badge label={s.status} variant="info" />
              <Text style={styles.name}>{s.number}</Text>
              <Text style={styles.meta}>{s.recipientName} • {s.route}</Text>
            </Card>
          ))}
        </>
      )}

      <FormModal visible={batchModal} title="Новая серия" onClose={() => setBatchModal(false)}>
        <Input label="Препарат *" value={productName} onChangeText={setProductName} />
        <Input label="Номер серии *" value={batchNumber} onChangeText={setBatchNumber} />
        <Input label="Количество *" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
        <Input label="Срок годности" value={expiryDate} onChangeText={setExpiryDate} placeholder="2028-01-01" />
        <Input label="Склад" value={warehouseName} onChangeText={setWarehouseName} />
        <Button title="Сохранить" onPress={saveBatch} loading={saving} fullWidth />
      </FormModal>

      <FormModal visible={shipModal} title="Новая поставка" onClose={() => setShipModal(false)}>
        <Input label="Номер *" value={shipNumber} onChangeText={setShipNumber} />
        <Input label="Получатель *" value={recipientName} onChangeText={setRecipientName} />
        <Input label="Маршрут" value={route} onChangeText={setRoute} />
        <Input label="Перевозчик" value={carrier} onChangeText={setCarrier} />
        <Button title="Сохранить" onPress={saveShipment} loading={saving} fullWidth />
      </FormModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  name: { ...typography.label, color: colors.text, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
