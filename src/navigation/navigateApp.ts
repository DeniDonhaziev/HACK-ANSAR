import { CommonActions } from '@react-navigation/native';
import { AppScreenName } from '../constants/departmentAccess';

type NavLike = {
  dispatch: (action: ReturnType<typeof CommonActions.navigate>) => void;
  getParent?: () => NavLike | undefined;
  getState?: () => { routeNames?: string[] };
};

function findNavigatorWithRoute(navigation: NavLike, routeName: string): NavLike | null {
  let current: NavLike | undefined = navigation;
  while (current) {
    const names = current.getState?.()?.routeNames ?? [];
    if (names.includes(routeName)) return current;
    current = current.getParent?.();
  }
  return null;
}

/**
 * Переход на экран с учётом вложенности: вкладка в MainTabs или экран в стеке.
 */
export function navigateToAppScreen(
  navigation: NavLike,
  screen: AppScreenName,
  tabScreens: AppScreenName[],
) {
  if (tabScreens.includes(screen)) {
    const stack = findNavigatorWithRoute(navigation, 'MainTabs');
    const action = CommonActions.navigate({
      name: 'MainTabs',
      params: { screen },
    });
    (stack ?? navigation).dispatch(action);
    return;
  }

  const stack = findNavigatorWithRoute(navigation, screen);
  const action = CommonActions.navigate({ name: screen });
  (stack ?? navigation).dispatch(action);
}
