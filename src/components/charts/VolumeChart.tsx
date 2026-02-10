// src/components/charts/VolumeChart.tsx
'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TimeSeriesData } from '@/types/trading'
import { formatCurrency, formatCompactNumber, formatDate } from '@/lib/utils'

interface VolumeChartProps {
  data: TimeSeriesData[]
  height?: number
}

export function VolumeChart({ data, height = 300 }: VolumeChartProps) {

  const responsiveHeight = typeof window !== 'undefined' && window.innerWidth < 640 ? 250 : height;
  
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDate: formatDate(item.timestamp, 'short')
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Volume:</span>
              <span className="text-sm font-semibold text-primary">
                {formatCurrency(payload[0].payload.volume)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">PnL:</span>
              <span className={`text-sm font-semibold ${
                payload[0].payload.pnl >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {formatCurrency(payload[0].payload.pnl)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={responsiveHeight}>
        <BarChart data={chartData}>
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
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="volume" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'}
                opacity={0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}