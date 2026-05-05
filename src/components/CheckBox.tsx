export interface CheckboxProps {
  disabled?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange:
    | React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>
    | undefined;
  id: string;
  label: string;
  subLabel: string | any;
}

export const Checkbox = (props: CheckboxProps) => (
  <div className="w-full flex gap-2 mt-2 items-center">
    <input
      className="
        peer relative appearance-none shrink-0 w-4 h-4 rounded-sm mt-1 bg-gray-500/35
        ring-offset-0 ring-1 ring-gray-300 dark:ring-gray-600
        focus:outline-none focus:ring-offset-0 focus:ring-[1px] focus:ring-gray-500 dark:focus:ring-gray-500
        disabled:border-steel-400 disabled:bg-steel-400 shadow-md
        "
      type="checkbox"
      {...props}
    />
    <svg
      className="absolute w-4 h-4 pointer-events-none hidden peer-checked:block stroke-gray-700 dark:stroke-gray-300 mt-1 outline-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="butt"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <div className="flex flex-col">
      <label
        className={`text-sm font-semibold select-none text-gray-700 dark:text-gray-300`}
        htmlFor={props.id}
      >
        {props.label}
      </label>
      {props.subLabel && (
        <label
          className="-mt-[1px] text-[8pt] font-normal select-none text-gray-600 dark:text-gray-400"
          htmlFor={props.id}
        >
          {props.subLabel}
        </label>
      )}
    </div>
  </div>
);

export default Checkbox;
