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

export type Priority = "high" | "medium" | "low";
export type CardColor = "green" | "purple" | "blue" | "orange" | "white";
export type CardType = "feature" | "bug" | "content" | "design" | "research";

export interface ColumnDef {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface CardLink {
  label: string;
  url: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Card {
  id: string;
  ticketId: number;
  title: string;
  description: string;
  area: string;
  priority: Priority;
  type: CardType | "";
  creator: string;
  column: string;
  sprint: string;
  color: CardColor | "";
  createdAt: string;
  completedAt: string | null;
  archived: boolean;
  archivedAt: string | null;
  note: string;
  noteFile: string | null;
  links: CardLink[];
  subtasks: Subtask[];
}

export interface BoardData {
  sprints: string[];
  columns: ColumnDef[];
  nextTicketId: number;
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

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#f85149",
  medium: "#d29922",
  low: "#3fb950",
};

export const TYPE_COLORS: Record<CardType, string> = {
  feature: "#58a6ff",
  bug: "#f85149",
  content: "#d29922",
  design: "#bc8cff",
  research: "#8b949e",
};

export const TYPE_LABELS: Record<CardType, string> = {
  feature: "Feature",
  bug: "Bug",
  content: "Content",
  design: "Design",
  research: "Research",
};

// ── Default Columns ───────────────────────────────────

export const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: "ideas", label: "Ideas", icon: "💡", color: "#8b949e" },
  { id: "backlog", label: "Backlog", icon: "📥", color: "#8b949e" },
  { id: "todo", label: "Todo", icon: "📋", color: "#d29922" },
  { id: "doing", label: "In Progress", icon: "⚡", color: "#58a6ff" },
  { id: "done", label: "Done", icon: "✅", color: "#3fb950" },
];

// ── Default Data ───────────────────────────────────────

const DEFAULT_BOARD: BoardData = {
  sprints: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"],
  columns: DEFAULT_COLUMNS,
  nextTicketId: 7,
  team: ["Visualizer", "Homer"],
  cards: [
    {
      id: "1",
      ticketId: 1,
      title: "Task-Manager fertigstellen",
      description: "Kanban Board mit allen Views und Features implementieren",
      area: "Frontend",
      priority: "high",
      type: "feature",
      creator: "Homer & Heinzel",
      column: "doing",
      sprint: "Sprint 1",
      color: "blue",
      createdAt: "2026-04-14",
      completedAt: null,
      archived: false,
      archivedAt: null,
      note: "",
      noteFile: null,
      links: [],
      subtasks: [],
    },
    {
      id: "2",
      ticketId: 2,
      title: "CSV Import Modul",
      description: "Datenimport fuer Dampsoft, Z1, Charly, EVIDENT",
      area: "Backend",
      priority: "high",
      type: "feature",
      creator: "Homer & Heinzel",
      column: "todo",
      sprint: "Sprint 2",
      color: "orange",
      createdAt: "2026-04-14",
      completedAt: null,
      archived: false,
      archivedAt: null,
      note: "",
      noteFile: null,
      links: [],
      subtasks: [],
    },
    {
      id: "3",
      ticketId: 3,
      title: "Dashboard mit echten Daten",
      description: "KPI-Karten und Charts nach Import befuellen",
      area: "Frontend",
      priority: "medium",
      type: "feature",
      creator: "Homer & Heinzel",
      column: "todo",
      sprint: "Sprint 2",
      color: "green",
      createdAt: "2026-04-14",
      completedAt: null,
      archived: false,
      archivedAt: null,
      note: "",
      noteFile: null,
      links: [],
      subtasks: [],
    },
    {
      id: "4",
      ticketId: 4,
      title: "Supabase Integration",
      description: "Datenbank fuer User, Board und Notes einrichten",
      area: "Backend",
      priority: "medium",
      type: "feature",
      creator: "Homer & Heinzel",
      column: "ideas",
      sprint: "",
      color: "purple",
      createdAt: "2026-04-14",
      completedAt: null,
      archived: false,
      archivedAt: null,
      note: "",
      noteFile: null,
      links: [],
      subtasks: [],
    },
    {
      id: "5",
      ticketId: 5,
      title: "Git & GitHub Setup",
      description: "Repository erstellt, Vercel connected",
      area: "DevOps",
      priority: "high",
      type: "feature",
      creator: "Homer & Heinzel",
      column: "done",
      sprint: "Sprint 1",
      color: "green",
      createdAt: "2026-04-13",
      completedAt: "2026-04-13",
      archived: false,
      archivedAt: null,
      note: "",
      noteFile: null,
      links: [],
      subtasks: [],
    },
    {
      id: "6",
      ticketId: 6,
      title: "Theme System",
      description: "Dark/Light Mode mit GitHub Theme Farben",
      area: "Frontend",
      priority: "high",
      type: "feature",
      creator: "Homer & Heinzel",
      column: "done",
      sprint: "Sprint 1",
      color: "blue",
      createdAt: "2026-04-13",
      completedAt: "2026-04-13",
      archived: false,
      archivedAt: null,
      note: "",
      noteFile: null,
      links: [],
      subtasks: [],
    },
  ],
};

