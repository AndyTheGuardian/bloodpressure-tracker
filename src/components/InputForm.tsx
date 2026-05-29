import { useRef, useState } from "react";
import type { Options } from "../types/BpTypes";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { validateField } from "../utils/validation";
import { inputFormStyle } from "../utils/bp";

type Props = {
  form: any;
  setForm: any;
  isEditing: any;
  setIsEditing: any;
  onSubmit: (e: React.FormEvent) => void;
  options: Options;
};

export function InputForm({
  form,
  setForm,
  isEditing,
  setIsEditing,
  onSubmit,
  options,
}: Props) {
  const refSys = useRef<HTMLInputElement>(null);
  const refDia = useRef<HTMLInputElement>(null);
  const refPls = useRef<HTMLInputElement>(null);
  const refCom = useRef<HTMLInputElement>(null);
  const refDat = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  useEffect(() => {
    refSys.current?.focus();
  }, []);

  const [errors, setErrors] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
  });

  const [touched, setTouched] = useState({
    systolic: false,
    diastolic: false,
    pulse: false,
  });

  function shouldAutoAdvance(field: string, value: string) {
    if (
      (field === "systolic" &&
        value.length === 2 &&
        !["1", "2"].includes(value[0])) ||
      (field !== "systolic" &&
        value.length === 2 &&
        !value[0].startsWith("1")) ||
      value.length === 3
    ) {
      return true;
    }

    return false;
  }

  function handleEnter(
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement | null>,
    prevRef?: React.RefObject<HTMLInputElement | null>,
  ) {
    if (!options.showComments && nextRef === refCom) nextRef = refDat;

    const value = e.currentTarget.value ?? "";

    if (e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      nextRef.current?.focus();
      return;
    }

    if ((e.key === "Backspace" || e.key === "ArrowLeft") && value === "") {
      e.preventDefault();
      prevRef?.current?.focus();
    }
  }

  function onChange(
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement | null>,
  ) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    if (value === "") {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    if (options.autoAdvance && shouldAutoAdvance(name, value)) {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  }

  function onBlur(e: React.FocusEvent<HTMLInputElement, Element>) {
    const { name, value } = e.target;

    setTouched({
      ...touched,
      [name]: true,
    });
    setErrors({
      ...errors,
      [name]: validateField(name, value),
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="grid grid-cols-3 gap-2 sm:flex">
        <div className="flex flex-col sm:flex-1 self-start">
          <div className="h-[12px]">
            {touched.systolic && errors.systolic && (
              <p className="text-red-500 text-xs font-medium -mt-1">
                {errors.systolic}
              </p>
            )}
          </div>
          <input
            className={`w-full sm:min-w-11 ${inputFormStyle.basic} 
            ${errors.systolic ? inputFormStyle.invalid : inputFormStyle.valid}`}
            placeholder={t("systolic")}
            name="systolic"
            type="numeric"
            inputMode="numeric"
            value={form.systolic}
            ref={refSys}
            onKeyDown={(e) => handleEnter(e, refDia)}
            onChange={(e) => onChange(e, refDia)}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={onBlur}
          />
        </div>
        {/* {isEditing ? <span className="py-2">/</span> : <></>} */}
        <div className="flex flex-col sm:flex-1 self-start">
          <div className="h-[12px]">
            {touched.diastolic && errors.diastolic && (
              <p className="text-red-500 text-xs font-medium -mt-1">
                {errors.diastolic}
              </p>
            )}
          </div>
          <input
            className={`w-full sm:min-w-11 ${inputFormStyle.basic} 
            ${errors.diastolic ? inputFormStyle.invalid : inputFormStyle.valid}`}
            placeholder={t("diastolic")}
            name="diastolic"
            type="numeric"
            inputMode="numeric"
            value={form.diastolic}
            ref={refDia}
            onKeyDown={(e) => handleEnter(e, refPls, refSys)}
            onChange={(e) => onChange(e, refPls)}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={onBlur}
          />
        </div>
        <div className="flex flex-col sm:flex-1 self-start">
          <div className="h-[12px]">
            {touched.pulse && errors.pulse && (
              <p className="text-red-500 text-xs font-medium -mt-1">
                {errors.pulse}
              </p>
            )}
          </div>
          <input
            className={`w-full sm:min-w-11 ${inputFormStyle.basic} 
            ${errors.pulse ? inputFormStyle.invalid : inputFormStyle.valid}`}
            placeholder={t("pulse")}
            name="pulse"
            type="numeric"
            inputMode="numeric"
            value={form.pulse}
            ref={refPls}
            onKeyDown={(e) => handleEnter(e, refCom, refDia)}
            onChange={(e) => {
              const nextRef = options.showComments ? refCom : refDat;
              onChange(e, nextRef);
            }}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={onBlur}
          />
        </div>
      </div>
      {options.showComments && (
        <input
          className={`w-full sm:mt-[12px] sm:flex-none sm:max-w-44 ${inputFormStyle.basic} ${inputFormStyle.valid}`}
          placeholder={t("note")}
          name="note"
          type="text"
          value={form.comment}
          ref={refCom}
          onKeyDown={(e) => handleEnter(e, refDat, refPls)}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
      <input
        className={`w-full sm:mt-[12px] sm:flex-none sm:max-w-52 ${inputFormStyle.basic} ${inputFormStyle.valid}`}
        name="date"
        type="datetime-local"
        value={form.datetime}
        ref={refDat}
        onChange={(e) => setForm({ ...form, datetime: e.target.value })}
      />
      {isEditing ? (
        <div className="sm:flex grid grid-cols-2 gap-2">
          {/* rounded text-gray-50 bg-green-600 hover:bg-green-500 disabled:bg-gray-500/50 disabled:hover:bg-gray-500/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] */}
          <button
            className="w-full sm:mt-[12px] h-10 p-2 green-button"
            name="save"
            onClick={onSubmit}
            disabled={
              !form.systolic ||
              !form.diastolic ||
              !form.pulse ||
              !!errors.systolic ||
              !!errors.diastolic ||
              !!errors.pulse
            }
          >
            {t("save")}
          </button>
          <button
            className="w-full sm:mt-[12px] h-10 red-button"
            name="cancel"
            onClick={() => setIsEditing(false)}
          >
            {t("cancel")}
          </button>
        </div>
      ) : (
        <button
          className="w-full sm:w-auto sm:mt-[12px] h-10 blue-button"
          name="add"
          disabled={
            !form.systolic ||
            !form.diastolic ||
            !form.pulse ||
            !!errors.systolic ||
            !!errors.diastolic ||
            !!errors.pulse
          }
        >
          {t("add")}
        </button>
      )}
    </form>
  );
}
