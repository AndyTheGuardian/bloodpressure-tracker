import type { Reading, Options } from "../types/BpTypes";
import { grayButtonStyle, getBPLevel, getBPStyle } from "../utils/bp";
import { ReadingItem } from "./ReadingItem";
import { useTranslation } from "react-i18next";

type Props = {
  sortedReadings: Reading[];

  state: {
    options: Options;
    setOptions: (options: Options) => void;
    deleteAll: boolean;
    setDeleteAll: (v: boolean) => void;
    hoveredReadingId: number | null;
    setHoveredReadingId: (id: number | null) => void;
  };

  actions: {
    deleteAllReadings: () => void;
    confirmDeleteAll: () => void;
    handleEdit: (
      id: number,
      sys: number,
      dia: number,
      pul: number,
      com: string,
      dat: string,
    ) => void;
    deleteReading: (id: number) => void;
  };
};

export function ReadingsPanel({ sortedReadings, state, actions }: Props) {
  const { options, setOptions, deleteAll, setDeleteAll, setHoveredReadingId } =
    state;
  const { deleteAllReadings, confirmDeleteAll, handleEdit, deleteReading } =
    actions;
  const { t } = useTranslation();
  return (
    <div className="mt-3 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow">
      <div className="flex gap-1">
        <h2
          className="flex-1 text-md font-semibold dark:text-gray-50/60"
          onClick={() =>
            setOptions({ ...options, showGradient: !options.showGradient })
          }
        >
          {t("readings")}
        </h2>
        <button
          onClick={deleteAllReadings}
          className={`text-xs mb-2 ${grayButtonStyle} disabled`}
          disabled={sortedReadings.length === 0}
        >
          {t("clearAll")}
        </button>
      </div>
      {deleteAll && (
        <div>
          <p className=" mt-2 text-md font-semibold text-gray-600 dark:text-gray-400">
            {t("deleteAllReadings")}
          </p>
          <div className="flex gap-2 mt-1 mb-6">
            <button
              onClick={confirmDeleteAll}
              className="bg-emerald-600 text-white px-3 py-1 
              rounded hover:cursor-pointer hover:bg-emerald-500 
              shadow-md disabled:opacity-50 transition-all duration-200 
              hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("confirmDelete")}
            </button>
            <button
              onClick={() => setDeleteAll(false)}
              className={grayButtonStyle}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      {sortedReadings.length === 0 ? (
        <p className="text-gray-500 mt-2">No data</p>
      ) : (
        <div className="mt-1 max-h-[40vh] md:max-h-[60vh] overflow-y-auto">
          <ul className="space-y-2 px-2">
            {sortedReadings.map((r) => {
              const level = getBPLevel(r.systolic, r.diastolic);
              const style = getBPStyle(level, options.showGradient);

              return (
                <li
                  key={r.id}
                  className={`flex p-2 rounded shadow-sm border-[1px] transition-all duration-200 hover:scale-[1.02] ${style}`}
                  onMouseEnter={() =>
                    options.showPing && setHoveredReadingId(r.id)
                  }
                  onMouseLeave={() => setHoveredReadingId(null)}
                >
                  <ReadingItem
                    reading={r}
                    onEdit={handleEdit}
                    onDelete={deleteReading}
                    options={options}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
