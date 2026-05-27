import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeName =
  | "rose" | "ocean" | "forest" | "sunset" | "grape" | "midnight"
  | "coral" | "teal" | "gold" | "crimson" | "lavender" | "mint"
  | "slate" | "flamingo" | "amber" | "cobalt" | "sage" | "magenta"
  | "rust" | "sapphire" | "olive" | "mauve" | "cerulean" | "burgundy"
  | "jade" | "peach" | "indigo" | "copper" | "arctic" | "neon";

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  description: string;
  swatch: string;
  textSwatch: string;
  defaultRadius?: string;
}

export const THEMES: ThemeConfig[] = [
  { name: "rose",     label: "Rose",     description: "Playful & Bold",         swatch: "#f43f5e", textSwatch: "#fff" },
  { name: "ocean",    label: "Ocean",    description: "Deep & Fluid",            swatch: "#3b82f6", textSwatch: "#fff" },
  { name: "forest",   label: "Forest",   description: "Natural & Calm",          swatch: "#22c55e", textSwatch: "#fff" },
  { name: "sunset",   label: "Sunset",   description: "Warm & Energetic",        swatch: "#f97316", textSwatch: "#fff" },
  { name: "grape",    label: "Grape",    description: "Elegant & Creative",      swatch: "#a855f7", textSwatch: "#fff" },
  { name: "midnight", label: "Midnight", description: "Sleek & Professional",    swatch: "#475569", textSwatch: "#fff" },
  { name: "coral",    label: "Coral",    description: "Vibrant & Warm",          swatch: "#ff4040", textSwatch: "#fff" },
  { name: "teal",     label: "Teal",     description: "Fresh & Modern",          swatch: "#14b8a6", textSwatch: "#fff" },
  { name: "gold",     label: "Gold",     description: "Luxurious & Warm",        swatch: "#f59e0b", textSwatch: "#fff" },
  { name: "crimson",  label: "Crimson",  description: "Bold & Powerful",         swatch: "#ef4444", textSwatch: "#fff" },
  { name: "lavender", label: "Lavender", description: "Soft & Dreamy",           swatch: "#8b5cf6", textSwatch: "#fff" },
  { name: "mint",     label: "Mint",     description: "Refreshing & Clean",      swatch: "#10b981", textSwatch: "#fff" },
  { name: "slate",    label: "Slate",    description: "Neutral & Focused",       swatch: "#64748b", textSwatch: "#fff" },
  { name: "flamingo", label: "Flamingo", description: "Fun & Expressive",        swatch: "#ec4899", textSwatch: "#fff" },
  { name: "amber",    label: "Amber",    description: "Bright & Friendly",       swatch: "#f59e0b", textSwatch: "#333" },
  { name: "cobalt",   label: "Cobalt",   description: "Deep & Focused",          swatch: "#2563eb", textSwatch: "#fff" },
  { name: "sage",     label: "Sage",     description: "Peaceful & Natural",      swatch: "#84cc16", textSwatch: "#333" },
  { name: "magenta",  label: "Magenta",  description: "Bold & Artistic",         swatch: "#d946ef", textSwatch: "#fff" },
  { name: "rust",     label: "Rust",     description: "Earthy & Rugged",         swatch: "#c2551a", textSwatch: "#fff" },
  { name: "sapphire", label: "Sapphire", description: "Clear & Trustworthy",     swatch: "#0ea5e9", textSwatch: "#fff" },
  { name: "olive",    label: "Olive",    description: "Earthy & Strong",         swatch: "#6b9e28", textSwatch: "#fff" },
  { name: "mauve",    label: "Mauve",    description: "Soft & Romantic",         swatch: "#b47bd4", textSwatch: "#fff" },
  { name: "cerulean", label: "Cerulean", description: "Airy & Open",             swatch: "#06b6d4", textSwatch: "#fff" },
  { name: "burgundy", label: "Burgundy", description: "Rich & Sophisticated",    swatch: "#be2d43", textSwatch: "#fff" },
  { name: "jade",     label: "Jade",     description: "Natural & Balanced",      swatch: "#0d9488", textSwatch: "#fff" },
  { name: "peach",    label: "Peach",    description: "Warm & Gentle",           swatch: "#f97040", textSwatch: "#fff" },
  { name: "indigo",   label: "Indigo",   description: "Classic & Reliable",      swatch: "#6366f1", textSwatch: "#fff" },
  { name: "copper",   label: "Copper",   description: "Warm & Vintage",          swatch: "#c97c34", textSwatch: "#fff" },
  { name: "arctic",   label: "Arctic",   description: "Clean & Minimal",         swatch: "#38bdf8", textSwatch: "#333" },
  { name: "neon",     label: "Neon",     description: "Electric & Gaming",       swatch: "#4ade80", textSwatch: "#111" },
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
