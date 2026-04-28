import type { Reading, Options } from "../types/BpTypes";
import { grayButtonStyle, getBPLevel, getBPStyle } from "../utils/bp";
import { BpItem } from "./BpItem";

type Props = {
  sortedReadings: Reading[];

  state: {
    options: Options;
    setOptions: (options: Options) => void;
    deleteAll: boolean;
    setDeleteAll: (v: boolean) => void;
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

export function BpListPanel({ sortedReadings, state, actions }: Props) {
  const { options, setOptions, deleteAll, setDeleteAll } = state;
  const { deleteAllReadings, confirmDeleteAll, handleEdit, deleteReading } =
    actions;
  return (
    <div className="mt-3 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow transition-colors duration-300">
      <div className="flex gap-1">
        <h2
          className="flex-1 text-md font-semibold dark:text-gray-50 dark:text-opacity-60"
          onClick={() =>
            setOptions({ ...options, showGradient: !options.showGradient })
          }
        >
          Readings
        </h2>
        {/* <button
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
                        setOptions({ ...options, showComments: !options.showComments })
                      }
                      className={`flex-shrink text-xs mb-2 ${
                        options.showComments
                          ? "bg-blue-600 hover:bg-blue-500 text-gray-100"
                          : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                      } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition duration-300`}
                    >
                      Comments
                    </button> */}
        <button
          onClick={deleteAllReadings}
          className={`flex-shrink text-xs mb-2 ${grayButtonStyle}`}
        >
          Clear all
        </button>
      </div>
      {deleteAll && (
        <div>
          <p className=" mt-2 text-md text-gray-500">Delete all readings?</p>
          <div className="flex gap-2 mt-1 mb-6">
            <button
              onClick={confirmDeleteAll}
              disabled={sortedReadings.length === 0}
              className="bg-emerald-600 text-white px-3 py-1 rounded hover:cursor-pointer hover:bg-emerald-500 disabled:opacity-50"
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
      {sortedReadings.length === 0 ? (
        <p className="text-gray-500 mt-2">No data</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {sortedReadings.map((r) => {
            const level = getBPLevel(r.systolic, r.diastolic);
            const style = getBPStyle(level, options.showGradient);

            return (
              <li
                key={r.id}
                className={`flex p-2 rounded shadow-sm border-[1px] transition duration-300 ${style}`}
              >
                <BpItem
                  reading={r}
                  onEdit={handleEdit}
                  onDelete={deleteReading}
                  options={options}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
