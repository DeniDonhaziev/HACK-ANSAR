import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../constants/theme';
import { DesktopLayout } from '../components/layout/DesktopLayout';

import { LoginScreen, TwoFactorScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { VisitsScreen } from '../screens/field/VisitsScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { MoreScreen } from '../screens/more/MoreScreen';
import { AuditTrailScreen } from '../screens/compliance/AuditTrailScreen';
import { SignaturesScreen } from '../screens/compliance/SignaturesScreen';
import { ApprovalsScreen } from '../screens/compliance/ApprovalsScreen';
import { ConsentsScreen } from '../screens/compliance/ConsentsScreen';
import { ExpensesScreen } from '../screens/compliance/ExpensesScreen';
import { WarehouseScreen } from '../screens/warehouse/WarehouseScreen';
import { MapScreen } from '../screens/field/MapScreen';
import { ClientsScreen } from '../screens/clients/ClientsScreen';
import { DocumentsScreen } from '../screens/documents/DocumentsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { DepartmentsScreen } from '../screens/admin/DepartmentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: colors.primaryDark },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 17 },
  headerShadowVisible: false,
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { flex: 1, backgroundColor: colors.background },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'grid-outline',
            Visits: 'storefront-outline',
            Tasks: 'checkbox-outline',
            Notifications: 'notifications-outline',
            More: 'menu-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Главная', tabBarLabel: 'Главная' }} />
      <Tab.Screen name="Visits" component={VisitsScreen} options={{ title: 'Визиты в аптеки', tabBarLabel: 'Визиты' }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: 'Задачи', tabBarLabel: 'Задачи' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Уведомления', tabBarLabel: 'Уведомл.' }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: 'Модули', tabBarLabel: 'Ещё' }} />
    </Tab.Navigator>
  );
}

function MobileMainStack() {
  return (
    <Stack.Navigator screenOptions={{ ...headerStyle, contentStyle: { flex: 1, backgroundColor: colors.background } }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Departments" component={DepartmentsScreen} options={{ title: 'Отделы' }} />
      <Stack.Screen name="Clients" component={ClientsScreen} options={{ title: 'Аптеки' }} />
      <Stack.Screen name="AuditTrail" component={AuditTrailScreen} options={{ title: 'Журнал' }} />
      <Stack.Screen name="Signatures" component={SignaturesScreen} options={{ title: 'Подписи' }} />
      <Stack.Screen name="Approvals" component={ApprovalsScreen} options={{ title: 'Согласования' }} />
      <Stack.Screen name="Consents" component={ConsentsScreen} options={{ title: 'Согласия' }} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Расходы' }} />
      <Stack.Screen name="Warehouse" component={WarehouseScreen} options={{ title: 'Склад' }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Карта' }} />
      <Stack.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Документы' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Аналитика' }} />
    </Stack.Navigator>
  );
}

function ResponsiveMain() {
  const { isDesktop } = useResponsive();
  if (isDesktop) {
    return <DesktopLayout />;
  }
  return <MobileMainStack />;
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const twoFactorPending = useAuthStore((s) => s.twoFactorPending);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const { isDesktop } = useResponsive();

  if (!authHydrated) return null;

  const navKey = isAuthenticated ? 'main' : twoFactorPending ? '2fa' : 'auth';

  return (
    <View style={[styles.root, isDesktop && styles.rootDesktop]}>
      <NavigationContainer key={navKey}>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: styles.stackContent }}>
          {!isAuthenticated ? (
            twoFactorPending ? (
              <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
            ) : (
              <Stack.Screen name="Login" component={LoginScreen} />
            )
          ) : (
            <Stack.Screen name="Main" component={ResponsiveMain} options={{ animation: 'fade' }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  rootDesktop: { minHeight: '100%' },
  stackContent: { flex: 1, backgroundColor: colors.background },
});
