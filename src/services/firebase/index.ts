import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '../../config/firebase';

export type DataBackend = 'local' | 'firebase';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let initialized = false;

export function getActiveBackend(): DataBackend {
  return initialized && isFirebaseConfigured() ? 'firebase' : 'local';
}

export function isFirebaseReady(): boolean {
  return initialized && !!firestore;
}

export function getFirebaseAuth(): Auth | null {
  return auth;
}

export function getFirestoreDb(): Firestore | null {
  return firestore;
}

export async function initFirebase(): Promise<boolean> {
  if (!isFirebaseConfigured()) {
    initialized = false;
    return false;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }

  auth = getAuth(app);
  firestore = getFirestore(app);
  initialized = true;
  return true;
}

/** Соответствие коллекций Firestore */
export const FIRESTORE_COLLECTIONS = {
  users: 'users',
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
  auditEntries: 'audit_logs',
  salesPlans: 'sales_plans',
  notifications: 'notifications',
  supportTickets: 'support_tickets',
} as const;

export type FirestoreCollection = keyof typeof FIRESTORE_COLLECTIONS;
