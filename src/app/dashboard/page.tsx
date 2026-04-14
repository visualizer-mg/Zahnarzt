"use client";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
          Übersicht deiner Praxis-Kennzahlen
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Honorarstundenumsatz",
            value: "—",
            hint: "Daten importieren",
            color: "var(--accent)",
          },
          {
            label: "Gesamtumsatz",
            value: "—",
            hint: "Daten importieren",
            color: "var(--green)",
          },
          {
            label: "PLAN vs IST",
            value: "—",
            hint: "Daten importieren",
            color: "var(--amber)",
          },
          {
            label: "Stundensatz-Effekt",
            value: "—",
            hint: "Daten importieren",
            color: "var(--purple)",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg p-5 border"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              {kpi.label}
            </p>
            <p className="text-3xl font-bold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--text-muted)" }}
            >
              {kpi.hint}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder Chart Area */}
      <div
        className="rounded-lg border p-8 flex items-center justify-center"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
          minHeight: "300px",
        }}
      >
        <div className="text-center">
          <p
            className="text-lg font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            📈 Chart-Bereich
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            Hier erscheinen Diagramme, sobald Daten importiert wurden.
          </p>
        </div>
      </div>
    </div>
  );
}
