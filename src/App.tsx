import { useEffect, useState } from "react";
import dayjs from "dayjs";
import BPChart from "./Chart";

type Reading = {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  recorded_at: number;
};

function App() {
  const [readings, setReadings] = useState<Reading[]>(() => {
    const saved = localStorage.getItem("readings");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const sysCr = 180;
  const sysH2 = 160;
  const sysH1 = 140;
  const sysEl = 130;

  const diaCr = 109;
  const diaH2 = 100;
  const diaH1 = 90;
  const diaEl = 85;

  const filteredReadings = readings.filter((r) => {
    if (!r.recorded_at) return true;

    const date = new Date(r.recorded_at);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && date < from) return false;
    if (to && date > to) return false;

    return true;
  });

  const reversedReadings = filteredReadings.reverse();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReading = {
      id: Date.now(),
      systolic: Number(form.systolic),
      diastolic: Number(form.diastolic),
      pulse: Number(form.pulse),
      recorded_at: Date.now(),
    };

    setReadings([...readings, newReading]);

    setForm({
      systolic: "",
      diastolic: "",
      pulse: "",
    });
  };

  const averages = (() => {
    if (filteredReadings.length === 0) {
      return { systolic: 0, diastolic: 0, pulse: 0 };
    }

    const sum = filteredReadings.reduce(
      (acc, r) => {
        acc.systolic += r.systolic;
        acc.diastolic += r.diastolic;
        acc.pulse += r.pulse;
        return acc;
      },
      { systolic: 0, diastolic: 0, pulse: 0 },
    );

    const count = filteredReadings.length;

    return {
      systolic: Math.round(sum.systolic / count),
      diastolic: Math.round(sum.diastolic / count),
      pulse: Math.round(sum.pulse / count),
    };
  })();

  const trendData = (() => {
    if (filteredReadings.length < 2) return { trend: "stable", diff: 0 };

    const sorted = [...filteredReadings].sort(
      (a, b) =>
        new Date(a.recorded_at || "").getTime() -
        new Date(b.recorded_at || "").getTime(),
    );

    const mid = Math.floor(sorted.length / 2);

    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const avg = (arr: typeof sorted) =>
      arr.reduce((sum, r) => sum + (r.systolic + r.diastolic) / 2, 0) /
      arr.length;

    const firstAvg = avg(firstHalf);
    const secondAvg = avg(secondHalf);

    const diff = secondAvg - firstAvg;

    let trend: "up" | "down" | "stable" = "stable";

    if (diff > 3) trend = "up";
    else if (diff < -3) trend = "down";

    return { trend, diff };
  })();

  const { trend, diff } = trendData;

  function calculateTrend(readings: typeof filteredReadings) {
    if (readings.length < 2) {
      return { slope: 0, trend: "stable" as const };
    }

    // sort by date
    const sorted = [...readings].sort(
      (a, b) =>
        new Date(a.recorded_at || "").getTime() -
        new Date(b.recorded_at || "").getTime(),
    );

    // x = index, y = systolic
    const x = sorted.map((_, i) => i);
    const y = sorted.map((r) => (r.systolic + r.diastolic) / 2);

    const n = x.length;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    // slope formula
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    let trend: "up" | "down" | "stable" = "stable";

    if (slope > 0.5) trend = "up";
    else if (slope < -0.5) trend = "down";

    return { slope, trend };
  }

  const trendDataReg = calculateTrend(filteredReadings);

  useEffect(() => {
    localStorage.setItem("readings", JSON.stringify(readings));
  }, [readings]);

  function getBPLevel(systolic: number, diastolic: number) {
    if (systolic >= sysCr || diastolic >= diaCr) return "crisis";
    if (systolic >= sysH2 || diastolic >= diaH2) return "high2";
    if (systolic >= sysH1 || diastolic >= diaH1) return "high1";
    if (systolic >= sysEl || diastolic >= diaEl) return "elevated";
    return "normal";
  }

  const colCrs = "red-700";
  const colHi2 = "red-500";
  const colHi1 = "orange-400";
  const colEle = "yellow-300";
  const colNrm = "green-500";

  function getBPStyle(level: string) {
    switch (level) {
      case "crisis":
        return `bg-${colCrs} border-red-800 text-gray-50 font-bold`;
      case "high2":
        return `bg-${colHi2} border-red-600 text-gray-50`;
      case "high1":
        return `bg-${colHi1} border-orange-500 text-gray-950`;
      case "elevated":
        return `bg-${colEle} border-yellow-400 text-gray-950`;
      default:
        return `bg-${colNrm} border-green-600 text-gray-950`;
    }
  }

  function getBPTextStyle(level: string) {
    switch (level) {
      case "crisis":
        return `text-${colCrs}`;
      case "high2":
        return `text-${colHi2}`;
      case "high1":
        return `text-${colHi1}`;
      case "elevated":
        return `text-${colEle}`;
      default:
        return `text-${colNrm}`;
    }
  }

  const avgLevel = getBPLevel(averages.systolic, averages.diastolic);
  const avgStyle = getBPTextStyle(avgLevel);

  return (
    <div className="min-h-screen min-w-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
      <div className="w-screen max-w-4xl bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md my-4">
        <h1 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">
          Blood Pressure Tracker
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-auto w-20 h-10 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:border-gray-950 dark:focus:border-gray-50"
            placeholder="Systolic"
            value={form.systolic}
            onChange={(e) => setForm({ ...form, systolic: e.target.value })}
          />
          <input
            className="flex-auto w-20  h-10 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:border-gray-950 dark:focus:border-gray-50"
            placeholder="Diastolic"
            value={form.diastolic}
            onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
          />
          <input
            className="flex-auto w-20 h-10 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:border-gray-950 dark:focus:border-gray-50"
            placeholder="Pulse"
            value={form.pulse}
            onChange={(e) => setForm({ ...form, pulse: e.target.value })}
          />
          <button
            className="flex-auto w-20 h-10 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 hover:cursor-pointer disabled:opacity-50 disabled:hover:bg-blue-500"
            disabled={!form.systolic || !form.diastolic || !form.pulse}
          >
            Add
          </button>
        </form>

        <div className="max-w-4xl bg-gray-50 dark:bg-gray-800 p-4 rounded shadow my-4">
          <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
            Average (Selected Range: {filteredReadings.length} readings)
          </h2>
          {filteredReadings.length === 0 ? (
            <p className="text-gray-500">No data</p>
          ) : (
            <div className="flex justify-around text-center">
              <div>
                <p className="text-sm text-gray-500">Systolic</p>
                <div className={`text-xl font-bold rounded ${avgStyle}`}>
                  <p className="text-xl font-bold">{averages.systolic}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Diastolic</p>
                <div className={`text-xl font-bold rounded ${avgStyle}`}>
                  <p className="text-xl font-bold">{averages.diastolic}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pulse</p>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {averages.pulse}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trend</p>
                <div className="flex">
                  {trend === "up" && (
                    <p className={`text-xl text-${colHi2} font-bold flex-1`}>
                      ↑ Increasing
                    </p>
                  )}
                  {trend == "down" && (
                    <p className={`text-xl text-${colNrm} font-bold flex-1`}>
                      ↓ Improving
                    </p>
                  )}
                  {trend == "stable" && (
                    <p className="text-xl text-gray-900 dark:text-gray-100 font-bold flex">
                      → Stable
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-[6px] ml-2 flex-nowrap">
                    {diff.toFixed(1)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trend (Regression)</p>
                <div className="flex">
                  {trendDataReg.trend === "up" && (
                    <p className={`text-xl text-${colHi2} font-bold flex-1`}>
                      ↑ Increasing
                    </p>
                  )}
                  {trendDataReg.trend == "down" && (
                    <p className={`text-xl text-${colNrm} font-bold flex-1`}>
                      ↓ Improving
                    </p>
                  )}
                  {trendDataReg.trend == "stable" && (
                    <p className="text-xl text-gray-900 dark:text-gray-100 font-bold flex">
                      → Stable
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-[6px] ml-2 flex-nowrap">
                    {trendDataReg.slope.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="max-w-4xl bg-gray-50 dark:bg-gray-800 p-4 rounded shadow my-4">
          <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
            Trend
          </h2>
          <BPChart readings={filteredReadings} />
        </div>

        <h2 className="text-md font-semibold mt-4 mb-2 dark:text-gray-50 dark:text-opacity-60">
          Filter
        </h2>

        <div className="flex gap-2">
          <input
            className="flex-1 h-10 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            className="flex-1 h-10 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <h2 className="text-md font-semibold mt-4 dark:text-gray-50 dark:text-opacity-60">
          Readings
        </h2>
        <ul className="mt-2 space-y-2">
          {reversedReadings.map((r) => {
            const level = getBPLevel(r.systolic, r.diastolic);
            const style = getBPStyle(level);

            return (
              <li
                key={r.id}
                className={`flex min-w-max p-2 border-2 rounded shadow-sm ${style}`}
              >
                <span className="flex-1 text-left">
                  {r.systolic} / {r.diastolic} (Pulse: {r.pulse})
                </span>
                <span className="flex-1 text-right">
                  {dayjs(r.recorded_at).format("DD.MM.YYYY HH:mm")}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
