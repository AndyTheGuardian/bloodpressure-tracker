  export type BPLevel =
    | "crisis"
    | "high2"
    | "high1"
    | "elevated"
    | "normal";
  
  export const BP_THRESHOLDS = {
    sys: {
        crisis: 180,
        high2: 160,
        high1: 140,
        elevated: 130,
    },
    dia: {
        crisis: 109,
        high2: 100,
        high1: 90,
        elevated: 85,
    },
  };

  export function getBPLevel(systolic: number, diastolic: number) {
    if (systolic >= BP_THRESHOLDS.sys.crisis || diastolic >= BP_THRESHOLDS.dia.crisis) return "crisis";
    if (systolic >= BP_THRESHOLDS.sys.high2 || diastolic >= BP_THRESHOLDS.dia.high2) return "high2";
    if (systolic >= BP_THRESHOLDS.sys.high1 || diastolic >= BP_THRESHOLDS.dia.high1) return "high1";
    if (systolic >= BP_THRESHOLDS.sys.elevated || diastolic >= BP_THRESHOLDS.dia.elevated) return "elevated";
    return "normal";
  }

  export function getBPStyle(level: BPLevel, isGrad: Boolean) {
    if (isGrad) {
      switch (level) {
        case "crisis":
          return `bg-gradient-to-r from-red-700 to-red-950 border-red-800 border-[1px] border-opacity-0 hover:border-opacity-100 text-gray-50 font-bold`;
        case "high2":
          return `bg-gradient-to-r from-red-500 to-red-950 border-red-600 border-[1px] border-opacity-0 hover:border-opacity-100 text-gray-50`;
        case "high1":
          return `bg-gradient-to-r from-orange-400 to-orange-950 border-orange-500 border-[1px] border-opacity-0 hover:border-opacity-100 text-gray-950`;
        case "elevated":
          return `bg-gradient-to-r from-yellow-300 to-yellow-950 border-yellow-400 border-[1px] border-opacity-0 hover:border-opacity-100 text-gray-950`;
        default:
          return `bg-gradient-to-r from-emerald-500 to-emerald-950 border-emerald-600 border-[1px] border-opacity-0 hover:border-opacity-100 text-gray-950`;
        // return `bg-gradient-to-r from-[#2dd4bf]  to-[#1f2937] border-green-600 text-gray-950`;
      }
    }
    switch (level) {
      case "crisis":
        return `bg-red-700 border-red-800 text-gray-50 font-bold`;
      case "high2":
        return `bg-red-500 border-red-600 text-gray-50`;
      case "high1":
        return `bg-orange-400 border-orange-500 text-gray-950`;
      case "elevated":
        return `bg-yellow-300 border-yellow-400 text-gray-950`;
      default:
        return `bg-emerald-500 border-emerald-600 text-gray-950`;
    }
  }


  export const grayButtonStyle =
    "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1 border-[1px] border-gray-300 dark:border-gray-700 rounded shadow-md hover:bg-gray-400 dark:hover:bg-gray-600 transition duration-300";

  export const avgTextStyle: Record<BPLevel, string> = {
    crisis: `text-xl font-bold underline underline-offset-2 decoration-red-700`,
    high2: `text-xl font-bold underline underline-offset-2 decoration-red-300 dark:decoration-red-500`,
    high1: `text-xl font-bold underline underline-offset-2 decoration-orange-400`,
    elevated: `text-xl font-bold underline underline-offset-2 decoration-yellow-500 dark:decoration-yellow-300`,
    normal: `text-xl font-bold underline underline-offset-2 decoration-emerald-500`,
  };

  export const trendTextStyle = {
    up: "text-xl underline underline-offset-2 decoration-red-400 dark:decoration-red-700 font-bold flex justify-center",
    down: "text-xl underline underline-offset-2 decoration-emerald-500 font-bold flex justify-center",
    stable:
      "text-xl underline underline-offset-2 decoration-gray-50 text-gray-900 dark:text-gray-100 font-bold flex justify-center",
  };