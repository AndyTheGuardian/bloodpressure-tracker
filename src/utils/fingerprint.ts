import type { Reading } from "../types/BpTypes";

export function getFingerprint(r: Reading) {
  return `${r.id}-${r.systolic}-${r.diastolic}-${r.pulse}`;
}
