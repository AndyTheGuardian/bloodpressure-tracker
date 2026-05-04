import { describe, it, expect } from "vitest";
import { detectDuplicates } from "../detectDuplicates";

const baseReading = {
  id: 1,
  systolic: 120,
  diastolic: 80,
  pulse: 70,
  recorded_at: 123,
  comment: "test",
};

describe("detectDuplicates", () => {
  it("detects duplicates against existing data", () => {
    const existing = [baseReading];

    const rows = [{ data: baseReading, errors: [] }];

    const result = detectDuplicates(existing, rows);

    expect(result[0].isDuplicate).toBe(true);
  });

  it("detects duplicates within file", () => {
    const existing: any[] = [];

    const rows = [
      { data: baseReading, errors: [] },
      { data: baseReading, errors: [] },
    ];

    const result = detectDuplicates(existing, rows);

    expect(result[0].isDuplicate).toBe(false);
    expect(result[1].isDuplicate).toBe(true);
  });

  it("ignores null rows", () => {
    const result = detectDuplicates([], [{ data: null, errors: ["error"] }]);

    expect(result[0].isDuplicate).toBe(false);
  });
});
