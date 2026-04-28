import type { Reading } from "../types/BpTypes";

export function parseCSV(text: string) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(1);

    let valid = 0;
    let invalid = 0;

    const parsed = lines
      .map((line) => {
        const parts = line.split(";");

        const reading = {
          id: Number(parts[0]) || Date.now() + Math.random(),
          recorded_at: new Date(parts[1]).getTime(),
          systolic: Number(parts[2]),
          diastolic: Number(parts[3]),
          pulse: Number(parts[4]),
          comment: parts[5].toString(),
        };

        const isValid =
          !isNaN(reading.systolic) &&
          !isNaN(reading.diastolic) &&
          !isNaN(reading.pulse) &&
          !isNaN(reading.recorded_at);
        if (isValid) valid++;
        else invalid++;

        return isValid ? reading : null;
      })
      .filter(Boolean) as Reading[];

    return { parsed, total: lines.length, valid, invalid };
  }