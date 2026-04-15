"use client";

import { useAuth } from "@/context/AuthContext";
import { BoardProvider } from "@/context/BoardContext";
import Navbar from "@/components/Navbar";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "100vh", color: "var(--text-muted)" }}
      >
        <span>Laden...</span>
      </div>
    );
  }

  // On login page, show content without Navbar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Not logged in — will redirect via useEffect
  if (!user) {
    return null;
  }

  // Logged in — show full app with Navbar and BoardProvider
  return (
    <BoardProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
    </BoardProvider>
  );
}
