import { useState } from "react";
import type { Reading, Options } from "../types/BpTypes";
import { InputForm } from "./InputForm";
import dayjs from "dayjs";

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

export function BpItem({ reading, onEdit, onDelete, options }: Props) {
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
          <div className="flex flex-grow flex-col sm:flex-row ">
            <span className="flex-1 text-left">
              {reading.systolic} / {reading.diastolic} (Pulse: {reading.pulse})
            </span>
            {options.showComments && (
              <span className="flex-1 text-center">{reading.comment}</span>
            )}
            <span
              className={`flex-1 sm:text-right ${options.showGradient ? "md:text-gray-50" : ""}`}
            >
              {dayjs(reading.recorded_at).format("DD.MM.YYYY HH:mm")}
            </span>
          </div>
          <button
            className={`-m-2 ml-3 pt-[2px] px-2 font-mono text-sm text ${options.showGradient ? "md:text-gray-50" : ""} hover:underline`}
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className={`-m-2 ml-3 px-2 font-mono text-sm ${options.showGradient ? "text-gray-50" : "text-gray-950"} bg-red-600 bg-opacity-0 hover:bg-opacity-90 transition duration-300`}
            onClick={() => onDelete(reading.id)}
          >
            x{/* ❌ */}
          </button>
        </>
      )}
    </>
  );
}
