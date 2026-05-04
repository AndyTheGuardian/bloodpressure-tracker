import type { Reading } from "../types/BpTypes";
import type { ParsedRow } from "../types/ParsedData";
import { getFingerprint } from "./fingerprint";

export function detectDuplicates(existing: Reading[], rows: ParsedRow[]) {
  const existingSet = new Set(
    Array.isArray(existing) ? existing.map(getFingerprint) : [],
  );

  const seen = new Set<string>();

  return rows.map((row) => {
    if (!row.data) {
      return {
        ...row,
        isDuplicate: false,
      };
    }

    const fp = getFingerprint(row.data);

    const isDuplicate = existingSet.has(fp) || seen.has(fp);

    seen.add(fp);

    return {
      ...row,
      isDuplicate,
    };
  });
}
