import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeName =
  | "rose" | "ocean" | "forest" | "sunset" | "grape" | "midnight"
  | "coral" | "teal" | "gold" | "crimson" | "lavender" | "mint"
  | "slate" | "flamingo" | "amber" | "cobalt" | "sage" | "magenta"
  | "rust" | "sapphire" | "olive" | "mauve" | "cerulean" | "burgundy"
  | "jade" | "peach" | "indigo" | "copper" | "arctic" | "neon"
  // ---- new themes (31-50) ----
  | "ruby" | "cherry" | "sky" | "aqua" | "pumpkin"
  | "mocha" | "galaxy" | "aurora" | "tropical" | "cyberpunk"
  | "volcano" | "bubblegum" | "honeydew" | "plum" | "ember"
  | "frost" | "cosmic" | "lemon" | "wine" | "sahara";

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  description: string;
  /** primary-500 — main accent color */
  primary: string;
  /** primary-300 — light accent */
  primaryLight: string;
  /** primary-700 — dark accent */
  primaryDark: string;
  /** Tint hue (used for previews & matches --th-h CSS variable) */
  hue: number;
  /** Tint saturation in light mode (matches --th-s-light) */
  satLight: number;
  /** Tint saturation in dark mode (matches --th-s-dark) */
  satDark: number;
  /** Accent gradient CSS string */
  accent: string;
  /** Text color readable on `primary` */
  textOnPrimary: string;
}

