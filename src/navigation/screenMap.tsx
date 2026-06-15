import React from 'react';
import { AppScreenName } from '../constants/departmentAccess';

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
import { SupportScreen } from '../screens/support/SupportScreen';
import { EmployeesScreen } from '../screens/hr/EmployeesScreen';
import { ItSystemsScreen } from '../screens/it/ItSystemsScreen';

export const SCREEN_COMPONENTS: Record<AppScreenName, React.ComponentType> = {
  Dashboard: DashboardScreen,
  Visits: VisitsScreen,
  Tasks: TasksScreen,
  Notifications: NotificationsScreen,
  More: MoreScreen,
  Clients: ClientsScreen,
  Warehouse: WarehouseScreen,
  Map: MapScreen,
  Analytics: AnalyticsScreen,
  Documents: DocumentsScreen,
  Approvals: ApprovalsScreen,
  Expenses: ExpensesScreen,
  Consents: ConsentsScreen,
  Signatures: SignaturesScreen,
  AuditTrail: AuditTrailScreen,
  Departments: DepartmentsScreen,
  Support: SupportScreen,
  Employees: EmployeesScreen,
  ItSystems: ItSystemsScreen,
};

/** Экраны только для стека (не вкладки) */
export const STACK_ONLY_SCREENS: AppScreenName[] = [
  'Clients', 'Warehouse', 'Map', 'Analytics', 'Documents',
  'Approvals', 'Expenses', 'Consents', 'Signatures', 'AuditTrail',
  'Departments', 'Support', 'Employees', 'ItSystems',
];
