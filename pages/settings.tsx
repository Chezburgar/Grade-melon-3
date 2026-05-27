import React, { useState } from "react";
import { useThemeSettings, THEMES, ThemeName } from "../context/ThemeContext";
import Head from "next/head";

const RADIUS_OPTIONS = [
  { label: "Sharp",        value: "0rem" },
  { label: "Subtle",       value: "0.25rem" },
  { label: "Default",      value: "0.5rem" },
  { label: "Rounded",      value: "0.75rem" },
  { label: "Pill",         value: "1rem" },
];

const FONT_SIZE_OPTIONS: { label: string; value: "small" | "normal" | "large" }[] = [
  { label: "Small",  value: "small" },
  { label: "Normal", value: "normal" },
  { label: "Large",  value: "large" },
];

export default function Settings() {
  const { settings, setTheme, updateSettings } = useThemeSettings();
  const [saved, setSaved] = useState(false);

  function handleThemeSelect(name: ThemeName) {
    setTheme(name);
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  }

  return (
    <>
      <Head>
        <title>Settings — Chezburger Grades</title>
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Appearance</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Choose a theme and customize how Chezburger Grades looks.
          </p>
        </div>

        {/* ── THEME GRID ─────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold dark:text-white mb-4">
            Theme &mdash;{" "}
            <span className="text-primary-500 font-normal capitalize">{settings.theme}</span>
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {THEMES.map((t) => {
              const active = settings.theme === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => handleThemeSelect(t.name)}
                  title={t.description}
                  className={[
                    "flex flex-col items-center gap-1.5 p-3 border-2 transition-all duration-150",
                    active
                      ? "border-primary-500 bg-primary-50 dark:bg-gray-700 shadow-md scale-105"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800",
                  ].join(" ")}
                  style={{ borderRadius: "0.75rem" }}
                >
                  {/* Swatch circle */}
                  <span
                    className="w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-xs font-bold"
                    style={{ background: t.swatch, color: t.textSwatch }}
                  >
                    {active && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`text-xs font-semibold truncate w-full text-center ${
                      active ? "text-primary-600 dark:text-primary-400" : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {t.label}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-tight hidden sm:block">
                    {t.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── ADVANCED CUSTOMIZATION ─────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold dark:text-white">Advanced Customization</h2>

          {/* Dark mode info */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Controlled by the toggle in the top navigation bar.</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              Top-bar toggle
            </span>
          </div>

          {/* Border radius */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="font-medium dark:text-white mb-3">Border Radius</p>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((r) => {
                const current = settings.customRadius ?? "0.5rem";
                const active = current === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => { updateSettings({ customRadius: r.value }); flash(); }}
                    className={[
                      "px-4 py-2 text-sm font-medium border-2 transition-all duration-100",
                      active
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400",
                    ].join(" ")}
                    style={{ borderRadius: r.value === "0rem" ? "2px" : r.value }}
                  >
                    {r.label}
                  </button>
                );
              })}
              <button
                onClick={() => { updateSettings({ customRadius: null }); flash(); }}
                className={[
                  "px-4 py-2 text-sm font-medium border-2 border-dashed transition-all rounded-lg",
                  settings.customRadius === null
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-primary-400",
                ].join(" ")}
              >
                Theme default
              </button>
            </div>
          </div>

          {/* Font size */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="font-medium dark:text-white mb-3">Font Size</p>
            <div className="flex gap-3">
              {FONT_SIZE_OPTIONS.map((f) => {
                const active = settings.fontSize === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => { updateSettings({ fontSize: f.value }); flash(); }}
                    className={[
                      "flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-100",
                      active
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400",
                    ].join(" ")}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Density */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="font-medium dark:text-white mb-1">Density</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Controls how much breathing room UI elements have.
            </p>
            <div className="flex gap-3">
              {(["comfortable", "compact"] as const).map((d) => {
                const active = settings.density === d;
                return (
                  <button
                    key={d}
                    onClick={() => { updateSettings({ density: d }); flash(); }}
                    className={[
                      "flex-1 py-2 rounded-lg text-sm font-medium border-2 capitalize transition-all duration-100",
                      active
                        ? "bg-primary-500 border-primary-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reduce animations */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium dark:text-white">Reduce Animations</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Disables transitions and motion effects.</p>
            </div>
            <button
              role="switch"
              aria-checked={settings.reduceAnimations}
              onClick={() => { updateSettings({ reduceAnimations: !settings.reduceAnimations }); flash(); }}
              className={[
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                settings.reduceAnimations ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600",
              ].join(" ")}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  settings.reduceAnimations ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Current theme info card */}
          <div className="p-4 bg-primary-50 dark:bg-gray-800 rounded-xl border-2 border-primary-200 dark:border-primary-800">
            {(() => {
              const t = THEMES.find((x) => x.name === settings.theme);
              return (
                <div className="flex items-center gap-4">
                  <span
                    className="w-12 h-12 rounded-full flex-shrink-0 shadow"
                    style={{ background: t?.swatch }}
                  />
                  <div>
                    <p className="font-semibold text-primary-700 dark:text-primary-300">{t?.label} Theme</p>
                    <p className="text-sm text-primary-600 dark:text-primary-400">{t?.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {settings.fontSize} font &middot; {settings.density} density
                      {settings.reduceAnimations ? " · reduced motion" : ""}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <p className="font-medium dark:text-white">Reset to Defaults</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Restore the original Rose theme and all default settings.</p>
            </div>
            <button
              onClick={() => {
                updateSettings({
                  theme: "rose",
                  fontSize: "normal",
                  density: "comfortable",
                  reduceAnimations: false,
                  customRadius: null,
                });
                flash();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </section>

        {/* Saved toast */}
        {saved && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-semibold pointer-events-none z-50">
            ✓ Saved
          </div>
        )}
      </div>
    </>
  );
}
