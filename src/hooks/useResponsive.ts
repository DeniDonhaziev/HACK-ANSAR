import { useWindowDimensions, Platform } from 'react-native';

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export const LAYOUT = {
  sidebarWidth: 260,
  contentMaxWidth: 1200,
  authMaxWidth: 480,
  authSplitMaxWidth: 920,
  authBrandWidth: 340,
  modalMaxWidth: 560,
  pagePaddingMobile: 16,
  pagePaddingDesktop: 32,
} as const;

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isWeb = Platform.OS === 'web';
  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isWide = width >= BREAKPOINTS.wide;

  const columns = isWide ? 4 : isDesktop ? 3 : isTablet ? 2 : 1;
  const pagePadding = isDesktop ? LAYOUT.pagePaddingDesktop : LAYOUT.pagePaddingMobile;
  const contentMaxWidth = isDesktop ? LAYOUT.contentMaxWidth : undefined;

  return {
    width,
    height,
    isWeb,
    isTablet,
    isDesktop,
    isWide,
    columns,
    pagePadding,
    contentMaxWidth,
  };
}