export const THEMES: ThemeConfig[] = [
  { name: "rose",     label: "Rose",     description: "Playful & Bold",         primary: "#f43f5e", primaryLight: "#fda4af", primaryDark: "#be123c", hue: 350, satLight: 55, satDark: 45, accent: "linear-gradient(135deg, #fb7185, #f43f5e)",            textOnPrimary: "#fff" },
  { name: "ocean",    label: "Ocean",    description: "Deep & Fluid",            primary: "#3b82f6", primaryLight: "#93c5fd", primaryDark: "#1d4ed8", hue: 217, satLight: 60, satDark: 40, accent: "linear-gradient(135deg, #60a5fa, #1d4ed8)",            textOnPrimary: "#fff" },
  { name: "forest",   label: "Forest",   description: "Natural & Calm",          primary: "#22c55e", primaryLight: "#86efac", primaryDark: "#15803d", hue: 142, satLight: 50, satDark: 38, accent: "linear-gradient(135deg, #4ade80, #15803d)",            textOnPrimary: "#fff" },
  { name: "sunset",   label: "Sunset",   description: "Warm & Energetic",        primary: "#f97316", primaryLight: "#fdba74", primaryDark: "#c2410c", hue: 22,  satLight: 65, satDark: 45, accent: "linear-gradient(135deg, #fbbf24, #f97316 50%, #db2777)", textOnPrimary: "#fff" },
  { name: "grape",    label: "Grape",    description: "Elegant & Creative",      primary: "#a855f7", primaryLight: "#d8b4fe", primaryDark: "#7e22ce", hue: 280, satLight: 55, satDark: 45, accent: "linear-gradient(135deg, #c084fc, #7e22ce)",            textOnPrimary: "#fff" },
  { name: "midnight", label: "Midnight", description: "Sleek & Professional",    primary: "#334155", primaryLight: "#64748b", primaryDark: "#0f172a", hue: 220, satLight: 35, satDark: 40, accent: "linear-gradient(135deg, #1e293b, #020617)",            textOnPrimary: "#fff" },
  { name: "coral",    label: "Coral",    description: "Vibrant & Warm",          primary: "#ff4040", primaryLight: "#ff9999", primaryDark: "#cc2b2b", hue: 5,   satLight: 70, satDark: 50, accent: "linear-gradient(135deg, #ff9999, #e63535)",            textOnPrimary: "#fff" },
  { name: "teal",     label: "Teal",     description: "Fresh & Modern",          primary: "#14b8a6", primaryLight: "#5eead4", primaryDark: "#0f766e", hue: 174, satLight: 55, satDark: 40, accent: "linear-gradient(135deg, #5eead4, #0d9488)",            textOnPrimary: "#fff" },
  { name: "gold",     label: "Gold",     description: "Luxurious & Warm",        primary: "#f59e0b", primaryLight: "#fcd34d", primaryDark: "#b45309", hue: 42,  satLight: 70, satDark: 50, accent: "linear-gradient(135deg, #fcd34d, #b45309)",            textOnPrimary: "#fff" },
  { name: "crimson",  label: "Crimson",  description: "Bold & Powerful",         primary: "#ef4444", primaryLight: "#fca5a5", primaryDark: "#b91c1c", hue: 0,   satLight: 65, satDark: 50, accent: "linear-gradient(135deg, #ef4444, #7f1d1d)",            textOnPrimary: "#fff" },
  { name: "lavender", label: "Lavender", description: "Soft & Dreamy",           primary: "#8b5cf6", primaryLight: "#c4b5fd", primaryDark: "#6d28d9", hue: 263, satLight: 55, satDark: 42, accent: "linear-gradient(135deg, #c4b5fd, #6d28d9)",            textOnPrimary: "#fff" },
  { name: "mint",     label: "Mint",     description: "Refreshing & Clean",      primary: "#10b981", primaryLight: "#6ee7b7", primaryDark: "#047857", hue: 156, satLight: 55, satDark: 38, accent: "linear-gradient(135deg, #6ee7b7, #047857)",            textOnPrimary: "#fff" },
  { name: "slate",    label: "Slate",    description: "Neutral & Focused",       primary: "#64748b", primaryLight: "#cbd5e1", primaryDark: "#334155", hue: 215, satLight: 25, satDark: 28, accent: "linear-gradient(135deg, #94a3b8, #334155)",            textOnPrimary: "#fff" },
  { name: "flamingo", label: "Flamingo", description: "Fun & Expressive",        primary: "#ec4899", primaryLight: "#f9a8d4", primaryDark: "#be185d", hue: 322, satLight: 65, satDark: 48, accent: "linear-gradient(135deg, #fbcfe8, #ec4899 50%, #831843)", textOnPrimary: "#fff" },
  { name: "amber",    label: "Amber",    description: "Bright & Friendly",       primary: "#f59e0b", primaryLight: "#fcd34d", primaryDark: "#b45309", hue: 40,  satLight: 75, satDark: 50, accent: "linear-gradient(135deg, #fde68a, #ea580c)",            textOnPrimary: "#333" },
  { name: "cobalt",   label: "Cobalt",   description: "Deep & Focused",          primary: "#2563eb", primaryLight: "#93c5fd", primaryDark: "#1e40af", hue: 224, satLight: 65, satDark: 50, accent: "linear-gradient(135deg, #3b82f6, #172554)",            textOnPrimary: "#fff" },
  { name: "sage",     label: "Sage",     description: "Peaceful & Natural",      primary: "#84cc16", primaryLight: "#bef264", primaryDark: "#4d7c0f", hue: 85,  satLight: 45, satDark: 32, accent: "linear-gradient(135deg, #bef264, #4d7c0f)",            textOnPrimary: "#333" },
  { name: "magenta",  label: "Magenta",  description: "Bold & Artistic",         primary: "#d946ef", primaryLight: "#f0abfc", primaryDark: "#a21caf", hue: 290, satLight: 65, satDark: 50, accent: "linear-gradient(135deg, #f0abfc, #a21caf)",            textOnPrimary: "#fff" },
  { name: "rust",     label: "Rust",     description: "Earthy & Rugged",         primary: "#c2551a", primaryLight: "#fbb37a", primaryDark: "#7d3410", hue: 18,  satLight: 60, satDark: 40, accent: "linear-gradient(135deg, #f08045, #6b2d0f)",            textOnPrimary: "#fff" },
  { name: "sapphire", label: "Sapphire", description: "Clear & Trustworthy",     primary: "#0ea5e9", primaryLight: "#7dd3fc", primaryDark: "#0369a1", hue: 200, satLight: 65, satDark: 45, accent: "linear-gradient(135deg, #7dd3fc, #075985)",            textOnPrimary: "#fff" },
  { name: "olive",    label: "Olive",    description: "Earthy & Strong",         primary: "#6b9e28", primaryLight: "#bef264", primaryDark: "#3f5c13", hue: 75,  satLight: 40, satDark: 30, accent: "linear-gradient(135deg, #86d046, #3f5c13)",            textOnPrimary: "#fff" },
  { name: "mauve",    label: "Mauve",    description: "Soft & Romantic",         primary: "#b47bd4", primaryLight: "#e4b8f7", primaryDark: "#7e41a0", hue: 295, satLight: 40, satDark: 32, accent: "linear-gradient(135deg, #e4b8f7, #7e41a0)",            textOnPrimary: "#fff" },
  { name: "cerulean", label: "Cerulean", description: "Airy & Open",             primary: "#06b6d4", primaryLight: "#7dd3fc", primaryDark: "#0e7490", hue: 190, satLight: 65, satDark: 45, accent: "linear-gradient(135deg, #7dd3fc, #0e7490)",            textOnPrimary: "#fff" },
  { name: "burgundy", label: "Burgundy", description: "Rich & Sophisticated",    primary: "#be2d43", primaryLight: "#fda4af", primaryDark: "#881337", hue: 345, satLight: 50, satDark: 42, accent: "linear-gradient(135deg, #e06070, #4c0519)",            textOnPrimary: "#fff" },
  { name: "jade",     label: "Jade",     description: "Natural & Balanced",      primary: "#0d9488", primaryLight: "#5eead4", primaryDark: "#115e59", hue: 168, satLight: 60, satDark: 42, accent: "linear-gradient(135deg, #2dd4bf, #115e59)",            textOnPrimary: "#fff" },
  { name: "peach",    label: "Peach",    description: "Warm & Gentle",           primary: "#f97040", primaryLight: "#ffb899", primaryDark: "#c04518", hue: 17,  satLight: 70, satDark: 40, accent: "linear-gradient(135deg, #ffb899, #e05a2b)",            textOnPrimary: "#fff" },
  { name: "indigo",   label: "Indigo",   description: "Classic & Reliable",      primary: "#6366f1", primaryLight: "#a5b4fc", primaryDark: "#4338ca", hue: 240, satLight: 60, satDark: 42, accent: "linear-gradient(135deg, #a5b4fc, #4338ca)",            textOnPrimary: "#fff" },
  { name: "copper",   label: "Copper",   description: "Warm & Vintage",          primary: "#c97c34", primaryLight: "#f0bc82", primaryDark: "#854c1f", hue: 22,  satLight: 55, satDark: 38, accent: "linear-gradient(135deg, #f0bc82, #854c1f)",            textOnPrimary: "#fff" },
  { name: "arctic",   label: "Arctic",   description: "Clean & Minimal",         primary: "#38bdf8", primaryLight: "#bae6fd", primaryDark: "#0369a1", hue: 195, satLight: 55, satDark: 35, accent: "linear-gradient(135deg, #bae6fd, #38bdf8)",            textOnPrimary: "#333" },
  { name: "neon",     label: "Neon",     description: "Electric & Gaming",       primary: "#4ade80", primaryLight: "#bef264", primaryDark: "#16a34a", hue: 130, satLight: 75, satDark: 55, accent: "linear-gradient(135deg, #bef264, #16a34a)",            textOnPrimary: "#111" },
  // ---- NEW THEMES (31-50) ----
  { name: "ruby",       label: "Ruby",       description: "Regal & Polished",        primary: "#be123c", primaryLight: "#fda4af", primaryDark: "#881337", hue: 348, satLight: 60, satDark: 48, accent: "linear-gradient(135deg, #fda4af, #881337)", textOnPrimary: "#fff" },
  { name: "cherry",     label: "Cherry",     description: "Sweet & Tart",            primary: "#e11d48", primaryLight: "#fda4af", primaryDark: "#9f1239", hue: 345, satLight: 70, satDark: 50, accent: "linear-gradient(135deg, #fb7185, #9f1239)", textOnPrimary: "#fff" },
  { name: "sky",        label: "Sky",        description: "Wide & Open",             primary: "#38bdf8", primaryLight: "#7dd3fc", primaryDark: "#0284c7", hue: 200, satLight: 70, satDark: 45, accent: "linear-gradient(135deg, #e0f2fe, #0284c7)", textOnPrimary: "#fff" },
  { name: "aqua",       label: "Aqua",       description: "Crystal Clear",           primary: "#06b6d4", primaryLight: "#67e8f9", primaryDark: "#0e7490", hue: 188, satLight: 70, satDark: 50, accent: "linear-gradient(135deg, #67e8f9, #0e7490)", textOnPrimary: "#fff" },
  { name: "pumpkin",    label: "Pumpkin",    description: "Autumn Vibes",            primary: "#ea580c", primaryLight: "#fdba74", primaryDark: "#9a3412", hue: 18,  satLight: 70, satDark: 45, accent: "linear-gradient(135deg, #fdba74, #9a3412)", textOnPrimary: "#fff" },
  { name: "mocha",      label: "Mocha",      description: "Cozy & Warm",             primary: "#7c4a3c", primaryLight: "#c8a08c", primaryDark: "#4a2c20", hue: 18,  satLight: 25, satDark: 22, accent: "linear-gradient(135deg, #c8a08c, #4a2c20)", textOnPrimary: "#fff" },
  { name: "galaxy",     label: "Galaxy",     description: "Cosmic Depths",           primary: "#6d28d9", primaryLight: "#c4b5fd", primaryDark: "#4c1d95", hue: 260, satLight: 55, satDark: 50, accent: "linear-gradient(135deg, #c4b5fd, #4c1d95 50%, #1e1b4b)", textOnPrimary: "#fff" },
  { name: "aurora",     label: "Aurora",     description: "Polar Lights",            primary: "#34d399", primaryLight: "#a7f3d0", primaryDark: "#047857", hue: 160, satLight: 50, satDark: 38, accent: "linear-gradient(135deg, #a7f3d0, #34d399 50%, #8b5cf6)", textOnPrimary: "#fff" },
  { name: "tropical",   label: "Tropical",   description: "Island Paradise",         primary: "#14b8a6", primaryLight: "#fde68a", primaryDark: "#0f766e", hue: 180, satLight: 60, satDark: 40, accent: "linear-gradient(135deg, #fde68a, #14b8a6 50%, #0e7490)", textOnPrimary: "#fff" },
  { name: "cyberpunk",  label: "Cyberpunk",  description: "Electric Future",         primary: "#d946ef", primaryLight: "#f5d0fe", primaryDark: "#a21caf", hue: 300, satLight: 75, satDark: 55, accent: "linear-gradient(135deg, #22d3ee, #d946ef 50%, #fbbf24)", textOnPrimary: "#fff" },
  { name: "volcano",    label: "Volcano",    description: "Fiery & Fierce",          primary: "#dc2626", primaryLight: "#fca5a5", primaryDark: "#7f1d1d", hue: 10,  satLight: 75, satDark: 50, accent: "linear-gradient(135deg, #fbbf24, #dc2626 50%, #450a0a)", textOnPrimary: "#fff" },
  { name: "bubblegum",  label: "Bubblegum",  description: "Pop & Playful",           primary: "#f472b6", primaryLight: "#fbcfe8", primaryDark: "#db2777", hue: 330, satLight: 75, satDark: 50, accent: "linear-gradient(135deg, #fbcfe8, #f472b6)",            textOnPrimary: "#fff" },
  { name: "honeydew",   label: "Honeydew",   description: "Fresh & Crisp",           primary: "#a3e635", primaryLight: "#d9f99d", primaryDark: "#65a30d", hue: 75,  satLight: 60, satDark: 38, accent: "linear-gradient(135deg, #d9f99d, #65a30d)",            textOnPrimary: "#333" },
  { name: "plum",       label: "Plum",       description: "Deep & Rich",             primary: "#7e22ce", primaryLight: "#c084fc", primaryDark: "#581c87", hue: 280, satLight: 55, satDark: 45, accent: "linear-gradient(135deg, #c084fc, #581c87)",            textOnPrimary: "#fff" },
  { name: "ember",      label: "Ember",      description: "Glowing Coal",            primary: "#c2410c", primaryLight: "#fdba74", primaryDark: "#7c2d12", hue: 18,  satLight: 65, satDark: 42, accent: "linear-gradient(135deg, #fbbf24, #c2410c)",            textOnPrimary: "#fff" },
  { name: "frost",      label: "Frost",      description: "Icy & Crisp",             primary: "#93c5fd", primaryLight: "#dbeafe", primaryDark: "#3b82f6", hue: 210, satLight: 45, satDark: 32, accent: "linear-gradient(135deg, #dbeafe, #93c5fd)",            textOnPrimary: "#1e3a8a" },
  { name: "cosmic",     label: "Cosmic",     description: "Starlit & Bold",          primary: "#9333ea", primaryLight: "#d8b4fe", primaryDark: "#6b21a8", hue: 280, satLight: 60, satDark: 48, accent: "linear-gradient(135deg, #f472b6, #9333ea 50%, #312e81)", textOnPrimary: "#fff" },
  { name: "lemon",      label: "Lemon",      description: "Bright & Zesty",          primary: "#eab308", primaryLight: "#fef08a", primaryDark: "#a16207", hue: 50,  satLight: 75, satDark: 50, accent: "linear-gradient(135deg, #fef08a, #a16207)",            textOnPrimary: "#333" },
  { name: "wine",       label: "Wine",       description: "Mature & Refined",        primary: "#831843", primaryLight: "#fda4af", primaryDark: "#4c0519", hue: 340, satLight: 50, satDark: 42, accent: "linear-gradient(135deg, #f472b6, #4c0519)",            textOnPrimary: "#fff" },
  { name: "sahara",     label: "Sahara",     description: "Sun-baked Sands",         primary: "#ca8a04", primaryLight: "#fde68a", primaryDark: "#854d0e", hue: 35,  satLight: 55, satDark: 38, accent: "linear-gradient(135deg, #fde68a, #854d0e)",            textOnPrimary: "#fff" },
];

