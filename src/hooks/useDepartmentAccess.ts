import { useMemo } from 'react';
import { useAuthStore } from '../stores';
import {
  getDepartmentAccess,
  canAccessScreen,
  getSidebarItems,
  getSidebarSections,
  AppScreenName,
  DepartmentAccessConfig,
} from '../constants/departmentAccess';

export function useDepartmentAccess() {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    const department = user?.department;
    const role = user?.role;
    const access = getDepartmentAccess(department, role);
    const isAdmin = role === 'admin';

    return {
      user,
      department,
      role,
      isAdmin,
      access,
      tabs: access.tabs,
      modules: access.modules,
      empty: access.empty,
      sidebarItems: getSidebarItems(department, role),
      sidebarSections: getSidebarSections(department, role),
      canAccess: (screen: AppScreenName) => canAccessScreen(screen, department, role),
    };
  }, [user]);
}

export type DepartmentAccess = DepartmentAccessConfig;
