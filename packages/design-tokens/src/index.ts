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
    background: "#f7f8fc",
    surface: "#ffffff",
    surfaceMuted: "#f1f4f9",
    surfaceTint: "#eef1fb",
    text: "#0d1117",
    muted: "#64748b",
    border: "#dde3ee",
    borderStrong: "#c8d1e1",
    accent: "#1c3fd4",
    accentText: "#ffffff",
    accentSoft: "#eef1fb",
    success: "#0b8a60",
    successSoft: "#ecfdf3",
    danger: "#dc3f3f",
    dangerSoft: "#fff0f0",
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
    contentMaxWidth: 1400,
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
    background: "#0a0f1e",
    surface: "#111827",
    surfaceMuted: "#161f35",
    surfaceTint: "#1a2340",
    text: "#f0f4ff",
    muted: "#94a3b8",
    border: "#1e2d4a",
    borderStrong: "#334465",
    accent: "#4f73f8",
    accentText: "#ffffff",
    accentSoft: "#1a2340",
    success: "#36c98b",
    successSoft: "#15261f",
    danger: "#ff7a7a",
    dangerSoft: "#321d25",
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