// ── Migration helper ──────────────────────────────────

function migrateBoard(data: Record<string, unknown>): BoardData {
  const d = data as Record<string, unknown>;
  const cards = (d.cards as Record<string, unknown>[]) || [];
  let nextId = (d.nextTicketId as number) || cards.length + 1;

  const migratedCards: Card[] = cards.map((c, i) => {
    const card = c as Record<string, unknown>;
    if (!card.ticketId) {
      card.ticketId = i + 1;
      if (i + 1 >= nextId) nextId = i + 2;
    }
    return {
      id: (card.id as string) || Date.now().toString(),
      ticketId: card.ticketId as number,
      title: (card.title as string) || "",
      description: (card.description as string) || "",
      area: (card.area as string) || "",
      priority: (card.priority as Priority) || "medium",
      type: (card.type as CardType | "") || "",
      creator: (card.creator as string) || "",
      column: (card.column as string) || "todo",
      sprint: (card.sprint as string) || "",
      color: (card.color as CardColor | "") || "",
      createdAt: (card.createdAt as string) || new Date().toISOString().split("T")[0],
      completedAt: (card.completedAt as string | null) ?? null,
      archived: (card.archived as boolean) ?? false,
      archivedAt: (card.archivedAt as string | null) ?? null,
      note: (card.note as string) || "",
      noteFile: (card.noteFile as string | null) ?? null,
      links: (card.links as CardLink[]) || [],
      subtasks: (card.subtasks as Subtask[]) || [],
    };
  });

  return {
    sprints: (d.sprints as string[]) || DEFAULT_BOARD.sprints,
    columns: (d.columns as ColumnDef[]) || DEFAULT_COLUMNS,
    nextTicketId: nextId,
    team: (d.team as string[]) || ["Visualizer", "Homer"],
    cards: migratedCards,
  };
}

// ── Context ────────────────────────────────────────────

interface BoardContextType {
  board: BoardData;
  addCard: (card: Omit<Card, "id" | "createdAt" | "ticketId" | "completedAt" | "archived" | "archivedAt">) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  moveCard: (id: string, toColumn: string) => void;
  archiveCard: (id: string) => void;
  restoreCard: (id: string) => void;
  toggleDone: (id: string) => void;
  addSubtask: (cardId: string, title: string) => void;
  toggleSubtask: (cardId: string, subtaskId: string) => void;
  removeSubtask: (cardId: string, subtaskId: string) => void;
  addSprint: (name: string) => void;
  removeSprint: (name: string) => void;
  addTeamMember: (name: string) => void;
  removeTeamMember: (name: string) => void;
  moveCardToPosition: (cardId: string, targetColumn: string, targetIndex: number) => void;
  addColumn: (col: ColumnDef) => void;
  removeColumn: (colId: string) => void;
  updateColumn: (colId: string, updates: Partial<ColumnDef>) => void;
  getActiveColumns: () => ColumnDef[];
}

