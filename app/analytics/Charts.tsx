"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BasePoint = {
  label: string;
};

type WeeklyPoint = BasePoint & { calories: number };
type RollingPoint = BasePoint & { average: number };
type DeltaPoint = BasePoint & { calories: number };
type DeficitDailyPoint = BasePoint & { deficit: number };
type DeficitTotalPoint = BasePoint & { totalDeficit: number };

export default function AnalyticsCharts(props: {
  variant: "weekly";
  data: WeeklyPoint[];
  targetCalories: number;
  targetLabel: string;
} | {
  variant: "rolling";
  data: RollingPoint[];
} | {
  variant: "delta";
  data: DeltaPoint[];
  targetCalories: number;
  deltaLabel: string;
} | {
  variant: "deficitDaily";
  data: DeficitDailyPoint[];
} | {
  variant: "deficitTotal";
  data: DeficitTotalPoint[];
}) {
  const tooltipStyle = { background: "#0f172a", border: "1px solid #334155" };

  return (
    <div className="mt-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        {props.variant === "weekly" ? (
          <LineChart data={props.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="calories" stroke="#34d399" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey={() => props.targetCalories}
              name={props.targetLabel}
              stroke="#f97316"
              strokeDasharray="4 4"
            />
          </LineChart>
        ) : props.variant === "rolling" ? (
          <LineChart data={props.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="average" stroke="#38bdf8" strokeWidth={2} />
          </LineChart>
        ) : props.variant === "delta" ? (
          <BarChart
            data={props.data.map((item) => ({
              ...item,
              delta: item.calories - props.targetCalories,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="delta" fill="#f97316" name={props.deltaLabel} />
          </BarChart>
        ) : props.variant === "deficitTotal" ? (
          <LineChart data={props.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line type="monotone" dataKey="totalDeficit" stroke="#f97316" strokeWidth={2} />
          </LineChart>
        ) : (
          <BarChart data={props.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="deficit" fill="#34d399" name="Deficit" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

