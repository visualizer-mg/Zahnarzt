"use client";

import {
  Card,
  COLOR_MAP,
  PRIORITY_COLORS,
  CardColor,
  useBoard,
} from "@/context/BoardContext";

interface TaskCardProps {
  card: Card;
  onEdit: (card: Card) => void;
  onOpenNote: (card: Card) => void;
}

export default function TaskCard({ card, onEdit, onOpenNote }: TaskCardProps) {
  const { deleteCard, getCardNumber } = useBoard();
  const num = getCardNumber(card.id);
  const colorStyle = card.color
    ? COLOR_MAP[card.color as CardColor]
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", card.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="rounded-md p-3 mb-2 cursor-grab active:cursor-grabbing transition-all hover:brightness-110 group"
      style={{
        backgroundColor: colorStyle?.bg || "var(--bg-tertiary)",
        border: `1px solid ${colorStyle?.border || "var(--border)"}`,
        borderLeft: `3px solid ${colorStyle?.hex || "var(--border)"}`,
      }}
    >
      {/* Top row: number + priority + actions */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            #{num}
          </span>
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: PRIORITY_COLORS[card.priority] }}
            title={card.priority}
          />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`"${card.title}" wirklich löschen?`)) {
                deleteCard(card.id);
              }
            }}
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              color: "var(--red)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Title */}
      <p
        className="text-sm font-medium mb-1 cursor-pointer"
        style={{ color: "var(--text-primary)" }}
        onClick={() => onOpenNote(card)}
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

      {/* Bottom row: area, sprint, creator, date */}
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
        {/* Links as gold chips */}
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
