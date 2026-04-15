"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Priority,
  CardColor,
  CardType,
  CardLink,
  Subtask,
  COLOR_MAP,
  PRIORITY_COLORS,
  TYPE_COLORS,
  TYPE_LABELS,
  useBoard,
} from "@/context/BoardContext";

interface CardModalProps {
  card: Card | null;
  defaultColumn: string;
  onClose: () => void;
}

const COLORS: { key: CardColor | ""; label: string }[] = [
  { key: "", label: "Keine" },
  { key: "green", label: "Gruen" },
  { key: "blue", label: "Blau" },
  { key: "purple", label: "Lila" },
  { key: "orange", label: "Orange" },
  { key: "white", label: "Weiss" },
];

const CARD_TYPES: { key: CardType | ""; label: string }[] = [
  { key: "", label: "Kein Typ" },
  { key: "feature", label: "Feature" },
  { key: "bug", label: "Bug" },
  { key: "content", label: "Content" },
  { key: "design", label: "Design" },
  { key: "research", label: "Research" },
];

export default function CardModal({
  card,
  defaultColumn,
  onClose,
}: CardModalProps) {
  const { board, addCard, updateCard } = useBoard();
  const isEdit = !!card;

  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [area, setArea] = useState(card?.area || "");
  const [priority, setPriority] = useState<Priority>(card?.priority || "medium");
  const [column, setColumn] = useState<string>(card?.column || defaultColumn);
  const [sprint, setSprint] = useState(card?.sprint || "");
  const [creator, setCreator] = useState(card?.creator || board.team?.[0] || "");
  const [color, setColor] = useState<CardColor | "">(card?.color || "");
  const [type, setType] = useState<CardType | "">(card?.type || "");
  const [links, setLinks] = useState<CardLink[]>(card?.links || []);
  const [subtasks, setSubtasks] = useState<Subtask[]>(card?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) return;

    const cardData = {
      title: title.trim(),
      description: description.trim(),
      area: area.trim(),
      priority,
      column,
      sprint,
      creator,
      color,
      type,
      links: links.filter((l) => l.label && l.url),
      subtasks,
    };

    if (isEdit && card) {
      updateCard(card.id, cardData);
    } else {
      addCard({
        ...cardData,
        note: "",
        noteFile: null,
      });
    }
    onClose();
  };

  // Link helpers
  const addLink = () => setLinks([...links, { label: "", url: "" }]);
  const removeLink = (i: number) => setLinks(links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: "label" | "url", value: string) =>
    setLinks(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  // Subtask helpers
  const handleAddSubtask = () => {
    const t = newSubtask.trim();
    if (!t) return;
    setSubtasks([...subtasks, { id: `st_${Date.now()}`, title: t, done: false }]);
    setNewSubtask("");
  };
  const toggleSt = (id: string) =>
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  const removeSt = (id: string) => setSubtasks(subtasks.filter((s) => s.id !== id));

  const inputStyle = {
    backgroundColor: "var(--bg-tertiary)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border overflow-hidden"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {isEdit ? `#${card.ticketId} bearbeiten` : "Neue Karte"}
          </h2>
          <button
            onClick={onClose}
            className="text-xl px-2"
            style={{ color: "var(--text-muted)" }}
          >
            x
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Titel *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm"
              style={inputStyle}
              placeholder="Kartentitel..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-md border text-sm resize-none"
              style={inputStyle}
              rows={2}
              placeholder="Kurze Beschreibung..."
            />
          </div>

          {/* Type + Area row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Typ
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CardType | "")}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={inputStyle}
              >
                {CARD_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Bereich / Tag
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={inputStyle}
                placeholder="z.B. Frontend"
              />
            </div>
          </div>

          {/* Column + Sprint */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Spalte
              </label>
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={inputStyle}
              >
                {board.columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Sprint
              </label>
              <select
                value={sprint}
                onChange={(e) => setSprint(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={inputStyle}
              >
                <option value="">Kein Sprint</option>
                {board.sprints.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Prioritaet
            </label>
            <div className="flex gap-3">
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === p}
                    onChange={() => setPriority(p)}
                    className="sr-only"
                  />
                  <span
                    className="w-3 h-3 rounded-full border-2"
                    style={{
                      backgroundColor:
                        priority === p ? PRIORITY_COLORS[p] : "transparent",
                      borderColor: PRIORITY_COLORS[p],
                    }}
                  />
                  <span
                    className="text-sm capitalize"
                    style={{
                      color:
                        priority === p
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                    }}
                  >
                    {p === "high" ? "Hoch" : p === "medium" ? "Mittel" : "Niedrig"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Creator + Color row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Ersteller
              </label>
              <select
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm"
                style={inputStyle}
              >
                {(board.team || []).map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Farbe
              </label>
              <div className="flex gap-2 pt-1">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setColor(c.key)}
                    className="w-7 h-7 rounded-full border-2 transition-transform"
                    style={{
                      backgroundColor: c.key
                        ? COLOR_MAP[c.key as CardColor].hex
                        : "var(--bg-tertiary)",
                      borderColor:
                        color === c.key
                          ? "var(--text-primary)"
                          : "transparent",
                      transform: color === c.key ? "scale(1.2)" : "scale(1)",
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Subtasks ({subtasks.filter((s) => s.done).length}/{subtasks.length})
            </label>
            <div className="space-y-1 mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 px-2 py-1 rounded"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <button
                    onClick={() => toggleSt(st.id)}
                    className="w-4 h-4 rounded border flex items-center justify-center text-xs flex-shrink-0"
                    style={{
                      borderColor: st.done ? "var(--green)" : "var(--border)",
                      backgroundColor: st.done ? "var(--green)" : "transparent",
                      color: "#fff",
                    }}
                  >
                    {st.done ? "✓" : ""}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{
                      color: st.done
                        ? "var(--text-muted)"
                        : "var(--text-primary)",
                      textDecoration: st.done ? "line-through" : "none",
                    }}
                  >
                    {st.title}
                  </span>
                  <button
                    onClick={() => removeSt(st.id)}
                    className="text-xs px-1"
                    style={{ color: "var(--red)" }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-2 py-1 rounded border text-sm"
                style={inputStyle}
                placeholder="Subtask hinzufuegen..."
              />
              <button
                onClick={handleAddSubtask}
                className="text-xs px-2 py-1 rounded"
                style={{ color: "var(--accent)" }}
              >
                +
              </button>
            </div>
          </div>

          {/* Links */}
          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Links
            </label>
            {links.map((link, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(i, "label", e.target.value)}
                  className="flex-1 px-2 py-1 rounded border text-sm"
                  style={inputStyle}
                  placeholder="Label"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                  className="flex-1 px-2 py-1 rounded border text-sm"
                  style={inputStyle}
                  placeholder="https://..."
                />
                <button
                  onClick={() => removeLink(i)}
                  className="px-2 text-sm"
                  style={{ color: "var(--red)" }}
                >
                  x
                </button>
              </div>
            ))}
            <button
              onClick={addLink}
              className="text-xs"
              style={{ color: "var(--accent)" }}
            >
              + Link hinzufuegen
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-5 py-3 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: title.trim()
                ? "var(--accent)"
                : "var(--bg-tertiary)",
              color: title.trim() ? "#ffffff" : "var(--text-muted)",
              cursor: title.trim() ? "pointer" : "not-allowed",
            }}
          >
            {isEdit ? "Speichern" : "Erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}
