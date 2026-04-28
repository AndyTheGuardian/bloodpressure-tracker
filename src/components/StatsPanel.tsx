import type { Reading } from "../types/BpTypes";
import { getAverages, calculateTrend } from "../utils/trend";
import { getBPLevel, avgTextStyle, trendTextStyle } from "../utils/bp";

type Props = {
  sortedReadings: Reading[];
};

export function StatsPanel({ sortedReadings }: Props) {
  const averages = getAverages(sortedReadings);

  const { slope, trend } = calculateTrend(sortedReadings);

  const avgLevel = getBPLevel(averages.systolic, averages.diastolic);
  return (
    <div className="max-w-4xl bg-gray-100 dark:bg-gray-800 p-4 rounded rounded-t-xl shadow mt-4 mb-2 transition-colors duration-300">
      <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
        Average (Selected Range: {sortedReadings.length} readings)
      </h2>
      {sortedReadings.length === 0 ? (
        <p className="text-gray-500">No data</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 sm:place-content-evenly gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Systolic</p>
            <p className={avgTextStyle[avgLevel]}>{averages.systolic}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Diastolic</p>
            <p className={avgTextStyle[avgLevel]}>{averages.diastolic}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pulse</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {averages.pulse}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 text-wrap">
              Trend (Regression)
            </p>
            <div className="flex place-content-center">
              {trend === "up" && (
                <div className={trendTextStyle.up}>
                  <p>↑</p>
                  <p className="hidden md:block">&nbsp;Increasing</p>
                </div>
              )}
              {trend == "down" && (
                <div className={trendTextStyle.down}>
                  <p>↓</p>
                  <p className="hidden sm:block">&nbsp;Improving</p>
                </div>
              )}
              {trend == "stable" && (
                <div className={trendTextStyle.stable}>
                  <p>→</p>
                  <p className="hidden md:block">&nbsp;Stable</p>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-[6px] ml-2">
                {slope.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
