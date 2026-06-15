import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { ScreenContainer } from '../../components/common';
import { Card, SectionHeader, EmptyState } from '../../components/ui';
import { useDataStore } from '../../stores';
import { COPY } from '../../constants/copy';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useResponsive } from '../../hooks/useResponsive';

let MapView: React.ComponentType<any> | null = null;
let Marker: React.ComponentType<any> | null = null;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
  } catch { /* maps unavailable */ }
}

export function MapScreen() {
  const { clients, visits } = useDataStore();
  const { isDesktop } = useResponsive();
  const clientsWithCoords = clients.filter((c) => c.lat && c.lng);

  if (clients.length === 0 && visits.length === 0) {
    return (
      <ScreenContainer title="Карта и маршрут">
        <EmptyState icon="map-outline" title="Нет данных для карты" message={COPY.map.emptyMessage} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Карта и маршрут">
      {Platform.OS !== 'web' && MapView && clientsWithCoords.length > 0 ? (
        <View style={[styles.mapContainer, isDesktop && styles.mapDesktop]}>
          <MapView style={styles.map} initialRegion={{ latitude: clientsWithCoords[0].lat!, longitude: clientsWithCoords[0].lng!, latitudeDelta: 0.1, longitudeDelta: 0.1 }}>
            {clientsWithCoords.map((c) => (
              Marker ? <Marker key={c.id} coordinate={{ latitude: c.lat!, longitude: c.lng! }} title={c.name} /> : null
            ))}
          </MapView>
        </View>
      ) : (
        <Card variant="outlined">
          <Text style={styles.hint}>{COPY.map.listHint}</Text>
          {clients.map((c) => (
            <Text key={c.id} style={styles.clientItem}>
              {c.name} — {c.address ?? c.city ?? 'адрес не указан'}
              {c.lat ? ` (${c.lat.toFixed(4)}, ${c.lng?.toFixed(4)})` : ''}
            </Text>
          ))}
        </Card>
      )}

      <SectionHeader title="Маршрут" subtitle={`${visits.length} визитов`} />
      {visits.length === 0 ? (
        <Text style={styles.empty}>{COPY.map.routeEmpty}</Text>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Card>
              <Text style={styles.routeItem}>{index + 1}. {item.clientName}</Text>
              <Text style={styles.address}>{item.clientAddress}</Text>
            </Card>
          )}
          scrollEnabled={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mapContainer: { height: 240, borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.md },
  mapDesktop: { height: 360 },
  map: { flex: 1 },
  routeItem: { ...typography.label, color: colors.text },
  address: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.md },
  clientItem: { ...typography.body, color: colors.text, marginBottom: 6 },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', padding: spacing.lg },
});
