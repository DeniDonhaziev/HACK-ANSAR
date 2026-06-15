import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore } from '../../stores';
import { formatDate } from '../../utils/format';
import { COPY, CONSENT_TYPE_OPTIONS } from '../../constants/copy';
import { colors, spacing, typography } from '../../constants/theme';
import { ConsentType, ConsentChannel } from '../../types';

const CHANNELS = [
  { label: 'Электронный документ', value: 'electronic' },
  { label: 'Бумажный носитель', value: 'paper' },
  { label: 'Электронная почта', value: 'email' },
];

export function ConsentsScreen() {
  const { goTo } = useAppNavigation();
  const { clients, consents, addConsent, revokeConsent } = useDataStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<ConsentType>('pharmacy_communication');
  const [channel, setChannel] = useState<ConsentChannel>('electronic');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!clientId) {
      Alert.alert(COPY.common.error, COPY.consents.selectPharmacy);
      return;
    }
    setSaving(true);
    await addConsent({ type, clientId, receivedAt: new Date().toISOString(), expiresAt: expiresAt || undefined, channel });
    setSaving(false);
    setModalVisible(false);
  };

  return (
    <View style={styles.wrap}>
      <ScreenContainer title={COPY.consents.title} subtitle={COPY.consents.subtitle} fabSafe>
        {consents.length === 0 ? (
          <EmptyState
            icon="shield-checkmark-outline"
            title={COPY.consents.emptyTitle}
            message={clients.length === 0 ? COPY.consents.emptyNoPharmacies : COPY.consents.emptyMessage}
            actionLabel={clients.length > 0 ? COPY.consents.addBtn : 'Перейти к аптекам'}
            onAction={() => clients.length > 0 ? setModalVisible(true) : goTo('Clients')}
          />
        ) : (
          <FlatList
            data={consents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card>
                <Badge label={item.isActive ? 'Действует' : 'Отозвано'} variant={item.isActive ? 'success' : 'error'} />
                <Text style={styles.client}>{item.clientName}</Text>
                <Text style={styles.meta}>Получено: {formatDate(item.receivedAt)} · Канал: {item.channel}</Text>
                {item.isActive && (
                  <Button title="Отозвать согласие" onPress={() => revokeConsent(item.id, 'Отозвано пользователем')} variant="danger" />
                )}
              </Card>
            )}
            scrollEnabled={false}
          />
        )}
      </ScreenContainer>
      {clients.length > 0 && <Fab onPress={() => setModalVisible(true)} />}
      <FormModal visible={modalVisible} title="Регистрация согласия" onClose={() => setModalVisible(false)}>
        <Select label="Аптека *" value={clientId} options={clients.map((c) => ({ label: c.name, value: c.id }))} onChange={setClientId} />
        <Select label="Тип согласия" value={type} options={CONSENT_TYPE_OPTIONS} onChange={(v) => setType(v as ConsentType)} />
        <Select label="Канал получения" value={channel} options={CHANNELS} onChange={(v) => setChannel(v as ConsentChannel)} />
        <Input label="Срок действия" value={expiresAt} onChangeText={setExpiresAt} placeholder="2027-01-01" />
        <Button title={COPY.common.save} onPress={handleSave} loading={saving} fullWidth />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  client: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
