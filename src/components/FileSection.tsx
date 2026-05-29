import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  actions: {
    handleFile: (f: File) => void;
    exportToCSV: () => void;
    exportToPDF: () => void;
  };
};

export function FileSection({ actions }: Props) {
  const { handleFile, exportToCSV, exportToPDF } = actions;

  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();

    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    handleFile(file);
  }

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg text-center transition duration-200 hidden md:block  ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/30 scale-[1.02]"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <p className="mt-[6px] text-sm text-gray-600 dark:text-gray-300">
          {t("dragDrop")}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
          {t("useFileUpload")}
        </p>
      </div>
      <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-2">
        <div className="grid grid-cols-2 md:col-span-2 w-full gap-2">
          <button onClick={exportToCSV} className="w-full text-xs gray-button">
            <div className="flex place-content-center">
              <span className="-mt-[5px] text-sm">→</span>
              <svg
                className="w-4 h-4 pointer-events-none stroke-gray-800 dark:stroke-gray-200 outline-none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              >
                <path stroke-linecap="round" d="M13 3v6h6"></path>{" "}
                <path d="M13 3l6 6v12H5V3z"></path>
              </svg>
              <span className="ml-1">CSV</span>
            </div>
            {/* → CSV */}
          </button>
          <button onClick={exportToPDF} className="w-full text-xs gray-button">
            <div className="flex place-content-center">
              <span className="-mt-[5px] text-sm">→</span>
              <svg
                className="w-4 h-4 pointer-events-none stroke-gray-800 dark:stroke-gray-200 outline-none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              >
                <path stroke-linecap="round" d="M13 3v6h6"></path>{" "}
                <path d="M13 3l6 6v12H5V3z"></path>
              </svg>
              <span className="ml-1">PDF</span>
            </div>
            {/* → PDF */}
          </button>
        </div>
        <input
          type="file"
          accept=".csv"
          title="Import CSV"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
          className="md:col-span-2
                  text-xs text-gray-900 dark:text-gray-100 file:text-gray-900 dark:file:text-gray-100
                  file:py-1 file:px-2 file:h-full
                  file:rounded-s-xs file:border-none shadow-md
                  border-[1px] border-gray-300 dark:border-gray-700 rounded
                  bg-transparent file:bg-gray-300 dark:file:bg-gray-700
                  hover:cursor-pointer hover:file:bg-gray-400 
                  dark:hover:file:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-600
                  transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        />
      </div>
    </div>
  );
}
