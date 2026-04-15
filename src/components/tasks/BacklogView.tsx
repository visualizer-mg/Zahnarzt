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

interface BacklogViewProps {
  onEditCard: (card: Card) => void;
  onOpenNote: (card: Card) => void;
  onNewCard: (column: string) => void;
}

interface DragOverInfo {
  cardId: string;
  position: "before" | "after";
}

export default function BacklogView({ onEditCard, onOpenNote, onNewCard }: BacklogViewProps) {
  const { board, deleteCard, restoreCard, moveCard, toggleDone, moveCardToPosition } = useBoard();
  const [search, setSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "ticket">("newest");
  const [showArchive, setShowArchive] = useState(false);
  const [colPickerCard, setColPickerCard] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<DragOverInfo | null>(null);
  const dragCardId = useRef<string | null>(null);

  // Get all backlog cards (not archived)
  const backlogCards = board.cards.filter(
    (c) => c.column === "backlog" && !c.archived
  );

  // Get archived cards
  const archivedCards = board.cards.filter((c) => c.archived);

  // Unique areas
  const allAreas = Array.from(
    new Set(board.cards.map((c) => c.area).filter(Boolean))
  ).sort();

  // Filter
  const filterCards = (cards: Card[]) => {
    let filtered = cards;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q)
      );
    }
    if (areaFilter) {
      filtered = filtered.filter((c) => c.area === areaFilter);
    }
    return filtered;
  };

  // Sort
  const sortCards = (cards: Card[]) => {
    const sorted = [...cards];
    if (sort === "newest") {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else {
      sorted.sort((a, b) => a.ticketId - b.ticketId);
    }
    return sorted;
  };

  const filteredBacklog = sortCards(filterCards(backlogCards));
  const filteredArchive = sortCards(filterCards(archivedCards));

  // Active columns for "move to board" picker
  const activeCols = board.columns.filter(
    (c) => c.id !== "backlog" && c.id !== "done"
  );

  const inputStyle = {
    backgroundColor: "var(--bg-tertiary)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  };

  // Drag handlers
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

      const colCards = board.cards.filter((c) => c.column === "backlog" && !c.archived);
      const targetIdx = colCards.findIndex((c) => c.id === dragOverInfo.cardId);

      if (targetIdx !== -1) {
        const insertIdx = dragOverInfo.position === "before" ? targetIdx : targetIdx + 1;
        moveCardToPosition(cardId, "backlog", insertIdx);
      }

      dragCardId.current = null;
      setDragOverInfo(null);
    },
    [board.cards, dragOverInfo, moveCardToPosition]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(related)) {
      setDragOverInfo(null);
    }
  }, []);

  const insertLine = (
    <div
      style={{
        height: "2px",
        backgroundColor: "#58a6ff",
        borderRadius: "1px",
        boxShadow: "0 0 4px rgba(88,166,255,0.5)",
      }}
    />
  );

  const renderRow = (card: Card, isArchived: boolean) => {
    const showBefore =
      !isArchived &&
      dragOverInfo?.cardId === card.id &&
      dragOverInfo?.position === "before";
    const showAfter =
      !isArchived &&
      dragOverInfo?.cardId === card.id &&
      dragOverInfo?.position === "after";

    return (
      <div key={card.id}>
        {showBefore && insertLine}
        <div
          draggable={!isArchived}
          onDragStart={!isArchived ? (e) => handleDragStart(e, card.id) : undefined}
          onDragOver={!isArchived ? (e) => handleRowDragOver(e, card.id) : undefined}
          className={`flex items-center gap-3 px-4 py-2.5 border-b hover:brightness-110 transition-colors ${
            isArchived ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
          }`}
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

          {/* Ticket # */}
          <span
            className="text-xs font-mono w-8"
            style={{ color: "var(--text-muted)" }}
          >
            #{card.ticketId}
          </span>

          {/* Priority */}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: PRIORITY_COLORS[card.priority] }}
          />

          {/* Type */}
          {card.type && (
            <span
              className="text-xs px-1 py-0.5 rounded flex-shrink-0"
              style={{
                backgroundColor: `${TYPE_COLORS[card.type as CardType]}15`,
                color: TYPE_COLORS[card.type as CardType],
              }}
            >
              {TYPE_LABELS[card.type as CardType]}
            </span>
          )}

          {/* Title */}
          <span
            className="flex-1 text-sm truncate"
            style={{
              color: "var(--text-primary)",
              textDecoration: isArchived ? "line-through" : "none",
              opacity: isArchived ? 0.6 : 1,
            }}
          >
            {card.title}
          </span>

          {/* Subtask count */}
          {(card.subtasks?.length || 0) > 0 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {card.subtasks.filter((s) => s.done).length}/{card.subtasks.length}
            </span>
          )}

          {/* Area */}
          {card.area && (
            <span
              className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-muted)",
              }}
            >
              {card.area}
            </span>
          )}

          {/* Creator */}
          {card.creator && (
            <span
              className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                backgroundColor: "rgba(63,185,80,0.1)",
                color: "var(--green)",
              }}
            >
              {card.creator}
            </span>
          )}

          {/* Date */}
          <span
            className="text-xs flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            {isArchived && card.completedAt
              ? `Erledigt: ${card.completedAt}`
              : card.createdAt}
          </span>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            {!isArchived && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setColPickerCard(colPickerCard === card.id ? null : card.id);
                  }}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    color: "var(--accent)",
                    backgroundColor: "var(--bg-tertiary)",
                  }}
                  title="Auf Board verschieben"
                >
                  → Board
                </button>
                {/* Column Picker Popup */}
                {colPickerCard === card.id && (
                  <div
                    className="absolute right-0 top-8 z-50 rounded-lg border shadow-lg py-1 min-w-[150px]"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {activeCols.map((col) => (
                      <button
                        key={col.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCard(card.id, col.id);
                          setColPickerCard(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:brightness-110"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: col.color }}
                        />
                        <span>{col.icon}</span>
                        <span>{col.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isArchived && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restoreCard(card.id);
                }}
                className="text-xs px-2 py-1 rounded"
                style={{
                  color: "var(--green)",
                  backgroundColor: "var(--bg-tertiary)",
                }}
              >
                Wiederherstellen
              </button>
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`"${card.title}" dauerhaft loeschen?`)) {
                  deleteCard(card.id);
                }
              }}
              className="text-xs px-2 py-1 rounded"
              style={{
                color: "var(--red)",
                backgroundColor: "var(--bg-tertiary)",
              }}
            >
              x
            </button>
          </div>
        </div>
        {showAfter && insertLine}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suchen..."
          className="flex-1 max-w-xs px-3 py-2 rounded-md border text-sm"
          style={inputStyle}
        />
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="px-3 py-2 rounded-md border text-sm"
          style={inputStyle}
        >
          <option value="">Alle Bereiche</option>
          {allAreas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "oldest" | "ticket")}
          className="px-3 py-2 rounded-md border text-sm"
          style={inputStyle}
        >
          <option value="newest">Neueste zuerst</option>
          <option value="oldest">Aelteste zuerst</option>
          <option value="ticket">Nach Ticket-Nr.</option>
        </select>
      </div>

      {/* Active Backlog */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-sm">📥</span>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Backlog
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-muted)",
            }}
          >
            {filteredBacklog.length}
          </span>
        </div>
        {filteredBacklog.length > 0 ? (
          filteredBacklog.map((card) => renderRow(card, false))
        ) : (
          <div
            className="px-4 py-6 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Keine Karten im Backlog.
          </div>
        )}
        {/* New Card Button */}
        <button
          onClick={() => onNewCard("backlog")}
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

      {/* Archived Section */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-left"
        >
          <span
            className="text-xs transition-transform"
            style={{
              transform: showArchive ? "rotate(0deg)" : "rotate(-90deg)",
            }}
          >
            ▼
          </span>
          <span className="text-sm">📦</span>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Archiv
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-muted)",
            }}
          >
            {filteredArchive.length}
          </span>
        </button>
        {showArchive && (
          <>
            {filteredArchive.length > 0 ? (
              filteredArchive.map((card) => renderRow(card, true))
            ) : (
              <div
                className="px-4 py-6 text-center text-sm border-t"
                style={{
                  color: "var(--text-muted)",
                  borderColor: "var(--border)",
                }}
              >
                Kein archiviertes Material.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
