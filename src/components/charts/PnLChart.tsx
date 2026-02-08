// src/components/charts/PnLChart.tsx
'use client'

import { useMemo } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TimeSeriesData } from '@/types/trading'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PnLChartProps {
  data: TimeSeriesData[]
  type?: 'line' | 'area'
  showCumulative?: boolean
  height?: number
}

export function PnLChart({ 
  data, 
  type = 'area', 
  showCumulative = true,
  height = 300 
}: PnLChartProps) {
  
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
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">{entry.name}:</span>
              <span className={`text-sm font-semibold ${
                entry.value >= 0 ? 'text-profit' : 'text-loss'
              }`}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const ChartComponent = type === 'area' ? AreaChart : LineChart

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={chartData}>
          <defs>
            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          
          {type === 'area' ? (
            <>
              {showCumulative && (
                <Area
                  type="monotone"
                  dataKey="cumulativePnL"
                  name="Cumulative PnL"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorCumulative)"
                  animationDuration={1000}
                />
              )}
              <Area
                type="monotone"
                dataKey="pnl"
                name="Trade PnL"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorPnL)"
                animationDuration={1000}
              />
            </>
          ) : (
            <>
              {showCumulative && (
                <Line
                  type="monotone"
                  dataKey="cumulativePnL"
                  name="Cumulative PnL"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              )}
              <Line
                type="monotone"
                dataKey="pnl"
                name="Trade PnL"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}