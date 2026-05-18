import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Options } from "../types/BpTypes";
import { grayButtonStyle } from "../utils/bp";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Props = {
  theme: string;
  setTheme: (s: string) => void;
  options: Options;
  setOptions: (o: Options) => void;
};

export function SettingsMenu({ theme, setTheme, options, setOptions }: Props) {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-50 shadow-lg"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      <div
        onClick={() => setOpen(false)}
        className={`
            fixed inset-0 
            bg-gray-900/20 
            z-40 
            transition-opacity 
            duration-300 
            ${
              open
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
      />

      <div
        className={`
            fixed 
            top-14 
            right-4 
            z-50 
            w-auto 
            rounded-lg 
            bg-gray-300 
            dark:bg-gray-900
            shadow-2xl border 
            border-gray-300 dark:border-gray-800 
            transform-gpu transition-all duration-300 ease-out 
            will-change-transform 
            ${
              open
                ? "translate-x-0 opacity-100 ease-out scale-100"
                : "translate-x-full opacity-0 ease-out scale-95"
            }`}
      >
        <div className="p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-300">
            {t("settings")}
          </h2>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`mb-2 rounded ${grayButtonStyle} transition duration-300`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <LanguageSwitcher />
          <button
            onClick={() =>
              setOptions({
                ...options,
                showComments: !options.showComments,
              })
            }
            className={`flex-shrink text-xs text-wrap mb-2 ${
              options.showComments
                ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-gray-100"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
            } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
          >
            {t("notes")}
          </button>
          <button
            onClick={() =>
              setOptions({
                ...options,
                showStats: !options.showStats,
              })
            }
            className={`flex-shrink text-xs text-wrap mb-2 ${
              options.showStats
                ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-gray-100"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
            } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
          >
            {t("stats")}
          </button>
          <button
            onClick={() =>
              setOptions({
                ...options,
                showFilter: !options.showFilter,
              })
            }
            className={`flex-shrink text-xs text-wrap mb-2 ${
              options.showFilter
                ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-gray-100"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
            } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
          >
            {t("filter")}
          </button>
          <button
            onClick={() =>
              setOptions({
                ...options,
                showFileSection: !options.showFileSection,
              })
            }
            className={`flex-shrink text-xs text-wrap mb-2 ${
              options.showFileSection
                ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-gray-100"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
            } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
          >
            {t("fileSection")}
          </button>
          <button
            onClick={() =>
              setOptions({
                ...options,
                showPing: !options.showPing,
              })
            }
            className={`flex-shrink text-xs text-wrap mb-2 ${
              options.showPing
                ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-gray-100"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
            } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
          >
            {t("pingAnimation")}
          </button>
        </div>
      </div>
    </div>
  );
}
