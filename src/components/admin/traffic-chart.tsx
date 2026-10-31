"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Point {
  date: string;
  label: string;
  visitors: number;
}

export default function TrafficChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, fontSize: 12 }}
            labelFormatter={(l) => `${l}`}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#38bdf8"
            strokeWidth={2.5}
            fill="url(#visitorsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
