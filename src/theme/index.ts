export { colors } from './colors';

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

/** Micro label used above sections: small, uppercase, tracked out. */
export const overline = {
  fontSize: 11,
  fontWeight: '800' as const,
  letterSpacing: 1.4,
  textTransform: 'uppercase' as const,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  accent: {
    shadowColor: '#f2d024',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
};
