import type { Reading } from "../types/BpTypes";

export function calculateStats(readings: Reading[]) {
  if (readings.length === 0) {
    return {
      systolic: 0,
      diastolic: 0,
      pulse: 0,
      maxSys: 0,
      maxDia: 0,
      maxPul: 0,
      minSys: 0,
      minDia: 0,
      minPul: 0,
      count: 0,
    };
  }

  const sum = readings.reduce(
    (acc, r) => {
      acc.systolic += r.systolic;
      acc.diastolic += r.diastolic;
      acc.pulse += r.pulse;
      return acc;
    },
    { systolic: 0, diastolic: 0, pulse: 0 },
  );

  const count = readings.length;

  return {
    systolic: Math.round(sum.systolic / count),
    diastolic: Math.round(sum.diastolic / count),
    pulse: Math.round(sum.pulse / count),
    maxSys: Math.max(...readings.map((r) => r.systolic)),
    maxDia: Math.max(...readings.map((r) => r.diastolic)),
    maxPul: Math.max(...readings.map((r) => r.pulse)),
    minSys: Math.min(...readings.map((r) => r.systolic)),
    minDia: Math.min(...readings.map((r) => r.diastolic)),
    minPul: Math.min(...readings.map((r) => r.pulse)),
    count,
  };
}
