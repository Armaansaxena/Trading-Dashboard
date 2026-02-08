// src/components/charts/DrawdownChart.tsx
'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TimeSeriesData } from '@/types/trading'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DrawdownChartProps {
  data: TimeSeriesData[]
  height?: number
}

export function DrawdownChart({ data, height = 300 }: DrawdownChartProps) {
  
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: formatDate(item.timestamp, 'short'),
      drawdownNegative: -Math.abs(item.drawdown) // Make drawdown negative for visual clarity
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">Drawdown:</span>
            <span className="text-sm font-semibold text-loss">
              {formatCurrency(Math.abs(payload[0].payload.drawdown))}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="formattedDate" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9ca3af' }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="drawdownNegative"
            name="Drawdown"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorDrawdown)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}