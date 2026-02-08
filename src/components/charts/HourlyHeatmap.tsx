// src/components/charts/HourlyHeatmap.tsx
'use client'

import { HourlyPerformance } from '@/types/trading'
import { formatCurrency } from '@/lib/utils'

interface HourlyHeatmapProps {
  data: HourlyPerformance[]
}

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  
  // Find min and max for color scaling
  const pnls = data.map(d => d.totalPnL)
  const maxPnL = Math.max(...pnls)
  const minPnL = Math.min(...pnls)
  const range = Math.max(Math.abs(maxPnL), Math.abs(minPnL))

  const getColor = (value: number) => {
    if (value === 0) return 'bg-muted'
    
    const intensity = Math.abs(value) / range
    const opacity = Math.min(Math.max(intensity, 0.2), 1)
    
    if (value > 0) {
      return `bg-profit`
    } else {
      return `bg-loss`
    }
  }

  const getOpacity = (value: number) => {
    if (value === 0) return 0.1
    const intensity = Math.abs(value) / range
    return Math.min(Math.max(intensity * 0.8, 0.2), 0.8)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-12 gap-2">
          {data.map((hour) => (
            <div
              key={hour.hour}
              className="relative group"
            >
              <div
                className={`${getColor(hour.totalPnL)} rounded-lg p-4 transition-all hover:scale-105 cursor-pointer border border-border`}
                style={{ opacity: getOpacity(hour.totalPnL) }}
              >
                <div className="text-center">
                  <p className="text-xs font-medium text-foreground mb-1">
                    {hour.hour.toString().padStart(2, '0')}:00
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {hour.trades}
                  </p>
                </div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-card border border-border rounded-lg p-3 shadow-xl whitespace-nowrap">
                  <p className="text-sm font-semibold mb-2">
                    {hour.hour.toString().padStart(2, '0')}:00 - {(hour.hour + 1).toString().padStart(2, '0')}:00
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Trades:</span>
                      <span className="font-semibold">{hour.trades}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Total PnL:</span>
                      <span className={`font-semibold ${hour.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(hour.totalPnL)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Avg PnL:</span>
                      <span className={`font-semibold ${hour.averagePnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(hour.averagePnL)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Win Rate:</span>
                      <span className="font-semibold">{hour.winRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-profit opacity-80 rounded"></div>
            <span className="text-xs text-muted-foreground">Profitable Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-loss opacity-80 rounded"></div>
            <span className="text-xs text-muted-foreground">Losing Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted opacity-50 rounded"></div>
            <span className="text-xs text-muted-foreground">No Trades</span>
          </div>
        </div>
      </div>
    </div>
  )
}