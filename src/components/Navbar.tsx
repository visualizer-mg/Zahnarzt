"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Analyse", href: "/analyse", icon: "📈" },
  { label: "Import", href: "/import", icon: "📁" },
  { label: "Einstellungen", href: "/einstellungen", icon: "⚙️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav
      className="w-full border-b"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo / App Name */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg"
            style={{ color: "var(--accent)" }}
          >
            <span>🦷</span>
            <span>Zahnarzt Umsatzanalyse</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? "var(--bg-tertiary)"
                      : "transparent",
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "var(--bg-tertiary)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle + Version */}
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-muted)",
              }}
            >
              v0.0.4
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md transition-colors"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
              title={
                theme === "dark"
                  ? "Zum Light Mode wechseln"
                  : "Zum Dark Mode wechseln"
              }
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
