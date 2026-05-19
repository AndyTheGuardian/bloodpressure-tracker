import { useEffect, useState } from "react";
import type { Reading, Options } from "./types/BpTypes";
import type { Theme } from "./types/theme";
import { getNow } from "./utils/date";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useImportCSV } from "./hooks/useImportCSV";
import { useExportData } from "./hooks/useExportData";
import { SettingsMenu } from "./components/SettingsMenu";
import Chart from "./components/Chart";
import { ReadingsPanel } from "./components/ReadingsPanel";
import { InputForm } from "./components/InputForm";
import { StatsPanel } from "./components/StatsPanel";
import { Filter } from "./components/Filter";
import { FileSection } from "./components/FileSection";
import { ImportPreviewModal } from "./components/ImportPreviewModal";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

function App() {
  const [readings, setReadings] = useLocalStorage<Reading[]>("readings", []);

  const [options, setOptions] = useLocalStorage<Options>("options", {
    showComments: false,
    showGradient: false,
    showFileSection: false,
    showPing: false,
    showStats: true,
    showFilter: true,
  });

  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    comment: "",
    datetime: getNow(),
  });

  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const {
    handleFile,
    importPreview,
    importError,
    setImportError,
    confirmImport,
    cancelImport,
    overwriteDuplicates,
    setOverwriteDuplicates,
  } = useImportCSV({ readings, setReadings });

  const { exportToCSV, exportToPDF } = useExportData(readings, t);

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark" || saved === "light") {
      return saved;
    }

    return window.matchMedia("(prefers-color-scheme: dark").matches
      ? "dark"
      : "light";
  });

  const [deleteAll, setDeleteAll] = useState(false);

  const [hoveredReadingId, setHoveredReadingId] = useState<number | null>(null);

  const [showFilter, setShowFilter] = useState(true);

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
    hoveredReadingId,
    setHoveredReadingId,
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
            {t("title")}
          </h1>
        </div>
        <SettingsMenu
          theme={theme}
          setTheme={setTheme}
          options={options}
          setOptions={setOptions}
        />
        <InputForm
          form={form}
          setForm={setForm}
          isEditing={false}
          setIsEditing={null}
          onSubmit={handleSubmit}
          options={options}
        />
        {options.showStats && <StatsPanel sortedReadings={sortedReadings} />}
        <Chart
          readings={sortedReadings}
          hoveredReadingId={hoveredReadingId}
          theme={theme}
        />
        {options.showFilter && (
          <Filter
            onResetFilter={resetFilter}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            showFilter={showFilter}
            setShowFilter={setShowFilter}
          />
        )}
        {importError && (
          <div className="mt-3 p-3 flex place-content-between bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
            <p>⚠️ {importError}</p>
            <button
              className="text-red-700"
              onClick={() => setImportError(null)}
            >
              <X />
            </button>
          </div>
        )}
        {importPreview && (
          <ImportPreviewModal
            preview={importPreview}
            onConfirm={confirmImport}
            onCancel={cancelImport}
            overwriteDuplicates={overwriteDuplicates}
            setOverwriteDuplicates={setOverwriteDuplicates}
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
