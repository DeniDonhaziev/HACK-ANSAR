import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { ScreenContainer, Input, Button } from '../../components/common';
import { Card, Badge, EmptyState, Fab, FormModal } from '../../components/ui';
import { useDataStore, useAuthStore } from '../../stores';
import { generateHash, getDeviceInfo, getMockIpAddress } from '../../utils/device';
import { formatDateTime } from '../../utils/format';
import { colors, spacing, typography } from '../../constants/theme';

export function SignaturesScreen() {
  const { signatures, addSignature } = useDataStore();
  const user = useAuthStore((s) => s.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (!user || !docTitle.trim()) return;
    if (twoFACode.length < 6) { Alert.alert('2FA', 'Введите 6-значный код'); return; }
    setSigning(true);
    const entityId = `doc-${Date.now()}`;
    const hash = await generateHash(`${docTitle}-${user.id}-${Date.now()}`);
    await addSignature({
      id: `sig-${Date.now()}`, type: 'document', entityId, entityTitle: docTitle.trim(),
      signedBy: user.id, signedByName: user.name, signedAt: new Date().toISOString(),
      signatureHash: hash, twoFactorVerified: true,
      ipAddress: getMockIpAddress(), deviceInfo: getDeviceInfo(), isValid: true, locked: true,
    });
    setSigning(false);
    setModalVisible(false);
    setDocTitle('');
    setTwoFACode('');
    Alert.alert('Готово', 'Документ подписан');
  };

  return (
    <View style={styles.wrap}>
      <ScreenContainer title="Электронные подписи" subtitle="Подписывайте документы с 2FA" fabSafe>
      {signatures.length === 0 ? (
        <EmptyState icon="create-outline" title="Подписей нет" message="Подпишите документ или завершите визит с подписью" actionLabel="Подписать документ" onAction={() => setModalVisible(true)} />
      ) : (
        <FlatList
          data={signatures}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card>
              <Badge label={item.type} variant="info" />
              {item.locked && <Badge label="Заблокировано" variant="warning" />}
              <Text style={styles.title}>{item.entityTitle}</Text>
              <Text style={styles.meta}>{item.signedByName} • {formatDateTime(item.signedAt)}</Text>
            </Card>
          )}
          scrollEnabled={false}
        />
      )}
      </ScreenContainer>
      {signatures.length > 0 && <Fab onPress={() => setModalVisible(true)} icon="create-outline" />}
      <FormModal visible={modalVisible} title="Подписать документ" onClose={() => setModalVisible(false)}>
        <Input label="Название документа *" value={docTitle} onChangeText={setDocTitle} placeholder="Договор №..." />
        <Input label="2FA код *" value={twoFACode} onChangeText={setTwoFACode} placeholder="000000" keyboardType="numeric" />
        <Button title="Подписать" onPress={handleSign} loading={signing} fullWidth />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  title: { ...typography.label, color: colors.text, marginTop: spacing.sm },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
