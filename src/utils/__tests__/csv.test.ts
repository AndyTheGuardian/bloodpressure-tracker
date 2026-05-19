import { describe, it, expect } from "vitest";
import { parseCSV } from "../parseCSV";

describe("parseCSV", () => {
  const t = (key: string) => key;

  it("parses valid CSV correctly", () => {
    const csv = `Id;Date;Systolic;Diastolic;Pulse;Comment
        1777395480000;4/28/2026, 7:02:00 PM;120;80;70;`;

    const result = parseCSV(csv, t);

    expect(result.total).toBe(1);
    expect(result.valid).toBe(1);
    expect(result.invalid).toBe(0);

    expect(result.rows[0].data).toMatchObject({
      systolic: 120,
      diastolic: 80,
      pulse: 70,
    });
  });

  it("skips header row", () => {
    const csv = `Id;Date;Systolic;Diastolic;Pulse;Comment`;

    const result = parseCSV(csv, t);

    expect(result.total).toBe(0);
  });

  it("flags invalid rows", () => {
    const csv = `Id;Date;Systolic;Diastolic;Pulse;Comment
        1777395480000;4/28/2026, 7:02:00 PM;abc;80;70;`;

    const result = parseCSV(csv, t);

    expect(result.valid).toBe(0);
    expect(result.invalid).toBe(1);
    expect(result.rows[0].errors.length).toBeGreaterThan(0);
  });

  it("handles empty file", () => {
    const result = parseCSV("", t);

    expect(result.total).toBe(0);
    expect(result.rows).toEqual([]);
  });
});
