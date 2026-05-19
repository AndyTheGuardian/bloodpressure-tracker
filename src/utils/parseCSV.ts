import type { Reading } from "../types/BpTypes";
import type { ParsedRow } from "../types/ParsedData";
import { REQUIRED_HEADERS } from "./csvSchema";

export function parseCSV(text: string, t: (key: string) => string) {
  const lines = text
    .replace(/^\ueFEFF/, "") // remove BOM (Byte Order Mark)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0 || lines[0].trim() === "") {
    return {
      rows: [],
      total: 0,
      valid: 0,
      invalid: 0,
      error: t("noHeader"),
    };
  }

  if (lines.length < 2) {
    return {
      rows: [],
      total: 0,
      valid: 0,
      invalid: 0,
      error: t("noDataRows"),
    };
  }

  const headers = lines[0].split(";").map((h) => h.trim().toLowerCase());

  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    //throw new Error(`Missing headers: ${missing.join(", ")}`);
    return {
      rows: [],
      total: 0,
      valid: 0,
      invalid: 0,
      error: `${t("missingHeaders")}: ${missing.join(", ")}`,
    };
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
      errors.push(t("invalidDate"));
    }

    if (isNaN(systolic)) errors.push(t("sysNumber"));

    if (isNaN(diastolic)) errors.push(t("diaNumber"));

    if (isNaN(pulse)) errors.push(t("plsNumber"));

    if (systolic < 70 || systolic > 250) errors.push(t("sysRange"));

    if (diastolic < 40 || diastolic > 150) errors.push(t("diaRange"));

    if (pulse < 30 || pulse > 220) errors.push(t("plsRange"));

    if (diastolic >= systolic) errors.push(t("diaGreaterSys"));

    if (errors.length > 0) {
      results.push({
        data: {
          id,
          systolic,
          diastolic,
          pulse,
          comment,
          recorded_at: timestamp,
        },
        errors,
      });
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

  const valid = results.filter((r) => r.errors.length === 0);
  const invalid = results.filter((r) => r.errors.length > 0);

  return {
    rows: results,
    parsed: valid.map((r) => r.data!) as Reading[],
    total: results.length,
    valid: valid.length,
    invalid: invalid.length,
    error: "",
  };
}
