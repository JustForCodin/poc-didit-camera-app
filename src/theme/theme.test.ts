import { theme } from './theme';

describe('Theme Configuration', () => {
  describe('colors', () => {
    it('should have all required color values', () => {
      expect(theme.colors).toHaveProperty('primary');
      expect(theme.colors).toHaveProperty('secondary');
      expect(theme.colors).toHaveProperty('success');
      expect(theme.colors).toHaveProperty('warning');
      expect(theme.colors).toHaveProperty('error');
      expect(theme.colors).toHaveProperty('background');
      expect(theme.colors).toHaveProperty('surface');
      expect(theme.colors).toHaveProperty('text');
      expect(theme.colors).toHaveProperty('textSecondary');
      expect(theme.colors).toHaveProperty('border');
    });

    it('should have valid hex color format for primary colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(theme.colors.primary).toMatch(hexColorRegex);
      expect(theme.colors.secondary).toMatch(hexColorRegex);
      expect(theme.colors.success).toMatch(hexColorRegex);
      expect(theme.colors.warning).toMatch(hexColorRegex);
      expect(theme.colors.error).toMatch(hexColorRegex);
    });
  });

  describe('spacing', () => {
    it('should have all spacing values', () => {
      expect(theme.spacing).toHaveProperty('xs');
      expect(theme.spacing).toHaveProperty('sm');
      expect(theme.spacing).toHaveProperty('md');
      expect(theme.spacing).toHaveProperty('lg');
      expect(theme.spacing).toHaveProperty('xl');
    });

    it('should have progressively larger spacing values', () => {
      expect(theme.spacing.xs).toBeLessThan(theme.spacing.sm);
      expect(theme.spacing.sm).toBeLessThan(theme.spacing.md);
      expect(theme.spacing.md).toBeLessThan(theme.spacing.lg);
      expect(theme.spacing.lg).toBeLessThan(theme.spacing.xl);
    });

    it('should have numeric spacing values', () => {
      expect(typeof theme.spacing.xs).toBe('number');
      expect(typeof theme.spacing.sm).toBe('number');
      expect(typeof theme.spacing.md).toBe('number');
      expect(typeof theme.spacing.lg).toBe('number');
      expect(typeof theme.spacing.xl).toBe('number');
    });
  });

  describe('typography', () => {
    it('should have heading typography', () => {
      expect(theme.typography.heading).toHaveProperty('fontSize');
      expect(theme.typography.heading).toHaveProperty('fontWeight');
    });

    it('should have body typography', () => {
      expect(theme.typography.body).toHaveProperty('fontSize');
      expect(theme.typography.body).toHaveProperty('fontWeight');
    });

    it('should have caption typography', () => {
      expect(theme.typography.caption).toHaveProperty('fontSize');
      expect(theme.typography.caption).toHaveProperty('fontWeight');
    });

    it('should have progressively smaller font sizes', () => {
      expect(theme.typography.heading.fontSize).toBeGreaterThan(
        theme.typography.body.fontSize,
      );
      expect(theme.typography.body.fontSize).toBeGreaterThan(
        theme.typography.caption.fontSize,
      );
    });
  });

  describe('borderRadius', () => {
    it('should have all border radius values', () => {
      expect(theme.borderRadius).toHaveProperty('sm');
      expect(theme.borderRadius).toHaveProperty('md');
      expect(theme.borderRadius).toHaveProperty('lg');
      expect(theme.borderRadius).toHaveProperty('full');
    });

    it('should have progressively larger border radius', () => {
      expect(theme.borderRadius.sm).toBeLessThan(theme.borderRadius.md);
      expect(theme.borderRadius.md).toBeLessThan(theme.borderRadius.lg);
      expect(theme.borderRadius.lg).toBeLessThan(theme.borderRadius.full);
    });

    it('should have full border radius as large value for pills', () => {
      expect(theme.borderRadius.full).toBeGreaterThan(100);
    });
  });
});
