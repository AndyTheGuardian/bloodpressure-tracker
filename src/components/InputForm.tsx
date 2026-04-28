import { useRef } from "react";
import type { Options } from "../types/BpTypes";
import { useEffect } from "react";

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

  useEffect(() => {
    refSys.current?.focus();
  }, []);

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
      <input
        className="w-full sm:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
        placeholder="Systolic"
        value={form.systolic}
        ref={refSys}
        onKeyDown={(e) => handleEnter(e, refDia)}
        onChange={(e) => setForm({ ...form, systolic: e.target.value })}
      />
      {isEditing ? <span className="py-2 sd:hidden">/</span> : <></>}
      <input
        className="w-full sm:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
        placeholder="Diastolic"
        value={form.diastolic}
        ref={refDia}
        onKeyDown={(e) => handleEnter(e, refPls)}
        onChange={(e) => setForm({ ...form, diastolic: e.target.value })}
      />
      <input
        className="w-full sm:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
        placeholder="Pulse"
        value={form.pulse}
        ref={refPls}
        onKeyDown={(e) => handleEnter(e, refCom)}
        onChange={(e) => setForm({ ...form, pulse: e.target.value })}
      />
      {options.showComments && (
        <input
          className={`w-auto sm:flex-1 h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300`}
          placeholder="Comment"
          type="text"
          value={form.comment}
          ref={refCom}
          onKeyDown={(e) => handleEnter(e, refDat)}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />
      )}
      <input
        className="w-48 sm:flex-auto h-10 p-2 border rounded shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-300"
        type="datetime-local"
        value={form.datetime}
        ref={refDat}
        onChange={(e) => setForm({ ...form, datetime: e.target.value })}
      />
      {isEditing ? (
        <>
          <button
            className="w-auto h-10 p-2 rounded text-gray-50 bg-green-600 hover:bg-green-500"
            onClick={onSubmit}
          >
            Save
          </button>
          <button
            className="w-auto h-10 p-2 rounded text-gray-50 bg-red-600 hover:bg-red-500"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          className="w-full sm:w-auto h-10 bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600 hover:cursor-pointer disabled:opacity-50 disabled:hover:bg-blue-500 focus:border-gray-400 dark:focus:border-gray-500 transition duration-300"
          disabled={!form.systolic || !form.diastolic || !form.pulse}
        >
          Add
        </button>
      )}
    </form>
  );
}
