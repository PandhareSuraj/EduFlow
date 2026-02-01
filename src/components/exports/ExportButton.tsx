import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: any, row?: any) => string;
}

export interface ExportSummary {
  totalRecords: number;
  additionalInfo?: Record<string, string | number>;
}

interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  title: string;
  formats?: ("excel" | "pdf" | "csv")[];
  filters?: Record<string, any>;
  summary?: ExportSummary;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

// Helper to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object") {
      return current[key];
    }
    return current;
  }, obj);
};

export function ExportButton({
  data,
  columns,
  filename,
  title,
  formats = ["excel", "pdf"],
  filters,
  summary,
  onExportStart,
  onExportComplete,
  disabled,
  variant = "outline",
  size = "default",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const { toast } = useToast();

  const exportToExcel = async () => {
    const wb = XLSX.utils.book_new();
    
    // Prepare data with headers
    const headers = columns.map((col) => col.label);
    const rows = data.map((row) =>
      columns.map((col) => {
        const value = getNestedValue(row, col.key);
        return col.formatter ? col.formatter(value, row) : value ?? "";
      })
    );

    // Create info section
    const infoData: any[][] = [];
    infoData.push([title]);
    infoData.push([`Generated on: ${format(new Date(), "PPP 'at' p")}`]);
    infoData.push([""]);

    if (filters) {
      infoData.push(["Filters Applied:"]);
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          infoData.push([`${key}: ${value}`]);
        }
      });
      infoData.push([""]);
    }

    if (summary) {
      infoData.push(["Summary:"]);
      infoData.push([`Total Records: ${summary.totalRecords}`]);
      if (summary.additionalInfo) {
        Object.entries(summary.additionalInfo).forEach(([key, value]) => {
          infoData.push([`${key}: ${value}`]);
        });
      }
      infoData.push([""]);
    }

    // Create worksheet with info and data
    const ws = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: `A${infoData.length + 1}` });
    XLSX.utils.sheet_add_aoa(ws, rows, { origin: `A${infoData.length + 2}` });

    // Auto-size columns
    const cols = columns.map(() => ({ wch: 20 }));
    ws["!cols"] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Report");

    const dateStr = format(new Date(), "yyyy-MM-dd");
    XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 20, { align: "center" });

    // Add generation date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated on: ${format(new Date(), "PPP 'at' p")}`,
      pageWidth / 2,
      30,
      { align: "center" }
    );

    // Add filters info if available
    let startY = 40;
    if (filters) {
      const activeFilters = Object.entries(filters).filter(
        ([_, value]) => value && value !== "all"
      );
      if (activeFilters.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Filters Applied:", 14, startY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        activeFilters.forEach(([key, value], index) => {
          doc.text(`${key}: ${value}`, 14, startY + 8 + index * 6);
        });
        startY += 8 + activeFilters.length * 6 + 10;
      }
    }

    // Prepare table data
    const tableColumns = columns.map((col) => col.label);
    const tableRows = data.map((row) =>
      columns.map((col) => {
        const value = getNestedValue(row, col.key);
        return col.formatter ? col.formatter(value, row) : String(value ?? "");
      })
    );

    // Add table
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: startY,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Add summary if available
    if (summary) {
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 14, finalY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Total Records: ${summary.totalRecords}`, 14, finalY + 8);

      if (summary.additionalInfo) {
        let yOffset = 16;
        Object.entries(summary.additionalInfo).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 14, finalY + yOffset);
          yOffset += 6;
        });
      }
    }

    const dateStr = format(new Date(), "yyyy-MM-dd");
    doc.save(`${filename}_${dateStr}.pdf`);
  };

  const exportToCSV = async () => {
    const headers = columns.map((col) => col.label);
    const rows = data.map((row) =>
      columns.map((col) => {
        const value = getNestedValue(row, col.key);
        const formatted = col.formatter ? col.formatter(value, row) : String(value ?? "");
        // Escape commas and quotes in CSV
        return formatted.includes(",") || formatted.includes('"')
          ? `"${formatted.replace(/"/g, '""')}"`
          : formatted;
      })
    );

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (exportType: "excel" | "pdf" | "csv") => {
    setIsExporting(true);
    setExportFormat(exportType);
    onExportStart?.();

    try {
      if (exportType === "excel") {
        await exportToExcel();
      } else if (exportType === "pdf") {
        await exportToPDF();
      } else {
        await exportToCSV();
      }

      toast({
        title: "Export Successful",
        description: `${title} exported as ${exportType.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportFormat(null);
      onExportComplete?.();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting || data.length === 0}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.includes("excel") && (
          <DropdownMenuItem onClick={() => handleExport("excel")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to Excel (.xlsx)
          </DropdownMenuItem>
        )}
        {formats.includes("pdf") && (
          <DropdownMenuItem onClick={() => handleExport("pdf")}>
            <FileText className="mr-2 h-4 w-4" />
            Export to PDF
          </DropdownMenuItem>
        )}
        {formats.includes("csv") && (
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
