import { t } from "i18next";

export function validateRange(value: string, min: number, max: number) {
  const n = Number(value);

  if (value.trim() === "") {
    return "";
  }

  if (isNaN(n)) {
    return t("valueNaN");
  }

  if (n < min || n > max) {
    return `${t("valueOutOfRange")} ${min}-${max}`;
  }

  return "";
}

export function validateBloodPressure(systolic: string, diastolic: string) {
  const sys = Number(systolic);
  const dia = Number(diastolic);

  if (!isNaN(sys) && !isNaN(dia) && dia >= sys) {
    return t("diaLowerSys");
  }

  return "";
}

export const validators = {
  // Systolic (mmHg): integer 70–250 (common valid range: 90–200)
  systolic: (v: string) => validateRange(v, 70, 250),
  // Diastolic (mmHg): integer 40–150 (common valid range: 40–120)
  diastolic: (v: string) => validateRange(v, 40, 150),
  // Heart rate / Pulse (bpm): integer 30–220 (typical: 40–180)
  pulse: (v: string) => validateRange(v, 30, 220),
};
