import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { generatePdf, type PdfColumn } from "../lib/pdf";

type GeneratePdfButtonProps = {
  title: string;
  label?: string;
  columns: PdfColumn[];
  disabled?: boolean;
};

export function GeneratePdfButton({ title, label = "Generate PDF", columns, disabled = false }: GeneratePdfButtonProps) {
  const onGenerate = () => {
    if (!generatePdf(title, columns)) {
      toast.error("Allow pop-ups for this site to generate the PDF.");
    }
  };

  return (
    <button
      type="button"
      onClick={onGenerate}
      disabled={disabled}
      title="Opens the print dialog; choose Save as PDF to download."
      className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
    >
      <FileDown className="h-4 w-4" /> {label}
    </button>
  );
}
