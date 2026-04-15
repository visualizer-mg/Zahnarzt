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
import DeleteDialog from "@/components/tasks/DeleteDialog";

interface ListViewProps {
  onEditCard: (card: Card) => void;
  onOpenNote: (card: Card) => void;
  onNewCard: (column: string) => void;
}

interface DragOverInfo {
  cardId: string;
  position: "before" | "after";
  colId: string;
}

export default function ListView({ onEditCard, onOpenNote, onNewCard }: ListViewProps) {
  const { board, deleteCard, archiveCard, toggleDone, addColumn, moveCardToPosition } = useBoard();
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null);
  const dragCardId = useRef<string | null>(null);

  const activeCards = board.cards.filter((c) => !c.archived);

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
    dragCardId.current = cardId;
  };

  const handleRowDragOver = useCallback(
    (e: React.DragEvent, colId: string, cardId: string) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position: "before" | "after" = y / rect.height < 0.5 ? "before" : "after";

      setDragOverInfo((prev) => {
        if (prev?.cardId === cardId && prev?.position === position) return prev;
        return { cardId, position, colId };
      });
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, colId: string) => {
      e.preventDefault();
      const cardId = dragCardId.current || e.dataTransfer.getData("text/plain");
      if (!cardId) { setDragOverInfo(null); return; }

      const colCards = activeCards.filter((c) => c.column === colId);

      if (dragOverInfo && dragOverInfo.colId === colId && dragOverInfo.cardId) {
        const targetIdx = colCards.findIndex((c) => c.id === dragOverInfo.cardId);
        if (targetIdx !== -1) {
          const insertIdx = dragOverInfo.position === "before" ? targetIdx : targetIdx + 1;
          moveCardToPosition(cardId, colId, insertIdx);
        } else {
          moveCardToPosition(cardId, colId, colCards.length);
        }
      } else {
        moveCardToPosition(cardId, colId, colCards.length);
      }

      dragCardId.current = null;
      setDragOverInfo(null);
    },
    [activeCards, dragOverInfo, moveCardToPosition]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(related)) {
      setDragOverInfo(null);
    }
  }, []);

  const insertLine = (
    <tr>
      <td colSpan={10} style={{ padding: 0, border: "none" }}>
        <div
          style={{
            height: "2px",
            backgroundColor: "#58a6ff",
            borderRadius: "1px",
            boxShadow: "0 0 4px rgba(88,166,255,0.5)",
          }}
        />
      </td>
    </tr>
  );

  const colgroup = (
    <colgroup>
      <col style={{ width: "32px" }} />
      <col style={{ width: "36px" }} />
      <col style={{ width: "20px" }} />
      <col style={{ width: "52px" }} />
      <col />
      <col style={{ width: "100px" }} />
      <col style={{ width: "78px" }} />
      <col style={{ width: "82px" }} />
      <col style={{ width: "92px" }} />
      <col style={{ width: "80px" }} />
    </colgroup>
  );

  return (
    <div className="space-y-6">
      {board.columns.filter((c) => c.id !== "backlog").map((col) => {
        const colCards = activeCards.filter((c) => c.column === col.id);
        if (colCards.length === 0) return null;

        return (
          <div
            key={col.id}
            className="rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Section Header */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "var(--border)" }}
            >
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

            {/* Table */}
            <table className="w-full" style={{ tableLayout: "fixed" }}>
              {colgroup}
              <thead>
                <tr
                  className="text-xs border-b"
                  style={{
                    color: "var(--text-muted)",
                    borderColor: "var(--border)",
                  }}
                >
                  <th className="text-center px-2 py-2">✓</th>
                  <th className="text-left px-2 py-2">#</th>
                  <th className="text-left px-2 py-2">Pri</th>
                  <th className="text-left px-2 py-2">Typ</th>
                  <th className="text-left px-2 py-2">Titel</th>
                  <th className="text-left px-2 py-2">Bereich</th>
                  <th className="text-left px-2 py-2">Sprint</th>
                  <th className="text-left px-2 py-2">Ersteller</th>
                  <th className="text-left px-2 py-2">Datum</th>
                  <th className="text-right px-4 py-2">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {colCards.map((card) => {
                  const showBefore =
                    dragOverInfo?.colId === col.id &&
                    dragOverInfo?.cardId === card.id &&
                    dragOverInfo?.position === "before";
                  const showAfter =
                    dragOverInfo?.colId === col.id &&
                    dragOverInfo?.cardId === card.id &&
                    dragOverInfo?.position === "after";

                  return (
                    <>{/* Fragment for insert lines */}
                      {showBefore && insertLine}
                      <tr
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onDragOver={(e) => handleRowDragOver(e, col.id, card.id)}
                        className="border-b last:border-b-0 hover:brightness-110 transition-colors cursor-grab active:cursor-grabbing"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "var(--bg-secondary)",
                          opacity: card.column === "done" ? 0.7 : 1,
                        }}
                        onClick={() => onEditCard(card)}
                      >
                        <td className="px-2 py-2.5 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDone(card.id);
                            }}
                            className="w-3.5 h-3.5 rounded border flex items-center justify-center text-xs mx-auto"
                            style={{
                              borderColor: card.column === "done" ? "var(--green)" : "var(--border)",
                              backgroundColor: card.column === "done" ? "var(--green)" : "transparent",
                              color: "#fff",
                              borderRadius: "3px",
                            }}
                          >
                            {card.column === "done" ? "✓" : ""}
                          </button>
                        </td>
                        <td
                          className="px-2 py-2.5 text-xs font-mono truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {card.ticketId}
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
                        <td className="px-2 py-2.5">
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
                        </td>
                        <td
                          className="px-2 py-2.5 text-sm font-medium truncate"
                          style={{
                            color: "var(--text-primary)",
                            textDecoration: card.column === "done" ? "line-through" : "none",
                          }}
                        >
                          {card.title}
                          {(card.subtasks?.length || 0) > 0 && (
                            <span
                              className="text-xs ml-2"
                              style={{ color: "var(--text-muted)" }}
                            >
                              ({card.subtasks.filter((s) => s.done).length}/{card.subtasks.length})
                            </span>
                          )}
                        </td>
                        <td
                          className="px-2 py-2.5 text-xs truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {card.area}
                        </td>
                        <td
                          className="px-2 py-2.5 text-xs truncate"
                          style={{ color: "var(--accent)" }}
                        >
                          {card.sprint}
                        </td>
                        <td
                          className="px-2 py-2.5 text-xs truncate"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {card.creator}
                        </td>
                        <td
                          className="px-2 py-2.5 text-xs truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {card.createdAt}
                        </td>
                        <td className="px-2 py-2.5 text-right">
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
                              setDeleteTarget(card);
                            }}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              color: "var(--red)",
                              backgroundColor: "var(--bg-tertiary)",
                            }}
                          >
                            x
                          </button>
                        </td>
                      </tr>
                      {showAfter && insertLine}
                    </>
                  );
                })}
              </tbody>
            </table>
            {/* New Card Button */}
            <button
              onClick={() => onNewCard(col.id)}
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
          </div>
        );
      })}

      {/* Add Column */}
      {!showAddCol ? (
        <button
          onClick={() => setShowAddCol(true)}
          className="w-full py-3 rounded-lg border-2 border-dashed text-sm font-medium transition-colors"
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
          + Spalte hinzufuegen
        </button>
      ) : (
        <div
          className="rounded-lg border p-4 flex gap-2 items-center"
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
            className="flex-1 px-3 py-2 rounded-md border text-sm"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            placeholder="Spaltenname..."
            autoFocus
          />
          <button
            onClick={() => {
              if (newColName.trim()) {
                const id = newColName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                addColumn({ id, label: newColName.trim(), icon: "📋", color: "#8b949e" });
                setNewColName("");
                setShowAddCol(false);
              }
            }}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            Erstellen
          </button>
          <button
            onClick={() => { setNewColName(""); setShowAddCol(false); }}
            className="px-3 py-2 rounded text-sm"
            style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <DeleteDialog
          title={deleteTarget.title}
          onArchive={() => {
            archiveCard(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onDelete={() => {
            deleteCard(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
