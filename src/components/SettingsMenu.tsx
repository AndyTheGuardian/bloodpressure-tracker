import { useState } from "react";
import {
  Menu,
  // Moon,
  SquareArrowUpLeft,
  SquareArrowUp,
  SquareArrowUpRight,
  SquareArrowDownLeft,
  SquareArrowDown,
  SquareArrowDownRight,
  // Sun,
  X,
} from "lucide-react";
import type { Options, ToastOption } from "../types/BpTypes";
import type { Theme } from "../types/theme";
import { settingsButtonStyle } from "../utils/bp";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import toast from "react-hot-toast";
import i18next from "i18next";
import { SettingsButton } from "./SettingsButton";

type Props = {
  theme: string;
  setTheme: (s: Theme) => void;
  options: Options;
  setOptions: (o: Options) => void;
};

export function SettingsMenu({ theme, setTheme, options, setOptions }: Props) {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();

  const language = i18next.language.toLowerCase();

  const toastPositions: ToastOption[] = [
    {
      icon: <SquareArrowUpLeft size={15} />,
      value: "top-left",
      style: "rounded-tl-md",
    },
    {
      icon: <SquareArrowUp size={15} />,
      value: "top-center",
      style: "rounded-none",
    },
    {
      icon: <SquareArrowUpRight size={15} />,
      value: "top-right",
      style: "rounded-tr-md",
    },
    {
      icon: <SquareArrowDownLeft size={15} />,
      value: "bottom-left",
      style: "rounded-bl-md",
    },
    {
      icon: <SquareArrowDown size={15} />,
      value: "bottom-center",
      style: "rounded-none",
    },
    {
      icon: <SquareArrowDownRight size={15} />,
      value: "bottom-right",
      style: "rounded-br-md",
    },
  ] as const;

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
          <div className="flex">
            <h2
              className={`text-lg font-semibold mb-4 select-none dark:text-gray-300`}
              onClick={() =>
                setOptions({
                  ...options,
                  toastOverkill: !options.toastOverkill,
                })
              }
            >
              {t("settings")}
            </h2>
            <p
              className={`
                ${
                  options.toastOverkill
                    ? "text-emerald-500 block text-[7pt]"
                    : "hidden"
                } 
                  ${
                    language === "en"
                      ? "mt-[.25px] -ml-[35px]"
                      : "mt-[.25px] -ml-[105.5px]"
                  }`}
            >
              ●{/* ⬢ */}
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mb-2 gray-button flex items-center justify-center"
          >
            {theme === "dark" ? "☀️" : "🌙"}
            {/* {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />} */}
          </button>
          <LanguageSwitcher />
          <p className="text-xs dark:text-gray-300 font-semibold select-none my-1">
            {t("visibility")}
          </p>
          <SettingsButton
            active={options.showComments}
            onClick={() => {
              setOptions({
                ...options,
                showComments: !options.showComments,
              });
              if (options.toastOverkill) {
                const state = options.showComments ? "off" : "on";
                toast.success(`${t("notes")} ${t(state)}`);
              }
            }}
            label={t("notes")}
          />
          <SettingsButton
            active={options.showStats}
            onClick={() => {
              setOptions({
                ...options,
                showStats: !options.showStats,
              });
              if (options.toastOverkill) {
                const state = options.showStats ? "off" : "on";
                toast.success(`${t("stats")} ${t(state)}`);
              }
            }}
            label={t("stats")}
          />
          <SettingsButton
            active={options.showFilter}
            onClick={() => {
              setOptions({
                ...options,
                showFilter: !options.showFilter,
              });
              if (options.toastOverkill) {
                const state = options.showFilter ? "off" : "on";
                toast.success(`${t("filter")} ${t(state)}`);
              }
            }}
            label={t("filter")}
          />
          <SettingsButton
            active={options.showFileSection}
            onClick={() => {
              setOptions({
                ...options,
                showFileSection: !options.showFileSection,
              });
              if (options.toastOverkill) {
                const state = options.showFileSection ? "off" : "on";
                toast.success(`${t("fileSection")} ${t(state)}`);
              }
            }}
            label={t("fileSection")}
          />
          <SettingsButton
            active={options.showStaticErrors}
            onClick={() => {
              setOptions({
                ...options,
                showStaticErrors: !options.showStaticErrors,
              });
              if (options.toastOverkill) {
                const state = options.showStaticErrors ? "off" : "on";
                toast.success(`${t("staticErrorMsgs")} ${t(state)}`);
              }
            }}
            label={t("staticErrorMsgs")}
          />
          <p className="text-xs dark:text-gray-300 font-semibold select-none my-1">
            {t("downloadLocation")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <SettingsButton
              active={options.exportMode === "downloads"}
              label={t("browserDownloads")}
              onClick={() => {
                setOptions({
                  ...options,
                  exportMode: "downloads",
                });
                toast.success(
                  `${t("downloadLocation")} ${t("setTo")} ${
                    options.exportMode === "downloads"
                      ? t("askEveryTime")
                      : t("browserDownloads")
                  }`,
                );
              }}
            />
            <SettingsButton
              active={options.exportMode === "ask"}
              label={t("askEveryTime")}
              onClick={() => {
                setOptions({
                  ...options,
                  exportMode: "ask",
                });
                toast.success(
                  `${t("downloadLocation")} ${t("setTo")} ${
                    options.exportMode === "ask"
                      ? t("browserDownloads")
                      : t("askEveryTime")
                  }`,
                );
              }}
            />
          </div>
          <p className="text-xs dark:text-gray-300 font-semibold select-none my-1">
            {t("functions")}
          </p>
          <SettingsButton
            active={options.autoAdvance}
            onClick={() => {
              setOptions({
                ...options,
                autoAdvance: !options.autoAdvance,
              });
              if (options.toastOverkill) {
                const state = options.autoAdvance ? "off" : "on";
                toast.success(`${t("autoAdvance")} ${t(state)}`);
              }
            }}
            label={t("autoAdvance")}
          />
          <SettingsButton
            active={options.showPing}
            onClick={() => {
              setOptions({
                ...options,
                showPing: !options.showPing,
              });
              if (options.toastOverkill) {
                const state = options.showPing ? "off" : "on";
                toast.success(`${t("pingAnimation")} ${t(state)}`);
              }
            }}
            label={t("pingAnimation")}
          />
          <p className="text-xs dark:text-gray-300 font-semibold select-none my-1">
            {t("notifyPosition")}
          </p>
          <div className="grid grid-cols-3 gap-[2px]">
            {toastPositions.map((pos) => (
              <button
                key={pos.value}
                onClick={() => {
                  setOptions({
                    ...options,
                    toastPosition: pos.value,
                  });
                  toast.success(`Position ${t("setTo")} '${pos.value}'`);
                }}
                className={`flex items-center justify-center 
                  text-xs text-wrap 
                  ${
                    options.toastPosition === pos.value
                      ? settingsButtonStyle.selected
                      : settingsButtonStyle.unselected
                  } 
                px-3 py-1 
                border-[1px] border-gray-300 dark:border-gray-700 
                ${pos.style} shadow-md transition-all duration-200 
                hover:scale-[1.02] active:scale-[0.98]`}
              >
                {/* {pos.label} */}
                {pos.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
