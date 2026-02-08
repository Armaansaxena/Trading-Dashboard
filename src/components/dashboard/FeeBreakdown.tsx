// src/components/dashboard/FeeBreakdown.tsx
'use client'

import { FeeBreakdown } from '@/types/trading'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { DollarSign, TrendingDown, Percent } from 'lucide-react'

interface FeeBreakdownProps {
  feeData: FeeBreakdown
}

export function FeeBreakdownCard({ feeData }: FeeBreakdownProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-xl font-semibold">Fee Analysis</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Fees */}
        <div className="bg-loss/10 border border-loss/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-loss" />
            <span className="text-sm text-muted-foreground">Total Fees Paid</span>
          </div>
          <p className="text-2xl font-bold text-loss">
            {formatCurrency(feeData.totalFees)}
          </p>
        </div>

        {/* Average Fee Per Trade */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Avg Fee Per Trade</p>
          <p className="text-2xl font-bold">
            {formatCurrency(feeData.averageFeePerTrade)}
          </p>
        </div>

        {/* Fee as % of Volume */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Fee % of Volume</span>
          </div>
          <p className="text-2xl font-bold">
            {formatPercentage(feeData.feesAsPercentOfVolume)}
          </p>
        </div>
      </div>

      {/* Fee Composition */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Fee Composition</h4>
        
        <div className="space-y-2">
          {/* Trading Fees */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Trading Fees (80%)</span>
                <span className="text-sm font-semibold text-loss">
                  {formatCurrency(feeData.tradingFees)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-loss transition-all"
                  style={{ width: '80%' }}
                />
              </div>
            </div>
          </div>

          {/* Network Fees */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Network Fees (20%)</span>
                <span className="text-sm font-semibold text-orange-500">
                  {formatCurrency(feeData.networkFees)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: '20%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}