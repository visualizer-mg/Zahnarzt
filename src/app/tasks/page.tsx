"use client";

import { useState } from "react";
import { Card, Column } from "@/context/BoardContext";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import ListView from "@/components/tasks/ListView";
import SprintsView from "@/components/tasks/SprintsView";
import CardModal from "@/components/tasks/CardModal";
import NotePanel from "@/components/tasks/NotePanel";

type View = "kanban" | "list" | "sprints";

const VIEWS: { key: View; label: string; icon: string }[] = [
  { key: "kanban", label: "Kanban", icon: "▦" },
  { key: "list", label: "Liste", icon: "☰" },
  { key: "sprints", label: "Sprints", icon: "🏃" },
];

function TasksContent() {
  const [view, setView] = useState<View>("kanban");
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState<Column>("todo");
  const [noteCard, setNoteCard] = useState<Card | null>(null);

  const handleNewCard = (column: Column) => {
    setModalCard(null);
    setModalColumn(column);
    setModalOpen(true);
  };

  const handleEditCard = (card: Card) => {
    setModalCard(card);
    setModalColumn(card.column);
    setModalOpen(true);
  };

  const handleOpenNote = (card: Card) => {
    setNoteCard(card);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header + View Switcher */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Tasks
          </h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            Projekt-Aufgaben verwalten
          </p>
        </div>

        {/* View Tabs */}
        <div
          className="flex rounded-lg border overflow-hidden"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  view === v.key
                    ? "var(--bg-tertiary)"
                    : "transparent",
                color:
                  view === v.key
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
              }}
            >
              <span>{v.icon}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      {view === "kanban" && (
        <KanbanBoard
          onEditCard={handleEditCard}
          onOpenNote={handleOpenNote}
          onNewCard={handleNewCard}
        />
      )}
      {view === "list" && (
        <ListView
          onEditCard={handleEditCard}
          onOpenNote={handleOpenNote}
        />
      )}
      {view === "sprints" && (
        <SprintsView
          onEditCard={handleEditCard}
          onOpenNote={handleOpenNote}
        />
      )}

      {/* Card Modal */}
      {modalOpen && (
        <CardModal
          card={modalCard}
          defaultColumn={modalColumn}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Note Panel */}
      {noteCard && (
        <NotePanel card={noteCard} onClose={() => setNoteCard(null)} />
      )}
    </div>
  );
}

export default function TasksPage() {
  return <TasksContent />;
}
