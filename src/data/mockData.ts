import {
  User, Client, Product, Approval, Consent, Expense, Batch, Shipment,
  Visit, Task, AppNotification, SalesPlan, MedRepKPI, SalesManagerKPI,
  Document, Integration, AutomationRule, AuditEntry, ElectronicSignature,
} from '../types';

export const mockUsers: User[] = [
  { id: 'u1', email: 'admin@pharma.ru', name: 'Администратор', role: 'admin', twoFactorEnabled: true },
  { id: 'u2', email: 'ivanov@pharma.ru', name: 'Иванов А.С.', role: 'medical_rep', region: 'Москва', territory: 'Центр', twoFactorEnabled: true },
  { id: 'u3', email: 'petrov@pharma.ru', name: 'Петров В.И.', role: 'sales_manager', region: 'Москва', twoFactorEnabled: false },
  { id: 'u4', email: 'sidorova@pharma.ru', name: 'Сидорова М.К.', role: 'compliance', twoFactorEnabled: true },
  { id: 'u5', email: 'kozlov@pharma.ru', name: 'Козлов Д.Е.', role: 'director', twoFactorEnabled: true },
];

export const mockClients: Client[] = [];

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Кардиомакс 10мг', sku: 'CRM-010', category: 'Кардиология', price: 1250, minStock: 100, temperatureZone: 'ambient' },
  { id: 'p2', name: 'ИнсулинФорт 100ЕД', sku: 'INS-100', category: 'Эндокринология', price: 3200, minStock: 50, temperatureZone: 'cold_2_8' },
  { id: 'p3', name: 'НейроВит комплекс', sku: 'NV-050', category: 'Неврология', price: 890, minStock: 200, temperatureZone: 'ambient' },
];

export const mockApprovals: Approval[] = [
  {
    id: 'apr1', type: 'discount', title: 'Скидка 15% для ГКБ №1', description: 'Специальные условия для гос. закупки',
    requesterId: 'u3', requesterName: 'Петров В.И.', amount: 150000, status: 'in_review', mode: 'sequential',
    createdAt: '2026-06-10T10:00:00Z', deadline: '2026-06-20T18:00:00Z',
    steps: [
      { id: 's1', order: 1, approverRole: 'sales_manager', approverId: 'u3', approverName: 'Петров В.И.', status: 'approved', decidedAt: '2026-06-10T14:00:00Z' },
      { id: 's2', order: 2, approverRole: 'finance', status: 'pending', deadline: '2026-06-20T18:00:00Z' },
      { id: 's3', order: 3, approverRole: 'compliance', status: 'pending' },
    ],
    comments: [], history: [{ id: 'h1', action: 'created', userId: 'u3', userName: 'Петров В.И.', timestamp: '2026-06-10T10:00:00Z' }],
  },
  {
    id: 'apr2', type: 'event', title: 'Конференция кардиологов 2026', description: 'Спонсорство мероприятия',
    requesterId: 'u3', requesterName: 'Петров В.И.', amount: 500000, status: 'pending', mode: 'parallel',
    createdAt: '2026-06-12T09:00:00Z', deadline: '2026-06-25T18:00:00Z',
    steps: [
      { id: 's1', order: 1, approverRole: 'marketing', status: 'pending' },
      { id: 's2', order: 2, approverRole: 'compliance', status: 'pending' },
      { id: 's3', order: 3, approverRole: 'finance', status: 'pending' },
    ],
    comments: [], history: [{ id: 'h1', action: 'created', userId: 'u3', userName: 'Петров В.И.', timestamp: '2026-06-12T09:00:00Z' }],
  },
];

export const mockConsents: Consent[] = [
  {
    id: 'con1', type: 'pharmacy_communication', clientId: 'c2', clientName: 'Аптека № 1', clientType: 'pharmacy',
    receivedAt: '2025-01-15T10:00:00Z', expiresAt: '2027-01-15T10:00:00Z', channel: 'electronic', isActive: true,
    history: [{ id: 'h1', action: 'created', timestamp: '2025-01-15T10:00:00Z', userId: 'u2' }],
  },
  {
    id: 'con2', type: 'data_processing', clientId: 'c1', clientName: 'Аптека «Здоровье»', clientType: 'pharmacy',
    receivedAt: '2024-06-01T10:00:00Z', expiresAt: '2026-06-01T10:00:00Z', channel: 'paper', isActive: true,
    history: [{ id: 'h1', action: 'created', timestamp: '2024-06-01T10:00:00Z', userId: 'u3' }],
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp1', type: 'gift', amount: 2500, currency: 'RUB', hcpId: 'c2', hcpName: 'д-р Смирнова Е.В.',
    description: 'Корпоративный подарок', date: '2026-06-01', documents: [], conflictOfInterestChecked: true,
    conflictOfInterestResult: 'clear', status: 'approved', createdBy: 'u2', limitExceeded: false,
  },
  {
    id: 'exp2', type: 'meal', amount: 4500, currency: 'RUB', hcpId: 'c4', hcpName: 'д-р Козлов П.А.',
    description: 'Рабочий обед', date: '2026-06-05', documents: [], conflictOfInterestChecked: true,
    conflictOfInterestResult: 'flagged', status: 'pending_approval', createdBy: 'u2', limitExceeded: false,
  },
];

