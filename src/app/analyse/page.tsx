"use client";

export default function AnalysePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Analyse
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Detaillierte Auswertungen und Vergleiche
        </p>
      </div>

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          {
            title: "Honorarstundenumsatz",
            description:
              "Umsatz pro Behandlungsstunde — der wichtigste KPI für deine Praxis-Effizienz.",
            icon: "⏱️",
          },
          {
            title: "PLAN vs IST Vergleich",
            description:
              "Vergleiche geplante Ziele mit tatsächlichen Ergebnissen pro Quartal.",
            icon: "🎯",
          },
          {
            title: "Stundensatz-Effekte",
            description:
              "Wie wirken sich Änderungen im Stundensatz auf den Gesamtumsatz aus?",
            icon: "💡",
          },
          {
            title: "Zeitraum-Vergleich",
            description:
              "Vergleiche verschiedene Zeiträume miteinander (Monat, Quartal, Jahr).",
            icon: "📅",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-lg border p-6"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.title}
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description}
                </p>
                <p
                  className="text-xs mt-3 italic"
                  style={{ color: "var(--text-muted)" }}
                >
                  Verfügbar nach Datenimport
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
