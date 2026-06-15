// === Пользователи, роли и отделы ===
export type Department =
  | 'customer_support'
  | 'warehouse'
  | 'marketing'
  | 'sales'
  | 'it'
  | 'accounting'
  | 'hr';

export type UserRole =
  | 'admin'
  | 'sales_manager'
  | 'medical_rep'
  | 'marketing'
  | 'compliance'
  | 'warehouse'
  | 'finance'
  | 'medical_affairs'
  | 'director';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: Department;
  region?: string;
  territory?: string;
  products?: string[];
  avatar?: string;
  twoFactorEnabled: boolean;
}

// === Audit Trail ===
export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'archive' | 'export' | 'sign' | 'approve' | 'reject';
  timestamp: string;
  userId: string;
  userName: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress?: string;
  deviceInfo?: string;
  isCritical: boolean;
  archived: boolean;
}

// === Электронные подписи ===
export type SignatureType = 'document' | 'report' | 'visit' | 'approval' | 'consent';

export interface ElectronicSignature {
  id: string;
  type: SignatureType;
  entityId: string;
  entityTitle: string;
  signedBy: string;
  signedByName: string;
  signedAt: string;
  signatureHash: string;
  twoFactorVerified: boolean;
  ipAddress?: string;
  deviceInfo?: string;
  isValid: boolean;
  locked: boolean;
}

// === Согласования ===
export type ApprovalType =
  | 'discount'
  | 'contract'
  | 'promo_material'
  | 'event'
  | 'budget'
  | 'non_standard'
  | 'medical_response'
  | 'gift_expense'
  | 'kol_activity';

export type ApprovalStatus =
  | 'draft'
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'returned'
  | 'expired';

export type ApprovalMode = 'sequential' | 'parallel';

export interface ApprovalStep {
  id: string;
  order: number;
  approverRole: UserRole;
  approverId?: string;
  approverName?: string;
  status: ApprovalStatus;
  comment?: string;
  decidedAt?: string;
  deadline?: string;
}

export interface Approval {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  amount?: number;
  status: ApprovalStatus;
  mode: ApprovalMode;
  steps: ApprovalStep[];
  createdAt: string;
  deadline?: string;
  comments: ApprovalComment[];
  history: ApprovalHistoryEntry[];
}

export interface ApprovalComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

// === Согласия ===
export type ConsentType =
  | 'pharmacy_communication'
  | 'data_processing'
  | 'marketing'
  | 'event_participation'
  | 'supply_agreement';

export type ConsentChannel = 'email' | 'paper' | 'electronic' | 'verbal' | 'portal';

export interface Consent {
  id: string;
  type: ConsentType;
  clientId: string;
  clientName: string;
  clientType: 'pharmacy';
  receivedAt: string;
  expiresAt?: string;
  channel: ConsentChannel;
  documentId?: string;
  signatureId?: string;
  isActive: boolean;
  revokedAt?: string;
  revokeReason?: string;
  history: ConsentHistoryEntry[];
}

export interface ConsentHistoryEntry {
  id: string;
  action: string;
  timestamp: string;
  userId: string;
  details?: string;
}

// === Подарки и расходы ===
export type ExpenseType =
  | 'gift'
  | 'meal'
  | 'travel'
  | 'event_sponsorship'
  | 'education'
  | 'consulting'
  | 'sample';

export interface Expense {
  id: string;
  type: ExpenseType;
  amount: number;
  currency: string;
  hcpId?: string;
  hcpName?: string;
  hcoId?: string;
  hcoName?: string;
  eventId?: string;
  contractId?: string;
  approvalId?: string;
  description: string;
  date: string;
  documents: string[];
  conflictOfInterestChecked: boolean;
  conflictOfInterestResult?: 'clear' | 'flagged' | 'blocked';
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'reported';
  createdBy: string;
  limitExceeded: boolean;
}

// === GDP / Дистрибуция ===
export interface Batch {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
  available: number;
  temperatureZone: 'ambient' | 'cold_2_8' | 'frozen';
  status: 'available' | 'reserved' | 'blocked' | 'recalled' | 'quarantine';
  recipientId?: string;
  recipientName?: string;
  movements: BatchMovement[];
}

export interface BatchMovement {
  id: string;
  type: 'receipt' | 'shipment' | 'transfer' | 'return' | 'recall' | 'adjustment';
  quantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  timestamp: string;
  userId: string;
  documentRef?: string;
}

