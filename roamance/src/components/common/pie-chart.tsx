'use client';

import React from 'react';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: ChartData[];
  isDarkMode: boolean;
}

export function PieChart({ data, isDarkMode }: PieChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className={`p-3 rounded-lg shadow-md ${isDarkMode ? 'bg-background/90 border border-muted/20' : 'bg-white/95 border border-muted/10'}`}>
          <p className="font-medium text-sm">{item.name}</p>
          <p className="text-sm" style={{ color: item.payload.color }}>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(item.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

              if (percent < 0.05) return null;

              return (
                <text
                  x={x}
                  y={y}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs font-medium"
                >
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsChart>
      </ResponsiveContainer>
    </div>
  );
}
