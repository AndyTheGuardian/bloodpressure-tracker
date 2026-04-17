import { useEffect, useState } from "react";
import dayjs from "dayjs";
import BPChart from "./Chart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRef } from "react";

type Reading = {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  comment: string;
  recorded_at: number;
};

function App() {
  const [readings, setReadings] = useState<Reading[]>(() => {
    const saved = localStorage.getItem("readings");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    comment: "",
    datetime: getNow(),
  });

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

  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
    refSys.current?.focus();
  }, [theme]);

  function getNow() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  const sysCr = 180;
  const sysH2 = 160;
  const sysH1 = 140;
  const sysEl = 130;

  const diaCr = 109;
  const diaH2 = 100;
  const diaH1 = 90;
  const diaEl = 85;

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

  const refSys = useRef<HTMLInputElement>(null);
  const refDia = useRef<HTMLInputElement>(null);
  const refPls = useRef<HTMLInputElement>(null);
  const refCom = useRef<HTMLInputElement>(null);
  const refDat = useRef<HTMLInputElement>(null);

  function handleEnter(
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLInputElement | null>,
  ) {
    if (!showComments && nextRef === refCom) nextRef = refDat;
    if (e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  }

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

    refSys.current?.focus();
  };

  const deleteReading = (id: number) => {
    setReadings(readings.filter((r) => id != r.id));
  };

  const averages = (() => {
    if (filteredReadings.length === 0) {
      return { systolic: 0, diastolic: 0, pulse: 0 };
    }

    const sum = filteredReadings.reduce(
      (acc, r) => {
        acc.systolic += r.systolic;
        acc.diastolic += r.diastolic;
        acc.pulse += r.pulse;
        return acc;
      },
      { systolic: 0, diastolic: 0, pulse: 0 },
    );

    const count = sortedReadings.length;

    return {
      systolic: Math.round(sum.systolic / count),
      diastolic: Math.round(sum.diastolic / count),
      pulse: Math.round(sum.pulse / count),
    };
  })();

  function calculateTrend(readings: typeof sortedReadings) {
    if (readings.length < 2) {
      return { slope: 0, trend: "stable" as const };
    }

    // sort by date
    const sorted = [...readings].sort(
      (a, b) =>
        new Date(a.recorded_at || "").getTime() -
        new Date(b.recorded_at || "").getTime(),
    );

    // x = index, y = systolic
    const x = sorted.map((_, i) => i);
    const y = sorted.map((r) => (r.systolic + r.diastolic) / 2);

    const n = x.length;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    // slope formula
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    let trend: "up" | "down" | "stable" = "stable";

    if (slope > 0.5) trend = "up";
    else if (slope < -0.5) trend = "down";

    return { slope, trend };
  }

  const { slope, trend } = calculateTrend(sortedReadings);

  useEffect(() => {
    localStorage.setItem("readings", JSON.stringify(readings));
  }, [readings]);

  function getBPLevel(systolic: number, diastolic: number) {
    if (systolic >= sysCr || diastolic >= diaCr) return "crisis";
    if (systolic >= sysH2 || diastolic >= diaH2) return "high2";
    if (systolic >= sysH1 || diastolic >= diaH1) return "high1";
    if (systolic >= sysEl || diastolic >= diaEl) return "elevated";
    return "normal";
  }

  function getBPStyle(level: string) {
    switch (level) {
      case "crisis":
        return `bg-red-700 border-red-800 text-gray-50 font-bold`;
      case "high2":
        return `bg-red-500 border-red-600 text-gray-50`;
      case "high1":
        return `bg-orange-400 border-orange-500 text-gray-950`;
      case "elevated":
        return `bg-yellow-300 border-yellow-400 text-gray-950`;
      default:
        return `bg-green-500 border-green-600 text-gray-950`;
    }
  }

  const avgLevel = getBPLevel(averages.systolic, averages.diastolic);

  const avgTextStyle = {
    crisis: `text-xl font-bold underline underline-offset-2 decoration-red-700`,
    high2: `text-xl font-bold underline underline-offset-2 decoration-red-300 dark:decoration-red-500`,
    high1: `text-xl font-bold underline underline-offset-2 decoration-orange-400`,
    elevated: `text-xl font-bold underline underline-offset-2 decoration-yellow-500 dark:decoration-yellow-300`,
    normal: `text-xl font-bold underline underline-offset-2 decoration-green-500`,
  };

  const trendTextStyle = {
    up: "text-xl underline underline-offset-2 decoration-red-400 dark:decoration-red-700 font-bold flex justify-center",
    down: "text-xl underline underline-offset-2 decoration-green-500 font-bold flex justify-center",
    stable:
      "text-xl text-gray-900 dark:text-gray-100 font-bold flex justify-center",
  };

  const grayButtonStyle =
    "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md hover:bg-gray-400 dark:hover:bg-gray-600";

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

  function parseCSV(text: string) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(1);

    let valid = 0;
    let invalid = 0;

    const parsed = lines
      .map((line) => {
        const parts = line.split(";");

        const reading = {
          id: Number(parts[0]) || Date.now() + Math.random(),
          recorded_at: new Date(parts[1]).getTime(),
          systolic: Number(parts[2]),
          diastolic: Number(parts[3]),
          pulse: Number(parts[4]),
          comment: parts[5].toString(),
        };

        const isValid =
          !isNaN(reading.systolic) &&
          !isNaN(reading.diastolic) &&
          !isNaN(reading.pulse) &&
          !isNaN(reading.recorded_at);
        if (isValid) valid++;
        else invalid++;

        return isValid ? reading : null;
      })
      .filter(Boolean) as Reading[];

    return { parsed, total: lines.length, valid, invalid };
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
      // new Date(r.recorded_at).toLocaleString(),
      dayjs(r.recorded_at).format("DD.MM.YYYY HH:mm"),
      r.systolic,
      r.diastolic,
      r.pulse,
      r.comment,
    ]);

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

  return (
    <div className="min-h-screen min-w-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center transition-colors duration-300">
      <div className="w-screen max-w-4xl bg-gray-200 dark:bg-gray-900 p-6 rounded-xl shadow-md my-4 transition-colors duration-300">
        <h1 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">
          Blood Pressure Tracker
        </h1>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-4 right-4 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            className="w-full sm:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
            placeholder="Systolic"
            value={form.systolic}
            ref={refSys}
            onKeyDown={(e) => handleEnter(e, refDia)}
            onChange={(e) => setForm({ ...form, systolic: e.target.value })}
          />
          <input
            className="w-full sm:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
            placeholder="Diastolic"
            value={form.diastolic}
            ref={refDia}
            onKeyDown={(e) => handleEnter(e, refPls)}
            onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
          />
          <input
            className="w-full sm:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
            placeholder="Pulse"
            value={form.pulse}
            ref={refPls}
            onKeyDown={(e) => handleEnter(e, refCom)}
            onChange={(e) => setForm({ ...form, pulse: e.target.value })}
          />
          <input
            className={`w-full sm:flex-1 h-10 p-2 border ${showComments ? "block" : "hidden"} rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300`}
            placeholder="Comment"
            type="text"
            value={form.comment}
            ref={refCom}
            onKeyDown={(e) => handleEnter(e, refDat)}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          <input
            className="w-full sm:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
            type="datetime-local"
            value={form.datetime}
            ref={refDat}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
          />
          <button
            className="w-full sm:w-auto h-10 bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 hover:cursor-pointer disabled:opacity-50 disabled:hover:bg-blue-500 focus:border-gray-400 dark:focus:border-gray-500"
            disabled={!form.systolic || !form.diastolic || !form.pulse}
          >
            Add
          </button>
        </form>

        <div className="max-w-4xl bg-gray-100 dark:bg-gray-800 p-4 rounded rounded-t-xl shadow mt-4 mb-2 transition-colors duration-300">
          <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
            Average (Selected Range: {filteredReadings.length} readings)
          </h2>
          {filteredReadings.length === 0 ? (
            <p className="text-gray-500">No data</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 sm:place-content-evenly gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Systolic</p>
                <p className={avgTextStyle[avgLevel]}>{averages.systolic}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Diastolic</p>
                <p className={avgTextStyle[avgLevel]}>{averages.diastolic}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pulse</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {averages.pulse}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 text-wrap">
                  Trend (Regression)
                </p>
                <div className="flex place-content-center">
                  {trend === "up" && (
                    <div className={trendTextStyle.up}>
                      <p>↑</p>
                      <p className="hidden md:block">&nbsp;Increasing</p>
                    </div>
                  )}
                  {trend == "down" && (
                    <div className={trendTextStyle.down}>
                      <p>↓</p>
                      <p className="hidden sm:block">&nbsp;Improving</p>
                    </div>
                  )}
                  {trend == "stable" && (
                    <div className={trendTextStyle.stable}>
                      <p>→</p>
                      <p className="hidden md:block">&nbsp;Stable</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-[6px] ml-2">
                    {slope.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-full overflow-x-auto bg-gray-100 dark:bg-gray-800 p-4 rounded rounded-b-xl shadow mb-4 transition-colors duration-300">
          <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
            Trend
          </h2>
          <BPChart readings={sortedReadings} />
        </div>

        {/* <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow"> */}
        <div className="flex place-content-between">
          <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
            Filter
          </h2>
          <button
            onClick={resetFilter}
            className={`col-span-1 text-xs mb-2 ${grayButtonStyle}`}
          >
            Reset
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="w-full sd:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
            //type="datetime-local"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            className="w-full sd:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
            //type="datetime-local"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        {/* <div className="flex tex-sm">
          <p className="flex-1">{dayjs(fromDate).format("DD.MM.YYYY HH:mm")}</p>
          <p className="flex-1">{dayjs(toDate).format("DD.MM.YYYY HH:mm")}</p>
        </div> */}
        {/*</div>*/}

        {/* <div className="mt-3 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow transition-colors duration-300">
          <h2 className="text-md font-semibold dark:text-gray-50 dark:text-opacity-60">
            File section
          </h2> */}
        {showPreview && (
          <div className="mt-4 bg-blue-50 dark:bg-gray-800 p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Preview Import</h2>
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
              <span className="text-green-500 font-semibold">
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
                className="bg-green-600 text-white px-3 py-1 rounded hover:cursor-pointer hover:bg-green-500 disabled:opacity-50"
              >
                Confirm Import
              </button>
              <button onClick={cancelImport} className={grayButtonStyle}>
                Cancel
              </button>
            </div>
          </div>
        )}
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
                  transition-colors duration-300"
            />
          </div>
        </div>
        {/* </div> */}
        <div className="mt-3 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow transition-colors duration-300">
          <div className="flex gap-1">
            <h2 className="flex-1 text-md font-semibold dark:text-gray-50 dark:text-opacity-60">
              Readings
            </h2>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex-shrink text-xs mb-2 ${
                showComments
                  ? "bg-blue-600 hover:bg-blue-500 text-gray-1000"
                  : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
              } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md`}
            >
              Comments
            </button>
            <button
              onClick={deleteAllReadings}
              className={`flex-shrink text-xs mb-2 ${grayButtonStyle}`}
            >
              Clear all
            </button>
          </div>
          {deleteAll && (
            <div>
              <p className=" mt-2 text-md text-gray-500">
                Delete all readings?
              </p>
              <div className="flex gap-2 mt-1 mb-6">
                <button
                  onClick={confirmDeleteAll}
                  disabled={readings.length === 0}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:cursor-pointer hover:bg-green-500 disabled:opacity-50"
                >
                  Confirm delete
                </button>
                <button
                  onClick={() => setDeleteAll(false)}
                  className={grayButtonStyle}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {filteredReadings.length === 0 ? (
            <p className="text-gray-500 mt-2">No data</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {sortedReadings.map((r) => {
                const level = getBPLevel(r.systolic, r.diastolic);
                const style = getBPStyle(level);

                return (
                  <li
                    key={r.id}
                    className={`flex p-2 border-2 rounded shadow-sm ${style}`}
                  >
                    <div className="flex flex-grow flex-col sm:flex-row ">
                      <span className="flex-1 text-left">
                        {r.systolic} / {r.diastolic} (Pulse: {r.pulse})
                      </span>
                      <span
                        className={`flex-1 text-center ${showComments ? "block" : "hidden"}`}
                      >
                        {r.comment}
                      </span>
                      <span className="flex-1 sm:text-right">
                        {dayjs(r.recorded_at).format("DD.MM.YYYY HH:mm")}
                      </span>
                    </div>
                    <button
                      className="-m-2 ml-3 px-2 text-gray-950 bg-red-500 bg-opacity-10 hover:bg-opacity-100"
                      onClick={() => deleteReading(r.id)}
                    >
                      ❌
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
