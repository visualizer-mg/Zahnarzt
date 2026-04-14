"use client";

import { useState } from "react";

const softwareOptions = [
  { name: "Dampsoft", format: "CSV", status: "geplant" },
  { name: "Z1", format: "CSV", status: "geplant" },
  { name: "Charly", format: "CSV", status: "geplant" },
  { name: "EVIDENT", format: "CSV", status: "geplant" },
];

export default function ImportPage() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Datenimport
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Importiere Abrechnungsdaten aus deiner Praxissoftware
        </p>
      </div>

      {/* Upload Area */}
      <div
        className="rounded-lg border-2 border-dashed p-12 mb-8 text-center transition-colors cursor-pointer"
        style={{
          backgroundColor: dragActive
            ? "var(--bg-tertiary)"
            : "var(--bg-secondary)",
          borderColor: dragActive ? "var(--accent)" : "var(--border)",
        }}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => setDragActive(false)}
      >
        <div className="text-4xl mb-4">📁</div>
        <p
          className="text-lg font-medium mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          CSV-Datei hierher ziehen
        </p>
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          oder klicke zum Auswählen
        </p>
        <button
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--accent)",
            color: "#ffffff",
          }}
        >
          Datei auswählen
        </button>
        <p
          className="text-xs mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Unterstützte Formate: .csv, .tsv — Keine Patientendaten, nur
          Leistungsziffern und Umsätze (DSGVO-konform)
        </p>
      </div>

      {/* Supported Software */}
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Unterstützte Praxissoftware
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {softwareOptions.map((sw) => (
          <div
            key={sw.name}
            className="rounded-lg border p-4"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {sw.name}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Format: {sw.format}
            </p>
            <span
              className="inline-block text-xs mt-2 px-2 py-0.5 rounded"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--amber)",
              }}
            >
              {sw.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
