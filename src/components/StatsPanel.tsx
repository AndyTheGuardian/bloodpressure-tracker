import type { Reading } from "../types/BpTypes";
import { calculateTrend } from "../utils/trend";
import { calculateStats } from "../utils/stats";
import { getBPLevel, statTextStyle } from "../utils/bp";
import { StatCard } from "./StatCard";
import { TrendIndicator } from "./TrendIndicator";
import { useTranslation } from "react-i18next";
import { useState } from "react";

type Props = {
  sortedReadings: Reading[];
};

export function StatsPanel({ sortedReadings }: Props) {
  const stats = calculateStats(sortedReadings);

  const { t } = useTranslation();

  const trendType = ["", "Sys", "Dia", "Pls"];

  const [index, setIndex] = useState(0);

  const { slope, trend } = calculateTrend(sortedReadings, trendType[index]);

  const avgLevel = getBPLevel(stats.systolic, stats.diastolic);
  const maxLevel = getBPLevel(stats.maxSys, stats.maxDia);

  function switchTrend() {
    if (index < trendType.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  }

  return (
    <div className="max-w-4xl bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow mt-3 mb-2 transition-colors duration-300">
      <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
        <button onClick={switchTrend}>{t("stats")}</button>
      </h2>
      {sortedReadings.length === 0 ? (
        <p className="text-gray-500">No data</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 sm:place-content-evenly gap-4 text-center">
          <StatCard
            label={t("systolic")}
            value={<p className={statTextStyle[avgLevel]}>{stats.systolic}</p>}
          />
          <StatCard
            label={t("diastolic")}
            value={<p className={statTextStyle[avgLevel]}>{stats.diastolic}</p>}
          />
          <StatCard
            label={t("pulse")}
            value={
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {stats.pulse}
              </p>
            }
          />
          <StatCard
            label={`${trendType[index]} Trend (Regression)`}
            value={<TrendIndicator trend={trend} slope={slope} />}
          />
          <StatCard
            label={`Max ${t("systolic").toLowerCase()}`}
            value={<p className={statTextStyle[maxLevel]}>{stats.maxSys}</p>}
          />
          <StatCard
            label={`Max ${t("diastolic").toLowerCase()}`}
            value={<p className={statTextStyle[maxLevel]}>{stats.maxDia}</p>}
          />
          <StatCard
            label={`Max ${t("pulse")}`}
            value={
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {stats.maxPul}
              </p>
            }
          />
          <StatCard
            label={`${t("total")} ${t("readings")}`}
            value={
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {stats.count}
              </p>
            }
          />
        </div>
      )}
    </div>
  );
}
