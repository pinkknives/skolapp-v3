"use client"

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { motion } from 'framer-motion'

export interface LinePoint {
  name: string
  value: number
}

interface LineProgressProps {
  data: LinePoint[]
  title?: string
  height?: 'sm' | 'md' | 'lg'
}

const heightClassMap = {
  sm: 'h-56',
  md: 'h-72',
  lg: 'h-96',
}

export function LineProgress({ data, title = 'Utveckling över tid', height = 'md' }: LineProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className={heightClassMap[height] + ' w-full'}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
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
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  )
}
