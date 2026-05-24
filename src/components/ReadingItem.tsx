import { useState } from "react";
import type { Reading, Options } from "../types/BpTypes";
import { InputForm } from "./InputForm";
import dayjs from "dayjs";
import { CircleGauge, HeartPulse } from "lucide-react";

type Props = {
  reading: Reading;
  onEdit: (
    id: number,
    systolic: number,
    diastolic: number,
    pulse: number,
    comment: string,
    datetime: string,
  ) => void;
  onDelete: (id: number) => void;
  options: Options;
};

export function ReadingItem({ reading, onEdit, onDelete, options }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    pulse: reading.pulse,
    comment: reading.comment,
    datetime: dayjs(reading.recorded_at).format("YYYY-MM-DDTHH:mm"),
    //datetime: new Date(reading.recorded_at).toISOString(),
  });

  function handleEdit() {
    setForm({
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      pulse: reading.pulse,
      comment: reading.comment,
      datetime: dayjs(reading.recorded_at).format("YYYY-MM-DDTHH:mm"),
    });
    setIsEditing(true);
  }

  function handleSubmit() {
    onEdit(
      reading.id,
      form.systolic,
      form.diastolic,
      form.pulse,
      form.comment,
      form.datetime,
    );
    setIsEditing(false);
  }

  return (
    <>
      {isEditing ? (
        <InputForm
          form={form}
          setForm={setForm}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSubmit={handleSubmit}
          options={options}
        />
      ) : (
        <>
          <div className="flex flex-grow flex-col sm:flex-row">
            <div className="flex-1 flex gap-1">
              <CircleGauge className="mt-1" size={15} />
              <span className="text-left">
                {reading.systolic} / {reading.diastolic}
              </span>
              <HeartPulse className="mt-1 ml-2" size={15} />
              <span>{reading.pulse}</span>
            </div>
            {options.showComments && (
              <span className="flex-1 text-center">{reading.comment}</span>
            )}
            <span
              className={`flex-1 sm:text-right ${options.showGradient ? "dark:md:text-gray-50" : ""}`}
            >
              {dayjs(reading.recorded_at).format("DD.MM.YYYY HH:mm")}
            </span>
          </div>
          <button
            className={`ml-3 -my-2 px-2 bg-emerald-400 bg-opacity-0 hover:bg-opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
            onClick={handleEdit}
          >
            <svg
              className={`w-4 h-4 pointer-events-none ${options.showGradient ? "dark:stroke-gray-50" : "stroke-gray-950"} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              role="img"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            >
              {" "}
              <path d="M18.4142136 4.41421356L19.5857864 5.58578644C20.366835 6.36683502 20.366835 7.63316498 19.5857864 8.41421356L8 20 4 20 4 16 15.5857864 4.41421356C16.366835 3.63316498 17.633165 3.63316498 18.4142136 4.41421356zM14 6L18 10" />
            </svg>
          </button>
          <button
            className={`-my-2 -mr-2 px-2 ${options.showGradient ? "dark:text-gray-50" : "text-gray-950"} bg-red-600 bg-opacity-0 hover:bg-opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
            onClick={() => onDelete(reading.id)}
          >
            {/* x❌ */}
            <svg
              className={`w-4 h-4 pointer-events-none ${options.showGradient ? "dark:stroke-gray-50" : "stroke-gray-950"}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="butt"
              strokeLinejoin="round"
            >
              <path d="M19 6L5 6M14 5L10 5M6 10L6 20C6 20.6666667 6.33333333 21 7 21 7.66666667 21 11 21 17 21 17.6666667 21 18 20.6666667 18 20 18 19.3333333 18 16 18 10" />
            </svg>
          </button>
        </>
      )}
    </>
  );
}
