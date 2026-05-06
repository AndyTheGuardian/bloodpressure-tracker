import { useState } from "react";
import { grayButtonStyle } from "../utils/bp";

type Props = {
  actions: {
    handleFile: (f: File) => void;
    exportToCSV: () => void;
    exportToPDF: () => void;
  };
};

export function FileSection({ actions }: Props) {
  const { handleFile, exportToCSV, exportToPDF } = actions;

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
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    handleFile(file);
  }

  return (
    <div className="flex gap-2 mt-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`flex-1 w-1/2 border-2 border-dashed rounded-lg text-center transition duration-200 hidden md:block  ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-gray-700 scale-[1.02]"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <p className="mt-[6px] text-sm text-gray-600 dark:text-gray-300">
          Drag & drop CSV here
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
          or use file upload
        </p>
      </div>
      <div className="flex-1 w-1/2 flex flex-row md:grid md:grid-col-2 gap-2">
        <button
          onClick={exportToCSV}
          className={`w-1/4 md:w-full text-xs ${grayButtonStyle}`}
        >
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
        <button
          onClick={exportToPDF}
          className={`w-1/4 md:w-full text-xs ${grayButtonStyle}`}
        >
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
        <input
          type="file"
          accept=".csv"
          title="Import CSV"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
          className="w-1/2 md:w-full md:col-span-2
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
