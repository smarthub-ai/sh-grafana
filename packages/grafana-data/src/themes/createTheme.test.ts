import { createTheme } from './createTheme';

describe('createTheme', () => {
  it('create custom theme', () => {
    const custom = createTheme({
      colors: {
        mode: 'dark',
        primary: {
          main: 'rgb(240,0,0)',
        },
        background: {
          canvas: '#123',
        },
      },
    });

    expect(custom.colors.primary.main).toBe('rgb(240,0,0)');
    expect(custom.colors.primary.shade).toBe('rgb(242, 38, 38)');
    expect(custom.colors.background.canvas).toBe('#123');
  });

  it('create default theme', () => {
    const theme = createTheme();
    expect(theme.colors.mode).toBe('dark');
    expect(theme.custom).toBeUndefined();
  });

  it('applies custom theme overrides when enabled via bootData', () => {
    const originalWindow = (global as any).window;
    const bootData = {
      settings: {
        customTheme: {
          enabled: true,
          headerBackground: '#C8102E',
          headerTextColor: '#FFFFFF',
          lightBackgroundCanvas: '#FAF9F5',
          lightBackgroundPrimary: '#FFFFFF',
          lightSectionHeaderBackground: '#DADBD6',
          lightBorderWeak: '#DFD2B0',
          darkBackgroundCanvas: '#151515',
          darkBackgroundPrimary: '#1E1E1E',
          darkSectionHeaderBackground: '#282828',
          darkBorderWeak: '#2D2D2D',
        },
      },
    };
    (global as any).window = { grafanaBootData: bootData };
    if (typeof window !== 'undefined') {
      (window as any).grafanaBootData = bootData;
    }

    const lightTheme = createTheme({ colors: { mode: 'light' } });
    expect(lightTheme.custom?.headerBackground).toBe('#C8102E');
    expect(lightTheme.custom?.headerTextColor).toBe('#FFFFFF');
    expect(lightTheme.custom?.sectionHeaderBackground).toBe('#DADBD6');
    expect(lightTheme.colors.background.canvas).toBe('#FAF9F5');
    expect(lightTheme.colors.background.primary).toBe('#FFFFFF');
    expect(lightTheme.colors.border.weak).toBe('#DFD2B0');

    const darkTheme = createTheme({ colors: { mode: 'dark' } });
    expect(darkTheme.custom?.headerBackground).toBe('#C8102E');
    expect(darkTheme.custom?.headerTextColor).toBe('#FFFFFF');
    expect(darkTheme.custom?.sectionHeaderBackground).toBe('#282828');
    expect(darkTheme.colors.background.canvas).toBe('#151515');
    expect(darkTheme.colors.background.primary).toBe('#1E1E1E');
    expect(darkTheme.colors.border.weak).toBe('#2D2D2D');

    (global as any).window = originalWindow;
    if (typeof window !== 'undefined') {
      delete (window as any).grafanaBootData;
    }
  });

  // Verify default custom theme colors are applied when ENABLE_THEME is set in the environment
  it('applies default custom theme colors when ENABLE_THEME is true in environment', () => {
    const originalEnv = process.env.ENABLE_THEME;
    process.env.ENABLE_THEME = 'true';

    try {
      const lightTheme = createTheme({ colors: { mode: 'light' } });
      expect(lightTheme.custom?.headerBackground).toBe('#d21300');
      expect(lightTheme.custom?.headerTextColor).toBe('#FFFFFF');
      expect(lightTheme.custom?.sectionHeaderBackground).toBe('#DADBD6');
      expect(lightTheme.colors.background.canvas).toBe('#FAF9F5');
      expect(lightTheme.colors.background.primary).toBe('#FFFFFF');
      expect(lightTheme.colors.border.weak).toBe('#DFD2B0');

      const darkTheme = createTheme({ colors: { mode: 'dark' } });
      expect(darkTheme.custom?.headerBackground).toBe('#d21300');
      expect(darkTheme.custom?.headerTextColor).toBe('#FFFFFF');
      expect(darkTheme.custom?.sectionHeaderBackground).toBe('#525252');
      expect(darkTheme.colors.background.canvas).toBe('#141414');
      expect(darkTheme.colors.background.primary).toBe('#000000');
      expect(darkTheme.colors.border.weak).toBe('#656565');
    } finally {
      process.env.ENABLE_THEME = originalEnv;
    }
  });
});
