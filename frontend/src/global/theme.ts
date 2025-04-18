/** css/js theme variables */
export const theme = {
  /* accent */
  accent: "hsl(342, 50%, 50%)",
  "accent-light": "hsl(342, 100%, 90%)",

  /** deep */
  deep: "hsl(204, 50%, 35%)",
  "deep-light": "hsl(204, 100%, 90%)",

  /** grays */
  shadow: "#00000020",
  black: "#000000",
  "off-black": "#303030",
  "dark-gray": "#606060",
  gray: "#b0b0b0",
  "light-gray": "#e0e0e0",
  "off-white": "#f0f0f0",
  white: "#ffffff",

  /** util colors */
  success: "#10b981",
  warning: "#f59e0b",
  error: "#f43f5e",

  /** font families */
  sans: "Poppins, sans-serif",
  mono: "IBM Plex Mono, monospace",

  /* font weights */
  regular: "300",
  medium: "400",
  bold: "500",

  /* effects */
  rounded: "5px",
  fast: "0.15s ease",
  slow: "0.35s ease",
  "box-shadow": "0 0 2px var(--shadow), 2px 2px 5px var(--shadow)",
  focus: "0 0 5px var(--accent)",
  spacing: "2",
  compact: "1.5",

  /** sizes */
  content: "1000px",
};

/** set css vars on root element */
for (const [key, value] of Object.entries(theme))
  document.documentElement.style.setProperty(`--${key}`, value);
