"use client";

import { useState } from "react";
import {
  Card,
  Column,
  COLUMNS,
  COLUMN_COLORS,
  useBoard,
} from "@/context/BoardContext";
import TaskCard from "@/components/tasks/TaskCard";

interface KanbanBoardProps {
  onEditCard: (card: Card) => void;
  onOpenNote: (card: Card) => void;
  onNewCard: (column: Column) => void;
}

export default function KanbanBoard({
  onEditCard,
  onOpenNote,
  onNewCard,
}: KanbanBoardProps) {
  const { board, moveCard } = useBoard();
  const [dragOverCol, setDragOverCol] = useState<Column | null>(null);

  const handleDragOver = (e: React.DragEvent, col: Column) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(col);
  };

  const handleDrop = (e: React.DragEvent, col: Column) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (cardId) {
      moveCard(cardId, col);
    }
    setDragOverCol(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 200px)" }}>
      {COLUMNS.map((col) => {
        const colCards = board.cards.filter((c) => c.column === col.key);
        const isDragOver = dragOverCol === col.key;

        return (
          <div
            key={col.key}
            className="flex-1 min-w-[280px] max-w-[350px] flex flex-col rounded-lg"
            style={{
              backgroundColor: isDragOver
                ? "rgba(88,166,255,0.05)"
                : "var(--bg-secondary)",
              border: `1px solid ${
                isDragOver ? "var(--accent)" : "var(--border)"
              }`,
              transition: "background-color 0.15s, border-color 0.15s",
            }}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column Header */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLUMN_COLORS[col.key] }}
                />
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
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 overflow-y-auto">
              {colCards.map((card) => (
                <TaskCard
                  key={card.id}
                  card={card}
                  onEdit={onEditCard}
                  onOpenNote={onOpenNote}
                />
              ))}

              {/* New Card Button */}
              <button
                onClick={() => onNewCard(col.key)}
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
    </div>
  );
}
