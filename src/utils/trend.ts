import type { Reading } from "../types/BpTypes";

export function calculateTrend(
  readings: Reading[],
  type?: string, //"Sys" | "Dia" | "Pls",
) {
  if (readings.length < 2) {
    return { slope: 0, trend: "stable" as const };
  }

  // sort by date
  const sorted = [...readings].sort(
    (a, b) =>
      new Date(a.recorded_at || "").getTime() -
      new Date(b.recorded_at || "").getTime(),
  );

  let y = [0];
  // x = index, y = systolic
  const x = sorted.map((_, i) => i);
  switch (type) {
    case "Sys": {
      y = sorted.map((r) => r.systolic); // + r.diastolic) / 2);
      break;
    }
    case "Dia": {
      y = sorted.map((r) => r.diastolic);
      break;
    }
    case "Pls": {
      y = sorted.map((r) => r.pulse);
      break;
    }
    default: {
      y = sorted.map((r) => (r.systolic + r.diastolic) / 2);
      break;
    }
  }

  const n = x.length;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  // slope formula
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const intercept = (sumY - slope * sumX) / n;

  // predicted values (regression line)
  const trendLine = x.map((xi) => slope * xi + intercept);

  let trend: "up" | "down" | "stable" = "stable";

  if (slope > 0.5) trend = "up";
  else if (slope < -0.5) trend = "down";

  return { slope, trend, trendLine };
}
