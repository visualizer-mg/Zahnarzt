"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Analyse", href: "/analyse", icon: "📈" },
  { label: "Import", href: "/import", icon: "📁" },
  { label: "Tasks", href: "/tasks", icon: "📋" },
];

const commitAuthor = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN || "lokal";
const commitDate = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_DATE
  ? new Date(process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_DATE).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
  : null;

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const isSettings = pathname === "/einstellungen";

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
            <span>Zahnarzt Umsatzanalyse V0.12</span>
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

          {/* Theme Toggle + Settings + Version */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-muted)",
              }}
              title={commitDate ? `Deploy: ${commitAuthor}, ${commitDate}` : `${commitAuthor}`}
            >
              v0.1.0 · {commitAuthor}{commitDate ? `, ${commitDate}` : ""}
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
            <Link
              href="/einstellungen"
              className="p-2 rounded-md transition-colors"
              style={{
                backgroundColor: isSettings
                  ? "var(--bg-tertiary)"
                  : "transparent",
                color: isSettings
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              }}
              title="Einstellungen"
            >
              ⚙️
            </Link>
            <button
              onClick={signOut}
              className="p-2 rounded-md transition-colors text-sm"
              style={{
                backgroundColor: "transparent",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                e.currentTarget.style.color = "var(--red, #f85149)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              title={user?.email || "Abmelden"}
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
