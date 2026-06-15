import { create } from 'zustand';
import {
  Client, Visit, Task, Approval, Consent, Expense, Batch, Shipment,
  Document, ElectronicSignature, AuditEntry, SalesPlan, AppNotification, SupportTicket,
} from '../types';
import { saveJSON, loadJSON, STORAGE_KEYS, generateId } from '../services/storageService';
import { getActiveBackend } from '../services/firebase';
import { loadAllFromFirestore, syncStorageKeyToFirestore } from '../services/firebase/sync';
import { isFirebaseUserSignedIn } from '../services/firebase/auth';
import { getDeviceInfo, getMockIpAddress } from '../utils/device';
import { approximateCoords } from '../utils/geocode';

type NewNotification = Omit<AppNotification, 'id' | 'timestamp' | 'read' | 'priority'> & { priority?: AppNotification['priority'] };

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
  supportTickets: SupportTicket[];

  hydrate: () => Promise<void>;
  pullFromFirebase: () => Promise<void>;
  persist: () => Promise<void>;
  syncWarehouse: () => Promise<void>;
  syncTasks: () => Promise<void>;

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
  addNotification: (n: NewNotification) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateSalesPlan: (id: string, data: Partial<Pick<SalesPlan, 'targetAmount' | 'actualAmount' | 'period'>>) => Promise<void>;

  addSupportTicket: (data: { clientId?: string; clientName: string; subject: string; description: string; priority?: SupportTicket['priority'] }) => Promise<SupportTicket>;
  updateSupportTicket: (ticket: SupportTicket) => Promise<void>;
  removeSupportTicket: (id: string) => Promise<void>;
}

const CRITICAL = ['contract', 'consent', 'signature', 'batch', 'expense', 'approval'];

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of secondary) map.set(item.id, item);
  for (const item of primary) map.set(item.id, item);
  return Array.from(map.values());
}

function buildTask(
  data: { title: string; description?: string; dueDate: string; priority: Task['priority']; clientId?: string },
  user: { id: string; name: string } | null,
): Task {
  return {
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
}

function defaultClientTaskDueDate(): string {
  const due = new Date();
  due.setDate(due.getDate() + 7);
  return due.toISOString();
}

async function saveList<T extends { id: string }>(storageKey: string, items: T[]): Promise<void> {
  await saveJSON(storageKey, items);
  if (getActiveBackend() === 'firebase' && (await isFirebaseUserSignedIn())) {
    try {
      await syncStorageKeyToFirestore(storageKey, items);
    } catch (err) {
      console.warn(`[Firebase] sync ${storageKey} failed`, err);
    }
  }
}

function mergeAllData(
  local: Awaited<ReturnType<typeof loadAll>>,
  remote: Awaited<ReturnType<typeof loadAllFromFirestore>> | null,
) {
  if (!remote) return local;
  return {
    clients: mergeById(remote.clients, local.clients),
    visits: mergeById(remote.visits, local.visits),
    tasks: mergeById(remote.tasks, local.tasks),
    approvals: mergeById(remote.approvals, local.approvals),
    consents: mergeById(remote.consents, local.consents),
    expenses: mergeById(remote.expenses, local.expenses),
    batches: mergeById(remote.batches, local.batches),
    shipments: mergeById(remote.shipments, local.shipments),
    documents: mergeById(remote.documents, local.documents),
    signatures: mergeById(remote.signatures, local.signatures),
    auditEntries: mergeById(remote.auditEntries, local.auditEntries),
    salesPlans: mergeById(remote.salesPlans, local.salesPlans),
    notifications: mergeById(remote.notifications, local.notifications),
    supportTickets: mergeById(remote.supportTickets, local.supportTickets),
  };
}

async function pushNotification(
  get: () => DataState,
  set: (partial: Partial<DataState>) => void,
  n: NewNotification,
) {
  const notification: AppNotification = {
    ...n,
    priority: n.priority ?? 'medium',
    id: generateId('notif'),
    timestamp: new Date().toISOString(),
    read: false,
  };
  set({ notifications: [notification, ...get().notifications] });
  await saveList(STORAGE_KEYS.notifications, get().notifications);
}

async function loadAll() {
  const [
    clients, visits, tasks, approvals, consents, expenses,
    batches, shipments, documents, signatures, auditEntries, salesPlans, notifications, supportTickets,
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
    loadJSON<SupportTicket[]>(STORAGE_KEYS.supportTickets, []),
  ]);
  return { clients, visits, tasks, approvals, consents, expenses, batches, shipments, documents, signatures, auditEntries, salesPlans, notifications, supportTickets };
}

