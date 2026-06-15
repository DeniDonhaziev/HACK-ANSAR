import { create } from 'zustand';
import { User, UserRole, Department } from '../types';
import { saveJSON, loadJSON, STORAGE_KEYS, generateId } from '../services/storageService';
import { getActiveBackend } from '../services/firebase';
import {
  firebaseRegister,
  firebaseLogin,
  firebaseLogout,
  getCurrentFirebaseUser,
  fetchUserProfile,
  isFirebaseAuthAvailable,
} from '../services/firebase/auth';
import { useDataStore } from './dataStore';

interface StoredUser extends User {
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  twoFactorPending: boolean;
  hydrated: boolean;
  hasUsers: boolean;
  backend: 'local' | 'firebase';

  hydrate: () => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: UserRole; department: Department; twoFactorEnabled: boolean }) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  cancelTwoFactor: () => Promise<void>;
  logout: () => Promise<void>;
}

async function setSessionUser(user: User) {
  await saveJSON(STORAGE_KEYS.currentUserId, user.id);
  await saveJSON('current_user', { id: user.id, name: user.name, department: user.department });
}

async function afterAuthSuccess() {
  await useDataStore.getState().pullFromFirebase();
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  twoFactorPending: false,
  hydrated: false,
  hasUsers: false,
  backend: 'local',

  hydrate: async () => {
    const backend = getActiveBackend();
    let user: User | null = null;
    let hasUsers = false;

    if (backend === 'firebase' && isFirebaseAuthAvailable()) {
      const fbUser = await getCurrentFirebaseUser();
      if (fbUser) {
        user = await fetchUserProfile(fbUser.uid);
        hasUsers = !!user;
      }
    }

    if (!user) {
      const users = await loadJSON<StoredUser[]>(STORAGE_KEYS.users, []);
      const currentUserId = await loadJSON<string | null>(STORAGE_KEYS.currentUserId, null);
      hasUsers = users.length > 0;
      if (currentUserId) {
        const found = users.find((u) => u.id === currentUserId);
        if (found) {
          const { password: _, ...safe } = found;
          user = { ...safe, department: safe.department ?? 'sales' };
        }
      }
    }

    set({
      backend,
      hasUsers,
      user,
      hydrated: true,
      isAuthenticated: !!user && !user.twoFactorEnabled,
      twoFactorPending: !!user && !!user.twoFactorEnabled,
    });
  },

  register: async ({ name, email, password, role, department, twoFactorEnabled }) => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return { ok: false, error: 'Заполните все обязательные поля.' };
    }
    if (!department) {
      return { ok: false, error: 'Выберите отдел.' };
    }

    if (getActiveBackend() === 'firebase' && isFirebaseAuthAvailable()) {
      const result = await firebaseRegister({ name, email, password, role, department, twoFactorEnabled });
      if (!result.ok || !result.user) return { ok: false, error: result.error };

      await setSessionUser(result.user);
      await afterAuthSuccess();
      if (twoFactorEnabled) {
        set({ user: result.user, twoFactorPending: true, isAuthenticated: false, hasUsers: true, backend: 'firebase' });
      } else {
        set({ user: result.user, isAuthenticated: true, twoFactorPending: false, hasUsers: true, backend: 'firebase' });
      }
      return { ok: true };
    }

    const users = await loadJSON<StoredUser[]>(STORAGE_KEYS.users, []);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'Пользователь с таким адресом электронной почты уже зарегистрирован.' };
    }
    const newUser: StoredUser = {
      id: generateId('user'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      department,
      twoFactorEnabled,
    };
    const { password: _, ...safe } = newUser;
    await saveJSON(STORAGE_KEYS.users, [...users, newUser]);
    await setSessionUser(newUser);

    if (twoFactorEnabled) {
      set({ user: safe, twoFactorPending: true, isAuthenticated: false, hasUsers: true, backend: 'local' });
    } else {
      set({ user: safe, isAuthenticated: true, twoFactorPending: false, hasUsers: true, backend: 'local' });
    }
    return { ok: true };
  },

  login: async (email, password) => {
    if (getActiveBackend() === 'firebase' && isFirebaseAuthAvailable()) {
      const result = await firebaseLogin(email, password);
      if (!result.ok || !result.user) return { ok: false, error: result.error };

      await setSessionUser(result.user);
      await afterAuthSuccess();
      if (result.user.twoFactorEnabled) {
        set({ user: result.user, twoFactorPending: true, isAuthenticated: false, backend: 'firebase' });
      } else {
        set({ user: result.user, isAuthenticated: true, twoFactorPending: false, backend: 'firebase' });
      }
      return { ok: true };
    }

    const users = await loadJSON<StoredUser[]>(STORAGE_KEYS.users, []);
    const found = users.find((u) => u.email === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, error: 'Неверный адрес электронной почты или пароль.' };

    const { password: _, ...safe } = found;
    await setSessionUser(found);

    if (found.twoFactorEnabled) {
      set({ user: safe, twoFactorPending: true, isAuthenticated: false, backend: 'local' });
    } else {
      set({ user: safe, isAuthenticated: true, twoFactorPending: false, backend: 'local' });
    }
    return { ok: true };
  },

  verifyTwoFactor: async (code) => {
    if (code.length === 6) {
      set({ isAuthenticated: true, twoFactorPending: false });
      return true;
    }
    return false;
  },

  cancelTwoFactor: async () => {
    if (get().backend === 'firebase') {
      await firebaseLogout();
    }
    await saveJSON(STORAGE_KEYS.currentUserId, null);
    set({ user: null, isAuthenticated: false, twoFactorPending: false });
  },

  logout: async () => {
    if (get().backend === 'firebase') {
      await firebaseLogout();
    }
    await saveJSON(STORAGE_KEYS.currentUserId, null);
    set({ user: null, isAuthenticated: false, twoFactorPending: false });
  },
}));
