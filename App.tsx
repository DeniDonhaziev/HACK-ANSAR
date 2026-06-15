import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore, useDataStore } from './src/stores';
import { colors } from './src/constants/theme';
import { initFirebase, getActiveBackend } from './src/services/firebase';

export default function App() {
  const [ready, setReady] = useState(false);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateData = useDataStore((s) => s.hydrate);
  const pullFromFirebase = useDataStore((s) => s.pullFromFirebase);

  useEffect(() => {
    (async () => {
      const fbReady = await initFirebase();
      await hydrateAuth();
      await hydrateData();
      if (fbReady && getActiveBackend() === 'firebase') {
        await pullFromFirebase();
      }
      setReady(true);
    })();
  }, [hydrateAuth, hydrateData, pullFromFirebase]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={styles.app}>
      <StatusBar style="light" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, width: '100%', backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
