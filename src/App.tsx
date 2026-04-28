import { useEffect, useState } from "react";
import type { Reading, Options } from "./types/BpTypes";
import { getNow } from "./utils/date";
import { grayButtonStyle } from "./utils/bp";
import { parseCSV } from "./utils/csv";
import { getAverages, calculateTrend } from "./utils/trend";
import { useLocalStorage } from "./hooks/useLocalStorage";
import dayjs from "dayjs";
import BPChart from "./components/Chart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BpListPanel } from "./components/BpListPanel";
import { InputForm } from "./components/InputForm";
import { StatsPanel } from "./components/StatsPanel";
import { Filter } from "./components/Filter";

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

  const [importSummary, setImportSummary] = useState({
    total: 0,
    valid: 0,
    invalid: 0,
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [previewData, setPreviewData] = useState<Reading[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  function handleImportCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target; // store reference
    const file = input.files?.[0];
    file ? console.info("File exists") : console.warn("File doen't exist");
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;

      const { parsed, total, valid, invalid } = parseCSV(text);

      setPreviewData(parsed);
      setImportSummary({
        total,
        valid,
        invalid,
      });
      setShowPreview(true);

      // reset input
      input.value = "";
    };

    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;

      const { parsed, total, valid, invalid } = parseCSV(text);

      setPreviewData(parsed);
      setImportSummary({ total, valid, invalid });
      setShowPreview(true);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function confirmImport() {
    setReadings((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const newOnes = previewData.filter((r) => !existingIds.has(r.id));
      return [...prev, ...newOnes];
    });
    setPreviewData([]);
    setShowPreview(false);
  }

  function cancelImport() {
    setPreviewData([]);
    setShowPreview(false);
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

  const bpListPanelState = {
    options,
    setOptions,
    deleteAll,
    setDeleteAll,
  };

  const bpListPanelActions = {
    deleteAllReadings,
    confirmDeleteAll,
    deleteReading,
    handleEdit,
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
        <div className="w-full overflow-x-auto bg-gray-100 dark:bg-gray-800 p-4 rounded rounded-b-xl shadow mb-4 transition-colors duration-300">
          <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
            Trend
          </h2>
          <BPChart readings={sortedReadings} />
        </div>
        <Filter
          onResetFilter={resetFilter}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
        />
        {showPreview && (
          <div className="mt-4 bg-blue-50 dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Preview Import
            </h2>
            <p className="text-xs mb-1 text-gray-700 dark:text-gray-300">
              Showing first 5 of {previewData.length} entries
            </p>
            <div className="max-h-40 overflow-auto text-sm rounded shadow bg-gray-200 dark:bg-gray-900 p-2">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sys</th>
                    <th>Dia</th>
                    <th>Pulse</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((r) => (
                    <tr key={r.id}>
                      <td>{dayjs(r.recorded_at).format("DD.MM.YYYY HH:mm")}</td>
                      <td>{r.systolic}</td>
                      <td>{r.diastolic}</td>
                      <td>{r.pulse}</td>
                      <td>{r.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
              Total: {importSummary.total} |{" "}
              <span className="text-emerald-500 font-semibold">
                Valid: {importSummary.valid}
              </span>{" "}
              |{" "}
              <span className="text-red-500 font-semibold">
                Invalid: {importSummary.invalid}
              </span>
            </p>
            {importSummary.invalid > 0 && (
              <p className="text-red-500 text-sm mt-1">
                Some rows could not be imported.
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={confirmImport}
                disabled={importSummary.valid === 0}
                className="bg-emerald-600 text-white px-3 py-1 rounded hover:cursor-pointer hover:bg-emerald-500 disabled:opacity-50 transition duration-300"
              >
                Confirm Import
              </button>
              <button onClick={cancelImport} className={grayButtonStyle}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {options.showFileSection && (
          <div className="flex gap-1 mt-3">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`p-2 flex-1 w-1/2 border-2 border-dashed rounded-lg text-center transition hidden md:block ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-gray-700"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Drag & drop CSV here
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                or use file upload
              </p>
            </div>
            <div className="flex-1 md:w-1/2 flex flex-row md:grid md:grid-col-2 gap-1">
              <button
                onClick={exportToCSV}
                className={`w-1/4 md:w-full text-xs ${grayButtonStyle}`}
              >
                → CSV
              </button>
              <button
                onClick={exportToPDF}
                className={`w-1/4 md:w-full text-xs ${grayButtonStyle}`}
              >
                → PDF
              </button>
              <input
                type="file"
                accept=".csv"
                title="Import CSV"
                onChange={handleImportCSV}
                className="w-1/2 md:w-full md:col-span-2
                  text-xs text-gray-900 dark:text-gray-100 file:text-gray-900 dark:file:text-gray-100
                  file:py-1 file:px-2 file:h-full
                  file:rounded-s-xs file:border-none shadow-md
                  border-[1px] border-gray-300 dark:border-gray-700 rounded
                  bg-transparent file:bg-gray-300 dark:file:bg-gray-700
                  hover:cursor-pointer hover:file:bg-gray-400 
                  dark:hover:file:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-600
                  transition-colors duration-300 file:transition-colors file:duration-300"
              />
            </div>
          </div>
        )}
        <BpListPanel
          sortedReadings={sortedReadings}
          state={bpListPanelState}
          actions={bpListPanelActions}
        />
      </div>
    </div>
  );
}

export default App;
