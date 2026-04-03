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

  function getBPStyle(level: string) {
    switch (level) {
      case "crisis":
        return "bg-red-700 border-red-800 text-gray-50 font-bold";
      case "high2":
        return "bg-red-500 border-red-600 text-gray-50";
      case "high1":
        return "bg-orange-400 border-orange-500";
      case "elevated":
        return "bg-yellow-300 border-yellow-400";
      default:
        return "bg-green-500 border-green-600";
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md my-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">
          Blood Pressure Tracker
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="h-10 w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            placeholder="Systolic"
            value={form.systolic}
            onChange={(e) => setForm({ ...form, systolic: e.target.value })}
          />
          <input
            className="h-10 w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            placeholder="Diastolic"
            value={form.diastolic}
            onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
          />
          <input
            className="h-10 w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            placeholder="Pulse"
            value={form.pulse}
            onChange={(e) => setForm({ ...form, pulse: e.target.value })}
          />

          <button
            className="h-10 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 hover:cursor-pointer disabled:opacity-50 disabled:hover:bg-blue-500"
            disabled={!form.systolic || !form.diastolic || !form.pulse}
          >
            Add
          </button>
        </form>

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
            className="h-10 w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            className="h-10 w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <h2 className="text-md font-semibold mt-4 dark:text-gray-50 dark:text-opacity-60">
          Readings
        </h2>
        <ul className="mt-2 space-y-2">
          {filteredReadings.map((r) => {
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
