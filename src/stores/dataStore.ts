import { create } from 'zustand';
import {
  Client, Visit, Task, Approval, Consent, Expense, Batch, Shipment,
  Document, ElectronicSignature, AuditEntry, SalesPlan, AppNotification,
} from '../types';
import { saveJSON, loadJSON, STORAGE_KEYS, generateId } from '../services/storageService';
import { getDeviceInfo, getMockIpAddress } from '../utils/device';

interface DataState {
  hydrated: boolean;
  clients: Client[];
  visits: Visit[];
  tasks: Task[];
  approvals: Approval[];
  consents: Consent[];
  expenses: Expense[];
  batches: Batch[];
  shipments: Shipment[];
  documents: Document[];
  signatures: ElectronicSignature[];
  auditEntries: AuditEntry[];
  salesPlans: SalesPlan[];
  notifications: AppNotification[];

  hydrate: () => Promise<void>;
  persist: () => Promise<void>;

  addClient: (data: Omit<Client, 'id' | 'consentStatus'>) => Promise<Client>;
  removeClient: (id: string) => Promise<void>;

  addVisit: (data: { clientId: string; plannedDate: string; clientAddress?: string }) => Promise<Visit>;
  updateVisit: (visit: Visit) => Promise<void>;
  removeVisit: (id: string) => Promise<void>;

  addTask: (data: { title: string; description?: string; dueDate: string; priority: Task['priority']; clientId?: string }) => Promise<Task>;
  updateTask: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;

  addApproval: (data: { type: Approval['type']; title: string; description: string; amount?: number }) => Promise<Approval>;
  decideApproval: (id: string, decision: 'approved' | 'rejected' | 'returned', comment?: string) => Promise<void>;

  addConsent: (data: Omit<Consent, 'id' | 'isActive' | 'history' | 'clientName' | 'clientType'>) => Promise<Consent>;
  revokeConsent: (id: string, reason: string) => Promise<void>;

  addExpense: (data: { type: Expense['type']; amount: number; description: string; hcpId?: string; hcpName?: string }) => Promise<Expense>;

  addBatch: (data: { productName: string; batchNumber: string; quantity: number; expiryDate: string; warehouseName: string }) => Promise<Batch>;
  addShipment: (data: { number: string; recipientName: string; route: string; carrier: string }) => Promise<Shipment>;

  addDocument: (data: { title: string; category: Document['category'] }) => Promise<Document>;
  addSalesPlan: (data: { targetAmount: number; period: SalesPlan['period']; year: number; month?: number }) => Promise<SalesPlan>;

  addAuditEntry: (params: Omit<AuditEntry, 'id' | 'timestamp' | 'ipAddress' | 'deviceInfo' | 'archived' | 'isCritical'>) => Promise<void>;
  addSignature: (sig: ElectronicSignature) => Promise<void>;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => Promise<void>;
}

const CRITICAL = ['contract', 'consent', 'signature', 'batch', 'expense', 'approval'];

async function loadAll() {
  const [
    clients, visits, tasks, approvals, consents, expenses,
    batches, shipments, documents, signatures, auditEntries, salesPlans, notifications,
  ] = await Promise.all([
    loadJSON<Client[]>(STORAGE_KEYS.clients, []),
    loadJSON<Visit[]>(STORAGE_KEYS.visits, []),
    loadJSON<Task[]>(STORAGE_KEYS.tasks, []),
    loadJSON<Approval[]>(STORAGE_KEYS.approvals, []),
    loadJSON<Consent[]>(STORAGE_KEYS.consents, []),
    loadJSON<Expense[]>(STORAGE_KEYS.expenses, []),
    loadJSON<Batch[]>(STORAGE_KEYS.batches, []),
    loadJSON<Shipment[]>(STORAGE_KEYS.shipments, []),
    loadJSON<Document[]>(STORAGE_KEYS.documents, []),
    loadJSON<ElectronicSignature[]>(STORAGE_KEYS.signatures, []),
    loadJSON<AuditEntry[]>(STORAGE_KEYS.auditEntries, []),
    loadJSON<SalesPlan[]>(STORAGE_KEYS.salesPlans, []),
    loadJSON<AppNotification[]>(STORAGE_KEYS.notifications, []),
  ]);
  return { clients, visits, tasks, approvals, consents, expenses, batches, shipments, documents, signatures, auditEntries, salesPlans, notifications };
}

