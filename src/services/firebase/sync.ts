import {
  Client, Visit, Task, Approval, Consent, Expense, Batch, Shipment,
  Document, ElectronicSignature, AuditEntry, SalesPlan, AppNotification, SupportTicket,
} from '../../types';
import { STORAGE_KEYS } from '../storageService';
import { canUseFirestore, fetchCollection, upsertCollection, upsertDocument, removeDocument } from './firestore';
import { FirestoreCollection, FIRESTORE_COLLECTIONS } from './index';

const STORAGE_TO_FIRESTORE: Record<string, FirestoreCollection> = {
  [STORAGE_KEYS.clients]: 'clients',
  [STORAGE_KEYS.visits]: 'visits',
  [STORAGE_KEYS.tasks]: 'tasks',
  [STORAGE_KEYS.approvals]: 'approvals',
  [STORAGE_KEYS.consents]: 'consents',
  [STORAGE_KEYS.expenses]: 'expenses',
  [STORAGE_KEYS.batches]: 'batches',
  [STORAGE_KEYS.shipments]: 'shipments',
  [STORAGE_KEYS.documents]: 'documents',
  [STORAGE_KEYS.signatures]: 'signatures',
  [STORAGE_KEYS.auditEntries]: 'auditEntries',
  [STORAGE_KEYS.salesPlans]: 'salesPlans',
  [STORAGE_KEYS.notifications]: 'notifications',
  [STORAGE_KEYS.supportTickets]: 'supportTickets',
};

export interface RemoteData {
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
}

export async function loadAllFromFirestore(): Promise<RemoteData | null> {
  if (!canUseFirestore()) return null;

  const [
    clients, visits, tasks, approvals, consents, expenses,
    batches, shipments, documents, signatures, auditEntries, salesPlans, notifications, supportTickets,
  ] = await Promise.all([
    fetchCollection<Client>('clients'),
    fetchCollection<Visit>('visits'),
    fetchCollection<Task>('tasks'),
    fetchCollection<Approval>('approvals'),
    fetchCollection<Consent>('consents'),
    fetchCollection<Expense>('expenses'),
    fetchCollection<Batch>('batches'),
    fetchCollection<Shipment>('shipments'),
    fetchCollection<Document>('documents'),
    fetchCollection<ElectronicSignature>('signatures'),
    fetchCollection<AuditEntry>('auditEntries'),
    fetchCollection<SalesPlan>('salesPlans'),
    fetchCollection<AppNotification>('notifications'),
    fetchCollection<SupportTicket>('supportTickets'),
  ]);

  return {
    clients, visits, tasks, approvals, consents, expenses,
    batches, shipments, documents, signatures, auditEntries, salesPlans, notifications, supportTickets,
  };
}

export async function syncStorageKeyToFirestore<T extends { id: string }>(
  storageKey: string,
  items: T[],
): Promise<void> {
  if (!canUseFirestore()) return;
  const collection = STORAGE_TO_FIRESTORE[storageKey];
  if (!collection) return;
  await upsertCollection(collection, items);
}

export async function syncItemToFirestore<T extends { id: string }>(
  storageKey: string,
  item: T,
): Promise<void> {
  if (!canUseFirestore()) return;
  const collection = STORAGE_TO_FIRESTORE[storageKey];
  if (!collection) return;
  await upsertDocument(collection, item);
}

export async function deleteItemFromFirestore(storageKey: string, id: string): Promise<void> {
  if (!canUseFirestore()) return;
  const collection = STORAGE_TO_FIRESTORE[storageKey];
  if (!collection) return;
  await removeDocument(collection, id);
}

export { FIRESTORE_COLLECTIONS };
