/**
 * Профессиональные тексты интерфейса PharmaCRM.
 * CRM для фармацевтических компаний: клиент — аптека.
 */
export const COPY = {
  app: {
    name: 'PharmaCRM',
    tagline: 'CRM для фармацевтических компаний',
    subtitle: 'Управление продажами и взаимодействием с аптечной сетью',
  },

  auth: {
    registerTitle: 'Регистрация',
    loginTitle: 'Вход в систему',
    firstRunHint: 'Первый запуск. Создайте учётную запись сотрудника.',
    nameLabel: 'Фамилия и имя',
    namePlaceholder: 'Иванов Алексей Сергеевич',
    emailLabel: 'Электронная почта',
    emailPlaceholder: 'name@pharma-company.ru',
    passwordLabel: 'Пароль',
    passwordPlaceholder: 'Не менее 4 символов',
    departmentLabel: 'Отдел',
    roleLabel: 'Должность',
    twoFaLabel: 'Двухфакторная аутентификация (2FA)',
    registerBtn: 'Зарегистрироваться',
    loginBtn: 'Войти',
    hasAccount: 'Уже есть учётная запись? Войти',
    noAccount: 'Нет учётной записи? Зарегистрироваться',
    twoFaTitle: 'Подтверждение входа',
    twoFaHint: 'Введите 6-значный код для адреса',
    codeLabel: 'Код подтверждения',
    confirmBtn: 'Подтвердить',
    invalidCode: 'Введите корректный 6-значный код.',
    fillAllFields: 'Заполните все обязательные поля.',
    selectDepartment: 'Выберите отдел.',
    userExists: 'Пользователь с таким адресом электронной почты уже зарегистрирован.',
    wrongCredentials: 'Неверный адрес электронной почты или пароль.',
  },

  roles: {
    medical_rep: 'Торговый представитель',
    sales_manager: 'Менеджер по работе с аптеками',
    compliance: 'Специалист по compliance',
    admin: 'Администратор системы',
  },

  pharmacy: {
    title: 'Аптеки',
    subtitleEmpty: 'Добавьте аптечные точки в базу',
    subtitleCount: (n: number) => `${n} ${pluralPharmacy(n)} в базе`,
    emptyTitle: 'Аптеки не добавлены',
    emptyMessage: 'Зарегистрируйте аптечную точку: укажите название, реквизиты и контактные данные.',
    addBtn: 'Добавить аптеку',
    modalTitle: 'Новая аптека',
    nameLabel: 'Название аптеки',
    namePlaceholder: 'ООО «Аптека № 1»',
    innLabel: 'ИНН',
    innPlaceholder: '7701234567',
    ogrnLabel: 'ОГРН',
    ogrnPlaceholder: '1234567890123',
    bikLabel: 'БИК банка',
    bikPlaceholder: '044525225',
    phoneLabel: 'Телефон',
    phonePlaceholder: '+7 (495) 000-00-00',
    addressLabel: 'Адрес',
    addressPlaceholder: 'г. Москва, ул. Примерная, д. 10',
    cityLabel: 'Город',
    cityPlaceholder: 'Москва',
    regionLabel: 'Регион',
    regionPlaceholder: 'Московская область',
    categoryLabel: 'Категория аптеки',
    badge: 'Аптека',
    saveBtn: 'Сохранить',
    deleteConfirm: 'Удалить аптеку из базы?',
    errorName: 'Укажите название аптеки.',
    errorPhone: 'Укажите контактный телефон.',
    errorInn: 'Укажите ИНН аптеки.',
  },

  dashboard: {
    greeting: (name: string) => `Добрый день, ${name}`,
    subtitleDefault: 'Обзор работы с аптечной сетью',
    emptyTitle: 'Данные отсутствуют',
    emptyMessage: 'Начните с регистрации аптек, затем планируйте визиты и формируйте задачи.',
    pharmacies: 'Аптеки',
    visits: 'Визиты',
    visitsActive: 'активных',
    tasks: 'Задачи',
    approvals: 'Согласования',
    approvalsPending: 'на рассмотрении',
    salesPlan: 'План продаж',
    notifications: 'Уведомления',
    notificationsUnread: (n: number) => `${n} непрочитанных`,
    noNotifications: 'Уведомления появятся при работе в системе.',
  },

  visits: {
    title: 'Визиты в аптеки',
    subtitleEmpty: 'Запланируйте первый визит',
    subtitleCount: (n: number) => `${n} ${pluralVisit(n)}`,
    emptyTitle: 'Визиты не запланированы',
    emptyNoPharmacies: 'Сначала добавьте аптеки в соответствующем разделе.',
    emptyMessage: 'Запланируйте визит торгового представителя в аптечную точку.',
    addBtn: 'Запланировать визит',
    modalTitle: 'Новый визит',
    pharmacyLabel: 'Аптека',
    dateLabel: 'Дата и время визита',
    datePlaceholder: '2026-06-15 10:00',
    checkIn: 'Отметить прибытие',
    checkOut: 'Завершить визит и подписать',
    noConsent: 'Отсутствует согласие аптеки на коммуникации. Добавьте согласие в соответствующем разделе.',
    geoError: 'Не удалось определить геолокацию. Проверьте разрешения устройства.',
    completed: 'Визит завершён и подписан электронной подписью.',
    selectPharmacyAndDate: 'Выберите аптеку и укажите дату визита.',
    reportDefault: 'Визит в аптеку проведён. Отчёт заполнен.',
  },

  tasks: {
    title: 'Задачи',
    subtitleEmpty: 'Создайте задачи для команды',
    subtitleCount: (n: number) => `${n} ${pluralTask(n)}`,
    emptyTitle: 'Задачи отсутствуют',
    emptyMessage: 'Создайте задачи для планирования работы с аптечной сетью.',
    addBtn: 'Создать задачу',
    modalTitle: 'Новая задача',
    errorFields: 'Укажите название задачи и срок исполнения.',
  },

  consents: {
    title: 'Согласия аптек',
    subtitle: 'Учёт согласий на обработку данных и коммуникации',
    emptyTitle: 'Согласия не зарегистрированы',
    emptyNoPharmacies: 'Сначала добавьте аптеки в базу.',
    emptyMessage: 'Зарегистрируйте полученные согласия аптечных точек.',
    addBtn: 'Добавить согласие',
    selectPharmacy: 'Выберите аптеку.',
  },

  warehouse: {
    title: 'Склад и дистрибуция',
    subtitle: 'Учёт серий ЛС, остатков и поставок в аптеки',
    emptyTitle: 'Складские данные отсутствуют',
    emptyMessage: 'Добавьте серии лекарственных препаратов и поставки.',
  },

  analytics: {
    title: 'Аналитика продаж',
    subtitle: 'Показатели работы с аптечной сетью',
    emptyMessage: 'Добавьте аптеки, визиты и план продаж — аналитика сформируется автоматически.',
  },

  map: {
    title: 'Карта и маршрут',
    emptyMessage: 'Добавьте аптеки и визиты — маршрут будет построен автоматически.',
    listHint: 'Список аптечных точек (интерактивная карта доступна в мобильном приложении).',
    routeEmpty: 'Запланируйте визиты для формирования маршрута.',
  },

  audit: {
    title: 'Журнал изменений',
    subtitle: 'Аудит действий пользователей в системе',
    emptyMessage: 'Записи появятся при создании аптек, визитов и других объектов.',
    exportEmpty: 'Нет записей для экспорта.',
  },

  common: {
    save: 'Сохранить',
    delete: 'Удалить',
    cancel: 'Отмена',
    error: 'Ошибка',
    success: 'Готово',
  },
} as const;

