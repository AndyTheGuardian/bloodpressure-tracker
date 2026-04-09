import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

import { Line } from "react-chartjs-2";

import annotationPlugin from "chartjs-plugin-annotation";
import type { ChartOptions } from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
);

ChartJS.register(annotationPlugin);

type Reading = {
  id: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  recorded_at: number;
};

export default function BPChart({ readings }: { readings: Reading[] }) {
  //const sorted = [...readings].reverse(); // oldest -> newest

  const x = readings.map((_, i) => i);
  const y = readings.map((r) => r.systolic);

  const n = x.length;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const intercept = (sumY - slope * sumX) / n;

  // predicted values (regression line)
  const trendLine = x.map((xi) => slope * xi + intercept);

  const trendColor =
    slope > 0.5
      ? "rgba(185, 28, 28,1)" // red
      : slope < -0.5
        ? "rgba(34, 197, 94,1)" // green
        : "rgba(255, 255, 255,1)";

  const data = {
    labels: readings.map((r) =>
      r.recorded_at
        ? new Date(r.recorded_at).toLocaleString("DE", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          })
        : "",
    ),
    datasets: [
      {
        label: "Systolic",
        data: readings.map((r) => r.systolic),
        borderColor: "rgb(4,94,249)",
        borderWidth: 2,
        pointRadius: 2,
        tension: 0,
        backgroundColor: "rgba(4,94,249,0.5)",
      },
      {
        label: "Diastolic",
        data: readings.map((r) => r.diastolic),
        borderColor: "rgb(180,4,249)",
        borderWidth: 2,
        pointRadius: 2,
        tension: 0,
        backgroundColor: "rgba(180,4,249,0.5)",
      },
      {
        label: "Pulse",
        data: readings.map((r) => r.pulse),
        borderColor: "rgb(160,160,1)",
        borderWidth: 2,
        pointRadius: 2,
        tension: 0,
        backgroundColor: "rgba(160,160,1,0.5)",
      },
      {
        label: "Trend",
        data: trendLine,
        borderColor: trendColor,
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  //const colNm = 'rgba(34, 197, 94,0.2)';

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      annotation: {
        annotations: {
          // crisBP: {
          //   drawTime: "beforeDatasetsDraw",
          //   type: "line",
          //   yMin: 180,
          //   yMax: 180,
          //   borderColor: "rgba(185, 28, 28,1)",
          //   borderWidth: 1,
          // },
          // high2BP: {
          //   drawTime: "beforeDatasetsDraw",
          //   type: "line",
          //   yMin: 160,
          //   yMax: 160,
          //   borderColor: "rgba(239, 68, 68,.5)",
          //   borderWidth: 1,
          // },
          // high1BP: {
          //   drawTime: "beforeDatasetsDraw",
          //   type: "line",
          //   yMin: 140,
          //   yMax: 140,
          //   borderColor: "rgba(251, 146, 60,.5)",
          //   borderWidth: 1,
          // },
          // elevBP: {
          //   drawTime: "beforeDatasetsDraw",
          //   type: "line",
          //   yMin: 130,
          //   yMax: 130,
          //   borderColor: "rgba(253, 224, 71,.5)",
          //   borderWidth: 1,
          // },
          normalZone: {
            type: "box",
            yMin: 100,
            yMax: 130,
            backgroundColor: "rgba(34, 197, 94,0.2)", // green
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
          elevatedZone: {
            type: "box",
            yMin: 130,
            yMax: 140,
            backgroundColor: "rgba(253, 224, 71,0.2)", // yellow
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
          high1Zone: {
            type: "box",
            yMin: 140,
            yMax: 160,
            backgroundColor: "rgba(251, 146, 60,0.2)", // orange
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
          high2Zone: {
            type: "box",
            yMin: 160,
            yMax: 180,
            backgroundColor: "rgba(239, 68, 68,0.2)", // red
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
          crisisZone: {
            type: "box",
            yMin: 180,
            yMax: 200,
            backgroundColor: "rgba(185, 28, 28,0.2)", // red
            borderWidth: 0,
            drawTime: "beforeDatasetsDraw",
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: (ctx: any) =>
            ctx.tick.value === 0
              ? "rgba(128,128,128,0.5)"
              : "rgba(128,128,128,0.2)",
          lineWidth: 1,
        },
      },
      y: {
        ticks: {
          color: "rgba(128,128,128,1)",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(128,128,128,0.5)",
          lineWidth: 1,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
