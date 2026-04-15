"use client";

import { useState, useRef, useCallback } from "react";
import {
  Card,
  PRIORITY_COLORS,
  TYPE_COLORS,
  TYPE_LABELS,
  CardType,
  useBoard,
} from "@/context/BoardContext";

interface SprintsViewProps {
  onEditCard: (card: Card) => void;
  onOpenNote: (card: Card) => void;
  onNewCard: (column: string) => void;
}

interface DragOverInfo {
  cardId: string;
  position: "before" | "after";
}

export default function SprintsView({
  onEditCard,
  onOpenNote,
  onNewCard,
}: SprintsViewProps) {
  const { board, toggleDone, moveCardToPosition } = useBoard();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);
  const dragCardId = useRef<string | null>(null);

  const toggle = (sprint: string) =>
    setCollapsed((prev) => ({ ...prev, [sprint]: !prev[sprint] }));

  const activeCards = board.cards.filter((c) => !c.archived);

  // Group cards by sprint
  const sprintGroups = [
    ...board.sprints.map((s) => ({
      name: s,
      cards: activeCards.filter((c) => c.sprint === s),
    })),
    {
      name: "Nicht zugeordnet",
      cards: activeCards.filter((c) => !c.sprint),
    },
  ].filter((g) => g.cards.length > 0);

  // Helper to get column info
  const getColInfo = (colId: string) => {
    return board.columns.find((c) => c.id === colId);
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
    dragCardId.current = cardId;
  };

  const handleRowDragOver = useCallback(
    (e: React.DragEvent, cardId: string) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position: "before" | "after" = y / rect.height < 0.5 ? "before" : "after";

      setDragOverInfo((prev) => {
        if (prev?.cardId === cardId && prev?.position === position) return prev;
        return { cardId, position };
      });
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const cardId = dragCardId.current || e.dataTransfer.getData("text/plain");
      if (!cardId || !dragOverInfo) { setDragOverInfo(null); return; }

      // Find the target card to determine its column
      const targetCard = activeCards.find((c) => c.id === dragOverInfo.cardId);
      if (!targetCard) { setDragOverInfo(null); return; }

      const colId = targetCard.column;
      const colCards = activeCards.filter((c) => c.column === colId);
      const targetIdx = colCards.findIndex((c) => c.id === dragOverInfo.cardId);

      if (targetIdx !== -1) {
        const insertIdx = dragOverInfo.position === "before" ? targetIdx : targetIdx + 1;
        moveCardToPosition(cardId, colId, insertIdx);
      }

      dragCardId.current = null;
      setDragOverInfo(null);
    },
    [activeCards, dragOverInfo, moveCardToPosition]
  );

  const insertLine = (
    <div
      style={{
        height: "2px",
        backgroundColor: "#58a6ff",
        borderRadius: "1px",
        boxShadow: "0 0 4px rgba(88,166,255,0.5)",
        margin: "0 16px",
      }}
    />
  );

  return (
    <div className="space-y-4">
      {sprintGroups.map((group) => {
        const doneCount = group.cards.filter(
          (c) => c.column === "done"
        ).length;
        const total = group.cards.length;
        const progress = total > 0 ? (doneCount / total) * 100 : 0;
        const isCollapsed = collapsed[group.name];

        return (
          <div
            key={group.name}
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={handleDrop}
          >
            {/* Sprint Header */}
            <button
              onClick={() => toggle(group.name)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ color: "var(--text-primary)" }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-xs transition-transform"
                  style={{
                    transform: isCollapsed
                      ? "rotate(-90deg)"
                      : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
                <span className="font-semibold">{group.name}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-muted)",
                  }}
                >
                  {total} Karten
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {doneCount}/{total} fertig
                </span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color:
                      progress === 100
                        ? "var(--green)"
                        : progress > 50
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                  }}
                >
                  {Math.round(progress)}%
                </span>
              </div>
            </button>

            {/* Progress Bar */}
            <div
              className="h-1 mx-4 mb-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress}%`,
                  backgroundColor:
                    progress === 100 ? "var(--green)" : "var(--accent)",
                }}
              />
            </div>

            {/* Cards */}
            {!isCollapsed && (
              <div className="px-4 pb-3">
                {group.cards.map((card) => {
                  const colInfo = getColInfo(card.column);
                  const showBefore =
                    dragOverInfo?.cardId === card.id &&
                    dragOverInfo?.position === "before";
                  const showAfter =
                    dragOverInfo?.cardId === card.id &&
                    dragOverInfo?.position === "after";

                  return (
                    <div key={card.id}>
                      {showBefore && insertLine}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onDragOver={(e) => handleRowDragOver(e, card.id)}
                        className="flex items-center gap-3 py-2 border-t cursor-grab active:cursor-grabbing hover:brightness-110 transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        onClick={() => onEditCard(card)}
                      >
                        {/* Done Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDone(card.id);
                          }}
                          className="w-3.5 h-3.5 rounded border flex items-center justify-center text-xs flex-shrink-0"
                          style={{
                            borderColor: card.column === "done" ? "var(--green)" : "var(--border)",
                            backgroundColor: card.column === "done" ? "var(--green)" : "transparent",
                            color: "#fff",
                            borderRadius: "3px",
                          }}
                        >
                          {card.column === "done" ? "✓" : ""}
                        </button>
                        <span
                          className="text-xs font-mono w-6"
                          style={{ color: "var(--text-muted)" }}
                        >
                          #{card.ticketId}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: PRIORITY_COLORS[card.priority],
                          }}
                        />
                        {/* Column badge */}
                        {colInfo && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${colInfo.color}15`,
                              color: colInfo.color,
                            }}
                          >
                            {colInfo.label}
                          </span>
                        )}
                        {/* Type badge */}
                        {card.type && (
                          <span
                            className="text-xs px-1 py-0.5 rounded"
                            style={{
                              backgroundColor: `${TYPE_COLORS[card.type as CardType]}15`,
                              color: TYPE_COLORS[card.type as CardType],
                            }}
                          >
                            {TYPE_LABELS[card.type as CardType]}
                          </span>
                        )}
                        <span
                          className="flex-1 text-sm"
                          style={{
                            color: "var(--text-primary)",
                            textDecoration: card.column === "done" ? "line-through" : "none",
                          }}
                        >
                          {card.title}
                        </span>
                        {card.area && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: "var(--bg-tertiary)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {card.area}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCard(card);
                          }}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            color: "var(--text-secondary)",
                            backgroundColor: "var(--bg-tertiary)",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      {showAfter && insertLine}
                    </div>
                  );
                })}
              </div>
            )}
            {/* New Card Button */}
            {!isCollapsed && (
              <button
                onClick={() => onNewCard("todo")}
                className="w-full text-left text-sm px-4 py-2.5 transition-colors"
                style={{
                  color: "var(--text-muted)",
                  borderTop: "1px dashed var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                + Neue Karte
              </button>
            )}
          </div>
        );
      })}

      {sprintGroups.length === 0 && (
        <div
          className="text-center py-12"
          style={{ color: "var(--text-muted)" }}
        >
          Keine Karten vorhanden. Erstelle deine erste Karte im Kanban-View.
        </div>
      )}
    </div>
  );
}
