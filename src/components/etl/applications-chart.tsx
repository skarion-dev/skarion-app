"use client";

import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EtlStats } from "@/api-client/services/EtlService";

// Register Chart.js modules once — safe to call multiple times
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type Tab = "day" | "month" | "year";

interface Props {
  stats: EtlStats;
}

const TAB_LABELS: Record<Tab, string> = {
  day: "Last 30 Days",
  month: "Last 12 Months",
  year: "All Years",
};

const commonOptions = (label: string): ChartOptions<"bar" | "line"> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.parsed.y} application${ctx.parsed.y !== 1 ? "s" : ""}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, maxRotation: 45 },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: {
        stepSize: 1,
        font: { size: 11 },
        callback: (v) => (Number.isInteger(v) ? v : ""),
      },
    },
  },
});

export function ApplicationsChart({ stats }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("month");
  const [mounted, setMounted] = useState(false);

  // Avoid SSR mismatch with Chart.js canvas
  useEffect(() => { setMounted(true); }, []);

  const dayData: ChartData<"line"> = {
    labels: stats.byDay.map((d) => {
      const [, , dd] = d.date.split("-");
      return `${dd}`;
    }),
    datasets: [
      {
        label: "Applications",
        data: stats.byDay.map((d) => d.count),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.12)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgb(99, 102, 241)",
      },
    ],
  };

  const monthData: ChartData<"bar"> = {
    labels: stats.byMonth.map((d) => {
      const [year, month] = d.month.split("-");
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Applications",
        data: stats.byMonth.map((d) => d.count),
        backgroundColor: "rgba(99, 102, 241, 0.75)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(99, 102, 241, 0.95)",
      },
    ],
  };

  const yearData: ChartData<"bar"> = {
    labels: stats.byYear.map((d) => d.year),
    datasets: [
      {
        label: "Applications",
        data: stats.byYear.map((d) => d.count),
        backgroundColor: "rgba(16, 185, 129, 0.75)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(16, 185, 129, 0.95)",
      },
    ],
  };

  const hasData =
    (activeTab === "day" && stats.byDay.length > 0) ||
    (activeTab === "month" && stats.byMonth.length > 0) ||
    (activeTab === "year" && stats.byYear.length > 0);

  return (
    <Card className="border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="text-base font-semibold">Applications Over Time</CardTitle>
        {/* Tab switcher */}
        <div className="flex rounded-lg border bg-muted/50 p-0.5 gap-0.5">
          {(["day", "month", "year"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          {!mounted ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Loading chart…
            </div>
          ) : !hasData ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No data available for this period
            </div>
          ) : activeTab === "day" ? (
            <Line
              data={dayData}
              options={commonOptions("day") as ChartOptions<"line">}
            />
          ) : (
            <Bar
              data={activeTab === "month" ? monthData : yearData}
              options={commonOptions(activeTab) as ChartOptions<"bar">}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