export interface Shipment {
  id: string;
  number: string;
  route: string;
  carrier: string;
  status: 'created' | 'in_transit' | 'delivered' | 'deviation' | 'claimed' | 'returned';
  recipientId: string;
  recipientName: string;
  items: ShipmentItem[];
  temperatureControl: boolean;
  temperatureLog?: TemperatureReading[];
  documents: string[];
  storageConditions: string;
  createdAt: string;
  deliveredAt?: string;
  confirmedBy?: string;
  deviations?: string[];
  claims?: string[];
}

export interface ShipmentItem {
  batchId: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
}

export interface TemperatureReading {
  timestamp: string;
  temperature: number;
  withinRange: boolean;
}

// === Планы продаж и KPI ===
export interface SalesPlan {
  id: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  month?: number;
  quarter?: number;
  employeeId?: string;
  regionId?: string;
  productId?: string;
  clientId?: string;
  channel?: string;
  targetAmount: number;
  actualAmount: number;
  forecastAmount: number;
  deviation: number;
  deviationPercent: number;
}

export interface MedRepKPI {
  userId: string;
  period: string;
  visitsCount: number;
  coveragePercent: number;
  aClientVisits: number;
  routeCompliance: number;
  reportQuality: number;
  promoPlanCompletion: number;
  zoneSales: number;
  productActivity: number;
  eventParticipation: number;
  complianceScore: number;
  reportingTimeliness: number;
}

export interface SalesManagerKPI {
  userId: string;
  period: string;
  salesVolume: number;
  margin: number;
  dealsCount: number;
  conversionRate: number;
  averageDeal: number;
  receivables: number;
  planCompletion: number;
  clientRetention: number;
  skuGrowth: number;
  promoEfficiency: number;
}

// === Задачи ===
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  clientId?: string;
  dealId?: string;
  subtasks: SubTask[];
  comments: TaskComment[];
  attachments: string[];
  reminderAt?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

// === Коммуникации ===
export type CommunicationType = 'call' | 'email' | 'sms' | 'messenger' | 'video' | 'internal';

export interface Communication {
  id: string;
  type: CommunicationType;
  clientId: string;
  clientName: string;
  userId: string;
  userName: string;
  subject?: string;
  content: string;
  result?: string;
  timestamp: string;
  templateId?: string;
  consentVerified: boolean;
}

// === Уведомления ===
export type NotificationType =
  | 'task'
  | 'overdue'
  | 'visit'
  | 'approval'
  | 'contract_expiry'
  | 'limit_exceeded'
  | 'missing_report'
  | 'complaint'
  | 'adverse_event'
  | 'order_status'
  | 'stock_shortage'
  | 'recall'
  | 'compliance_risk';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  entityType?: string;
  entityId?: string;
  priority: 'low' | 'medium' | 'high';
}

// === Визиты ===
export interface Visit {
  id: string;
  clientId: string;
  clientName: string;
  clientAddress: string;
  clientLat?: number;
  clientLng?: number;
  repId: string;
  repName: string;
  plannedDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  checkInLat?: number;
  checkInLng?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
  report?: string;
  materialsUsed?: string[];
  photos?: string[];
  signatureId?: string;
  deviationMeters?: number;
}

// === Документы ===
export type DocumentCategory =
  | 'contract'
  | 'appendix'
  | 'invoice'
  | 'act'
  | 'waybill'
  | 'certificate'
  | 'instruction'
  | 'promo'
  | 'medical'
  | 'report'
  | 'complaint'
  | 'consent';

export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  version: number;
  fileUri?: string;
  entityType?: string;
  entityId?: string;
  uploadedBy: string;
  uploadedAt: string;
  archived: boolean;
  signed: boolean;
  signatureId?: string;
  accessRoles: UserRole[];
}

// === Аптеки (клиенты фармкомпании) ===
export interface Client {
  id: string;
  name: string;
  type: 'pharmacy';
  inn: string;
  ogrn?: string;
  bik?: string;
  phone: string;
  address?: string;
  city?: string;
  region?: string;
  email?: string;
  lat?: number;
  lng?: number;
  category?: 'A' | 'B' | 'C';
  consentStatus: 'active' | 'expired' | 'revoked' | 'none';
  assignedRepId?: string;
}

// === Продукты ===
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  minStock: number;
  temperatureZone: 'ambient' | 'cold_2_8' | 'frozen';
}

// === Интеграции ===
export interface Integration {
  id: string;
  name: string;
  type: 'erp' | 'email' | 'telephony' | 'bi' | 'pv' | 'lims' | 'dms' | 'mdm';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: string;
  config?: Record<string, string>;
}

// === Автоматизация ===
export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastTriggered?: string;
}