export const useDataStore = create<DataState>((set, get) => ({
  hydrated: false,
  clients: [], visits: [], tasks: [], approvals: [], consents: [],
  expenses: [], batches: [], shipments: [], documents: [],
  signatures: [], auditEntries: [], salesPlans: [], notifications: [], supportTickets: [],

  hydrate: async () => {
    if (get().hydrated) return;
    const local = await loadAll();
    let data = local;

    if (getActiveBackend() === 'firebase' && (await isFirebaseUserSignedIn())) {
      try {
        const remote = await loadAllFromFirestore();
        data = mergeAllData(local, remote);
      } catch (err) {
        console.warn('[Firebase] load failed, using local cache', err);
      }
    }

    set({ ...data, hydrated: true });

    await Promise.all([
      saveJSON(STORAGE_KEYS.clients, data.clients),
      saveJSON(STORAGE_KEYS.visits, data.visits),
      saveJSON(STORAGE_KEYS.tasks, data.tasks),
      saveJSON(STORAGE_KEYS.approvals, data.approvals),
      saveJSON(STORAGE_KEYS.consents, data.consents),
      saveJSON(STORAGE_KEYS.expenses, data.expenses),
      saveJSON(STORAGE_KEYS.batches, data.batches),
      saveJSON(STORAGE_KEYS.shipments, data.shipments),
      saveJSON(STORAGE_KEYS.documents, data.documents),
      saveJSON(STORAGE_KEYS.signatures, data.signatures),
      saveJSON(STORAGE_KEYS.auditEntries, data.auditEntries),
      saveJSON(STORAGE_KEYS.salesPlans, data.salesPlans),
      saveJSON(STORAGE_KEYS.notifications, data.notifications),
      saveJSON(STORAGE_KEYS.supportTickets, data.supportTickets),
    ]);
  },

  pullFromFirebase: async () => {
    if (getActiveBackend() !== 'firebase') return;
    if (!(await isFirebaseUserSignedIn())) return;

    const local = {
      clients: get().clients,
      visits: get().visits,
      tasks: get().tasks,
      approvals: get().approvals,
      consents: get().consents,
      expenses: get().expenses,
      batches: get().batches,
      shipments: get().shipments,
      documents: get().documents,
      signatures: get().signatures,
      auditEntries: get().auditEntries,
      salesPlans: get().salesPlans,
      notifications: get().notifications,
      supportTickets: get().supportTickets,
    };

    try {
      const remote = await loadAllFromFirestore();
      if (!remote) return;
      const data = mergeAllData(local, remote);
      set({ ...data, hydrated: true });
      await Promise.all([
        saveJSON(STORAGE_KEYS.clients, data.clients),
        saveJSON(STORAGE_KEYS.visits, data.visits),
        saveJSON(STORAGE_KEYS.tasks, data.tasks),
        saveJSON(STORAGE_KEYS.approvals, data.approvals),
        saveJSON(STORAGE_KEYS.consents, data.consents),
        saveJSON(STORAGE_KEYS.expenses, data.expenses),
        saveJSON(STORAGE_KEYS.batches, data.batches),
        saveJSON(STORAGE_KEYS.shipments, data.shipments),
        saveJSON(STORAGE_KEYS.documents, data.documents),
        saveJSON(STORAGE_KEYS.signatures, data.signatures),
        saveJSON(STORAGE_KEYS.auditEntries, data.auditEntries),
        saveJSON(STORAGE_KEYS.salesPlans, data.salesPlans),
        saveJSON(STORAGE_KEYS.notifications, data.notifications),
        saveJSON(STORAGE_KEYS.supportTickets, data.supportTickets),
      ]);
    } catch (err) {
      console.warn('[Firebase] pull failed', err);
    }
  },

  persist: async () => {
    const s = get();
    await Promise.all([
      saveList(STORAGE_KEYS.clients, s.clients),
      saveList(STORAGE_KEYS.visits, s.visits),
      saveList(STORAGE_KEYS.tasks, s.tasks),
      saveList(STORAGE_KEYS.approvals, s.approvals),
      saveList(STORAGE_KEYS.consents, s.consents),
      saveList(STORAGE_KEYS.expenses, s.expenses),
      saveList(STORAGE_KEYS.batches, s.batches),
      saveList(STORAGE_KEYS.shipments, s.shipments),
      saveList(STORAGE_KEYS.documents, s.documents),
      saveList(STORAGE_KEYS.signatures, s.signatures),
      saveList(STORAGE_KEYS.auditEntries, s.auditEntries),
      saveList(STORAGE_KEYS.salesPlans, s.salesPlans),
      saveList(STORAGE_KEYS.notifications, s.notifications),
      saveList(STORAGE_KEYS.supportTickets, s.supportTickets),
    ]);
  },

  syncWarehouse: async () => {
    const [storedBatches, storedShipments] = await Promise.all([
      loadJSON<Batch[]>(STORAGE_KEYS.batches, []),
      loadJSON<Shipment[]>(STORAGE_KEYS.shipments, []),
    ]);
    const { batches, shipments } = get();
    const mergedBatches = mergeById(storedBatches, batches);
    const mergedShipments = mergeById(storedShipments, shipments);

    set({ batches: mergedBatches, shipments: mergedShipments });

    if (mergedBatches.length !== storedBatches.length) {
      await saveList(STORAGE_KEYS.batches, mergedBatches);
    }
    if (mergedShipments.length !== storedShipments.length) {
      await saveList(STORAGE_KEYS.shipments, mergedShipments);
    }
  },

  syncTasks: async () => {
    const storedTasks = await loadJSON<Task[]>(STORAGE_KEYS.tasks, []);
    const { tasks } = get();
    const mergedTasks = mergeById(storedTasks, tasks);
    set({ tasks: mergedTasks });
    if (mergedTasks.length !== storedTasks.length) {
      await saveList(STORAGE_KEYS.tasks, mergedTasks);
    }
  },

  addClient: async (data) => {
    const coords = approximateCoords(data.city, data.address, data.name);
    const client: Client = { ...data, ...coords, id: generateId('client'), consentStatus: 'none' };
    const clients = [client, ...get().clients];
    set({ clients });
    await saveList(STORAGE_KEYS.clients, clients);

    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    const followUpTask = buildTask({
      title: `Связаться с аптекой: ${client.name}`,
      description: 'Первичный контакт после добавления в клиентскую базу',
      dueDate: defaultClientTaskDueDate(),
      priority: 'medium',
      clientId: client.id,
    }, user);
    const tasks = [followUpTask, ...get().tasks];
    set({ tasks });
    await saveList(STORAGE_KEYS.tasks, tasks);

    try {
      await pushNotification(get, set, {
        type: 'client',
        title: 'Аптека добавлена',
        message: `${client.name} зарегистрирована в базе`,
        entityType: 'pharmacy',
        entityId: client.id,
      });
      await pushNotification(get, set, {
        type: 'task',
        title: 'Задача по аптеке',
        message: followUpTask.title,
        entityType: 'task',
        entityId: followUpTask.id,
      });
    } catch {
      // уведомления не блокируют сохранение
    }
    return client;
  },

  removeClient: async (id) => {
    const clients = get().clients.filter((c) => c.id !== id);
    const tasks = get().tasks.filter((t) => t.clientId !== id);
    set({ clients, tasks });
    await Promise.all([
      saveList(STORAGE_KEYS.clients, clients),
      saveList(STORAGE_KEYS.tasks, tasks),
    ]);
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
    await pushNotification(get, set, {
      type: 'visit',
      title: 'Визит запланирован',
      message: `${visit.clientName} — ${new Date(visit.plannedDate).toLocaleDateString('ru-RU')}`,
      entityType: 'visit',
      entityId: visit.id,
    });
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
    const task = buildTask(data, user);
    const tasks = [task, ...get().tasks];
    set({ tasks });
    await saveList(STORAGE_KEYS.tasks, tasks);
    try {
      await pushNotification(get, set, {
        type: 'task',
        title: 'Новая задача',
        message: task.title,
        entityType: 'task',
        entityId: task.id,
      });
    } catch {
      // уведомление не блокирует сохранение
    }
    return task;
  },

  updateTask: async (task) => {
    const tasks = get().tasks.map((t) => (t.id === task.id ? task : t));
    set({ tasks });
    await saveList(STORAGE_KEYS.tasks, tasks);
  },

  removeTask: async (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    await saveList(STORAGE_KEYS.tasks, tasks);
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
    await pushNotification(get, set, {
      type: 'approval',
      title: 'Заявка на согласование',
      message: approval.title,
      entityType: 'approval',
      entityId: approval.id,
    });
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
    const approval = get().approvals.find((a) => a.id === id);
    if (approval) {
      const labels = { approved: 'одобрена', rejected: 'отклонена', returned: 'возвращена на доработку' };
      await pushNotification(get, set, {
        type: 'approval',
        title: 'Решение по согласованию',
        message: `«${approval.title}» — ${labels[decision]}`,
        entityType: 'approval',
        entityId: id,
      });
    }
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
    await pushNotification(get, set, {
      type: 'consent',
      title: 'Согласие зарегистрировано',
      message: consent.clientName,
      entityType: 'consent',
      entityId: consent.id,
    });
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
    await pushNotification(get, set, {
      type: 'expense',
      title: 'Расход зарегистрирован',
      message: `${expense.amount} ₽ — ${expense.description}`,
      entityType: 'expense',
      entityId: expense.id,
    });
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
    const batches = [batch, ...get().batches];
    set({ batches });
    await saveList(STORAGE_KEYS.batches, batches);
    try {
      await pushNotification(get, set, {
        type: 'document',
        title: 'Серия добавлена',
        message: `${batch.productName} · ${batch.batchNumber} (${batch.quantity} шт.)`,
        entityType: 'batch',
        entityId: batch.id,
      });
    } catch {
      // уведомление не должно блокировать сохранение серии
    }
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
    const shipments = [shipment, ...get().shipments];
    set({ shipments });
    await saveList(STORAGE_KEYS.shipments, shipments);
    try {
      await pushNotification(get, set, {
        type: 'document',
        title: 'Поставка создана',
        message: `${shipment.number} → ${shipment.recipientName}`,
        entityType: 'shipment',
        entityId: shipment.id,
      });
    } catch {
      // уведомление не должно блокировать сохранение поставки
    }
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
    await pushNotification(get, set, {
      type: 'document',
      title: 'Документ добавлен',
      message: doc.title,
      entityType: 'document',
      entityId: doc.id,
    });
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
    await pushNotification(get, set, n);
  },

  markNotificationRead: async (id) => {
    set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
    await get().persist();
  },

  markAllNotificationsRead: async () => {
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) });
    await get().persist();
  },

  updateSalesPlan: async (id, data) => {
    set({
      salesPlans: get().salesPlans.map((p) => {
        if (p.id !== id) return p;
        const targetAmount = data.targetAmount ?? p.targetAmount;
        const actualAmount = data.actualAmount ?? p.actualAmount;
        const deviation = actualAmount - targetAmount;
        const deviationPercent = targetAmount ? (deviation / targetAmount) * 100 : 0;
        return { ...p, ...data, targetAmount, actualAmount, deviation, deviationPercent };
      }),
    });
    await get().persist();
  },

  addSupportTicket: async (data) => {
    const user = await loadJSON<{ name: string; id: string } | null>('current_user', null);
    const ticket: SupportTicket = {
      id: generateId('ticket'),
      clientId: data.clientId,
      clientName: data.clientName,
      subject: data.subject,
      description: data.description,
      status: 'open',
      priority: data.priority ?? 'medium',
      createdAt: new Date().toISOString(),
      assigneeId: user?.id,
      assigneeName: user?.name,
    };
    set({ supportTickets: [ticket, ...get().supportTickets] });
    await get().persist();
    await pushNotification(get, set, {
      type: 'complaint',
      title: 'Новое обращение',
      message: `${ticket.clientName}: ${ticket.subject}`,
      entityType: 'support',
      entityId: ticket.id,
      priority: 'high',
    });
    return ticket;
  },

  updateSupportTicket: async (ticket) => {
    set({ supportTickets: get().supportTickets.map((t) => (t.id === ticket.id ? ticket : t)) });
    await get().persist();
  },

  removeSupportTicket: async (id) => {
    set({ supportTickets: get().supportTickets.filter((t) => t.id !== id) });
    await get().persist();
  },
}));
