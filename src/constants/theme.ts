/** Homies Lab — тёплая кремово-золотая палитра */
export const colors = {
  primary: '#2D2D2D',
  primaryDark: '#1A1A1A',
  primaryLight: '#F0EDE6',
  secondary: '#5C5C5C',
  secondaryLight: '#E8E4DC',
  accent: '#E8B84A',
  accentDark: '#D4A012',
  accentLight: '#FFF8E7',
  success: '#4A9B6E',
  successLight: '#E8F5ED',
  warning: '#D4A012',
  warningLight: '#FFF3D6',
  error: '#C45C5C',
  errorLight: '#FDECEC',
  info: '#6B8CAE',
  infoLight: '#EEF3F8',
  background: '#F5F1E8',
  surface: '#FFFCF5',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F0EDE6',
  sidebar: '#EEEBE4',
  text: '#2D2D2D',
  textSecondary: '#6B6560',
  textMuted: '#A39E96',
  border: '#E5E0D6',
  borderFocus: '#E8B84A',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(45, 45, 45, 0.4)',
  gradientStart: '#2D2D2D',
  gradientEnd: '#4A4A4A',
  tabBar: '#FFFCF5',
  chartYellow: '#E8B84A',
  chartDark: '#2D2D2D',
  chartGrey: '#C4BEB4',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.1 },
  overline: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5, textTransform: 'uppercase' as const },
};

export const shadows = {
  sm: {
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
};
