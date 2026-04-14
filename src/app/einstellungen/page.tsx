"use client";

import { useTheme } from "@/context/ThemeContext";

export default function EinstellungenPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Einstellungen
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          App-Konfiguration und Darstellung
        </p>
      </div>

      {/* Theme Settings */}
      <div
        className="rounded-lg border p-6 mb-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Darstellung
        </h2>

        <div className="flex gap-4">
          {(["dark", "light"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className="flex-1 rounded-lg border p-4 text-center transition-colors"
              style={{
                backgroundColor:
                  theme === mode
                    ? "var(--bg-tertiary)"
                    : "var(--bg-primary)",
                borderColor:
                  theme === mode ? "var(--accent)" : "var(--border)",
                borderWidth: theme === mode ? "2px" : "1px",
              }}
            >
              <span className="text-2xl block mb-2">
                {mode === "dark" ? "🌙" : "☀️"}
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  color:
                    theme === mode
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                }}
              >
                {mode === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Praxis Info (Placeholder) */}
      <div
        className="rounded-lg border p-6 mb-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Praxis-Informationen
        </h2>
        <p style={{ color: "var(--text-muted)" }}>
          Hier können später Praxis-Name, Anzahl Behandler und
          Arbeitsstunden konfiguriert werden.
        </p>
      </div>

      {/* App Info */}
      <div
        className="rounded-lg border p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Über die App
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Version</span>
            <span style={{ color: "var(--text-primary)" }}>v0.0.4</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Framework</span>
            <span style={{ color: "var(--text-primary)" }}>Next.js</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Theme</span>
            <span style={{ color: "var(--text-primary)" }}>
              GitHub Dark (Obsidian)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
