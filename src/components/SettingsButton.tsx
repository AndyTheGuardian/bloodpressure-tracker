import { settingsButtonStyle } from "../utils/bp";

type Props = {
  active: boolean;
  label: string;
  onClick: () => void;
};

export function SettingsButton({ active, label, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 mb-2 flex-shrink text-xs text-wrap 
        border-[1px] border-gray-300 dark:border-gray-700 
        rounded shadow-md 
        transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
        ${
          active ? settingsButtonStyle.selected : settingsButtonStyle.unselected
        } `}
    >
      {label}
    </button>
  );
}