const noop = (() => {}) as never;
const BoardContext = createContext<BoardContextType>({
  board: { sprints: [], columns: [], nextTicketId: 1, cards: [], team: [] },
  addCard: noop,
  updateCard: noop,
  deleteCard: noop,
  moveCard: noop,
  archiveCard: noop,
  restoreCard: noop,
  toggleDone: noop,
  addSubtask: noop,
  toggleSubtask: noop,
  removeSubtask: noop,
  addSprint: noop,
  removeSprint: noop,
  addTeamMember: noop,
  removeTeamMember: noop,
  moveCardToPosition: noop,
  addColumn: noop,
  removeColumn: noop,
  updateColumn: noop,
  getActiveColumns: () => [],
});

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
        if (parsed.cards) {
          setBoard(migrateBoard(parsed));
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

  // ── Helpers ───────────────────

  const stampCompleted = (card: Card): Card => {
    if (!card.completedAt) {
      return { ...card, completedAt: new Date().toISOString().split("T")[0] };
    }
    return card;
  };

  // ── Card Actions ──────────────

  const addCard = useCallback(
    (card: Omit<Card, "id" | "createdAt" | "ticketId" | "completedAt" | "archived" | "archivedAt">) => {
      setBoard((prev) => {
        const newCard: Card = {
          ...card,
          id: Date.now().toString(),
          ticketId: prev.nextTicketId,
          createdAt: new Date().toISOString().split("T")[0],
          completedAt: card.column === "done" ? new Date().toISOString().split("T")[0] : null,
          archived: false,
          archivedAt: null,
        };
        return {
          ...prev,
          nextTicketId: prev.nextTicketId + 1,
          cards: [...prev.cards, newCard],
        };
      });
    },
    []
  );

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => {
        if (c.id !== id) return c;
        let updated = { ...c, ...updates };
        if (updates.column === "done" && c.column !== "done") {
          updated = stampCompleted(updated);
        }
        if (updates.column && updates.column !== "done" && c.column === "done") {
          updated.completedAt = null;
        }
        return updated;
      }),
    }));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
    }));
  }, []);

  const moveCard = useCallback((id: string, toColumn: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => {
        if (c.id !== id) return c;
        let updated = { ...c, column: toColumn };
        if (toColumn === "done" && c.column !== "done") {
          updated = stampCompleted(updated);
        }
        if (toColumn !== "done" && c.column === "done") {
          updated.completedAt = null;
        }
        return updated;
      }),
    }));
  }, []);

  const archiveCard = useCallback((id: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => {
        if (c.id !== id) return c;
        let updated: Card = { ...c, archived: true, archivedAt: new Date().toISOString() };
        updated = stampCompleted(updated);
        return updated;
      }),
    }));
  }, []);

  const restoreCard = useCallback((id: string) => {
    setBoard((prev) => {
      const activeCols = prev.columns.filter(
        (col) => col.id !== "backlog" && col.id !== "done"
      );
      const targetCol = activeCols[0]?.id || "todo";
      return {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === id
            ? { ...c, archived: false, archivedAt: null, column: targetCol }
            : c
        ),
      };
    });
  }, []);

  const toggleDone = useCallback((id: string) => {
    setBoard((prev) => {
      const activeCols = prev.columns.filter(
        (col) => col.id !== "backlog" && col.id !== "done"
      );
      const firstActive = activeCols[0]?.id || "todo";
      return {
        ...prev,
        cards: prev.cards.map((c) => {
          if (c.id !== id) return c;
          if (c.column === "done") {
            return { ...c, column: firstActive, completedAt: null };
          } else {
            return stampCompleted({ ...c, column: "done" });
          }
        }),
      };
    });
  }, []);

  // ── Reorder ────────────────────

  const moveCardToPosition = useCallback(
    (cardId: string, targetColumn: string, targetIndex: number) => {
      setBoard((prev) => {
        const cardIdx = prev.cards.findIndex((c) => c.id === cardId);
        if (cardIdx === -1) return prev;

        const card = prev.cards[cardIdx];
        // Remove card from current position
        const withoutCard = prev.cards.filter((c) => c.id !== cardId);

        // Update column + completedAt if needed
        let updatedCard = { ...card, column: targetColumn };
        if (targetColumn === "done" && card.column !== "done") {
          updatedCard = stampCompleted(updatedCard);
        }
        if (targetColumn !== "done" && card.column === "done") {
          updatedCard.completedAt = null;
        }

        // Get cards in target column to find actual insertion index
        const colCards = withoutCard.filter((c) => c.column === targetColumn && !c.archived);
        const clampedIdx = Math.min(targetIndex, colCards.length);

        // Find the global index to insert at
        let globalIndex: number;
        if (clampedIdx >= colCards.length) {
          // Insert after the last card in this column
          const lastColCard = colCards[colCards.length - 1];
          globalIndex = lastColCard
            ? withoutCard.indexOf(lastColCard) + 1
            : withoutCard.length;
        } else {
          // Insert before the card at clampedIdx
          globalIndex = withoutCard.indexOf(colCards[clampedIdx]);
        }

        // Insert card at new position
        const newCards = [...withoutCard];
        newCards.splice(globalIndex, 0, updatedCard);

        return { ...prev, cards: newCards };
      });
    },
    []
  );

  // ── Subtask Actions ───────────

  const addSubtask = useCallback((cardId: string, title: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              subtasks: [
                ...c.subtasks,
                { id: `st_${Date.now()}`, title, done: false },
              ],
            }
          : c
      ),
    }));
  }, []);

  const toggleSubtask = useCallback((cardId: string, subtaskId: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              subtasks: c.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, done: !st.done } : st
              ),
            }
          : c
      ),
    }));
  }, []);

  const removeSubtask = useCallback((cardId: string, subtaskId: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === cardId
          ? { ...c, subtasks: c.subtasks.filter((st) => st.id !== subtaskId) }
          : c
      ),
    }));
  }, []);

  // ── Sprint Actions ────────────

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

  // ── Team Actions ──────────────

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

  // ── Column Actions ────────────

  const addColumn = useCallback((col: ColumnDef) => {
    setBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, col],
    }));
  }, []);

  const removeColumn = useCallback((colId: string) => {
    if (colId === "done" || colId === "backlog") return;
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== colId),
      cards: prev.cards.map((c) =>
        c.column === colId ? { ...c, column: "backlog" } : c
      ),
    }));
  }, []);

  const updateColumn = useCallback(
    (colId: string, updates: Partial<ColumnDef>) => {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((c) =>
          c.id === colId ? { ...c, ...updates } : c
        ),
      }));
    },
    []
  );

  const getActiveColumns = useCallback(() => {
    return board.columns.filter(
      (c) => c.id !== "backlog" && c.id !== "done"
    );
  }, [board.columns]);

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
        archiveCard,
        restoreCard,
        toggleDone,
        addSubtask,
        toggleSubtask,
        removeSubtask,
        addSprint,
        removeSprint,
        addTeamMember,
        removeTeamMember,
        moveCardToPosition,
        addColumn,
        removeColumn,
        updateColumn,
        getActiveColumns,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  return useContext(BoardContext);
}
