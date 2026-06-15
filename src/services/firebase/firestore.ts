import {
  collection, doc, getDocs, setDoc, deleteDoc, writeBatch,
} from 'firebase/firestore';
import { getFirestoreDb, isFirebaseReady, FirestoreCollection, FIRESTORE_COLLECTIONS } from './index';

function collectionPath(name: FirestoreCollection): string {
  return FIRESTORE_COLLECTIONS[name];
}

export async function fetchCollection<T extends { id: string }>(name: FirestoreCollection): Promise<T[]> {
  const db = getFirestoreDb();
  if (!db) return [];
  const snap = await getDocs(collection(db, collectionPath(name)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

export async function upsertDocument<T extends { id: string }>(
  name: FirestoreCollection,
  item: T,
): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  const { id, ...data } = item;
  await setDoc(doc(db, collectionPath(name), id), { ...data, id }, { merge: true });
}

export async function removeDocument(name: FirestoreCollection, id: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;
  await deleteDoc(doc(db, collectionPath(name), id));
}

export async function upsertCollection<T extends { id: string }>(
  name: FirestoreCollection,
  items: T[],
): Promise<void> {
  const db = getFirestoreDb();
  if (!db || items.length === 0) return;

  const batchSize = 400;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = items.slice(i, i + batchSize);
    for (const item of chunk) {
      const { id, ...data } = item;
      batch.set(doc(db, collectionPath(name), id), { ...data, id }, { merge: true });
    }
    await batch.commit();
  }
}

export function canUseFirestore(): boolean {
  return isFirebaseReady();
}
