import type { Reading } from "../types/BpTypes";
import { REQUIRED_HEADERS } from "./csvSchema";

type ParsedRow = {
  data: Reading | null;
  errors: string[];
  isDuplicate?: boolean;
};

export function parseCSV(text: string) {
  const lines = text
    .replace(/^\ueFEFF/, "") // remove BOM (Byte Order Mark)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0); // remove empty lines

  if (lines.length < 2) {
    throw new Error("CSV must contain header + at least one row");
  }

  const headers = lines[0].split(";").map((h) => h.trim().toLowerCase());

  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(`Missing headers: ${missing.join(", ")}`);
  }

  const results: ParsedRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = lines[i].split(";");

    // skip header row explicitly
    const isHeader = (row: string[]) =>
      row[0].toLowerCase() === "id" && row[1].toLowerCase() === "date";
    if (isHeader(row)) continue;

    const errors: string[] = [];

    const id = Number(row[0]) || Date.now() + Math.random();
    const dateStr = row[1];
    const systolic = Number(row[2]);
    const diastolic = Number(row[3]);
    const pulse = Number(row[4]);
    const comment = row[5];

    const timestamp = new Date(dateStr).getTime();
    if (isNaN(timestamp)) {
      errors.push("Invalid date");
    }

    if (isNaN(systolic)) errors.push("Systolic must be a number");

    if (isNaN(diastolic)) errors.push("Diastolic must be a number");

    if (isNaN(pulse)) errors.push("Pulse must be a number");

    if (systolic < 70 || systolic > 250) errors.push("Systolic out of range");

    if (diastolic < 40 || diastolic > 150)
      errors.push("Diastolic out of range");

    if (pulse < 30 || pulse > 220) errors.push("Pulse out of range");

    if (diastolic >= systolic) errors.push("Diastolic >= Systolic");

    if (errors.length > 0) {
      results.push({ data: null, errors });
    } else {
      results.push({
        data: {
          id,
          systolic,
          diastolic,
          pulse,
          comment,
          recorded_at: timestamp,
        },
        errors: [],
      });
    }
  }

  const valid = results.filter((r) => r.data !== null);
  const invalid = results.filter((r) => r.data === null);

  return {
    rows: results,
    parsed: valid.map((r) => r.data!) as Reading[],
    total: results.length,
    valid: valid.length,
    invalid: invalid.length,
  };
}
