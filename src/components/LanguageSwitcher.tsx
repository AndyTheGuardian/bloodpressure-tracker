import i18n from "i18next";

export function LanguageSwitcher() {
  function changeLanguage(lang: "en" | "de") {
    i18n.changeLanguage(lang);

    localStorage.setItem("language", lang);
  }

  return (
    <div className="flex gap-2">
      <button
        className={`flex-1 text-xs mb-2 ${
          i18n.language === "de"
            ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-gray-100"
            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
        } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
        onClick={() => changeLanguage("de")}
      >
        DE
      </button>
      <button
        className={`flex-1 text-xs mb-2 ${
          i18n.language === "en"
            ? "bg-blue-600 hover:bg-blue-500 border-blue-600 text-gray-100"
            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
        } px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
        onClick={() => changeLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}
