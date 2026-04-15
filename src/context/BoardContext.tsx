"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase-client";

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

// ── Supabase Helpers ─────────────────────────────────

function dbCardToCard(row: Record<string, unknown>): Card {
  return {
    id: row.id as string,
    ticketId: row.ticket_id as number,
    title: row.title as string,
    description: (row.description as string) || "",
    area: (row.area as string) || "",
    priority: (row.priority as Priority) || "medium",
    type: (row.type as CardType | "") || "",
    creator: (row.creator as string) || "",
    column: (row.column_id as string) || "todo",
    sprint: (row.sprint as string) || "",
    color: (row.color as CardColor | "") || "",
    createdAt: (row.created_at as string) || "",
    completedAt: (row.completed_at as string) || null,
    archived: (row.archived as boolean) || false,
    archivedAt: (row.archived_at as string) || null,
    note: (row.note as string) || "",
    noteFile: (row.note_file as string) || null,
    links: (row.links as CardLink[]) || [],
    subtasks: (row.subtasks as Subtask[]) || [],
  };
}

function cardToDbRow(card: Card) {
  return {
    id: card.id,
    ticket_id: card.ticketId,
    title: card.title,
    description: card.description,
    area: card.area,
    priority: card.priority,
    type: card.type || null,
    creator: card.creator,
    column_id: card.column,
    sprint: card.sprint || null,
    color: card.color || null,
    created_at: card.createdAt,
    completed_at: card.completedAt,
    archived: card.archived,
    archived_at: card.archivedAt,
    note: card.note,
    note_file: card.noteFile,
    links: card.links,
    subtasks: card.subtasks,
    position: 0,
  };
}

// ── Context ────────────────────────────────────────────

interface BoardContextType {
  board: BoardData;
  loading: boolean;
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
  convertToSubtask: (sourceCardId: string, targetCardId: string) => void;
  addColumn: (col: ColumnDef) => void;
  removeColumn: (colId: string) => void;
  updateColumn: (colId: string, updates: Partial<ColumnDef>) => void;
  getActiveColumns: () => ColumnDef[];
}

const noop = (() => {}) as never;
const BoardContext = createContext<BoardContextType>({
  board: { sprints: [], columns: [], nextTicketId: 1, cards: [], team: [] },
  loading: true,
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
  convertToSubtask: noop,
  addColumn: noop,
  removeColumn: noop,
  updateColumn: noop,
  getActiveColumns: () => [],
});

// ── Provider ───────────────────────────────────────────

