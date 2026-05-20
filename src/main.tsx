import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./i18n";
import { Toaster } from "react-hot-toast";

import { registerSW } from "virtual:pwa-register";

// registerSW({
//   immediate: true,
// });

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New version available. Reload?")) {
      updateSW(true);
    }
  },

  onOfflineReady() {
    console.log("App ready offline");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-center"
      toastOptions={{ className: "dark:bg-gray-800 dark:text-gray-100" }}
    />
  </StrictMode>,
);
