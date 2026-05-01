import { useEffect, useState } from "react";
import type { Reading, Options } from "./types/BpTypes";
import { getNow } from "./utils/date";
import { grayButtonStyle } from "./utils/bp";
import { getAverages, calculateTrend } from "./utils/trend";
import { useLocalStorage } from "./hooks/useLocalStorage";
import dayjs from "dayjs";
import Chart from "./components/Chart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ReadingsPanel } from "./components/ReadingsPanel";
import { InputForm } from "./components/InputForm";
import { StatsPanel } from "./components/StatsPanel";
import { Filter } from "./components/Filter";
import { FileSection } from "./components/FileSection";
import { ImportPreviewModal } from "./components/ImportPreviewModal";
import { useImportExport } from "./hooks/useImportExport";

function App() {
  const [readings, setReadings] = useLocalStorage<Reading[]>("readings", []);

  const [options, setOptions] = useLocalStorage<Options>("options", {
    showComments: false,
    showGradient: false,
    showFileSection: false,
  });

  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    comment: "",
    datetime: getNow(),
  });

  const [settings, setSettings] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const {
    handleFile,
    importPreview,
    importError,
    confirmImport,
    cancelImport,
  } = useImportExport({ readings, setReadings });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");

    if (saved) return saved;

    return window.matchMedia("(prefers-color-scheme: dark").matches
      ? "dark"
      : "light";
  });

  const [deleteAll, setDeleteAll] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const filteredReadings = readings.filter((r) => {
    if (!r.recorded_at) return true;

    const date = new Date(r.recorded_at);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && date < from) return false;
    if (to && date > to) return false;

    return true;
  });

  const sortedReadings = [...filteredReadings].sort(
    (a, b) => b.recorded_at - a.recorded_at,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReading = {
      id: new Date(form.datetime).getTime(),
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      pulse: Number(form.pulse),
      comment: form.comment,
      recorded_at: form.datetime
        ? new Date(form.datetime).getTime()
        : Date.now(),
    };

    setReadings([...readings, newReading]);

    setForm({
      systolic: "",
      diastolic: "",
      pulse: "",
      comment: "",
      datetime: getNow(),
    });
  };

  const handleEdit = (
    id: number,
    sys: number,
    dia: number,
    pul: number,
    com: string,
    dat: string,
  ) => {
    setReadings(
      readings.map((r) =>
        r.id === id
          ? {
              ...r,
              systolic: Number(sys),
              diastolic: Number(dia),
              pulse: Number(pul),
              comment: com,
              recorded_at: new Date(dat).getTime(),
            }
          : r,
      ),
    );
  };

  const deleteReading = (id: number) => {
    setReadings(readings.filter((r) => id != r.id));
  };

  function exportToCSV() {
    const headers = ["ID", "Date", "Systolic", "Diastolic", "Pulse", "Comment"];

    const rows = sortedReadings.map((r) => [
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

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "blood-pressure.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  function exportToPDF() {
    const doc = new jsPDF();

    const tableData = sortedReadings.map((r) => [
      dayjs(r.recorded_at).format("DD.MM.YYYY HH:mm"),
      r.systolic,
      r.diastolic,
      r.pulse,
      r.comment,
    ]);

    const averages = getAverages(sortedReadings);

    const { trend } = calculateTrend(sortedReadings);

    doc.setFontSize(16);
    doc.text("Blood Pressure Report", 14, 15);

    doc.setFontSize(12);
    doc.text(
      `Average: ${averages.systolic}/${averages.diastolic} (Pulse: ${averages.pulse})   Trend: ${
        trend === "up" ? "rising" : trend === "down" ? "falling" : "stable"
      }`,
      14,
      25,
    );

    autoTable(doc, {
      startY: 30,
      head: [["Date", "Systolic", "Diastolic", "Pulse", "Comment"]],
      body: tableData,

      styles: {
        fontSize: 10,
      },

      headStyles: {
        fillColor: [59, 130, 246], // blue
      },
    });

    doc.save("blood-pressure.pdf");
  }

  function deleteAllReadings() {
    setDeleteAll(true);
  }

  function confirmDeleteAll() {
    setReadings([]);
    setDeleteAll(false);
  }

  function resetFilter() {
    setFromDate("");
    setToDate("");
  }

  const ReadingsPanelState = {
    options,
    setOptions,
    deleteAll,
    setDeleteAll,
  };

  const ReadingsPanelActions = {
    deleteAllReadings,
    confirmDeleteAll,
    deleteReading,
    handleEdit,
  };

  const FileSectionActions = {
    handleFile,
    exportToCSV,
    exportToPDF,
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
      <div className="w-screen max-w-4xl bg-gray-200 dark:bg-gray-900 p-6 rounded-xl shadow-md my-4 transition-colors duration-300">
        <div className="flex">
          <h1 className="flex-1 text-2xl font-bold mb-4 text-center dark:text-gray-100">
            Blood Pressure Tracker
          </h1>
          <button
            onClick={() => setSettings(!settings)}
            className="mb-4 text-gray-700 dark:text-gray-300"
          >
            &#9776;
          </button>
        </div>
        {/* <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-4 right-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 transition duration-300"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button> */}
        {settings && (
          <div className="max-w-4xl bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow mb-4 transition duration-300">
            <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
              Settings
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`rounded ${grayButtonStyle} transition duration-300`}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
              <button
                onClick={() =>
                  setOptions({
                    ...options,
                    showFileSection: !options.showFileSection,
                  })
                }
                className={`flex-shrink text-xs mb-2 ${
                  options.showFileSection
                    ? "bg-blue-600 hover:bg-blue-500 text-gray-100"
                    : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition duration-300`}
              >
                File Section
              </button>
              <button
                onClick={() =>
                  setOptions({
                    ...options,
                    showComments: !options.showComments,
                  })
                }
                className={`flex-shrink text-xs mb-2 ${
                  options.showComments
                    ? "bg-blue-600 hover:bg-blue-500 text-gray-100"
                    : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition duration-300`}
              >
                Comments
              </button>
            </div>
          </div>
        )}
        <InputForm
          form={form}
          setForm={setForm}
          isEditing={false}
          setIsEditing={null}
          onSubmit={handleSubmit}
          options={options}
        />
        <StatsPanel sortedReadings={sortedReadings} />
        <Chart readings={sortedReadings} />
        <Filter
          onResetFilter={resetFilter}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />
        {importError && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
            ⚠️ {importError}
          </div>
        )}
        {importPreview && (
          <ImportPreviewModal
            preview={importPreview}
            onConfirm={confirmImport}
            onCancel={cancelImport}
          />
        )}
        {options.showFileSection && (
          <FileSection actions={FileSectionActions} />
        )}
        <ReadingsPanel
          sortedReadings={sortedReadings}
          state={ReadingsPanelState}
          actions={ReadingsPanelActions}
        />
      </div>
    </div>
  );
}

export default App;
