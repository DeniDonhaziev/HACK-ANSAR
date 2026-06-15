import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DesktopSidebar } from './DesktopSidebar';
import { colors } from '../../constants/theme';
import { useDepartmentAccess } from '../../hooks/useDepartmentAccess';
import { AppScreenName } from '../../constants/departmentAccess';
import { SCREEN_COMPONENTS } from '../../navigation/screenMap';

const Stack = createNativeStackNavigator();

function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <DesktopSidebar />
      <View style={styles.main}>{children}</View>
    </View>
  );
}

export function DesktopLayout() {
  const { sidebarItems } = useDepartmentAccess();
  const screens = [...new Set(sidebarItems.map((i) => i.screen))];

  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      screenLayout={({ children }) => <DesktopShell>{children}</DesktopShell>}
    >
      {screens.map((screen) => (
        <Stack.Screen
          key={screen}
          name={screen}
          component={SCREEN_COMPONENTS[screen as AppScreenName]}
        />
      ))}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
    overflow: 'hidden',
  },
});
