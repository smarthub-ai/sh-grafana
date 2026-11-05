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

  // Images built without ENABLE_THEME get this boot data from conf/defaults.ini and must keep Grafana's default colors
  it('keeps default colors when the custom theme is disabled via bootData', () => {
    const defaultLight = createTheme({ colors: { mode: 'light' } });
    const defaultDark = createTheme({ colors: { mode: 'dark' } });

    (window as any).grafanaBootData = {
      settings: { customTheme: { enabled: false, headerBackground: '', headerTextColor: '' } },
    };

    try {
      const lightTheme = createTheme({ colors: { mode: 'light' } });
      expect(lightTheme.custom).toBeUndefined();
      expect(lightTheme.colors.background).toEqual(defaultLight.colors.background);
      expect(lightTheme.colors.border).toEqual(defaultLight.colors.border);

      const darkTheme = createTheme({ colors: { mode: 'dark' } });
      expect(darkTheme.custom).toBeUndefined();
      expect(darkTheme.colors.background).toEqual(defaultDark.colors.background);
      expect(darkTheme.colors.border).toEqual(defaultDark.colors.border);
    } finally {
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
