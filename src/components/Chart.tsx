import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import { calculateTrend } from "../utils/trend";
import { useState, useMemo, useEffect } from "react";
import type { Reading } from "../types/BpTypes";
import type { Plugin } from "chart.js";

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

type Props = {
  readings: Reading[];
  hoveredReadingId: number | null;
};

ChartJS.register(annotationPlugin);

const ping: Plugin<"line"> = {
  id: "ping",

  afterDraw(chart: any) {
    const { ctx } = chart;

    const hoveredId = chart.options.plugins.ping?.hoveredReadingId;

    if (!hoveredId) return;

    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      meta.data.forEach((point: any, index: number) => {
        const reading = dataset.readings?.[index];
        if (reading?.id !== hoveredId) return;

        const x = point.x;
        const y = point.y;

        const progress = chart.options.plugins?.ping?.pulse ?? 0;

        const t = progress / 30;

        const eased = 1 - Math.pow(1 - t, 3);

        const radius = 2 + eased * 10;

        const alpha = Math.pow(1 - t, 2);

        const color = dataset.borderColor || "rgb(160, 160, 160)";

        const strokeColor = color
          .replace("rgb", "rgba")
          .replace(")", `, ${alpha}`);

        ctx.save();

        ctx.globalCompositeOperation = "screen";

        ctx.shadowBlur = 10;
        ctx.shadowColor = strokeColor;

        ctx.beginPath();

        ctx.arc(x, y, radius, 0, Math.PI * 2);

        // const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

        // gradient.addColorStop(1, `rgba(128,128,128, ${alpha * 0.5})`);
        // gradient.addColorStop(0.5, `rgba(128,128,128, ${alpha * 0.25})`);
        // gradient.addColorStop(0, `rgba(128,128,128, 0)`);

        // ctx.fillStyle = gradient;
        ctx.fillStyle = strokeColor;
        ctx.fill();

        ctx.strokeStyle = strokeColor;

        ctx.lineWidth = 6 * (1 - progress);

        ctx.stroke();

        ctx.restore();
      });
    });

    //chart.draw();
  },
};

ChartJS.register(ping);

export default function Chart({ readings, hoveredReadingId }: Props) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!hoveredReadingId) return;
    const interval = setInterval(() => {
      setPulse((p) => {
        const next = p + 1;
        return next > 30 ? 0 : next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [hoveredReadingId]);

  useEffect(() => {
    setPulse(0);
  }, [hoveredReadingId]);

  const sorted = [...readings].reverse(); // oldest -> newest

  const trend = ["Sys", "Dia", "Pls"];

  const [index, setIndex] = useState(0);

  function switchTrend() {
    if (index < trend.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  }

  const { slope, trendLine } = calculateTrend(readings, trend[index]);

  const trendColor =
    slope > 0.5
      ? "rgba(185, 28, 28,1)" // red
      : slope < -0.5
        ? "rgba(34, 197, 94,1)" // green
        : "rgba(128, 128, 128,0.75)";

  const data = useMemo(
    () => ({
      labels: sorted.map((r) =>
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
          data: sorted.map((r) => r.systolic),
          readings: sorted,
          borderColor: "rgb(4,94,249)",
          borderWidth: 2,
          pointRadius: window.innerWidth < 800 ? 1 : 2, //sorted.map((r) => (r.id === hoveredReadingId ? 6 : 2)),
          tension: 0,
          backgroundColor: "rgba(4,94,249)",
        },
        {
          label: "Diastolic",
          data: sorted.map((r) => r.diastolic),
          readings: sorted,
          borderColor: "rgb(180,4,249)",
          borderWidth: 2,
          pointRadius: window.innerWidth < 800 ? 1 : 2, //sorted.map((r) => (r.id === hoveredReadingId ? 6 : 2)),
          tension: 0,
          backgroundColor: "rgba(180,4,249)",
        },
        {
          label: "Pulse",
          data: sorted.map((r) => r.pulse),
          readings: sorted,
          borderColor: "rgb(160,160,1)",
          borderWidth: 2,
          pointRadius: window.innerWidth < 800 ? 1 : 2, //sorted.map((r) => (r.id === hoveredReadingId ? 6 : 2)),
          tension: 0,
          backgroundColor: "rgba(160,160,1)",
        },
        {
          label: `Trend (${trend[index]}: ${slope.toFixed(2)})`,
          data: trendLine,
          borderColor: trendColor,
          borderWidth: 2,
          borderDash: [5, 3],
          pointRadius: 0,
        },
      ],
    }),
    [sorted, hoveredReadingId, pulse, window.innerWidth],
  );

  //const colNm = 'rgba(34, 197, 94,0.2)';

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ping: {
          hoveredReadingId,
          pulse,
          drawTime: "afterDatasetsDraw",
        },
        legend: {
          position: "top",
        },
        annotation: {
          annotations: {
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
    }),
    [hoveredReadingId, pulse],
  );

  return (
    <div
      className={`mt-3 w-full overflow-x-auto bg-gray-100 dark:bg-gray-800 p-4 rounded-t-xl rounded-b-xl shadow mb-3 transition-colors duration-300`}
    >
      <h2 className="text-md font-semibold mb-2 dark:text-gray-50 dark:text-opacity-60">
        <button onClick={switchTrend}>Trend</button>
      </h2>
      <div className="h-[300px] sm:h-[400px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
