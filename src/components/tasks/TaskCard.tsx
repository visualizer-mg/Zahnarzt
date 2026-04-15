"use client";

import {
  Card,
  COLOR_MAP,
  PRIORITY_COLORS,
  TYPE_COLORS,
  TYPE_LABELS,
  CardColor,
  CardType,
  useBoard,
} from "@/context/BoardContext";


interface TaskCardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onOpenNote: (card: Card) => void;
  onDragStart?: (cardId: string) => void;
  onRequestDelete?: (card: Card) => void;
}

export default function TaskCard({ card, onEdit, onOpenNote, onDragStart, onRequestDelete }: TaskCardProps) {
  const { toggleDone, moveCard } = useBoard();
  const colorStyle = card.color
    ? COLOR_MAP[card.color as CardColor]
    : null;

  const subtasksDone = card.subtasks?.filter((s) => s.done).length || 0;
  const subtasksTotal = card.subtasks?.length || 0;
  const subtaskProgress =
    subtasksTotal > 0 ? (subtasksDone / subtasksTotal) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", card.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(card.id);
      }}
      onClick={() => onEdit(card)}
      className="rounded-md p-3 mb-2 cursor-pointer active:cursor-grabbing transition-all hover:brightness-110 group"
      style={{
        backgroundColor: colorStyle?.bg || "var(--bg-tertiary)",
        border: `1px solid ${colorStyle?.border || "var(--border)"}`,
        borderLeft: `3px solid ${colorStyle?.hex || "var(--border)"}`,
        opacity: card.column === "done" ? 0.7 : 1,
      }}
    >
      {/* Top row: done checkbox + number + priority + type + actions */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
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
            title={card.column === "done" ? "Erledigt" : "Als erledigt markieren"}
          >
            {card.column === "done" ? "✓" : ""}
          </button>
          <span
            className="text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            #{card.ticketId}
          </span>
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: PRIORITY_COLORS[card.priority] }}
            title={card.priority}
          />
          {/* Type Badge */}
          {card.type && (
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                backgroundColor: `${TYPE_COLORS[card.type as CardType]}15`,
                color: TYPE_COLORS[card.type as CardType],
              }}
            >
              {TYPE_LABELS[card.type as CardType]}
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Backlog button */}
          {card.column !== "backlog" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveCard(card.id, "backlog");
              }}
              className="text-xs px-1.5 py-0.5 rounded"
              title="Ins Backlog verschieben"
              style={{
                color: "var(--text-secondary)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              ↓
            </button>
          )}
          {/* Delete/Archive button — opens dialog */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete?.(card);
            }}
            className="text-xs px-1.5 py-0.5 rounded"
            title="Loeschen / Archivieren"
            style={{
              color: "var(--red)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            x
          </button>
        </div>
      </div>

      {/* Title */}
      <p
        className="text-sm font-medium mb-1"
        style={{
          color: "var(--text-primary)",
          textDecoration: card.column === "done" ? "line-through" : "none",
        }}
      >
        {card.title}
      </p>

      {/* Description (2 lines max) */}
      {card.description && (
        <p
          className="text-xs mb-2"
          style={{
            color: "var(--text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {card.description}
        </p>
      )}

      {/* Subtask Progress Bar */}
      {subtasksTotal > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${subtaskProgress}%`,
                  backgroundColor:
                    subtaskProgress === 100 ? "var(--green)" : "var(--accent)",
                }}
              />
            </div>
            <span
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {subtasksDone}/{subtasksTotal}
            </span>
          </div>
        </div>
      )}

      {/* Bottom row: area, sprint, creator, date, links */}
      <div className="flex flex-wrap items-center gap-1.5">
        {card.area && (
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-muted)",
            }}
          >
            {card.area}
          </span>
        )}
        {card.sprint && (
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "rgba(88,166,255,0.1)",
              color: "var(--accent)",
            }}
          >
            {card.sprint}
          </span>
        )}
        {card.creator && (
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor:
                card.creator === "Claude"
                  ? "rgba(188,140,255,0.1)"
                  : "rgba(63,185,80,0.1)",
              color:
                card.creator === "Claude"
                  ? "var(--purple)"
                  : "var(--green)",
            }}
          >
            {card.creator}
          </span>
        )}
        {card.links?.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-1.5 py-0.5 rounded no-underline"
            style={{
              backgroundColor: "rgba(210,153,34,0.1)",
              color: "var(--amber)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
