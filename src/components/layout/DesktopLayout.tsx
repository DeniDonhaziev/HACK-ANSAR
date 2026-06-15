import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DesktopSidebar } from './DesktopSidebar';
import { colors } from '../../constants/theme';

import { DashboardScreen } from '../../screens/dashboard/DashboardScreen';
import { VisitsScreen } from '../../screens/field/VisitsScreen';
import { TasksScreen } from '../../screens/tasks/TasksScreen';
import { NotificationsScreen } from '../../screens/notifications/NotificationsScreen';
import { AuditTrailScreen } from '../../screens/compliance/AuditTrailScreen';
import { SignaturesScreen } from '../../screens/compliance/SignaturesScreen';
import { ApprovalsScreen } from '../../screens/compliance/ApprovalsScreen';
import { ConsentsScreen } from '../../screens/compliance/ConsentsScreen';
import { ExpensesScreen } from '../../screens/compliance/ExpensesScreen';
import { WarehouseScreen } from '../../screens/warehouse/WarehouseScreen';
import { MapScreen } from '../../screens/field/MapScreen';
import { ClientsScreen } from '../../screens/clients/ClientsScreen';
import { DocumentsScreen } from '../../screens/documents/DocumentsScreen';
import { AnalyticsScreen } from '../../screens/analytics/AnalyticsScreen';
import { DepartmentsScreen } from '../../screens/admin/DepartmentsScreen';

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
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      screenLayout={({ children }) => <DesktopShell>{children}</DesktopShell>}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Visits" component={VisitsScreen} />
      <Stack.Screen name="Tasks" component={TasksScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Clients" component={ClientsScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="AuditTrail" component={AuditTrailScreen} />
      <Stack.Screen name="Signatures" component={SignaturesScreen} />
      <Stack.Screen name="Approvals" component={ApprovalsScreen} />
      <Stack.Screen name="Consents" component={ConsentsScreen} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} />
      <Stack.Screen name="Warehouse" component={WarehouseScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Departments" component={DepartmentsScreen} />
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
