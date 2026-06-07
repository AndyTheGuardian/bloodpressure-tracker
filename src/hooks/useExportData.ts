import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import type { Reading } from "../types/BpTypes";
import { calculateStats } from "../utils/stats";
import { calculateTrend } from "../utils/trend";
import toast from "react-hot-toast";
import type { Options } from "../types/BpTypes";

export function useExportData(
  readings: Reading[],
  t: (key: string) => string,
  options: Options,
) {
  async function exportToCSV() {
    const headers = ["ID", "Date", "Systolic", "Diastolic", "Pulse", "Comment"];

    const rows = readings.map((r) => [
      r.id,
      new Date(r.recorded_at).toLocaleString(),
      r.systolic,
      r.diastolic,
      r.pulse,
      r.comment,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(";"))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });

    const fileName = "blood-pressure.csv";

    if (options.exportMode === "downloads") {
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(link.href);
    }

    if (options.exportMode === "ask" && "showSaveFilePicker" in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "CSV Files",
            accept: {
              "text/csv": [".csv"],
            },
          },
        ],
      });

      const writable = await handle.createWritable();

      await writable.write(blob);
      await writable.close();
    }

    // const url = URL.createObjectURL(blob);
    // const a = document.createElement("a");

    // a.href = url;
    // a.download = "blood-pressure.csv";
    // a.click();

    // URL.revokeObjectURL(url);

    toast.success(`CSV ${t("exported")}`);
  }

  function exportToPDF() {
    const doc = new jsPDF();

    const tableData = readings.map((r) => [
      dayjs(r.recorded_at).format("DD.MM.YYYY HH:mm"),
      r.systolic,
      r.diastolic,
      r.pulse,
      r.comment,
    ]);

    const stats = calculateStats(readings);

    const { trend } = calculateTrend(readings);

    doc.setFontSize(16);
    doc.text(`${t("bp")} Report`, 14, 15);

    doc.setFontSize(12);
    doc.text(
      `${t("average")}: ${stats.systolic} / ${stats.diastolic} (${t("pulse")}: ${stats.pulse})   Trend: ${
        trend === "up"
          ? t("rising")
          : trend === "down"
            ? t("falling")
            : t("stable")
      }`,
      14,
      25,
    );

    autoTable(doc, {
      startY: 30,
      head: [[t("date"), t("systolic"), t("diastolic"), t("pulse"), t("note")]],
      body: tableData,

      styles: {
        fontSize: 10,
      },

      headStyles: {
        fillColor: [59, 130, 246], // blue
      },
    });

    doc.save("blood-pressure.pdf");

    toast.success(`PDF ${t("exported")}`);
  }

  return {
    exportToCSV,
    exportToPDF,
  };
}
