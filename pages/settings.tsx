import React, { useState } from "react";
import { useThemeSettings, THEMES, ThemeName, ThemeConfig } from "../context/ThemeContext";
import Head from "next/head";
import { HiCheck } from "react-icons/hi";

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

/** Mini UI mockup preview rendered inside each theme card */
function ThemePreview({ t, active }: { t: ThemeConfig; active: boolean }) {
  const bgLight = `hsl(${t.hue}, ${t.satLight}%, 96%)`;
  const bgMid   = `hsl(${t.hue}, ${t.satLight}%, 90%)`;
  const cardBg  = `hsl(${t.hue}, ${Math.max(t.satLight / 2, 5)}%, 99%)`;
  const lineBg  = `hsl(${t.hue}, ${t.satLight}%, 85%)`;
  const lineBg2 = `hsl(${t.hue}, ${t.satLight}%, 92%)`;

  return (
    <div
      className="relative w-full aspect-[5/4] overflow-hidden rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${bgLight}, ${bgMid})`,
        boxShadow: active
          ? `0 8px 24px -6px ${t.primary}55, 0 0 0 2px ${t.primary}`
          : `0 4px 14px -6px rgba(0,0,0,0.15), inset 0 0 0 1px hsl(${t.hue},${t.satLight}%,80%)`,
      }}
    >
      {/* Top accent strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[18%]"
        style={{ background: t.accent }}
      />
      {/* Mini "logo" dot on the accent strip */}
      <div
        className="absolute top-[5%] left-[6%] w-[10%] aspect-square rounded-full"
        style={{ background: "rgba(255,255,255,0.85)", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
      />
      {/* Mini avatar circle */}
      <div
        className="absolute top-[5%] right-[6%] w-[10%] aspect-square rounded-full"
        style={{ background: "rgba(255,255,255,0.6)" }}
      />

      {/* Card */}
      <div
        className="absolute top-[28%] left-[8%] right-[8%] h-[40%] rounded-lg p-[5%]"
        style={{
          background: cardBg,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <div className="h-[18%] w-[55%] rounded-sm mb-[6%]" style={{ background: lineBg }} />
        <div className="h-[14%] w-[80%] rounded-sm mb-[4%]" style={{ background: lineBg2 }} />
        <div className="h-[14%] w-[65%] rounded-sm" style={{ background: lineBg2 }} />
      </div>

      {/* Button row */}
      <div className="absolute bottom-[8%] left-[8%] flex gap-[3%]" style={{ width: "84%" }}>
        <div
          className="h-[55%] flex-1 rounded-md"
          style={{ background: t.primary, boxShadow: `0 2px 6px ${t.primary}55` }}
        />
        <div
          className="h-full aspect-square rounded-md"
          style={{ background: t.primaryLight }}
        />
        <div
          className="h-full aspect-square rounded-md"
          style={{ background: t.primaryDark }}
        />
      </div>

      {/* Active checkmark badge */}
      {active && (
        <div
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: t.primary, color: t.textOnPrimary }}
        >
          <HiCheck className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { settings, setTheme, updateSettings } = useThemeSettings();
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  function handleThemeSelect(name: ThemeName) {
    setTheme(name);
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  }

  const filtered = search
    ? THEMES.filter(
        (t) =>
          t.label.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
      )
    : THEMES;

  const activeTheme = THEMES.find((t) => t.name === settings.theme);

  return (
    <>
      <Head>
        <title>Customize — Chezburger Grades</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero header with current-theme accent */}
        <div
          className="mb-8 p-6 rounded-2xl relative overflow-hidden"
          style={{
            background: activeTheme?.accent || "linear-gradient(135deg, #f43f5e, #be123c)",
          }}
        >
          <div className="relative z-10 text-white">
            <h1 className="text-3xl font-bold drop-shadow">Customize</h1>
            <p className="mt-1 opacity-95 drop-shadow-sm">
              Pick from <span className="font-bold">{THEMES.length} themes</span> and tweak every detail to your taste.
            </p>
          </div>
          {/* Decorative bubbles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-xl" />
          <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
        </div>

        {/* Search */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold dark:text-white whitespace-nowrap">
            Theme — <span className="text-primary-500 capitalize">{settings.theme}</span>
          </h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${THEMES.length} themes...`}
            className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-full max-w-xs"
          />
        </div>

        {/* ── THEME GRID — rich preview cards ──────────────── */}
        <section className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((t) => {
              const active = settings.theme === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => handleThemeSelect(t.name)}
                  className="group text-left transition-transform duration-150 hover:-translate-y-1 focus:outline-none"
                >
                  <ThemePreview t={t} active={active} />
                  <div className="mt-2 px-1">
                    <p className={`font-semibold text-sm ${active ? "text-primary-600 dark:text-primary-400" : "text-gray-800 dark:text-gray-200"}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-12">
              No themes match &quot;{search}&quot;
            </p>
          )}
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
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-semibold pointer-events-none z-50 flex items-center gap-1.5">
            <HiCheck className="w-4 h-4" /> Saved
          </div>
        )}
      </div>
    </>
  );
}
