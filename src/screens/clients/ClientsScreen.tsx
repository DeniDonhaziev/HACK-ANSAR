import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore, useAuthStore } from '../../stores';
import { COPY, PHARMACY_CATEGORIES } from '../../constants/copy';
import { colors, spacing, typography } from '../../constants/theme';
import { Client } from '../../types';

export function ClientsScreen() {
  const { clients, addClient, removeClient, addAuditEntry } = useDataStore();
  const user = useAuthStore((s) => s.user);
  const [modalVisible, setModalVisible] = useState(false);
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

  const resetForm = () => {
    setName(''); setInn(''); setOgrn(''); setBik(''); setPhone('');
    setAddress(''); setCity(''); setRegion(''); setCategory('B');
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
    setSaving(false);
    resetForm();
    setModalVisible(false);
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
            renderItem={({ item }) => (
              <Card>
                <View style={styles.row}>
                  <Badge label={COPY.pharmacy.badge} variant="primary" />
                  {item.category ? <Badge label={`Кат. ${item.category}`} variant="info" /> : null}
                </View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.rowText}>ИНН: {item.inn}</Text>
                {item.ogrn ? <Text style={styles.rowText}>ОГРН: {item.ogrn}</Text> : null}
                {item.bik ? <Text style={styles.rowText}>БИК: {item.bik}</Text> : null}
                <Text style={styles.rowText}>Тел.: {item.phone}</Text>
                {item.address ? <Text style={styles.address}>{item.address}{item.city ? `, ${item.city}` : ''}</Text> : null}
                <Button title={COPY.common.delete} onPress={() => handleDelete(item)} variant="ghost" icon="trash-outline" />
              </Card>
            )}
            scrollEnabled={false}
          />
        )}
      </ScreenContainer>

      {clients.length > 0 && <Fab onPress={() => setModalVisible(true)} />}

      <FormModal visible={modalVisible} title={COPY.pharmacy.modalTitle} onClose={() => setModalVisible(false)}>
        <Input label={`${COPY.pharmacy.nameLabel} *`} value={name} onChangeText={setName} placeholder={COPY.pharmacy.namePlaceholder} />
        <Input label={`${COPY.pharmacy.innLabel} *`} value={inn} onChangeText={setInn} placeholder={COPY.pharmacy.innPlaceholder} keyboardType="numeric" />
        <Input label={COPY.pharmacy.ogrnLabel} value={ogrn} onChangeText={setOgrn} placeholder={COPY.pharmacy.ogrnPlaceholder} keyboardType="numeric" />
        <Input label={COPY.pharmacy.bikLabel} value={bik} onChangeText={setBik} placeholder={COPY.pharmacy.bikPlaceholder} keyboardType="numeric" />
        <Input label={`${COPY.pharmacy.phoneLabel} *`} value={phone} onChangeText={setPhone} placeholder={COPY.pharmacy.phonePlaceholder} keyboardType="phone-pad" />
        <Input label={COPY.pharmacy.addressLabel} value={address} onChangeText={setAddress} placeholder={COPY.pharmacy.addressPlaceholder} />
        <Input label={COPY.pharmacy.cityLabel} value={city} onChangeText={setCity} placeholder={COPY.pharmacy.cityPlaceholder} />
        <Input label={COPY.pharmacy.regionLabel} value={region} onChangeText={setRegion} placeholder={COPY.pharmacy.regionPlaceholder} />
        <Select label={COPY.pharmacy.categoryLabel} value={category ?? 'B'} options={PHARMACY_CATEGORIES} onChange={(v) => setCategory(v as Client['category'])} />
        <Button title={COPY.pharmacy.saveBtn} onPress={handleSave} loading={saving} fullWidth icon="checkmark" />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  name: { ...typography.h3, color: colors.text },
  rowText: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  address: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});
