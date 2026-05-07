import "chart.js";

declare module "chart.js" {
  interface PluginOptionsByType<TType extends ChartType> {
    ping?: {
      hoveredReadingId?: number | null;
      pulse?: number;
    };
  }
}
