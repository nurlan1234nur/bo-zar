export type ThemeTokens = {
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    surfaceTint: string;
    text: string;
    muted: string;
    border: string;
    borderStrong: string;
    accent: string;
    accentText: string;
    accentSoft: string;
    success: string;
    successSoft: string;
    danger: string;
    dangerSoft: string;
    shadow: string;
  };
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  layout: {
    contentMaxWidth: number;
    adminSidebarWidth: number;
    panelWidth: number;
  };
  typography: {
    body: number;
    small: number;
    sectionTitle: number;
    hero: number;
  };
};

export const lightTheme: ThemeTokens = {
  colors: {
    background: "#f5f7fb",
    surface: "#ffffff",
    surfaceMuted: "#f3f3f3",
    surfaceTint: "#fff1ee",
    text: "#111111",
    muted: "#787878",
    border: "#e6e6e6",
    borderStrong: "#d9d9d9",
    accent: "#ff4422",
    accentText: "#ffffff",
    accentSoft: "#fff5f2",
    success: "#067647",
    successSoft: "#ecfdf3",
    danger: "#b12c12",
    dangerSoft: "#fff1ee",
    shadow: "rgba(0, 0, 0, 0.18)",
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 10,
    lg: 14,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  layout: {
    contentMaxWidth: 1120,
    adminSidebarWidth: 248,
    panelWidth: 460,
  },
  typography: {
    body: 14,
    small: 12,
    sectionTitle: 18,
    hero: 34,
  },
};

export const darkTheme: ThemeTokens = {
  colors: {
    background: "#0f1218",
    surface: "#171b22",
    surfaceMuted: "#1d232d",
    surfaceTint: "#251916",
    text: "#f5f7fb",
    muted: "#a8b0bc",
    border: "#2d3644",
    borderStrong: "#394355",
    accent: "#ff6a4a",
    accentText: "#ffffff",
    accentSoft: "#2a1916",
    success: "#36c98b",
    successSoft: "#15261f",
    danger: "#ff8a76",
    dangerSoft: "#2a1916",
    shadow: "rgba(0, 0, 0, 0.42)",
  },
  radius: lightTheme.radius,
  spacing: lightTheme.spacing,
  layout: lightTheme.layout,
  typography: lightTheme.typography,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themes;
export const theme = lightTheme;

export type DesignTokens = ThemeTokens;
