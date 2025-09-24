"use client"

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export interface DistributionBin {
  label: string
  count: number
}

interface DistributionProps {
  data: DistributionBin[]
  title?: string
  height?: 'sm' | 'md' | 'lg'
}

const heightClassMap = {
  sm: 'h-56',
  md: 'h-72',
  lg: 'h-96',
}

export function Distribution({ data, title = 'Resultatfördelning', height = 'md' }: DistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={heightClassMap[height] + ' w-full'}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-neutral-500" />
              <YAxis tick={{ fontSize: 12 }} className="text-neutral-500" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
