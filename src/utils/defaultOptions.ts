import type { Options } from "../types/BpTypes";

export const defaultOptions: Options = {
  showComments: false,
  showGradient: false,
  showFileSection: false,
  showPing: false,
  showStats: true,
  showFilter: true,
  showStaticErrors: false,
  autoAdvance: true,
  toastPosition: window.innerWidth < 640 ? "bottom-center" : "top-right",
  toastOverkill: false,
  exportMode: "downloads",
};
