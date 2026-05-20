import { useState } from "react";
import type { Reading } from "../types/BpTypes";
import type { Parsed } from "../types/ParsedData";
import { parseCSV } from "../utils/parseCSV";
import { getFingerprint } from "../utils/fingerprint";
import { detectDuplicates } from "../utils/detectDuplicates";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

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
      toast.error(t("uploadCsv"));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      setImportError(t("readFail"));
      toast.error(t("readFail"));
    };

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") return;

        const result = parseCSV(text, t);

        const rowsWithDuplicates = detectDuplicates(readings, result.rows);

        if (result.error) {
          setImportError(result.error);
          toast.error(result.error);
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
          toast.error(err.message);
        } else {
          setImportError(t("unknownError"));
          toast.error(t("unknownError"));
        }

        setImportPreview(null);
      }
    };

    reader.readAsText(file);
  }

  function confirmImport() {
    if (!importPreview) return;

    const id = toast.loading(t("importing"));

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
      const mapped = Array.from(map.values());
      setReadings(mapped);
      toast.success(`${mapped.length} ${t("readingsImported")}`, { id });
    } else {
      const clean = validRows.filter((r) => !r.isDuplicate).map((r) => r.data!);

      setReadings((prev) => [...prev, ...clean]);
      toast.success(`${clean.length} ${t("readingsImported")}`, { id });
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