export const mockBatches: Batch[] = [
  {
    id: 'b1', productId: 'p1', productName: 'Кардиомакс 10мг', batchNumber: 'LOT-2026-001',
    manufactureDate: '2026-01-15', expiryDate: '2028-01-15', warehouseId: 'w1', warehouseName: 'Склад Москва',
    quantity: 5000, reserved: 500, available: 4500, temperatureZone: 'ambient', status: 'available',
    movements: [{ id: 'm1', type: 'receipt', quantity: 5000, timestamp: '2026-02-01T08:00:00Z', userId: 'u1' }],
  },
  {
    id: 'b2', productId: 'p2', productName: 'ИнсулинФорт 100ЕД', batchNumber: 'LOT-2026-042',
    manufactureDate: '2026-03-01', expiryDate: '2026-09-01', warehouseId: 'w1', warehouseName: 'Склад Москва',
    quantity: 800, reserved: 100, available: 700, temperatureZone: 'cold_2_8', status: 'available',
    movements: [{ id: 'm1', type: 'receipt', quantity: 800, timestamp: '2026-03-15T08:00:00Z', userId: 'u1' }],
  },
];

export const mockShipments: Shipment[] = [
  {
    id: 'sh1', number: 'SHP-2026-0156', route: 'Москва → Подольск', carrier: 'ТК «ФармЛогистик»',
    status: 'in_transit', recipientId: 'c5', recipientName: 'ООО «ФармДистрибьюшн»',
    items: [{ batchId: 'b1', productName: 'Кардиомакс 10мг', batchNumber: 'LOT-2026-001', quantity: 1000, expiryDate: '2028-01-15' }],
    temperatureControl: false, documents: ['Накладная №156'], storageConditions: '15-25°C',
    createdAt: '2026-06-14T06:00:00Z',
  },
];

export const mockVisits: Visit[] = [
  {
    id: 'v1', clientId: 'c2', clientName: 'д-р Смирнова Е.В.', clientAddress: 'ул. Пушкина, 5',
    clientLat: 55.7612, clientLng: 37.6185, repId: 'u2', repName: 'Иванов А.С.',
    plannedDate: '2026-06-15T10:00:00Z', status: 'planned',
  },
  {
    id: 'v2', clientId: 'c1', clientName: 'ГБУЗ ГКБ №1', clientAddress: 'ул. Ленина, 10',
    clientLat: 55.7558, clientLng: 37.6173, repId: 'u2', repName: 'Иванов А.С.',
    plannedDate: '2026-06-15T14:00:00Z', status: 'planned',
  },
];

export const mockTasks: Task[] = [
  {
    id: 't1', title: 'Подготовить отчёт по визиту', assigneeId: 'u2', assigneeName: 'Иванов А.С.',
    creatorId: 'u3', dueDate: '2026-06-16T18:00:00Z', priority: 'high', status: 'new',
    clientId: 'c2', subtasks: [{ id: 'st1', title: 'Заполнить форму визита', completed: false }],
    comments: [], attachments: [],
  },
  {
    id: 't2', title: 'Согласовать промо-материалы Q3', assigneeId: 'u4', assigneeName: 'Сидорова М.К.',
    creatorId: 'u3', dueDate: '2026-06-20T18:00:00Z', priority: 'medium', status: 'in_progress',
    subtasks: [], comments: [], attachments: [],
  },
];

export const mockNotifications: AppNotification[] = [
  { id: 'n1', type: 'approval', title: 'Новое согласование', message: 'Скидка 15% для ГКБ №1 ожидает решения', timestamp: '2026-06-14T10:00:00Z', read: false, entityType: 'approval', entityId: 'apr1', priority: 'high' },
  { id: 'n2', type: 'visit', title: 'Визит сегодня', message: 'д-р Смирнова Е.В. в 10:00', timestamp: '2026-06-15T07:00:00Z', read: false, entityType: 'visit', entityId: 'v1', priority: 'medium' },
  { id: 'n3', type: 'stock_shortage', title: 'Дефицит товара', message: 'ИнсулинФорт 100ЕД — остаток ниже минимума', timestamp: '2026-06-14T15:00:00Z', read: true, priority: 'high' },
  { id: 'n4', type: 'compliance_risk', title: 'Compliance-риск', message: 'Истекает согласие д-р Козлов П.А.', timestamp: '2026-06-13T09:00:00Z', read: false, priority: 'high' },
];

