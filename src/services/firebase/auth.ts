import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, UserRole, Department } from '../../types';
import { getFirebaseAuth, getFirestoreDb, isFirebaseReady, FIRESTORE_COLLECTIONS } from './index';

export async function waitForFirebaseAuth(): Promise<FirebaseUser | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

export async function getCurrentFirebaseUser(): Promise<FirebaseUser | null> {
  return waitForFirebaseAuth();
}

export async function isFirebaseUserSignedIn(): Promise<boolean> {
  const user = await getCurrentFirebaseUser();
  return !!user;
}

export async function fetchUserProfile(uid: string): Promise<User | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  const data = snap.data() as User;
  return { ...data, id: uid, department: data.department ?? 'sales' };
}

export async function saveUserProfile(uid: string, profile: User): Promise<void> {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore не инициализирован');
  await setDoc(doc(db, FIRESTORE_COLLECTIONS.users, uid), { ...profile, id: uid }, { merge: true });
}

export async function firebaseRegister(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: Department;
  twoFactorEnabled: boolean;
}): Promise<{ ok: boolean; error?: string; user?: User }> {
  const auth = getFirebaseAuth();
  if (!auth) return { ok: false, error: 'Firebase не инициализирован. Перезапустите npm run web.' };

  try {
    const cred = await createUserWithEmailAndPassword(auth, data.email.trim().toLowerCase(), data.password);
    const profile: User = {
      id: cred.user.uid,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      department: data.department,
      twoFactorEnabled: data.twoFactorEnabled,
    };
    try {
      await saveUserProfile(cred.user.uid, profile);
    } catch {
      return {
        ok: false,
        error: 'Аккаунт в Auth создан, но профиль не записался в Firestore. Проверьте правила базы (Rules).',
      };
    }
    return { ok: true, user: profile };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code ?? '';
    if (code === 'auth/email-already-in-use') {
      return { ok: false, error: 'Email уже зарегистрирован в Firebase. Войдите через «Вход».' };
    }
    if (code === 'auth/weak-password') {
      return { ok: false, error: 'Пароль должен быть не менее 6 символов.' };
    }
    if (code === 'auth/invalid-email') {
      return { ok: false, error: 'Некорректный email.' };
    }
    return { ok: false, error: `Ошибка Firebase Auth: ${code || 'неизвестная'}` };
  }
}

export async function firebaseLogin(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string; user?: User }> {
  const auth = getFirebaseAuth();
  if (!auth) return { ok: false, error: 'Firebase не инициализирован. Перезапустите npm run web.' };

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    let profile = await fetchUserProfile(cred.user.uid);

    if (!profile) {
      profile = {
        id: cred.user.uid,
        name: cred.user.email?.split('@')[0] ?? 'Сотрудник',
        email: cred.user.email ?? email.trim().toLowerCase(),
        role: 'medical_rep',
        department: 'sales',
        twoFactorEnabled: false,
      };
      await saveUserProfile(cred.user.uid, profile);
    }

    return { ok: true, user: profile };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code ?? '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return { ok: false, error: 'Неверный email или пароль. Если регистрировались до подключения Firebase — зарегистрируйтесь заново.' };
    }
    return { ok: false, error: `Ошибка входа: ${code || 'проверьте email и пароль'}` };
  }
}

export async function firebaseLogout(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

export function isFirebaseAuthAvailable(): boolean {
  return isFirebaseReady() && !!getFirebaseAuth();
}
