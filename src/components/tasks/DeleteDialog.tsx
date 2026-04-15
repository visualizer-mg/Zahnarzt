"use client";

interface DeleteDialogProps {
  title: string;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function DeleteDialog({ title, onArchive, onDelete, onClose }: DeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="rounded-lg border shadow-2xl w-full max-w-sm mx-4"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Was soll mit &quot;{title}&quot; passieren?
          </h3>
        </div>

        {/* Options */}
        <div className="p-3 space-y-2">
          <button
            onClick={onArchive}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--amber)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <span className="text-lg">📦</span>
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--amber)" }}
              >
                Archivieren
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Bleibt im System, wird ausgeblendet
              </div>
            </div>
          </button>

          <button
            onClick={onDelete}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--red)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <span className="text-lg">🗑</span>
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--red)" }}
              >
                Dauerhaft loeschen
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Nicht rueckgaengig machbar
              </div>
            </div>
          </button>
        </div>

        {/* Cancel */}
        <div
          className="px-3 pb-3"
        >
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-md text-sm transition-colors"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-tertiary)",
            }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
