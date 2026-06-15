import { create } from 'zustand';
import { User, UserRole, Department } from '../types';
import { saveJSON, loadJSON, STORAGE_KEYS, generateId } from '../services/storageService';

interface StoredUser extends User {
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  twoFactorPending: boolean;
  hydrated: boolean;
  hasUsers: boolean;

  hydrate: () => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: UserRole; department: Department; twoFactorEnabled: boolean }) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  twoFactorPending: false,
  hydrated: false,
  hasUsers: false,

  hydrate: async () => {
    const users = await loadJSON<StoredUser[]>(STORAGE_KEYS.users, []);
    const currentUserId = await loadJSON<string | null>(STORAGE_KEYS.currentUserId, null);
    let user: User | null = null;
    if (currentUserId) {
      const found = users.find((u) => u.id === currentUserId);
      if (found) {
        const { password: _, ...safe } = found;
        user = { ...safe, department: safe.department ?? 'sales' };
      }
    }
    set({
      hasUsers: users.length > 0,
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
    await saveJSON(STORAGE_KEYS.currentUserId, newUser.id);
    await saveJSON('current_user', { id: newUser.id, name: newUser.name, department: newUser.department });

    if (twoFactorEnabled) {
      set({ user: safe, twoFactorPending: true, isAuthenticated: false, hasUsers: true });
    } else {
      set({ user: safe, isAuthenticated: true, twoFactorPending: false, hasUsers: true });
    }
    return { ok: true };
  },

  login: async (email, password) => {
    const users = await loadJSON<StoredUser[]>(STORAGE_KEYS.users, []);
    const found = users.find((u) => u.email === email.toLowerCase() && u.password === password);
    if (!found) return { ok: false, error: 'Неверный адрес электронной почты или пароль.' };

    const { password: _, ...safe } = found;
    await saveJSON(STORAGE_KEYS.currentUserId, found.id);
    await saveJSON('current_user', { id: found.id, name: found.name, department: found.department ?? 'sales' });

    if (found.twoFactorEnabled) {
      set({ user: safe, twoFactorPending: true, isAuthenticated: false });
    } else {
      set({ user: safe, isAuthenticated: true, twoFactorPending: false });
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

  logout: async () => {
    await saveJSON(STORAGE_KEYS.currentUserId, null);
    set({ user: null, isAuthenticated: false, twoFactorPending: false });
  },
}));
