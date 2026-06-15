import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AppScreenName } from '../constants/departmentAccess';
import { navigateToAppScreen } from '../navigation/navigateApp';
import { useDepartmentAccess } from './useDepartmentAccess';

export function useAppNavigation() {
  const navigation = useNavigation<any>();
  const { tabs } = useDepartmentAccess();
  const tabScreens = useMemo(() => tabs.map((t) => t.screen), [tabs]);

  return {
    navigation,
    goTo: (screen: AppScreenName) => navigateToAppScreen(navigation, screen, tabScreens),
  };
}
