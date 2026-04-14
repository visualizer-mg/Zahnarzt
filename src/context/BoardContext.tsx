"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────

export type Column = "ideas" | "todo" | "doing" | "done";
export type Priority = "high" | "medium" | "low";
export type CardColor = "green" | "purple" | "blue" | "orange" | "white";

export interface CardLink {
  label: string;
  url: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  area: string;
  priority: Priority;
  creator: string;
  column: Column;
  sprint: string;
  color: CardColor | "";
  createdAt: string;
  note: string;
  links: CardLink[];
}

export interface BoardData {
  sprints: string[];
  cards: Card[];
  team: string[];
}

// ── Color Map ──────────────────────────────────────────

export const COLOR_MAP: Record<
  CardColor,
  { hex: string; bg: string; border: string }
> = {
  green: {
    hex: "#3fb950",
    bg: "rgba(63,185,80,0.08)",
    border: "rgba(63,185,80,0.35)",
  },
  purple: {
    hex: "#bc8cff",
    bg: "rgba(188,140,255,0.08)",
    border: "rgba(188,140,255,0.35)",
  },
  blue: {
    hex: "#58a6ff",
    bg: "rgba(88,166,255,0.08)",
    border: "rgba(88,166,255,0.35)",
  },
  orange: {
    hex: "#f0883e",
    bg: "rgba(240,136,62,0.08)",
    border: "rgba(240,136,62,0.35)",
  },
  white: {
    hex: "#e6edf3",
    bg: "rgba(230,237,243,0.06)",
    border: "rgba(230,237,243,0.3)",
  },
};

export const COLUMN_COLORS: Record<Column, string> = {
  ideas: "#8b949e",
  todo: "#d29922",
  doing: "#58a6ff",
  done: "#3fb950",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#f85149",
  medium: "#d29922",
  low: "#3fb950",
};

export const COLUMNS: { key: Column; label: string }[] = [
  { key: "ideas", label: "Ideas" },
  { key: "todo", label: "Todo" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" },
];

// ── Default Data ───────────────────────────────────────

const DEFAULT_BOARD: BoardData = {
  sprints: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"],
  team: ["Visualizer", "Homer"],
  cards: [
    {
      id: "1",
      title: "Task-Manager fertigstellen",
      description: "Kanban Board mit allen Views und Features implementieren",
      area: "Frontend",
      priority: "high",
      creator: "Homer & Heinzel",
      column: "doing",
      sprint: "Sprint 1",
      color: "blue",
      createdAt: "2026-04-14",
      note: "",
      links: [],
    },
    {
      id: "2",
      title: "CSV Import Modul",
      description: "Datenimport für Dampsoft, Z1, Charly, EVIDENT",
      area: "Backend",
      priority: "high",
      creator: "Homer & Heinzel",
      column: "todo",
      sprint: "Sprint 2",
      color: "orange",
      createdAt: "2026-04-14",
      note: "",
      links: [],
    },
    {
      id: "3",
      title: "Dashboard mit echten Daten",
      description: "KPI-Karten und Charts nach Import befüllen",
      area: "Frontend",
      priority: "medium",
      creator: "Homer & Heinzel",
      column: "todo",
      sprint: "Sprint 2",
      color: "green",
      createdAt: "2026-04-14",
      note: "",
      links: [],
    },
    {
      id: "4",
      title: "Supabase Integration",
      description: "Datenbank für User, Board und Notes einrichten",
      area: "Backend",
      priority: "medium",
      creator: "Homer & Heinzel",
      column: "ideas",
      sprint: "",
      color: "purple",
      createdAt: "2026-04-14",
      note: "",
      links: [],
    },
    {
      id: "5",
      title: "Git & GitHub Setup",
      description: "Repository erstellt, Vercel connected",
      area: "DevOps",
      priority: "high",
      creator: "Homer & Heinzel",
      column: "done",
      sprint: "Sprint 1",
      color: "green",
      createdAt: "2026-04-13",
      note: "",
      links: [],
    },
    {
      id: "6",
      title: "Theme System",
      description: "Dark/Light Mode mit GitHub Theme Farben",
      area: "Frontend",
      priority: "high",
      creator: "Homer & Heinzel",
      column: "done",
      sprint: "Sprint 1",
      color: "blue",
      createdAt: "2026-04-13",
      note: "",
      links: [],
    },
  ],
};

// ── Context ────────────────────────────────────────────

interface BoardContextType {
  board: BoardData;
  addCard: (card: Omit<Card, "id" | "createdAt">) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, toColumn: Column) => void;
  addSprint: (name: string) => void;
  removeSprint: (name: string) => void;
  addTeamMember: (name: string) => void;
  removeTeamMember: (name: string) => void;
  getCardNumber: (id: string) => number;
}

const defaultCtx: BoardContextType = {
  board: DEFAULT_BOARD,
  addCard: () => {},
  updateCard: () => {},
  deleteCard: () => {},
  moveCard: () => {},
  addSprint: () => {},
  removeSprint: () => {},
  addTeamMember: () => {},
  removeTeamMember: () => {},
  getCardNumber: () => 0,
};

const BoardContext = createContext<BoardContextType>(defaultCtx);

// ── Provider ───────────────────────────────────────────

export function BoardProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useState<BoardData>(DEFAULT_BOARD);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("zahnarzt-board");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.cards && parsed.sprints) {
          setBoard({
            ...parsed,
            team: parsed.team || ["Visualizer", "Homer"],
          });
        }
      } catch {
        // ignore parse errors
      }
    }
    setMounted(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("zahnarzt-board", JSON.stringify(board));
    }
  }, [board, mounted]);

  const addCard = useCallback(
    (card: Omit<Card, "id" | "createdAt">) => {
      const newCard: Card = {
        ...card,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setBoard((prev) => ({
        ...prev,
        cards: [...prev.cards, newCard],
      }));
    },
    []
  );

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
    }));
  }, []);

  const moveCard = useCallback((id: string, toColumn: Column) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === id ? { ...c, column: toColumn } : c
      ),
    }));
  }, []);

  const addSprint = useCallback((name: string) => {
    setBoard((prev) => ({
      ...prev,
      sprints: [...prev.sprints, name],
    }));
  }, []);

  const removeSprint = useCallback((name: string) => {
    setBoard((prev) => ({
      ...prev,
      sprints: prev.sprints.filter((s) => s !== name),
      cards: prev.cards.map((c) =>
        c.sprint === name ? { ...c, sprint: "" } : c
      ),
    }));
  }, []);

  const addTeamMember = useCallback((name: string) => {
    setBoard((prev) => ({
      ...prev,
      team: [...(prev.team || []), name],
    }));
  }, []);

  const removeTeamMember = useCallback((name: string) => {
    setBoard((prev) => ({
      ...prev,
      team: (prev.team || []).filter((m) => m !== name),
    }));
  }, []);

  const getCardNumber = useCallback(
    (id: string) => {
      const sorted = [...board.cards].sort(
        (a, b) =>
          a.createdAt.localeCompare(b.createdAt) ||
          a.id.localeCompare(b.id)
      );
      const idx = sorted.findIndex((c) => c.id === id);
      return idx + 1;
    },
    [board.cards]
  );

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <BoardContext.Provider
      value={{
        board,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
        addSprint,
        removeSprint,
        addTeamMember,
        removeTeamMember,
        getCardNumber,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  return useContext(BoardContext);
}