export const useDataStore = create<DataState>((set, get) => ({
  hydrated: false,
  clients: [], visits: [], tasks: [], approvals: [], consents: [],
  expenses: [], batches: [], shipments: [], documents: [],
  signatures: [], auditEntries: [], salesPlans: [], notifications: [],

  hydrate: async () => {
    const data = await loadAll();
    set({ ...data, hydrated: true });
  },

  persist: async () => {
    const s = get();
    await Promise.all([
      saveJSON(STORAGE_KEYS.clients, s.clients),
      saveJSON(STORAGE_KEYS.visits, s.visits),
      saveJSON(STORAGE_KEYS.tasks, s.tasks),
      saveJSON(STORAGE_KEYS.approvals, s.approvals),
      saveJSON(STORAGE_KEYS.consents, s.consents),
      saveJSON(STORAGE_KEYS.expenses, s.expenses),
      saveJSON(STORAGE_KEYS.batches, s.batches),
      saveJSON(STORAGE_KEYS.shipments, s.shipments),
      saveJSON(STORAGE_KEYS.documents, s.documents),
      saveJSON(STORAGE_KEYS.signatures, s.signatures),
      saveJSON(STORAGE_KEYS.auditEntries, s.auditEntries),
      saveJSON(STORAGE_KEYS.salesPlans, s.salesPlans),
      saveJSON(STORAGE_KEYS.notifications, s.notifications),
    ]);
  },

  addClient: async (data) => {
    const client: Client = { ...data, id: generateId('client'), consentStatus: 'none' };
    set({ clients: [client, ...get().clients] });
    await get().persist();
    return client;
  },

  removeClient: async (id) => {
    set({ clients: get().clients.filter((c) => c.id !== id) });
    await get().persist();
  },

  addVisit: async (data) => {
    const client = get().clients.find((c) => c.id === data.clientId);
    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    const visit: Visit = {
      id: generateId('visit'),
      clientId: data.clientId,
      clientName: client?.name ?? 'Аптека',
      clientAddress: data.clientAddress ?? client?.address ?? '',
      clientLat: client?.lat,
      clientLng: client?.lng,
      repId: user?.id ?? '',
      repName: user?.name ?? '',
      plannedDate: data.plannedDate,
      status: 'planned',
    };
    set({ visits: [visit, ...get().visits] });
    await get().persist();
    return visit;
  },

  updateVisit: async (visit) => {
    set({ visits: get().visits.map((v) => (v.id === visit.id ? visit : v)) });
    await get().persist();
  },

  removeVisit: async (id) => {
    set({ visits: get().visits.filter((v) => v.id !== id) });
    await get().persist();
  },

  addTask: async (data) => {
    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    const task: Task = {
      id: generateId('task'),
      title: data.title,
      description: data.description,
      assigneeId: user?.id ?? '',
      assigneeName: user?.name ?? '',
      creatorId: user?.id ?? '',
      dueDate: data.dueDate,
      priority: data.priority,
      status: 'new',
      clientId: data.clientId,
      subtasks: [],
      comments: [],
      attachments: [],
    };
    set({ tasks: [task, ...get().tasks] });
    await get().persist();
    return task;
  },

  updateTask: async (task) => {
    set({ tasks: get().tasks.map((t) => (t.id === task.id ? task : t)) });
    await get().persist();
  },

  removeTask: async (id) => {
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
    await get().persist();
  },

  addApproval: async (data) => {
    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    const approval: Approval = {
      id: generateId('apr'),
      type: data.type,
      title: data.title,
      description: data.description,
      requesterId: user?.id ?? '',
      requesterName: user?.name ?? '',
      amount: data.amount,
      status: 'pending',
      mode: 'sequential',
      steps: [{ id: 's1', order: 1, approverRole: 'compliance', status: 'pending' }],
      createdAt: new Date().toISOString(),
      comments: [],
      history: [{ id: generateId('h'), action: 'created', userId: user?.id ?? '', userName: user?.name ?? '', timestamp: new Date().toISOString() }],
    };
    set({ approvals: [approval, ...get().approvals] });
    await get().persist();
    return approval;
  },

  decideApproval: async (id, decision, comment) => {
    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    set({
      approvals: get().approvals.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          status: decision,
          steps: a.steps.map((s) => ({ ...s, status: decision, comment, decidedAt: new Date().toISOString(), approverName: user?.name })),
          history: [...a.history, { id: generateId('h'), action: decision, userId: user?.id ?? '', userName: user?.name ?? '', timestamp: new Date().toISOString(), details: comment }],
        };
      }),
    });
    await get().persist();
  },

  addConsent: async (data) => {
    const client = get().clients.find((c) => c.id === data.clientId);
    const consent: Consent = {
      ...data,
      id: generateId('consent'),
      clientName: client?.name ?? '',
      clientType: 'pharmacy',
      isActive: true,
      history: [{ id: generateId('h'), action: 'created', timestamp: new Date().toISOString(), userId: 'user' }],
    };
    if (client) {
      set({
        consents: [consent, ...get().consents],
        clients: get().clients.map((c) => c.id === client.id ? { ...c, consentStatus: 'active' as const } : c),
      });
    } else {
      set({ consents: [consent, ...get().consents] });
    }
    await get().persist();
    return consent;
  },

  revokeConsent: async (id, reason) => {
    set({
      consents: get().consents.map((c) => c.id === id ? { ...c, isActive: false, revokedAt: new Date().toISOString(), revokeReason: reason } : c),
    });
    await get().persist();
  },

  addExpense: async (data) => {
    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    const expense: Expense = {
      id: generateId('exp'),
      type: data.type,
      amount: data.amount,
      currency: 'RUB',
      hcpId: data.hcpId,
      hcpName: data.hcpName,
      description: data.description,
      date: new Date().toISOString(),
      documents: [],
      conflictOfInterestChecked: false,
      status: 'draft',
      createdBy: user?.id ?? '',
      limitExceeded: false,
    };
    set({ expenses: [expense, ...get().expenses] });
    await get().persist();
    return expense;
  },

  addBatch: async (data) => {
    const batch: Batch = {
      id: generateId('batch'),
      productId: generateId('prod'),
      productName: data.productName,
      batchNumber: data.batchNumber,
      manufactureDate: new Date().toISOString(),
      expiryDate: data.expiryDate,
      warehouseId: generateId('wh'),
      warehouseName: data.warehouseName,
      quantity: data.quantity,
      reserved: 0,
      available: data.quantity,
      temperatureZone: 'ambient',
      status: 'available',
      movements: [],
    };
    set({ batches: [batch, ...get().batches] });
    await get().persist();
    return batch;
  },

  addShipment: async (data) => {
    const shipment: Shipment = {
      id: generateId('shp'),
      number: data.number,
      route: data.route,
      carrier: data.carrier,
      status: 'created',
      recipientId: '',
      recipientName: data.recipientName,
      items: [],
      temperatureControl: false,
      documents: [],
      storageConditions: '15-25°C',
      createdAt: new Date().toISOString(),
    };
    set({ shipments: [shipment, ...get().shipments] });
    await get().persist();
    return shipment;
  },

  addDocument: async (data) => {
    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    const doc: Document = {
      id: generateId('doc'),
      title: data.title,
      category: data.category,
      version: 1,
      uploadedBy: user?.name ?? '',
      uploadedAt: new Date().toISOString(),
      archived: false,
      signed: false,
      accessRoles: ['admin'],
    };
    set({ documents: [doc, ...get().documents] });
    await get().persist();
    return doc;
  },

  addSalesPlan: async (data) => {
    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    const plan: SalesPlan = {
      id: generateId('plan'),
      period: data.period,
      year: data.year,
      month: data.month,
      employeeId: user?.id,
      targetAmount: data.targetAmount,
      actualAmount: 0,
      forecastAmount: 0,
      deviation: -data.targetAmount,
      deviationPercent: -100,
    };
    set({ salesPlans: [plan, ...get().salesPlans] });
    await get().persist();
    return plan;
  },

  addAuditEntry: async (params) => {
    const entry: AuditEntry = {
      id: generateId('audit'),
      ...params,
      timestamp: new Date().toISOString(),
      ipAddress: getMockIpAddress(),
      deviceInfo: getDeviceInfo(),
      isCritical: CRITICAL.includes(params.entityType),
      archived: false,
    };
    set({ auditEntries: [entry, ...get().auditEntries] });
    await get().persist();
  },

  addSignature: async (sig) => {
    set({ signatures: [sig, ...get().signatures] });
    await get().persist();
  },

  addNotification: async (n) => {
    const notification: AppNotification = {
      ...n,
      id: generateId('notif'),
      timestamp: new Date().toISOString(),
      read: false,
    };
    set({ notifications: [notification, ...get().notifications] });
    await get().persist();
  },
}));
