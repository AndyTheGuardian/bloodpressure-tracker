import dayjs from "dayjs";
import type { Parsed } from "../types/ParsedData";
import { useTranslation } from "react-i18next";
import Checkbox from "./CheckBox";

type Props = {
  preview: Parsed;
  onConfirm: () => void;
  onCancel: () => void;
  overwriteDuplicates: boolean;
  setOverwriteDuplicates: (v: boolean) => void;
};

export function ImportPreviewModal({
  preview,
  onConfirm,
  onCancel,
  overwriteDuplicates,
  setOverwriteDuplicates,
}: Props) {
  const duplicates = preview.rows.filter((r) => r.isDuplicate).length;
  const { t } = useTranslation();
  const calculatedImport = overwriteDuplicates
    ? preview.rows.filter((p) => p.errors.length === 0).length
    : preview.rows.filter((p) => p.errors.length === 0 && !p.isDuplicate)
        .length;

  return (
    <div className="mt-4 bg-blue-50 dark:bg-gray-800 p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
        {t("previewImport")}
      </h2>
      {/* <p className="text-xs mb-1 text-gray-700 dark:text-gray-300">
        Showing first 5 of {preview.rows.length} entries
      </p> */}
      <div className="max-h-40 overflow-auto text-sm rounded shadow bg-gray-200 dark:bg-gray-900 p-2">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>{t("date")}</th>
              <th>Sys</th>
              <th>Dia</th>
              <th>{t("pulse")}</th>
              <th>{t("note")}</th>
            </tr>
          </thead>
          <tbody>
            {preview.rows.slice(0, preview.rows.length).map((r) => (
              <tr
                key={r.data?.id}
                className={
                  r.errors.length
                    ? "bg-red-100 dark:bg-red-900/40"
                    : r.isDuplicate
                      ? "bg-yellow-100 dark:bg-yellow-900/40"
                      : ""
                }
              >
                <td>{dayjs(r.data?.recorded_at).format("DD.MM.YYYY HH:mm")}</td>
                <td>{r.data?.systolic}</td>
                <td>{r.data?.diastolic}</td>
                <td>{r.data?.pulse}</td>
                <td>{r.data?.comment}</td>
                <td>
                  {r.errors.join(", ")}
                  {r.isDuplicate && ` ${t("duplicate")}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
        {t("total")}: {preview.total} |{" "}
        <span className="text-emerald-500 font-semibold">
          {t("valid")}: {preview.valid}
        </span>{" "}
        |{" "}
        <span className="text-red-500 font-semibold">
          {t("invalid")}: {preview.invalid}
        </span>{" "}
        |{" "}
        <span className="text-yellow-500 font-semibold">
          {t("duplicates")}: {duplicates}
        </span>
      </p>
      {preview.invalid > 0 && (
        <p className="text-red-500 text-sm mt-1 font-semibold">
          {t("someRows")}
        </p>
      )}
      {duplicates > 0 && (
        <Checkbox
          id="duplicates"
          label={t("overwriteDuplicates")}
          sublabel={
            overwriteDuplicates
              ? `${duplicates} ${t("entriesReplaced")}`
              : `${duplicates} ${t("duplicatesSkipped")}`
          }
          checked={overwriteDuplicates}
          onChange={(e) => setOverwriteDuplicates(e.target.checked)}
        />
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={onConfirm} className="px-2 py-1 green-button">
          <span>{t("confirmImport")}</span>
          {preview.invalid > 0 || (!overwriteDuplicates && duplicates > 0)
            ? ` ${calculatedImport}/${preview.total}`
            : ""}
        </button>
        <button onClick={onCancel} className="gray-button text-base">
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