export function BoardProvider({ children }: { children: ReactNode }) {
  const [board, setBoard] = useState<BoardData>({
    sprints: [],
    columns: [],
    nextTicketId: 1,
    cards: [],
    team: [],
  });
  const [loading, setLoading] = useState(true);

  // ── Load from Supabase ──────────
  useEffect(() => {
    async function loadBoard() {
      if (!supabase) { setLoading(false); return; }
      try {
        const [columnsRes, sprintsRes, cardsRes, teamRes, metaRes] = await Promise.all([
          supabase.from("board_columns").select("*").order("position"),
          supabase.from("sprints").select("*").order("position"),
          supabase.from("cards").select("*").order("position"),
          supabase.from("team_members").select("*"),
          supabase.from("board_meta").select("*").eq("key", "nextTicketId").single(),
        ]);

        const columns: ColumnDef[] = (columnsRes.data || []).map((r: Record<string, unknown>) => ({
          id: r.id as string,
          label: r.label as string,
          icon: (r.icon as string) || "📋",
          color: (r.color as string) || "#8b949e",
        }));

        const sprints: string[] = (sprintsRes.data || []).map((r: Record<string, unknown>) => r.name as string);
        const cards: Card[] = (cardsRes.data || []).map(dbCardToCard);
        const team: string[] = (teamRes.data || []).map((r: Record<string, unknown>) => r.name as string);
        const nextTicketId = metaRes.data ? parseInt(metaRes.data.value as string, 10) : 1;

        setBoard({ columns, sprints, cards, team, nextTicketId });
      } catch (err) {
        console.error("Failed to load board from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBoard();
  }, []);

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

        // Write to Supabase
        const dbRow = cardToDbRow(newCard);
        dbRow.position = prev.cards.length;
        supabase?.from("cards").insert(dbRow).then();
        supabase?.from("board_meta").update({ value: String(prev.nextTicketId + 1) }).eq("key", "nextTicketId").then();

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
    setBoard((prev) => {
      const newCards = prev.cards.map((c) => {
        if (c.id !== id) return c;
        let updated = { ...c, ...updates };
        if (updates.column === "done" && c.column !== "done") {
          updated = stampCompleted(updated);
        }
        if (updates.column && updates.column !== "done" && c.column === "done") {
          updated.completedAt = null;
        }

        // Write to Supabase
        const dbUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.area !== undefined) dbUpdates.area = updates.area;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.type !== undefined) dbUpdates.type = updates.type || null;
        if (updates.creator !== undefined) dbUpdates.creator = updates.creator;
        if (updates.column !== undefined) dbUpdates.column_id = updates.column;
        if (updates.sprint !== undefined) dbUpdates.sprint = updates.sprint || null;
        if (updates.color !== undefined) dbUpdates.color = updates.color || null;
        if (updates.note !== undefined) dbUpdates.note = updates.note;
        if (updates.links !== undefined) dbUpdates.links = updates.links;
        if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
        dbUpdates.completed_at = updated.completedAt;
        supabase?.from("cards").update(dbUpdates).eq("id", id).then();

        return updated;
      });
      return { ...prev, cards: newCards };
    });
  }, []);

  const deleteCard = useCallback((id: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.filter((c) => c.id !== id),
    }));
    supabase?.from("cards").delete().eq("id", id).then();
  }, []);

  const moveCard = useCallback((id: string, toColumn: string) => {
    setBoard((prev) => {
      const newCards = prev.cards.map((c) => {
        if (c.id !== id) return c;
        let updated = { ...c, column: toColumn };
        if (toColumn === "done" && c.column !== "done") {
          updated = stampCompleted(updated);
        }
        if (toColumn !== "done" && c.column === "done") {
          updated.completedAt = null;
        }
        supabase?.from("cards").update({
          column_id: toColumn,
          completed_at: updated.completedAt,
        }).eq("id", id).then();
        return updated;
      });
      return { ...prev, cards: newCards };
    });
  }, []);

  const archiveCard = useCallback((id: string) => {
    setBoard((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => {
        if (c.id !== id) return c;
        const now = new Date().toISOString();
        let updated: Card = { ...c, archived: true, archivedAt: now };
        updated = stampCompleted(updated);
        supabase?.from("cards").update({
          archived: true,
          archived_at: now,
          completed_at: updated.completedAt,
        }).eq("id", id).then();
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
      const newCards = prev.cards.map((c) =>
        c.id === id
          ? { ...c, archived: false, archivedAt: null, column: targetCol }
          : c
      );
      supabase?.from("cards").update({
        archived: false,
        archived_at: null,
        column_id: targetCol,
      }).eq("id", id).then();
      return { ...prev, cards: newCards };
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
            supabase?.from("cards").update({
              column_id: firstActive,
              completed_at: null,
            }).eq("id", id).then();
            return { ...c, column: firstActive, completedAt: null };
          } else {
            const updated = stampCompleted({ ...c, column: "done" });
            supabase?.from("cards").update({
              column_id: "done",
              completed_at: updated.completedAt,
            }).eq("id", id).then();
            return updated;
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
        const withoutCard = prev.cards.filter((c) => c.id !== cardId);

        let updatedCard = { ...card, column: targetColumn };
        if (targetColumn === "done" && card.column !== "done") {
          updatedCard = stampCompleted(updatedCard);
        }
        if (targetColumn !== "done" && card.column === "done") {
          updatedCard.completedAt = null;
        }

        const colCards = withoutCard.filter((c) => c.column === targetColumn && !c.archived);
        const clampedIdx = Math.min(targetIndex, colCards.length);

        let globalIndex: number;
        if (clampedIdx >= colCards.length) {
          const lastColCard = colCards[colCards.length - 1];
          globalIndex = lastColCard
            ? withoutCard.indexOf(lastColCard) + 1
            : withoutCard.length;
        } else {
          globalIndex = withoutCard.indexOf(colCards[clampedIdx]);
        }

        const newCards = [...withoutCard];
        newCards.splice(globalIndex, 0, updatedCard);

        // Update positions in Supabase
        supabase?.from("cards").update({
          column_id: targetColumn,
          completed_at: updatedCard.completedAt,
          position: clampedIdx,
        }).eq("id", cardId).then();

        return { ...prev, cards: newCards };
      });
    },
    []
  );

  // ── Convert Card to Subtask ────

  const convertToSubtask = useCallback(
    (sourceCardId: string, targetCardId: string) => {
      if (sourceCardId === targetCardId) return;
      setBoard((prev) => {
        const sourceCard = prev.cards.find((c) => c.id === sourceCardId);
        const targetCard = prev.cards.find((c) => c.id === targetCardId);
        if (!sourceCard || !targetCard) return prev;

        const newSubtasks = [
          ...targetCard.subtasks,
          { id: `st_${Date.now()}`, title: sourceCard.title, done: false },
        ];

        const newCards = prev.cards
          .filter((c) => c.id !== sourceCardId)
          .map((c) =>
            c.id === targetCardId ? { ...c, subtasks: newSubtasks } : c
          );

        // Delete source card and update target subtasks in Supabase
        supabase?.from("cards").delete().eq("id", sourceCardId).then();
        supabase?.from("cards").update({ subtasks: newSubtasks }).eq("id", targetCardId).then();

        return { ...prev, cards: newCards };
      });
    },
    []
  );

  // ── Subtask Actions ───────────

  const addSubtask = useCallback((cardId: string, title: string) => {
    setBoard((prev) => {
      const card = prev.cards.find((c) => c.id === cardId);
      if (!card) return prev;
      const newSubtasks = [...card.subtasks, { id: `st_${Date.now()}`, title, done: false }];
      supabase?.from("cards").update({ subtasks: newSubtasks }).eq("id", cardId).then();
      return {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId ? { ...c, subtasks: newSubtasks } : c
        ),
      };
    });
  }, []);

  const toggleSubtask = useCallback((cardId: string, subtaskId: string) => {
    setBoard((prev) => {
      const card = prev.cards.find((c) => c.id === cardId);
      if (!card) return prev;
      const newSubtasks = card.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, done: !st.done } : st
      );
      supabase?.from("cards").update({ subtasks: newSubtasks }).eq("id", cardId).then();
      return {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId ? { ...c, subtasks: newSubtasks } : c
        ),
      };
    });
  }, []);

  const removeSubtask = useCallback((cardId: string, subtaskId: string) => {
    setBoard((prev) => {
      const card = prev.cards.find((c) => c.id === cardId);
      if (!card) return prev;
      const newSubtasks = card.subtasks.filter((st) => st.id !== subtaskId);
      supabase?.from("cards").update({ subtasks: newSubtasks }).eq("id", cardId).then();
      return {
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === cardId ? { ...c, subtasks: newSubtasks } : c
        ),
      };
    });
  }, []);

  // ── Sprint Actions ────────────

  const addSprint = useCallback((name: string) => {
    setBoard((prev) => {
      supabase?.from("sprints").insert({ name, position: prev.sprints.length }).then();
      return { ...prev, sprints: [...prev.sprints, name] };
    });
  }, []);

  const removeSprint = useCallback((name: string) => {
    setBoard((prev) => {
      supabase?.from("sprints").delete().eq("name", name).then();
      // Clear sprint from cards that used it
      supabase?.from("cards").update({ sprint: null }).eq("sprint", name).then();
      return {
        ...prev,
        sprints: prev.sprints.filter((s) => s !== name),
        cards: prev.cards.map((c) =>
          c.sprint === name ? { ...c, sprint: "" } : c
        ),
      };
    });
  }, []);

  // ── Team Actions ──────────────

  const addTeamMember = useCallback((name: string) => {
    setBoard((prev) => {
      supabase?.from("team_members").insert({ name }).then();
      return { ...prev, team: [...(prev.team || []), name] };
    });
  }, []);

  const removeTeamMember = useCallback((name: string) => {
    setBoard((prev) => {
      supabase?.from("team_members").delete().eq("name", name).then();
      return { ...prev, team: (prev.team || []).filter((m) => m !== name) };
    });
  }, []);

  // ── Column Actions ────────────

  const addColumn = useCallback((col: ColumnDef) => {
    setBoard((prev) => {
      supabase?.from("board_columns").insert({
        id: col.id,
        label: col.label,
        icon: col.icon,
        color: col.color,
        position: prev.columns.length,
      }).then();
      return { ...prev, columns: [...prev.columns, col] };
    });
  }, []);

  const removeColumn = useCallback((colId: string) => {
    if (colId === "done" || colId === "backlog") return;
    setBoard((prev) => {
      supabase?.from("board_columns").delete().eq("id", colId).then();
      // Move cards from deleted column to backlog
      supabase?.from("cards").update({ column_id: "backlog" }).eq("column_id", colId).then();
      return {
        ...prev,
        columns: prev.columns.filter((c) => c.id !== colId),
        cards: prev.cards.map((c) =>
          c.column === colId ? { ...c, column: "backlog" } : c
        ),
      };
    });
  }, []);

  const updateColumn = useCallback(
    (colId: string, updates: Partial<ColumnDef>) => {
      setBoard((prev) => {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.label !== undefined) dbUpdates.label = updates.label;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        supabase?.from("board_columns").update(dbUpdates).eq("id", colId).then();
        return {
          ...prev,
          columns: prev.columns.map((c) =>
            c.id === colId ? { ...c, ...updates } : c
          ),
        };
      });
    },
    []
  );

  const getActiveColumns = useCallback(() => {
    return board.columns.filter(
      (c) => c.id !== "backlog" && c.id !== "done"
    );
  }, [board.columns]);

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

  return (
    <BoardContext.Provider
      value={{
        board,
        loading,
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
        convertToSubtask,
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