function pluralPharmacy(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'аптека';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'аптеки';
  return 'аптек';
}

function pluralVisit(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'визит';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'визита';
  return 'визитов';
}

function pluralTask(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'задача';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'задачи';
  return 'задач';
}

export { pluralPharmacy, pluralVisit, pluralTask };

export const PHARMACY_CATEGORIES = [
  { label: 'Категория A', value: 'A' },
  { label: 'Категория B', value: 'B' },
  { label: 'Категория C', value: 'C' },
];

export const ROLE_OPTIONS = [
  { label: COPY.roles.medical_rep, value: 'medical_rep' },
  { label: COPY.roles.sales_manager, value: 'sales_manager' },
  { label: COPY.roles.compliance, value: 'compliance' },
  { label: COPY.roles.admin, value: 'admin' },
];

export const VISIT_STATUS_LABELS: Record<string, string> = {
  planned: 'Запланирован',
  in_progress: 'В процессе',
  completed: 'Завершён',
  cancelled: 'Отменён',
  missed: 'Пропущен',
};

export const CONSENT_TYPE_OPTIONS = [
  { label: 'Коммуникации с аптекой', value: 'pharmacy_communication' },
  { label: 'Обработка персональных данных', value: 'data_processing' },
  { label: 'Маркетинговые рассылки', value: 'marketing' },
];
