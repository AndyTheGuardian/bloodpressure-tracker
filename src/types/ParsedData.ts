import type { Reading } from "./BpTypes";

export type ParsedRow = {
  data: Reading | null;
  errors: string[];
  isDuplicate?: boolean;
};

export type Parsed = {
  rows: ParsedRow[];
  total: number;
  valid: number;
  invalid: number;
  error: string;
};
