"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useBoard, ColumnDef } from "@/context/BoardContext";

export default function EinstellungenPage() {
  const { theme, setTheme } = useTheme();
  const {
    board,
    addTeamMember,
    removeTeamMember,
    addColumn,
    removeColumn,
    updateColumn,
    addSprint,
    removeSprint,
  } = useBoard();
  const [newMember, setNewMember] = useState("");
  const [newColLabel, setNewColLabel] = useState("");
  const [newColIcon, setNewColIcon] = useState("");
  const [newColColor, setNewColColor] = useState("#8b949e");
  const [newSprint, setNewSprint] = useState("");

  const columns = board?.columns || [];
  const sprints = board?.sprints || [];
  const team = board?.team || [];

  const handleAddMember = () => {
    const name = newMember.trim();
    if (name && !team.includes(name)) {
      addTeamMember(name);
      setNewMember("");
    }
  };

  const handleAddColumn = () => {
    const label = newColLabel.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (columns.some((c) => c.id === id)) return;
    addColumn({ id, label, icon: newColIcon || "📋", color: newColColor });
    setNewColLabel("");
    setNewColIcon("");
    setNewColColor("#8b949e");
  };

  const handleAddSprint = () => {
    const name = newSprint.trim();
    if (name && !sprints.includes(name)) {
      addSprint(name);
      setNewSprint("");
    }
  };

  const inputStyle = {
    backgroundColor: "var(--bg-tertiary)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Einstellungen
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          App-Konfiguration und Darstellung
        </p>
      </div>

      {/* Theme Settings */}
      <div
        className="rounded-lg border p-6 mb-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Darstellung
        </h2>
        <div className="flex gap-4">
          {(["dark", "light"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className="flex-1 rounded-lg border p-4 text-center transition-colors"
              style={{
                backgroundColor:
                  theme === mode ? "var(--bg-tertiary)" : "var(--bg-primary)",
                borderColor: theme === mode ? "var(--accent)" : "var(--border)",
                borderWidth: theme === mode ? "2px" : "1px",
              }}
            >
              <span className="text-2xl block mb-2">
                {mode === "dark" ? "🌙" : "☀️"}
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  color: theme === mode ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {mode === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Board Columns */}
      <div
        className="rounded-lg border p-6 mb-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Board-Spalten
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Spalten konfigurieren. &quot;Backlog&quot; und &quot;Done&quot; sind System-Spalten.
        </p>

        <div className="space-y-2 mb-4">
          {columns.map((col) => {
            const isSystem = col.id === "backlog" || col.id === "done";
            return (
              <div
                key={col.id}
                className="flex items-center gap-3 px-3 py-2 rounded-md"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="text-sm">{col.icon}</span>
                <span
                  className="text-sm font-medium flex-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {col.label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {col.id}
                </span>
                {isSystem ? (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      color: "var(--text-muted)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    System
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm(`Spalte "${col.label}" entfernen? Karten werden in Backlog verschoben.`)) {
                        removeColumn(col.id);
                      }
                    }}
                    className="text-xs px-2 py-1 rounded transition-colors"
                    style={{
                      color: "var(--red)",
                      backgroundColor: "var(--bg-secondary)",
                    }}
                  >
                    Entfernen
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Column */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newColLabel}
            onChange={(e) => setNewColLabel(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border text-sm"
            style={inputStyle}
            placeholder="Spaltenname..."
          />
          <input
            type="text"
            value={newColIcon}
            onChange={(e) => setNewColIcon(e.target.value)}
            className="w-16 px-3 py-2 rounded-md border text-sm text-center"
            style={inputStyle}
            placeholder="Icon"
          />
          <input
            type="color"
            value={newColColor}
            onChange={(e) => setNewColColor(e.target.value)}
            className="w-10 h-10 rounded-md border cursor-pointer"
            style={{ borderColor: "var(--border)" }}
          />
          <button
            onClick={handleAddColumn}
            disabled={!newColLabel.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: newColLabel.trim() ? "var(--accent)" : "var(--bg-tertiary)",
              color: newColLabel.trim() ? "#ffffff" : "var(--text-muted)",
              cursor: newColLabel.trim() ? "pointer" : "not-allowed",
            }}
          >
            Hinzufuegen
          </button>
        </div>
      </div>

      {/* Sprints */}
      <div
        className="rounded-lg border p-6 mb-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Sprints
        </h2>

        <div className="space-y-2 mb-4">
          {sprints.map((sprint) => (
            <div
              key={sprint}
              className="flex items-center justify-between px-3 py-2 rounded-md"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {sprint}
              </span>
              <button
                onClick={() => {
                  if (confirm(`Sprint "${sprint}" entfernen?`)) {
                    removeSprint(sprint);
                  }
                }}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{
                  color: "var(--red)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                Entfernen
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSprint}
            onChange={(e) => setNewSprint(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSprint();
            }}
            className="flex-1 px-3 py-2 rounded-md border text-sm"
            style={inputStyle}
            placeholder="Sprint-Name..."
          />
          <button
            onClick={handleAddSprint}
            disabled={!newSprint.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: newSprint.trim() ? "var(--accent)" : "var(--bg-tertiary)",
              color: newSprint.trim() ? "#ffffff" : "var(--text-muted)",
              cursor: newSprint.trim() ? "pointer" : "not-allowed",
            }}
          >
            Hinzufuegen
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div
        className="rounded-lg border p-6 mb-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Team-Mitglieder
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Mitglieder koennen bei Tasks als Ersteller ausgewaehlt werden.
        </p>

        <div className="space-y-2 mb-4">
          {team.map((member) => (
            <div
              key={member}
              className="flex items-center justify-between px-3 py-2 rounded-md"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {member}
              </span>
              <button
                onClick={() => {
                  if (confirm(`"${member}" aus dem Team entfernen?`)) {
                    removeTeamMember(member);
                  }
                }}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{
                  color: "var(--red)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                Entfernen
              </button>
            </div>
          ))}
          {team.length === 0 && (
            <p
              className="text-sm italic"
              style={{ color: "var(--text-muted)" }}
            >
              Noch keine Team-Mitglieder hinzugefuegt.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddMember();
            }}
            className="flex-1 px-3 py-2 rounded-md border text-sm"
            style={inputStyle}
            placeholder="Name eingeben..."
          />
          <button
            onClick={handleAddMember}
            disabled={!newMember.trim()}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: newMember.trim() ? "var(--accent)" : "var(--bg-tertiary)",
              color: newMember.trim() ? "#ffffff" : "var(--text-muted)",
              cursor: newMember.trim() ? "pointer" : "not-allowed",
            }}
          >
            Hinzufuegen
          </button>
        </div>
      </div>

      {/* App Info */}
      <div
        className="rounded-lg border p-6"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Ueber die App
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Version</span>
            <span style={{ color: "var(--text-primary)" }}>v0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Framework</span>
            <span style={{ color: "var(--text-primary)" }}>Next.js</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Theme</span>
            <span style={{ color: "var(--text-primary)" }}>
              GitHub Dark (Obsidian)
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Task System</span>
            <span style={{ color: "var(--text-primary)" }}>v2 (Dynamic Columns)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
