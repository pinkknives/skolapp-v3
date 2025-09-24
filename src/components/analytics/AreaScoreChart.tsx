"use client"

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface AreaScorePoint {
  name: string
  value: number
}

interface AreaScoreChartProps {
  data: AreaScorePoint[]
  label?: string
  height?: number
}

export function AreaScoreChart({ data, label = 'Poäng', height = 260 }: AreaScoreChartProps) {
  const heightClass = height >= 360 ? 'h-96' : height >= 320 ? 'h-80' : height >= 280 ? 'h-72' : 'h-64'
  return (
    <div className="w-full">
      <div className={heightClass}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-neutral-500" />
            <YAxis tick={{ fontSize: 12 }} className="text-neutral-500" />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              }}
            />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#scoreColor)" name={label} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
