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