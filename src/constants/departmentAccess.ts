import { Ionicons } from '@expo/vector-icons';
import { Department, UserRole } from '../types';

export type AppScreenName =
  | 'Dashboard'
  | 'Visits'
  | 'Tasks'
  | 'Notifications'
  | 'More'
  | 'Clients'
  | 'Warehouse'
  | 'Map'
  | 'Analytics'
  | 'Documents'
  | 'Approvals'
  | 'Expenses'
  | 'Consents'
  | 'Signatures'
  | 'AuditTrail'
  | 'Departments'
  | 'Support'
  | 'Employees'
  | 'ItSystems';

export interface TabConfig {
  screen: AppScreenName;
  title: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface ModuleConfig {
  screen: AppScreenName;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  section: string;
}

export interface DashboardEmptyConfig {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel: string;
  actionScreen: AppScreenName;
}

export interface DepartmentAccessConfig {
  tabs: TabConfig[];
  modules: ModuleConfig[];
  empty: DashboardEmptyConfig;
}

const BASE_TABS = {
  dashboard: { screen: 'Dashboard' as const, title: 'Главная', label: 'Главная', icon: 'grid-outline' as const },
  tasks: { screen: 'Tasks' as const, title: 'Задачи', label: 'Задачи', icon: 'checkbox-outline' as const },
  notifications: { screen: 'Notifications' as const, title: 'Уведомления', label: 'Уведомл.', icon: 'notifications-outline' as const },
  more: { screen: 'More' as const, title: 'Модули', label: 'Ещё', icon: 'menu-outline' as const },
};

/** Доступ по отделам — каждый видит только свой функционал */
export const DEPARTMENT_ACCESS: Record<Department, DepartmentAccessConfig> = {
  customer_support: {
    tabs: [
      BASE_TABS.dashboard,
      { screen: 'Support', title: 'Обращения', label: 'Обращения', icon: 'headset-outline' },
      { screen: 'Clients', title: 'Аптеки', label: 'Аптеки', icon: 'storefront-outline' },
      BASE_TABS.tasks,
      BASE_TABS.more,
    ],
    modules: [
      { screen: 'Notifications', title: 'Уведомления', icon: 'notifications-outline', section: 'Система' },
      { screen: 'Documents', title: 'Документы', icon: 'folder-open-outline', section: 'Документы' },
      { screen: 'Consents', title: 'Согласия аптек', icon: 'shield-checkmark-outline', section: 'Справочники' },
    ],
    empty: {
      icon: 'headset-outline',
      title: 'Обращений пока нет',
      message: 'Зарегистрируйте первое обращение от аптечной точки или добавьте аптеку в базу.',
      actionLabel: 'Новое обращение',
      actionScreen: 'Support',
    },
  },

  warehouse: {
    tabs: [
      BASE_TABS.dashboard,
      { screen: 'Warehouse', title: 'Склад', label: 'Склад', icon: 'cube-outline' },
      { screen: 'Map', title: 'Маршруты', label: 'Маршруты', icon: 'map-outline' },
      BASE_TABS.tasks,
      BASE_TABS.more,
    ],
    modules: [
      { screen: 'Notifications', title: 'Уведомления', icon: 'notifications-outline', section: 'Система' },
      { screen: 'Clients', title: 'Аптеки (доставка)', icon: 'storefront-outline', section: 'Логистика' },
      { screen: 'Documents', title: 'Накладные', icon: 'document-text-outline', section: 'Документы' },
    ],
    empty: {
      icon: 'cube-outline',
      title: 'Склад пуст',
      message: 'Добавьте серии препаратов и оформите первую поставку в аптеку.',
      actionLabel: 'Открыть склад',
      actionScreen: 'Warehouse',
    },
  },

  marketing: {
    tabs: [
      BASE_TABS.dashboard,
      { screen: 'Analytics', title: 'Аналитика', label: 'Аналитика', icon: 'bar-chart-outline' },
      { screen: 'Expenses', title: 'Расходы', label: 'Расходы', icon: 'wallet-outline' },
      BASE_TABS.tasks,
      BASE_TABS.more,
    ],
    modules: [
      { screen: 'Approvals', title: 'Согласования промо', icon: 'checkmark-circle-outline', section: 'Маркетинг' },
      { screen: 'Clients', title: 'Аптеки', icon: 'storefront-outline', section: 'Аптечная сеть' },
      { screen: 'Documents', title: 'Материалы', icon: 'folder-open-outline', section: 'Документы' },
      { screen: 'Notifications', title: 'Уведомления', icon: 'notifications-outline', section: 'Система' },
    ],
    empty: {
      icon: 'megaphone-outline',
      title: 'Кампаний пока нет',
      message: 'Создайте заявку на промо-акцию или зарегистрируйте маркетинговый расход.',
      actionLabel: 'Новый расход',
      actionScreen: 'Expenses',
    },
  },

  sales: {
    tabs: [
      BASE_TABS.dashboard,
      { screen: 'Visits', title: 'Визиты в аптеки', label: 'Визиты', icon: 'storefront-outline' },
      { screen: 'Clients', title: 'Аптеки', label: 'Аптеки', icon: 'medical-outline' },
      BASE_TABS.tasks,
      BASE_TABS.more,
    ],
    modules: [
      { screen: 'Notifications', title: 'Уведомления', icon: 'notifications-outline', section: 'Система' },
      { screen: 'Map', title: 'Карта и маршрут', icon: 'map-outline', section: 'Полевая работа' },
      { screen: 'Analytics', title: 'Аналитика продаж', icon: 'bar-chart-outline', section: 'KPI' },
      { screen: 'Approvals', title: 'Согласования', icon: 'checkmark-circle-outline', section: 'Сделки' },
      { screen: 'Consents', title: 'Согласия', icon: 'shield-checkmark-outline', section: 'Compliance' },
      { screen: 'Documents', title: 'Документы', icon: 'folder-open-outline', section: 'Документы' },
    ],
    empty: {
      icon: 'storefront-outline',
      title: 'Начните с аптек',
      message: 'Добавьте аптечные точки, затем планируйте визиты и формируйте задачи.',
      actionLabel: 'Добавить аптеку',
      actionScreen: 'Clients',
    },
  },

  it: {
    tabs: [
      BASE_TABS.dashboard,
      { screen: 'ItSystems', title: 'Системы', label: 'Системы', icon: 'server-outline' },
      { screen: 'AuditTrail', title: 'Журнал', label: 'Журнал', icon: 'document-text-outline' },
      BASE_TABS.tasks,
      BASE_TABS.notifications,
    ],
    modules: [
      { screen: 'Departments', title: 'Отделы компании', icon: 'business-outline', section: 'Администрирование' },
      { screen: 'Documents', title: 'Документы', icon: 'folder-open-outline', section: 'Инфраструктура' },
      { screen: 'Signatures', title: 'Электронные подписи', icon: 'create-outline', section: 'Безопасность' },
    ],
    empty: {
      icon: 'laptop-outline',
      title: 'Система работает штатно',
      message: 'Записи в журнале появятся при действиях пользователей. Проверьте статус интеграций.',
      actionLabel: 'Открыть журнал',
      actionScreen: 'AuditTrail',
    },
  },

  accounting: {
    tabs: [
      BASE_TABS.dashboard,
      { screen: 'Approvals', title: 'Согласования', label: 'Согласов.', icon: 'checkmark-circle-outline' },
      { screen: 'Expenses', title: 'Расходы', label: 'Расходы', icon: 'wallet-outline' },
      { screen: 'Documents', title: 'Документы', label: 'Документы', icon: 'folder-open-outline' },
      BASE_TABS.notifications,
    ],
    modules: [
      { screen: 'Analytics', title: 'Финансовая аналитика', icon: 'bar-chart-outline', section: 'Отчётность' },
      { screen: 'Clients', title: 'Аптеки (дебиторка)', icon: 'storefront-outline', section: 'Контрагенты' },
      { screen: 'Tasks', title: 'Задачи', icon: 'checkbox-outline', section: 'Работа' },
    ],
    empty: {
      icon: 'calculator-outline',
      title: 'Нет финансовых данных',
      message: 'Зарегистрируйте расход или дождитесь заявок на согласование от других отделов.',
      actionLabel: 'Добавить расход',
      actionScreen: 'Expenses',
    },
  },

  hr: {
    tabs: [
      BASE_TABS.dashboard,
      { screen: 'Employees', title: 'Сотрудники', label: 'Кадры', icon: 'people-outline' },
      { screen: 'Departments', title: 'Отделы', label: 'Отделы', icon: 'business-outline' },
      BASE_TABS.tasks,
      BASE_TABS.notifications,
    ],
    modules: [
      { screen: 'Documents', title: 'Кадровые документы', icon: 'folder-open-outline', section: 'Документы' },
    ],
    empty: {
      icon: 'people-outline',
      title: 'Кадровая база',
      message: 'Сотрудники появятся после регистрации в системе. Просматривайте структуру отделов.',
      actionLabel: 'Список сотрудников',
      actionScreen: 'Employees',
    },
  },
};

/** Полный доступ для администратора */
export const ADMIN_ACCESS: DepartmentAccessConfig = {
  tabs: [
    BASE_TABS.dashboard,
    { screen: 'Visits', title: 'Визиты', label: 'Визиты', icon: 'storefront-outline' },
    { screen: 'Clients', title: 'Аптеки', label: 'Аптеки', icon: 'medical-outline' },
    BASE_TABS.tasks,
    BASE_TABS.notifications,
    BASE_TABS.more,
  ],
  modules: [
    { screen: 'Support', title: 'Обращения', icon: 'headset-outline', section: 'Поддержка' },
    { screen: 'Warehouse', title: 'Склад', icon: 'cube-outline', section: 'Логистика' },
    { screen: 'Map', title: 'Карта', icon: 'map-outline', section: 'Полевая работа' },
    { screen: 'Analytics', title: 'Аналитика', icon: 'bar-chart-outline', section: 'KPI' },
    { screen: 'Approvals', title: 'Согласования', icon: 'checkmark-circle-outline', section: 'Compliance' },
    { screen: 'Expenses', title: 'Расходы', icon: 'wallet-outline', section: 'Compliance' },
    { screen: 'Consents', title: 'Согласия', icon: 'shield-checkmark-outline', section: 'Compliance' },
    { screen: 'Signatures', title: 'Подписи', icon: 'create-outline', section: 'Compliance' },
    { screen: 'AuditTrail', title: 'Журнал', icon: 'document-text-outline', section: 'Compliance' },
    { screen: 'Documents', title: 'Документы', icon: 'folder-open-outline', section: 'Документы' },
    { screen: 'Employees', title: 'Сотрудники', icon: 'people-outline', section: 'Компания' },
    { screen: 'Departments', title: 'Отделы', icon: 'business-outline', section: 'Компания' },
    { screen: 'ItSystems', title: 'ИТ-системы', icon: 'server-outline', section: 'Компания' },
  ],
  empty: {
    icon: 'analytics-outline',
    title: 'Данные отсутствуют',
    message: 'Начните с регистрации аптек или выберите нужный модуль в меню.',
    actionLabel: 'Добавить аптеку',
    actionScreen: 'Clients',
  },
};

export function getDepartmentAccess(department?: Department, role?: UserRole): DepartmentAccessConfig {
  if (role === 'admin') return ADMIN_ACCESS;
  if (department && DEPARTMENT_ACCESS[department]) return DEPARTMENT_ACCESS[department];
  return DEPARTMENT_ACCESS.sales;
}

export function canAccessScreen(
  screen: AppScreenName,
  department?: Department,
  role?: UserRole,
): boolean {
  const access = getDepartmentAccess(department, role);
  const tabScreens = access.tabs.map((t) => t.screen);
  const moduleScreens = access.modules.map((m) => m.screen);
  if (screen === 'Dashboard') return true;
  if (screen === 'More') return access.modules.length > 0 || role === 'admin';
  return tabScreens.includes(screen) || moduleScreens.includes(screen);
}

/** Все пункты бокового меню (вкладки + модули без дублей) */
export function getSidebarItems(department?: Department, role?: UserRole): ModuleConfig[] {
  const access = getDepartmentAccess(department, role);
  const seen = new Set<AppScreenName>();
  const items: ModuleConfig[] = [];

  for (const tab of access.tabs) {
    if (!seen.has(tab.screen)) {
      seen.add(tab.screen);
      items.push({ screen: tab.screen, title: tab.title, icon: tab.icon, section: 'Основное' });
    }
  }
  for (const mod of access.modules) {
    if (!seen.has(mod.screen)) {
      seen.add(mod.screen);
      items.push(mod);
    }
  }
  return items;
}

export function getSidebarSections(department?: Department, role?: UserRole): string[] {
  return [...new Set(getSidebarItems(department, role).map((i) => i.section))];
}
