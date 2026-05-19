import { useState } from "react";
import type { Reading } from "../types/BpTypes";
import type { Parsed } from "../types/ParsedData";
import { parseCSV } from "../utils/parseCSV";
import { getFingerprint } from "../utils/fingerprint";
import { detectDuplicates } from "../utils/detectDuplicates";
import { useTranslation } from "react-i18next";

export function useImportCSV({
  readings,
  setReadings,
}: {
  readings: Reading[];
  setReadings: React.Dispatch<React.SetStateAction<Reading[]>>;
}) {
  const [importPreview, setImportPreview] = useState<Parsed | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(false);

  const { t } = useTranslation();

  function handleFile(file: File) {
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setImportError(t("uploadCsv"));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      setImportError(t("readFail"));
    };

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") return;

        const result = parseCSV(text, t);

        const rowsWithDuplicates = detectDuplicates(readings, result.rows);

        if (result.error) {
          setImportError(result.error);
          setImportPreview(null);
        } else {
          setImportPreview({
            ...result,
            rows: rowsWithDuplicates,
          });

          setImportError(null);
        }
      } catch (err) {
        console.error(err);

        if (err instanceof Error) {
          setImportError(err.message);
        } else {
          setImportError(t("unknownError"));
        }

        setImportPreview(null);
      }
    };

    reader.readAsText(file);
  }

  function confirmImport() {
    if (!importPreview) return;

    const validRows = importPreview.rows.filter((r) => r.errors.length === 0);

    if (overwriteDuplicates) {
      const map = new Map<string, Reading>();

      readings.forEach((r) => {
        map.set(getFingerprint(r), r);
      });

      validRows.forEach((r) => {
        const data = r.data!;
        map.set(getFingerprint(data), data);
      });

      setReadings(Array.from(map.values()));
    } else {
      const clean = validRows.filter((r) => !r.isDuplicate).map((r) => r.data!);

      setReadings((prev) => [...prev, ...clean]);
    }
    setImportPreview(null);
  }

  function cancelImport() {
    setImportPreview(null);
  }

  return {
    handleFile,
    importPreview,
    importError,
    setImportError,
    confirmImport,
    cancelImport,
    overwriteDuplicates,
    setOverwriteDuplicates,
  };
}
