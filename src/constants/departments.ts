import { Department } from '../types';

export interface DepartmentInfo {
  id: Department;
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'customer_support',
    name: 'Отдел клиентской поддержки',
    shortName: 'Клиентская поддержка',
    description: 'Обработка обращений аптечных точек, консультации и сопровождение заказов',
    icon: 'headset-outline',
  },
  {
    id: 'warehouse',
    name: 'Отдел складского учёта',
    shortName: 'Складской учёт',
    description: 'Учёт остатков ЛС, серий, сроков годности и отгрузок в аптеки',
    icon: 'cube-outline',
  },
  {
    id: 'marketing',
    name: 'Отдел маркетинга',
    shortName: 'Маркетинг',
    description: 'Промо-акции, POS-материалы и мероприятия для аптечной сети',
    icon: 'megaphone-outline',
  },
  {
    id: 'sales',
    name: 'Отдел продаж',
    shortName: 'Продажи',
    description: 'Работа с аптечной сетью: визиты, заказы, планы и KPI продаж',
    icon: 'trending-up-outline',
  },
  {
    id: 'it',
    name: 'Отдел информационных технологий',
    shortName: 'ИТ',
    description: 'Поддержка систем, интеграции, безопасность и инфраструктура',
    icon: 'laptop-outline',
  },
  {
    id: 'accounting',
    name: 'Отдел бухгалтерии',
    shortName: 'Бухгалтерия',
    description: 'Финансовый учёт, счета, дебиторка и отчётность',
    icon: 'calculator-outline',
  },
  {
    id: 'hr',
    name: 'Отдел кадрового учёта',
    shortName: 'Кадры',
    description: 'Персонал, штатное расписание, кадровые документы',
    icon: 'people-outline',
  },
];

export function getDepartmentInfo(id: Department): DepartmentInfo | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}

export function getDepartmentLabel(id: Department): string {
  return getDepartmentInfo(id)?.name ?? id;
}

export function getDepartmentShortLabel(id: Department): string {
  return getDepartmentInfo(id)?.shortName ?? id;
}

export const DEPARTMENT_SELECT_OPTIONS = DEPARTMENTS.map((d) => ({
  label: d.shortName,
  value: d.id,
}));
