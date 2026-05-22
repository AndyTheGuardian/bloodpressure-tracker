import { trendTextStyle } from "../utils/bp";
import { useTranslation } from "react-i18next";

type Props = {
  trend: "up" | "down" | "stable";
  slope: number;
};

export function TrendIndicator({ trend, slope }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex place-content-center">
      {trend === "up" && (
        <div className={trendTextStyle.up}>
          <p>↑</p>
          <p>&nbsp;{t("rising")}</p>
        </div>
      )}
      {trend == "down" && (
        <div className={trendTextStyle.down}>
          <p>↓</p>
          <p>&nbsp;{t("falling")}</p>
        </div>
      )}
      {trend == "stable" && (
        <div className={trendTextStyle.stable}>
          <p>→</p>
          <p>&nbsp;{t("stable")}</p>
        </div>
      )}
      <p className="text-sm text-gray-500 mt-[6px] ml-2">{slope.toFixed(2)}</p>
    </div>
  );
}
