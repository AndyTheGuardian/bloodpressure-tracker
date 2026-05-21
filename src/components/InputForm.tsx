import { useRef, useState } from "react";
import type { Options } from "../types/BpTypes";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { validators } from "../utils/validation";

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

  function handleEnter(
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLInputElement | null>,
  ) {
    if (!options.showComments && nextRef === refCom) nextRef = refDat;
    if (e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="grid grid-flow-col-dense sm:flex gap-2">
        <div className="flex flex-col sm:flex-1">
          <div className="h-[12px]">
            {touched.systolic && errors.systolic && (
              <p className="text-red-500 text-xs -mt-1 ml-1 ">
                {errors.systolic}
              </p>
            )}
          </div>
          <input
            className={`w-full sm:min-w-11 h-10 p-2 border rounded shadow ${errors.systolic ? "border-red-500/60 bg-red-500/30" : "bg-gray-200/50 dark:bg-gray-800/50 bg-opacity-50 dark:border-gray-700/50"} dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300`}
            placeholder={t("systolic")}
            type="numeric"
            value={form.systolic}
            ref={refSys}
            onKeyDown={(e) => handleEnter(e, refDia)}
            onChange={(e) => {
              setForm({ ...form, systolic: e.target.value });
            }}
            onBlur={() => {
              setTouched({
                ...touched,
                systolic: true,
              });
              setErrors({
                ...errors,
                systolic: validators.systolic(form.systolic),
              });
            }}
          />
        </div>
        {isEditing ? <span className="py-2">/</span> : <></>}
        <div className="flex flex-col sm:flex-1">
          <div className="h-[12px]">
            {touched.diastolic && errors.diastolic && (
              <p className="text-red-500 text-xs -mt-1 ml-1 ">
                {errors.diastolic}
              </p>
            )}
          </div>
          <input
            className={`w-full sm:min-w-11 h-10 p-2 border rounded shadow  ${errors.diastolic ? "border-red-500/60 bg-red-500/30" : "bg-gray-200/50 dark:bg-gray-800/50 dark:border-gray-700/50"} dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300`}
            placeholder={t("diastolic")}
            type="numeric"
            value={form.diastolic}
            ref={refDia}
            onKeyDown={(e) => handleEnter(e, refPls)}
            onChange={(e) => {
              setForm({ ...form, diastolic: e.target.value });
            }}
            onBlur={() => {
              setTouched({
                ...touched,
                diastolic: true,
              });
              setErrors({
                ...errors,
                diastolic: validators.diastolic(form.diastolic),
              });
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-1">
          <div className="h-[12px]">
            {touched.pulse && errors.pulse && (
              <p className="text-red-500 text-xs -mt-1">{errors.pulse}</p>
            )}
          </div>
          <input
            className={`w-full sm:min-w-11 h-10 p-2 border rounded shadow  ${errors.pulse ? "border-red-500/60 bg-red-500/30" : "bg-gray-200/50 dark:bg-gray-800/50 dark:border-gray-700/50"} dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300`}
            placeholder={t("pulse")}
            type="numeric"
            value={form.pulse}
            ref={refPls}
            onKeyDown={(e) => handleEnter(e, refCom)}
            onChange={(e) => {
              setForm({ ...form, pulse: e.target.value });
            }}
            onBlur={() => {
              setTouched({
                ...touched,
                pulse: true,
              });
              setErrors({
                ...errors,
                pulse: validators.pulse(form.pulse),
              });
            }}
          />
        </div>
      </div>
      {options.showComments && (
        <input
          className={`w-full mt-[12px] sm:flex-none sm:max-w-44 h-10 p-2 border rounded shadow bg-gray-200/50 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300`}
          placeholder={t("note")}
          type="text"
          value={form.comment}
          ref={refCom}
          onKeyDown={(e) => handleEnter(e, refDat)}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />
      )}
      <input
        className={`w-full mt-[12px] sm:flex-none sm:max-w-52 h-10 p-2 border rounded shadow bg-gray-200/50 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300`}
        type="datetime-local"
        value={form.datetime}
        ref={refDat}
        onChange={(e) => setForm({ ...form, datetime: e.target.value })}
      />
      {isEditing ? (
        <div className="sm:flex-none grid grid-cols-2 gap-2">
          <button
            className="w-auto mt-[12px] h-10 p-2 rounded text-gray-50 bg-green-600 hover:bg-green-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={onSubmit}
          >
            {t("save")}
          </button>
          <button
            className="w-auto mt-[12px] h-10 p-2 rounded text-gray-50 bg-red-600 hover:bg-red-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => setIsEditing(false)}
          >
            {t("cancel")}
          </button>
        </div>
      ) : (
        <button
          className="w-full mt-[12px] sm:w-auto h-10 bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 hover:cursor-pointer disabled:opacity-50 disabled:hover:bg-blue-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
