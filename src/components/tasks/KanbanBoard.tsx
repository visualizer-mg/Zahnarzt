"use client";

import { useState, useRef, useCallback } from "react";
import {
  Card,
  ColumnDef,
  useBoard,
} from "@/context/BoardContext";
import TaskCard from "@/components/tasks/TaskCard";

interface KanbanBoardProps {
  onEditCard: (card: Card) => void;
  onOpenNote: (card: Card) => void;
  onNewCard: (column: string) => void;
}

interface DragOverInfo {
  colId: string;
  cardId: string | null;  // null = empty column or after last card
  position: "before" | "after";
}

export default function KanbanBoard({
  onEditCard,
  onOpenNote,
  onNewCard,
}: KanbanBoardProps) {
  const { board, moveCard, moveCardToPosition, archiveCard, addColumn } = useBoard();
  const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const dragCardId = useRef<string | null>(null);

  // Filter out archived cards
  const activeCards = board.cards.filter((c) => !c.archived);

  const handleDragStart = useCallback((cardId: string) => {
    dragCardId.current = cardId;
  }, []);

  const handleCardDragOver = useCallback(
    (e: React.DragEvent, colId: string, cardId: string) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const ratio = y / rect.height;
      // Top 28% → insert before, bottom 28% → insert after, middle = keep current
      const position = ratio < 0.28 ? "before" : "after";

      setDragOverInfo((prev) => {
        if (prev?.colId === colId && prev?.cardId === cardId && prev?.position === position) {
          return prev;
        }
        return { colId, cardId, position };
      });
    },
    []
  );

  const handleColumnDragOver = useCallback(
    (e: React.DragEvent, colId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      // Only set if not already over a card in this column
      setDragOverInfo((prev) => {
        if (prev?.colId === colId && prev?.cardId !== null) return prev;
        return { colId, cardId: null, position: "after" };
      });
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, colId: string) => {
      e.preventDefault();
      const cardId = dragCardId.current || e.dataTransfer.getData("text/plain");
      if (!cardId) {
        setDragOverInfo(null);
        return;
      }

      const colCards = activeCards.filter((c) => c.column === colId);

      if (dragOverInfo && dragOverInfo.colId === colId && dragOverInfo.cardId) {
        // Insert relative to a specific card
        const targetIdx = colCards.findIndex((c) => c.id === dragOverInfo.cardId);
        if (targetIdx !== -1) {
          const insertIdx = dragOverInfo.position === "before" ? targetIdx : targetIdx + 1;
          moveCardToPosition(cardId, colId, insertIdx);
        } else {
          moveCardToPosition(cardId, colId, colCards.length);
        }
      } else {
        // Drop on empty column or column background → append
        moveCardToPosition(cardId, colId, colCards.length);
      }

      dragCardId.current = null;
      setDragOverInfo(null);
    },
    [activeCards, dragOverInfo, moveCardToPosition]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the column entirely
    const related = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(related)) {
      setDragOverInfo(null);
    }
  }, []);

  const renderInsertLine = () => (
    <div
      style={{
        height: "2px",
        backgroundColor: "#58a6ff",
        borderRadius: "1px",
        margin: "2px 0",
        boxShadow: "0 0 4px rgba(88,166,255,0.5)",
      }}
    />
  );

  return (
    <div
      className="pb-4"
      style={{
        minHeight: "calc(100vh - 200px)",
        overflowX: "scroll",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "auto",
        scrollbarColor: "var(--text-muted) var(--bg-tertiary)",
      }}
    >
    <div
      className="flex gap-4"
      style={{
        minWidth: "fit-content",
      }}
    >
      {board.columns.filter((c) => c.id !== "backlog").map((col) => {
        const colCards = activeCards.filter((c) => c.column === col.id);
        const isDragOver = dragOverInfo?.colId === col.id;

        return (
          <div
            key={col.id}
            className="min-w-[280px] w-[300px] flex-shrink-0 flex flex-col rounded-lg"
            style={{
              backgroundColor: isDragOver
                ? "rgba(88,166,255,0.05)"
                : "var(--bg-secondary)",
              border: `1px solid ${
                isDragOver ? "var(--accent)" : "var(--border)"
              }`,
              transition: "background-color 0.15s, border-color 0.15s",
            }}
            onDragOver={(e) => handleColumnDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <span className="text-sm">{col.icon}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {col.label}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-muted)",
                  }}
                >
                  {colCards.length}
                </span>
              </div>
              {/* Archive all button for Done column */}
              {col.id === "done" && colCards.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm(`Alle ${colCards.length} erledigten Karten archivieren?`)) {
                      colCards.forEach((c) => archiveCard(c.id));
                    }
                  }}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    color: "var(--amber)",
                    backgroundColor: "var(--bg-tertiary)",
                  }}
                  title="Alle archivieren"
                >
                  📦
                </button>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 overflow-y-auto">
              {colCards.map((card, idx) => {
                const showBefore =
                  isDragOver &&
                  dragOverInfo?.cardId === card.id &&
                  dragOverInfo?.position === "before";
                const showAfter =
                  isDragOver &&
                  dragOverInfo?.cardId === card.id &&
                  dragOverInfo?.position === "after";

                return (
                  <div
                    key={card.id}
                    onDragOver={(e) => handleCardDragOver(e, col.id, card.id)}
                  >
                    {showBefore && renderInsertLine()}
                    <TaskCard
                      card={card}
                      onEdit={onEditCard}
                      onOpenNote={onOpenNote}
                      onDragStart={handleDragStart}
                    />
                    {showAfter && renderInsertLine()}
                  </div>
                );
              })}

              {/* Show insert line for empty column or drop at end */}
              {isDragOver && dragOverInfo?.cardId === null && colCards.length === 0 && renderInsertLine()}

              {/* New Card Button */}
              <button
                onClick={() => onNewCard(col.id)}
                className="w-full text-left text-sm px-3 py-2 rounded-md transition-colors"
                style={{
                  color: "var(--text-muted)",
                  border: "1px dashed var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                + Neue Karte
              </button>
            </div>
          </div>
        );
      })}

      {/* Add Column Button */}
      <div className="min-w-[200px] flex-shrink-0">
        {!showAddCol ? (
          <button
            onClick={() => setShowAddCol(true)}
            className="w-full h-full min-h-[100px] rounded-lg border-2 border-dashed flex items-center justify-center transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <span className="text-sm font-medium">+ Spalte</span>
          </button>
        ) : (
          <div
            className="rounded-lg border p-3"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newColName.trim()) {
                  const id = newColName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                  addColumn({ id, label: newColName.trim(), icon: "📋", color: "#8b949e" });
                  setNewColName("");
                  setShowAddCol(false);
                }
                if (e.key === "Escape") {
                  setNewColName("");
                  setShowAddCol(false);
                }
              }}
              className="w-full px-3 py-2 rounded-md border text-sm mb-2"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="Spaltenname..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (newColName.trim()) {
                    const id = newColName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    addColumn({ id, label: newColName.trim(), icon: "📋", color: "#8b949e" });
                    setNewColName("");
                    setShowAddCol(false);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                }}
              >
                Erstellen
              </button>
              <button
                onClick={() => {
                  setNewColName("");
                  setShowAddCol(false);
                }}
                className="px-3 py-1.5 rounded text-xs"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
