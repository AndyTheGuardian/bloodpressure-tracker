import type { Reading } from "../types/BpTypes";


export function getAverages(sortedReadings: Reading[] ) {
    if (sortedReadings.length === 0) {
      return { systolic: 0, diastolic: 0, pulse: 0 };
    }

    const sum = sortedReadings.reduce(
      (acc, r) => {
        acc.systolic += r.systolic;
        acc.diastolic += r.diastolic;
        acc.pulse += r.pulse;
        return acc;
      },
      { systolic: 0, diastolic: 0, pulse: 0 },
    );

    const count = sortedReadings.length;

    return {
      systolic: Math.round(sum.systolic / count),
      diastolic: Math.round(sum.diastolic / count),
      pulse: Math.round(sum.pulse / count),
    };
  };

export function calculateTrend(readings: Reading[]) {
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