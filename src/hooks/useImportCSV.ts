import { useState } from "react";
import type { Reading } from "../types/BpTypes";
import { parseCSV } from "../utils/parseCSV";
import { getFingerprint } from "../utils/fingerprint";

type PreviewRow = {
  data: Reading | null;
  errors: string[];
  isDuplicate?: boolean;
};

type Preview = {
  rows: PreviewRow[];
  total: number;
  valid: number;
  invalid: number;
};

export function useImportCSV({
  readings,
  setReadings,
}: {
  readings: Reading[];
  setReadings: React.Dispatch<React.SetStateAction<Reading[]>>;
}) {
  const [importPreview, setImportPreview] = useState<Preview | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function handleFile(file: File) {
    if (!file) return;

    const reader = new FileReader();

    reader.onerror = () => {
      setImportError("Failed to read file");
    };

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") return;

        const result = parseCSV(text);

        const existingSet = new Set(
          Array.isArray(readings) ? readings.map(getFingerprint) : [],
        );

        const seen = new Set<string>();

        const rowsWithDuplicates = result.rows.map((row) => {
          if (!row.data) return row;

          const fp = getFingerprint(row.data);

          const isDuplicate = existingSet.has(fp) || seen.has(fp);

          seen.add(fp);

          return {
            ...row,
            isDuplicate,
          };
        });

        setImportPreview({
          ...result,
          rows: rowsWithDuplicates,
        });

        setImportError(null);
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          setImportError(err.message);
        } else {
          setImportError("Unknown import error");
        }

        setImportPreview(null);
      }
    };

    reader.readAsText(file);
  }

  function confirmImport() {
    if (!importPreview) return;

    const clean = importPreview.rows
      .filter((r) => r.data && !r.isDuplicate)
      .map((r) => r.data!);

    setReadings((prev) => [...prev, ...clean]);

    setImportPreview(null);
  }

  function cancelImport() {
    setImportPreview(null);
  }

  return {
    handleFile,
    importPreview,
    importError,
    confirmImport,
    cancelImport,
  };
}
