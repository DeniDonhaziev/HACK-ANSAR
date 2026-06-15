import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button, Select } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore, useAuthStore } from '../../stores';
import { generateHash, getDeviceInfo, getMockIpAddress } from '../../utils/device';
import { formatDateTime } from '../../utils/format';
import { COPY, VISIT_STATUS_LABELS } from '../../constants/copy';
import { colors, spacing, typography } from '../../constants/theme';
import * as Location from 'expo-location';

export function VisitsScreen() {
  const { clients, visits, consents, addVisit, updateVisit, removeVisit, addSignature } = useDataStore();
  const user = useAuthStore((s) => s.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canCommunicate = (id: string) =>
    consents.some((c) => c.clientId === id && c.isActive && c.type === 'pharmacy_communication');

  const handleSave = async () => {
    if (!clientId || !date.trim()) {
      Alert.alert(COPY.common.error, COPY.visits.selectPharmacyAndDate);
      return;
    }
    setSaving(true);
    await addVisit({ clientId, plannedDate: new Date(date).toISOString() });
    setSaving(false);
    setModalVisible(false);
    setClientId('');
    setDate('');
  };

  const handleCheckIn = async (visitId: string) => {
    const visit = visits.find((v) => v.id === visitId);
    if (!visit) return;
    if (consents.length > 0 && !canCommunicate(visit.clientId)) {
      Alert.alert(COPY.common.error, COPY.visits.noConsent);
      return;
    }
    setCheckingIn(visitId);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat: number | undefined;
      let lng: number | undefined;
      let deviation: number | undefined;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        if (visit.clientLat && visit.clientLng) {
          deviation = Math.round(Math.sqrt(
            Math.pow((lat - visit.clientLat) * 111000, 2) +
            Math.pow((lng - visit.clientLng) * 111000, 2),
          ));
        }
      }
      await updateVisit({ ...visit, status: 'in_progress', checkInAt: new Date().toISOString(), checkInLat: lat, checkInLng: lng, deviationMeters: deviation });
    } catch {
      Alert.alert(COPY.common.error, COPY.visits.geoError);
    }
    setCheckingIn(null);
  };

  const handleCheckOut = async (visitId: string) => {
    const visit = visits.find((v) => v.id === visitId);
    if (!visit || !user) return;
    await updateVisit({
      ...visit,
      status: 'completed',
      checkOutAt: new Date().toISOString(),
      report: visit.report ?? COPY.visits.reportDefault,
    });
    const hash = await generateHash(`${visitId}-${user.id}-${Date.now()}`);
    await addSignature({
      id: `sig-${Date.now()}`, type: 'visit', entityId: visitId,
      entityTitle: `Визит в аптеку: ${visit.clientName}`, signedBy: user.id,
      signedByName: user.name, signedAt: new Date().toISOString(),
      signatureHash: hash, twoFactorVerified: true,
      ipAddress: getMockIpAddress(), deviceInfo: getDeviceInfo(),
      isValid: true, locked: true,
    });
    Alert.alert(COPY.common.success, COPY.visits.completed);
  };

  const pharmacyOptions = clients.map((c) => ({ label: c.name, value: c.id }));

  return (
    <View style={styles.wrap}>
      <ScreenContainer
        title={COPY.visits.title}
        subtitle={visits.length > 0 ? COPY.visits.subtitleCount(visits.length) : COPY.visits.subtitleEmpty}
      >
        {visits.length === 0 ? (
          <EmptyState
            icon="storefront-outline"
            title={COPY.visits.emptyTitle}
            message={clients.length === 0 ? COPY.visits.emptyNoPharmacies : COPY.visits.emptyMessage}
            actionLabel={clients.length > 0 ? COPY.visits.addBtn : undefined}
            onAction={clients.length > 0 ? () => setModalVisible(true) : undefined}
          />
        ) : (
          <FlatList
            data={visits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card>
                <View style={styles.row}>
                  <Badge label={VISIT_STATUS_LABELS[item.status] ?? item.status} variant={item.status === 'completed' ? 'success' : 'info'} />
                  <Text style={styles.time}>{formatDateTime(item.plannedDate)}</Text>
                </View>
                <Text style={styles.client}>{item.clientName}</Text>
                {item.clientAddress ? <Text style={styles.address}>{item.clientAddress}</Text> : null}
                {item.status === 'planned' && (
                  <Button title={COPY.visits.checkIn} onPress={() => handleCheckIn(item.id)} loading={checkingIn === item.id} icon="location-outline" />
                )}
                {item.status === 'in_progress' && (
                  <Button title={COPY.visits.checkOut} onPress={() => handleCheckOut(item.id)} icon="checkmark-circle-outline" />
                )}
                <Button title={COPY.common.delete} onPress={() => removeVisit(item.id)} variant="ghost" icon="trash-outline" />
              </Card>
            )}
            scrollEnabled={false}
          />
        )}
      </ScreenContainer>

      {clients.length > 0 && <Fab onPress={() => setModalVisible(true)} />}

      <FormModal visible={modalVisible} title={COPY.visits.modalTitle} onClose={() => setModalVisible(false)}>
        {pharmacyOptions.length === 0 ? (
          <Text style={styles.hint}>{COPY.visits.emptyNoPharmacies}</Text>
        ) : (
          <>
            <Select label={`${COPY.visits.pharmacyLabel} *`} value={clientId} options={pharmacyOptions} onChange={setClientId} />
            <Input label={`${COPY.visits.dateLabel} *`} value={date} onChangeText={setDate} placeholder={COPY.visits.datePlaceholder} />
            <Button title={COPY.common.save} onPress={handleSave} loading={saving} fullWidth />
          </>
        )}
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  time: { ...typography.caption, color: colors.textSecondary },
  client: { ...typography.h3, color: colors.text },
  address: { ...typography.caption, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
  hint: { ...typography.body, color: colors.textMuted, textAlign: 'center', padding: spacing.lg },
});
