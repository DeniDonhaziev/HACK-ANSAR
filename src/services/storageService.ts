import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@pharma_crm_';

export async function saveJSON<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(`${PREFIX}${key}`, JSON.stringify(data));
}

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(`${PREFIX}${key}`);
}

export const STORAGE_KEYS = {
  users: 'users',
  currentUserId: 'current_user_id',
  clients: 'clients',
  visits: 'visits',
  tasks: 'tasks',
  approvals: 'approvals',
  consents: 'consents',
  expenses: 'expenses',
  batches: 'batches',
  shipments: 'shipments',
  documents: 'documents',
  signatures: 'signatures',
  auditEntries: 'audit_entries',
  salesPlans: 'sales_plans',
  notifications: 'notifications',
  supportTickets: 'support_tickets',
} as const;

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
