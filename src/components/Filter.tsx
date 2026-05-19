import { grayButtonStyle } from "../utils/bp";
import { useTranslation } from "react-i18next";

type Props = {
  onResetFilter: () => void;
  fromDate: string;
  setFromDate: any;
  toDate: string;
  setToDate: any;
  showFilter: Boolean;
  setShowFilter: any;
};

export function Filter({
  onResetFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  showFilter,
  setShowFilter,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex place-content-between">
        <h2 className="text-md font-semibold dark:text-gray-50 dark:text-opacity-60">
          <button onClick={() => setShowFilter(!showFilter)}>
            {t("filter")}
          </button>
        </h2>
        <button
          onClick={onResetFilter}
          className={`col-span-1 text-xs  ${grayButtonStyle}`}
        >
          {t("reset")}
        </button>
      </div>
      {showFilter && (
        <div className="flex flex-row sm:flex-row gap-2 mt-2">
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
      )}
    </>
  );
}
