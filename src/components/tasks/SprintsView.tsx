"use client";

import { useState } from "react";
import {
  Card,
  PRIORITY_COLORS,
  COLUMN_COLORS,
  useBoard,
} from "@/context/BoardContext";

interface SprintsViewProps {
  onEditCard: (card: Card) => void;
  onOpenNote: (card: Card) => void;
}

export default function SprintsView({
  onEditCard,
  onOpenNote,
}: SprintsViewProps) {
  const { board, getCardNumber } = useBoard();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (sprint: string) =>
    setCollapsed((prev) => ({ ...prev, [sprint]: !prev[sprint] }));

  // Group cards by sprint
  const sprintGroups = [
    ...board.sprints.map((s) => ({
      name: s,
      cards: board.cards.filter((c) => c.sprint === s),
    })),
    {
      name: "Nicht zugeordnet",
      cards: board.cards.filter((c) => !c.sprint),
    },
  ].filter((g) => g.cards.length > 0);

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
                {group.cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-3 py-2 border-t cursor-pointer hover:brightness-110 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => onOpenNote(card)}
                  >
                    <span
                      className="text-xs font-mono w-6"
                      style={{ color: "var(--text-muted)" }}
                    >
                      #{getCardNumber(card.id)}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: PRIORITY_COLORS[card.priority],
                      }}
                    />
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: COLUMN_COLORS[card.column],
                      }}
                      title={card.column}
                    />
                    <span
                      className="flex-1 text-sm"
                      style={{ color: "var(--text-primary)" }}
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
                ))}
              </div>
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
