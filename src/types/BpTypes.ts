import type { ReactNode } from "react";
import type { ToastPosition } from "react-hot-toast";

export type Reading = {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  comment: string;
  recorded_at: number;
};

export type toastPosition = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

export type ToastOption = {
  icon: ReactNode;
  value: ToastPosition;
  style: string;
};

export type Options = {
  showComments: boolean;
  showGradient: boolean;
  showFileSection: boolean;
  showPing: boolean;
  showStats: boolean;
  showFilter: boolean;
  showStaticErrors: boolean;
  autoAdvance: boolean;
  toastPosition: ToastPosition;
  toastOverkill: boolean;
};
