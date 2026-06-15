import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores';
import { useResponsive } from '../hooks/useResponsive';
import { useDepartmentAccess } from '../hooks/useDepartmentAccess';
import { colors } from '../constants/theme';
import { DesktopLayout } from '../components/layout/DesktopLayout';
import { AppScreenName } from '../constants/departmentAccess';
import { SCREEN_COMPONENTS } from './screenMap';

import { LoginScreen, TwoFactorScreen } from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 17, color: colors.text },
  headerShadowVisible: false,
  headerBackTitle: 'Назад',
};

const SCREEN_TITLES: Partial<Record<AppScreenName, string>> = {
  Clients: 'Аптеки',
  AuditTrail: 'Журнал',
  Signatures: 'Подписи',
  Approvals: 'Согласования',
  Consents: 'Согласия',
  Expenses: 'Расходы',
  Warehouse: 'Склад',
  Map: 'Карта',
  Documents: 'Документы',
  Analytics: 'Аналитика',
  Departments: 'Отделы',
  Support: 'Обращения',
  Employees: 'Сотрудники',
  ItSystems: 'ИТ-системы',
  Notifications: 'Уведомления',
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { tabs } = useDepartmentAccess();
  const tabBarHeight = 58 + Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 4);

  return (
    <Tab.Navigator
      screenOptions={{
        ...headerStyle,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accentDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -2 },
        sceneStyle: { flex: 1, backgroundColor: colors.background },
      }}
    >
      {tabs.map((tab) => {
        const Component = SCREEN_COMPONENTS[tab.screen];
        if (!Component) return null;
        return (
          <Tab.Screen
            key={tab.screen}
            name={tab.screen}
            component={Component}
            options={{
              title: tab.title,
              tabBarLabel: tab.label,
              tabBarIcon: ({ color, size, focused }) => (
                <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
                  <Ionicons name={tab.icon} size={size - 1} color={color} />
                </View>
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}

function MobileMainStack() {
  const { tabs, modules } = useDepartmentAccess();
  const tabNames = new Set(tabs.map((t) => t.screen));

  const stackScreens = [...new Set(
    modules.map((m) => m.screen).filter((s) => !tabNames.has(s)),
  )];

  return (
    <Stack.Navigator
      screenOptions={{
        ...headerStyle,
        contentStyle: { flex: 1, backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      {stackScreens.map((screen) => (
        <Stack.Screen
          key={screen}
          name={screen}
          component={SCREEN_COMPONENTS[screen]}
          options={{
            title: SCREEN_TITLES[screen] ?? screen,
            headerShown: true,
            animation: 'slide_from_right',
          }}
        />
      ))}
    </Stack.Navigator>
  );
}

function ResponsiveMain() {
  const { isDesktop } = useResponsive();
  if (isDesktop) return <DesktopLayout />;
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
  tabIconWrap: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabIconWrapActive: {
    backgroundColor: colors.accentLight,
  },
});