export const mockSalesPlans: SalesPlan[] = [
  { id: 'sp1', period: 'monthly', year: 2026, month: 6, employeeId: 'u2', targetAmount: 2500000, actualAmount: 1800000, forecastAmount: 2300000, deviation: -700000, deviationPercent: -28 },
  { id: 'sp2', period: 'quarterly', year: 2026, quarter: 2, regionId: 'moscow', targetAmount: 15000000, actualAmount: 12500000, forecastAmount: 14200000, deviation: -2500000, deviationPercent: -16.7 },
];

export const mockMedRepKPI: MedRepKPI = {
  userId: 'u2', period: 'Июнь 2026', visitsCount: 42, coveragePercent: 78, aClientVisits: 15,
  routeCompliance: 92, reportQuality: 85, promoPlanCompletion: 70, zoneSales: 1800000,
  productActivity: 88, eventParticipation: 3, complianceScore: 95, reportingTimeliness: 90,
};

export const mockSalesManagerKPI: SalesManagerKPI = {
  userId: 'u3', period: 'Июнь 2026', salesVolume: 12500000, margin: 3200000, dealsCount: 45,
  conversionRate: 32, averageDeal: 277777, receivables: 2100000, planCompletion: 83,
  clientRetention: 94, skuGrowth: 12, promoEfficiency: 76,
};

export const mockDocuments: Document[] = [
  { id: 'd1', title: 'Договор поставки ГКБ №1', category: 'contract', version: 2, uploadedBy: 'u3', uploadedAt: '2026-01-10T10:00:00Z', archived: false, signed: true, accessRoles: ['admin', 'sales_manager', 'compliance'] },
  { id: 'd2', title: 'Сертификат GMP Кардиомакс', category: 'certificate', version: 1, uploadedBy: 'u1', uploadedAt: '2026-02-01T10:00:00Z', archived: false, signed: false, accessRoles: ['admin', 'warehouse', 'compliance'] },
];

export const mockIntegrations: Integration[] = [
  { id: 'i1', name: '1С:ERP', type: 'erp', status: 'connected', lastSync: '2026-06-15T06:00:00Z' },
  { id: 'i2', name: 'Power BI', type: 'bi', status: 'connected', lastSync: '2026-06-14T22:00:00Z' },
  { id: 'i3', name: 'PV-система', type: 'pv', status: 'connected', lastSync: '2026-06-15T04:00:00Z' },
  { id: 'i4', name: 'Outlook', type: 'email', status: 'disconnected' },
];

export const mockAutomationRules: AutomationRule[] = [
  { id: 'ar1', name: 'Автозадача при просрочке визита', trigger: 'visit_missed', action: 'create_task', enabled: true, lastTriggered: '2026-06-10T18:00:00Z' },
  { id: 'ar2', name: 'Напоминание об истечении согласия', trigger: 'consent_expiring', action: 'send_notification', enabled: true },
  { id: 'ar3', name: 'Проверка compliance при расходе', trigger: 'expense_created', action: 'check_compliance', enabled: true, lastTriggered: '2026-06-05T12:00:00Z' },
];

export const mockAuditEntries: AuditEntry[] = [
  { id: 'a1', entityType: 'approval', entityId: 'apr1', action: 'create', timestamp: '2026-06-10T10:00:00Z', userId: 'u3', userName: 'Петров В.И.', newValue: 'Скидка 15%', isCritical: true, archived: false, ipAddress: '192.168.1.45', deviceInfo: 'android 14' },
  { id: 'a2', entityType: 'expense', entityId: 'exp1', action: 'approve', timestamp: '2026-06-02T14:00:00Z', userId: 'u4', userName: 'Сидорова М.К.', reason: 'В пределах лимита', isCritical: true, archived: false, ipAddress: '192.168.1.12', deviceInfo: 'ios 18' },
];

export const mockSignatures: ElectronicSignature[] = [
  { id: 'sig1', type: 'visit', entityId: 'v0', entityTitle: 'Визит к д-р Смирнова', signedBy: 'u2', signedByName: 'Иванов А.С.', signedAt: '2026-06-08T11:30:00Z', signatureHash: 'a3f5...', twoFactorVerified: true, isValid: true, locked: true },
];

export function initializeMockData() {
  return {
    users: mockUsers,
    clients: mockClients,
    products: mockProducts,
    approvals: mockApprovals,
    consents: mockConsents,
    expenses: mockExpenses,
    batches: mockBatches,
    shipments: mockShipments,
    visits: mockVisits,
    tasks: mockTasks,
    notifications: mockNotifications,
    salesPlans: mockSalesPlans,
    medRepKPI: mockMedRepKPI,
    salesManagerKPI: mockSalesManagerKPI,
    documents: mockDocuments,
    integrations: mockIntegrations,
    automationRules: mockAutomationRules,
    auditEntries: mockAuditEntries,
    signatures: mockSignatures,
  };
}
