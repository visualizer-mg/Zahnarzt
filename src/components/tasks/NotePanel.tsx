"use client";

import { useState, useEffect } from "react";
import { Card, useBoard } from "@/context/BoardContext";

interface NotePanelProps {
  card: Card;
  onClose: () => void;
}

export default function NotePanel({ card, onClose }: NotePanelProps) {
  const { updateCard } = useBoard();
  const [note, setNote] = useState(card.note || "");
  const [saved, setSaved] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Auto-save after 1 second of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (note !== card.note) {
        updateCard(card.id, { note });
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [note, card.id, card.note, updateCard]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col border-l"
        style={{
          width: "min(480px, 90vw)",
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border)",
          animation: "slideIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex-1 min-w-0 mr-3">
            <h2
              className="text-base font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {card.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
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
              {saved && (
                <span className="text-xs" style={{ color: "var(--green)" }}>
                  Gespeichert
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xl px-2"
            style={{ color: "var(--text-muted)" }}
          >
            ×
          </button>
        </div>

        {/* Note Content */}
        <div className="flex-1 p-5 overflow-y-auto">
          <label
            className="block text-xs font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Notizen
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-full min-h-[300px] px-3 py-2 rounded-md border text-sm resize-none font-mono"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              lineHeight: "1.6",
            }}
            placeholder="Notizen hier eingeben...&#10;&#10;Unterstützt Markdown-Format.&#10;Wird automatisch gespeichert."
          />
        </div>

        {/* Footer Info */}
        <div
          className="px-5 py-2 border-t text-xs"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Erstellt: {card.createdAt} · Automatische Speicherung aktiv
        </div>
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
