"use client";

import { useTheme } from "@/context/ThemeContext";

export default function Home() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <header className="flex items-center justify-between px-6 py-4 bg-bg-secondary border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold text-text-primary">
            Zahnarzt Umsatzanalyse
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
            v0.0.2
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary border border-border text-text-secondary hover:text-text-primary hover:border-accent transition-colors cursor-pointer"
        >
          <span className="text-sm">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg text-center space-y-6">
          <h1 className="text-3xl font-bold text-text-primary">Willkommen</h1>
          <p className="text-text-secondary text-lg">
            Deine Zahnarztpraxis-Analyse App wird hier entstehen.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-bg-secondary border border-border">
              <div className="text-2xl font-bold text-status-green">OK</div>
              <div className="text-sm text-text-muted">Next.js</div>
            </div>
            <div className="p-4 rounded-lg bg-bg-secondary border border-border">
              <div className="text-2xl font-bold text-status-green">OK</div>
              <div className="text-sm text-text-muted">Tailwind</div>
            </div>
            <div className="p-4 rounded-lg bg-bg-secondary border border-border">
              <div className="text-2xl font-bold text-status-green">OK</div>
              <div className="text-sm text-text-muted">Theme System</div>
            </div>
            <div className="p-4 rounded-lg bg-bg-secondary border border-border">
              <div className="text-2xl font-bold text-status-amber">WIP</div>
              <div className="text-sm text-text-muted">Dashboard</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-3 bg-bg-secondary border-t border-border">
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>Zahnarzt Umsatzanalyse v0.0.2</span>
          <span>Theme: {theme === "dark" ? "Dark (GitHub)" : "Light (GitHub)"}</span>
        </div>
      </footer>
    </div>
  );
}
