import { createBreakpoints } from './breakpoints';
import { createColors, ThemeColorsInput } from './createColors';
import { createComponents } from './createComponents';
import { createShadows } from './createShadows';
import { createShape, ThemeShapeInput } from './createShape';
import { createSpacing, ThemeSpacingOptions } from './createSpacing';
import { createTransitions } from './createTransitions';
import { createTypography, ThemeTypographyInput } from './createTypography';
import { createV1Theme } from './createV1Theme';
import { createVisualizationColors } from './createVisualizationColors';
import { GrafanaTheme2 } from './types';
import { zIndex } from './zIndex';

/** @internal */
export interface NewThemeOptions {
  name?: string;
  colors?: ThemeColorsInput;
  spacing?: ThemeSpacingOptions;
  shape?: ThemeShapeInput;
  typography?: ThemeTypographyInput;
}

/** Custom theme configuration passed from backend boot data */
export interface CustomThemeConfig {
  enabled?: boolean;
  headerBackground?: string;
  headerTextColor?: string;
  lightBackgroundCanvas?: string;
  lightBackgroundPrimary?: string;
  lightBackgroundSecondary?: string;
  lightSectionHeaderBackground?: string;
  lightBorderWeak?: string;
  lightBorderMedium?: string;
  darkBackgroundCanvas?: string;
  darkBackgroundPrimary?: string;
  darkBackgroundSecondary?: string;
  darkSectionHeaderBackground?: string;
  darkBorderWeak?: string;
  darkBorderMedium?: string;
}

function getCustomThemeConfig(): CustomThemeConfig | undefined {
  const g: any = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : undefined;
  if (!g) {
    return undefined;
  }
  return g.grafanaBootData?.settings?.customTheme || g.window?.grafanaBootData?.settings?.customTheme;
}

/** @internal */
export function createTheme(options: NewThemeOptions = {}): GrafanaTheme2 {
  const {
    name,
    colors: colorsInput = {},
    spacing: spacingInput = {},
    shape: shapeInput = {},
    typography: typographyInput = {},
  } = options;

  const colors = createColors(colorsInput);

  // Apply custom theme configuration overrides when theme customization is enabled
  const customConfig = getCustomThemeConfig();
  // Safe environment check compatible with Node.js and Webpack DefinePlugin (avoids TS2367 comparison error)
  const isEnvTheme =
    typeof process !== 'undefined' &&
    Boolean(
      (process.env.ENABLE_THEME as unknown) === true ||
        process.env.ENABLE_THEME === 'true' ||
        process.env.ENABLE_THEME === '1' ||
        (process.env.enable_theme as unknown) === true ||
        process.env.enable_theme === 'true' ||
        process.env.enable_theme === '1'
    );
  const isThemeEnabled = isEnvTheme || Boolean(customConfig?.enabled);

  // Default custom theme colors from design specifications (Images 3, 4, 5) and defaults.ini
  const defaultThemeColors = {
    headerBackground: '#d21300',
    headerTextColor: '#FFFFFF',
    lightBackgroundCanvas: '#FAF9F5',
    lightBackgroundPrimary: '#FFFFFF',
    lightBackgroundSecondary: '#F4F3EE',
    lightSectionHeaderBackground: '#DADBD6',
    lightBorderWeak: '#DFD2B0',
    lightBorderMedium: '#E5E2DC',
    darkBackgroundCanvas: '#141414',
    darkBackgroundPrimary: '#000000',
    darkBackgroundSecondary: '#222222',
    darkSectionHeaderBackground: '#525252',
    darkBorderWeak: '#656565',
    darkBorderMedium: '#656565',
  };

  let sectionHeaderBackground: string | undefined;

  if (isThemeEnabled) {
    if (colors.mode === 'light') {
      colors.background.canvas =
        customConfig?.lightBackgroundCanvas || defaultThemeColors.lightBackgroundCanvas;
      colors.background.primary =
        customConfig?.lightBackgroundPrimary || defaultThemeColors.lightBackgroundPrimary;
      colors.background.secondary =
        customConfig?.lightBackgroundSecondary || defaultThemeColors.lightBackgroundSecondary;
      colors.border.weak =
        customConfig?.lightBorderWeak || defaultThemeColors.lightBorderWeak;
      colors.border.medium =
        customConfig?.lightBorderMedium || defaultThemeColors.lightBorderMedium;
      sectionHeaderBackground =
        customConfig?.lightSectionHeaderBackground || defaultThemeColors.lightSectionHeaderBackground;
    } else {
      colors.background.canvas =
        customConfig?.darkBackgroundCanvas || defaultThemeColors.darkBackgroundCanvas;
      colors.background.primary =
        customConfig?.darkBackgroundPrimary || defaultThemeColors.darkBackgroundPrimary;
      colors.background.secondary =
        customConfig?.darkBackgroundSecondary || defaultThemeColors.darkBackgroundSecondary;
      colors.border.weak =
        customConfig?.darkBorderWeak || defaultThemeColors.darkBorderWeak;
      colors.border.medium =
        customConfig?.darkBorderMedium || defaultThemeColors.darkBorderMedium;
      sectionHeaderBackground =
        customConfig?.darkSectionHeaderBackground || defaultThemeColors.darkSectionHeaderBackground;
    }
  }

  const custom = isThemeEnabled
    ? {
        headerBackground:
          customConfig?.headerBackground || defaultThemeColors.headerBackground,
        headerTextColor:
          customConfig?.headerTextColor || defaultThemeColors.headerTextColor,
        sectionHeaderBackground: sectionHeaderBackground,
      }
    : undefined;

  const breakpoints = createBreakpoints();
  const spacing = createSpacing(spacingInput);
  const shape = createShape(shapeInput);
  const typography = createTypography(colors, typographyInput);
  const shadows = createShadows(colors);
  const transitions = createTransitions();
  const components = createComponents(colors, shadows);
  const visualization = createVisualizationColors(colors);

  const theme = {
    name: name ?? (colors.mode === 'dark' ? 'Dark' : 'Light'),
    isDark: colors.mode === 'dark',
    isLight: colors.mode === 'light',
    colors,
    breakpoints,
    spacing,
    shape,
    components,
    typography,
    shadows,
    transitions,
    visualization,
    zIndex: {
      ...zIndex,
    },
    flags: {},
    custom,
  };

  return {
    ...theme,
    v1: createV1Theme(theme),
  };
}
