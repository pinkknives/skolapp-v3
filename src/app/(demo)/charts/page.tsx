"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { LineProgress } from '@/components/charts/LineProgress'
import { BarBySubject } from '@/components/charts/BarBySubject'
import { Distribution } from '@/components/charts/Distribution'

export default function ChartsDemoPage() {
  const [useMock, setUseMock] = React.useState(true)

  const lineData = useMock
    ? [
        { name: 'V.01', value: 62 },
        { name: 'V.02', value: 64 },
        { name: 'V.03', value: 67 },
        { name: 'V.04', value: 66 },
        { name: 'V.05', value: 70 },
      ]
    : []

  const subjectData = useMock
    ? [
        { subject: 'Matematik', value: 72 },
        { subject: 'Svenska', value: 65 },
        { subject: 'Engelska', value: 78 },
        { subject: 'NO', value: 61 },
      ]
    : []

  const distributionData = useMock
    ? [
        { label: '0-20', count: 2 },
        { label: '21-40', count: 4 },
        { label: '41-60', count: 7 },
        { label: '61-80', count: 10 },
        { label: '81-100', count: 5 },
      ]
    : []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <Typography variant="h3" className="font-semibold">Charts Demo</Typography>
          <Typography variant="body2" className="text-neutral-600">shadcn/ui + Recharts – mockdata vs live.</Typography>
        </div>
        <Button variant="outline" onClick={() => setUseMock(!useMock)}>
          {useMock ? 'Visa (live när klart)' : 'Visa mock'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linjetrend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineProgress data={lineData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarBySubject data={subjectData} />
        <Distribution data={distributionData} />
      </div>
    </div>
  )
}
