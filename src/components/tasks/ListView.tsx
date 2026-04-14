"use client";

import {
  Card,
  COLUMNS,
  COLUMN_COLORS,
  PRIORITY_COLORS,
  useBoard,
} from "@/context/BoardContext";

interface ListViewProps {
  onEditCard: (card: Card) => void;
  onOpenNote: (card: Card) => void;
}

export default function ListView({ onEditCard, onOpenNote }: ListViewProps) {
  const { board, deleteCard, getCardNumber } = useBoard();

  return (
    <div className="space-y-6">
      {COLUMNS.map((col) => {
        const colCards = board.cards.filter((c) => c.column === col.key);
        if (colCards.length === 0) return null;

        return (
          <div
            key={col.key}
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            {/* Section Header */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
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

            {/* Table */}
            <table className="w-full">
              <thead>
                <tr
                  className="text-xs border-b"
                  style={{
                    color: "var(--text-muted)",
                    borderColor: "var(--border)",
                  }}
                >
                  <th className="text-left px-4 py-2 w-10">#</th>
                  <th className="text-left px-2 py-2 w-8">Pri</th>
                  <th className="text-left px-2 py-2">Titel</th>
                  <th className="text-left px-2 py-2 w-24">Bereich</th>
                  <th className="text-left px-2 py-2 w-24">Sprint</th>
                  <th className="text-left px-2 py-2 w-28">Ersteller</th>
                  <th className="text-left px-2 py-2 w-24">Datum</th>
                  <th className="text-right px-4 py-2 w-20">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {colCards.map((card) => (
                  <tr
                    key={card.id}
                    className="border-b last:border-b-0 hover:brightness-110 transition-colors cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                    onClick={() => onOpenNote(card)}
                  >
                    <td
                      className="px-4 py-2.5 text-xs font-mono"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {getCardNumber(card.id)}
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{
                          backgroundColor: PRIORITY_COLORS[card.priority],
                        }}
                        title={card.priority}
                      />
                    </td>
                    <td
                      className="px-2 py-2.5 text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {card.title}
                    </td>
                    <td
                      className="px-2 py-2.5 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {card.area}
                    </td>
                    <td
                      className="px-2 py-2.5 text-xs"
                      style={{ color: "var(--accent)" }}
                    >
                      {card.sprint}
                    </td>
                    <td
                      className="px-2 py-2.5 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {card.creator}
                    </td>
                    <td
                      className="px-2 py-2.5 text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {card.createdAt}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCard(card);
                        }}
                        className="text-xs px-2 py-1 rounded mr-1"
                        style={{
                          color: "var(--text-secondary)",
                          backgroundColor: "var(--bg-tertiary)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${card.title}" löschen?`)) {
                            deleteCard(card.id);
                          }
                        }}
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          color: "var(--red)",
                          backgroundColor: "var(--bg-tertiary)",
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
