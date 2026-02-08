// src/components/charts/DayOfWeekChart.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DailyPerformance } from '@/types/trading'
import { formatCurrency } from '@/lib/utils'

interface DayOfWeekChartProps {
  data: DailyPerformance[]
  height?: number
}

export function DayOfWeekChart({ data, height = 300 }: DayOfWeekChartProps) {
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{item.day}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Trades:</span>
              <span className="text-sm font-semibold">{item.trades}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Total PnL:</span>
              <span className={`text-sm font-semibold ${
                item.totalPnL >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {formatCurrency(item.totalPnL)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Avg PnL:</span>
              <span className={`text-sm font-semibold ${
                item.averagePnL >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {formatCurrency(item.averagePnL)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">Win Rate:</span>
              <span className="text-sm font-semibold">{item.winRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="day" 
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
          <Bar 
            dataKey="totalPnL" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.totalPnL >= 0 ? '#10b981' : '#ef4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}