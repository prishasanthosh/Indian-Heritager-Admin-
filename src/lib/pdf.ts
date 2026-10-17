export type PdfColumn = {
  label: string;
  value: (string | number)[];
};

export function formatDateTime(value: string | undefined): string {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function generatePdf(title: string, columns: PdfColumn[]): boolean {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  const headers = columns.map(({ label }) => `<th>${escapeHtml(label)}</th>`).join("");
  const rowCount = columns[0]?.value.length ?? 0;
  const rows = Array.from({ length: rowCount }, (_, rowIndex) =>
    `<tr>${columns.map(({ value }) => `<td>${escapeHtml(String(value[rowIndex] ?? ""))}</td>`).join("")}</tr>`
  ).join("");
  const generatedAt = formatDateTime(new Date().toISOString());

  printWindow.document.write(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body { font: 12px Arial, sans-serif; color: #172033; }
          h1 { font-size: 20px; margin: 0 0 6px; }
          p { color: #64748b; margin: 0 0 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
          th { background: #f1f5f9; }
          tr { break-inside: avoid; }
          @media print { thead { display: table-header-group; } }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>Generated ${escapeHtml(generatedAt)} · ${rowCount} records</p>
        <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
      </body>
    </html>`);
  printWindow.document.close();
    window.setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    }, 250);
  return true;
}