export interface ThemeSettings {
  theme: ThemeName;
  fontSize: "small" | "normal" | "large";
  density: "comfortable" | "compact";
  reduceAnimations: boolean;
  customRadius: string | null;
}

const DEFAULTS: ThemeSettings = {
  theme: "rose",
  fontSize: "normal",
  density: "comfortable",
  reduceAnimations: false,
  customRadius: null,
};

const STORAGE_KEY = "chezb-theme-settings";

interface ThemeContextValue {
  settings: ThemeSettings;
  setTheme: (t: ThemeName) => void;
  updateSettings: (patch: Partial<ThemeSettings>) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  settings: DEFAULTS,
  setTheme: () => {},
  updateSettings: () => {},
});

function applyToDOM(s: ThemeSettings) {
  const html = document.documentElement;
  html.setAttribute("data-theme", s.theme);
  html.setAttribute("data-fontsize", s.fontSize);
  html.setAttribute("data-density", s.density);
  if (s.reduceAnimations) html.classList.add("reduce-motion");
  else html.classList.remove("reduce-motion");
  if (s.customRadius) html.style.setProperty("--theme-radius", s.customRadius);
  else html.style.removeProperty("--theme-radius");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ThemeSettings = { ...DEFAULTS, ...JSON.parse(raw) };
        setSettings(parsed);
        applyToDOM(parsed);
      }
    } catch {}
  }, []);

  function persist(next: ThemeSettings) {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    applyToDOM(next);
  }

  return (
    <ThemeContext.Provider
      value={{
        settings,
        setTheme: (t) => persist({ ...settings, theme: t }),
        updateSettings: (patch) => persist({ ...settings, ...patch }),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeSettings = () => useContext(ThemeContext);
