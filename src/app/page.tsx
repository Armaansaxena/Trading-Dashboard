// src/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useTradingStore } from '@/store/tradingStore'
import { getMockTradesForDev } from '@/utils/mockData'
import { AnalyticsEngine } from '@/utils/analytics'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PnLChart } from '@/components/charts/PnLChart'
import { formatCurrency, formatPercentage, formatCompactNumber, getPnLColor } from '@/lib/utils'
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { DrawdownChart } from '@/components/charts/DrawdownChart'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { HourlyHeatmap } from '@/components/charts/HourlyHeatmap'
import { FeeBreakdownCard } from '@/components/dashboard/FeeBreakdown'
import { DayOfWeekChart } from '@/components/charts/DayOfWeekChart'
import { CumulativeFeesChart } from '@/components/charts/CumulativeFeesChart'
import { WalletButton } from '@/components/wallet/WalletButton'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export default function Home() {
  const { trades, filteredTrades, metrics, setTrades, isLoading } = useTradingStore()

  useEffect(() => {
    // Load mock data on mount
    const mockTrades = getMockTradesForDev()
    setTrades(mockTrades)
  }, [setTrades])

  if (isLoading || !metrics) {
    return (
      <main className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading your trading analytics...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Generate chart data
  const timeSeriesData = AnalyticsEngine.generateTimeSeriesData(filteredTrades)
  const symbolPerformance = AnalyticsEngine.calculateSymbolPerformance(filteredTrades)
  const orderTypePerformance = AnalyticsEngine.calculateOrderTypePerformance(filteredTrades)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Deriverse Analytics</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Professional Trading Journal & Portfolio Analysis
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <ThemeToggle />
              <Link 
                href="/journal"
                className="px-3 sm:px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors whitespace-nowrap"
              >
                View Journal
              </Link>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"> 
        
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total PnL"
            value={formatCurrency(metrics.totalPnL)}
            subtitle={`From ${metrics.tradeCount} trades`}
            valueClassName={getPnLColor(metrics.totalPnL)}
            icon={<DollarSign className={`h-8 w-8 ${getPnLColor(metrics.totalPnL)}`} />}
            trend={metrics.totalPnL > 0 ? 'up' : metrics.totalPnL < 0 ? 'down' : 'neutral'}
          />
          
          <MetricCard
            title="Win Rate"
            value={formatPercentage(metrics.winRate)}
            subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
            icon={<Target className="h-8 w-8 text-primary" />}
          />
          
          <MetricCard
            title="Total Volume"
            value={formatCompactNumber(metrics.totalVolume)}
            subtitle={`Avg: ${formatCurrency(metrics.totalVolume / metrics.tradeCount)}`}
            icon={<BarChart3 className="h-8 w-8 text-blue-500" />}
          />
          
          <MetricCard
            title="Profit Factor"
            value={metrics.profitFactor.toFixed(2)}
            subtitle={metrics.profitFactor > 1 ? 'Profitable' : 'Needs improvement'}
            valueClassName={metrics.profitFactor > 1 ? 'text-profit' : 'text-loss'}
            icon={<TrendingUp className="h-8 w-8 text-purple-500" />}
          />
        </div>

        {/* Performance Chart */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Performance Over Time</h2>
              <p className="text-sm text-muted-foreground">
                Cumulative PnL and individual trade results
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent">
                1W
              </button>
              <button className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent">
                1M
              </button>
              <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md">
                All
              </button>
            </div>
          </div>
          <PnLChart data={timeSeriesData} type="area" showCumulative={true} height={400} />
        </div>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Risk Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Max Drawdown</span>
                <span className="text-sm font-semibold text-loss">
                  {formatCurrency(metrics.maxDrawdown)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                <span className="text-sm font-semibold">
                  {metrics.sharpeRatio?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Risk/Reward</span>
                <span className="text-sm font-semibold">
                  {metrics.averageRiskRewardRatio?.toFixed(2) || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Trade Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Win</span>
                <span className="text-sm font-semibold text-profit">
                  {formatCurrency(metrics.averageWin)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Loss</span>
                <span className="text-sm font-semibold text-loss">
                  {formatCurrency(metrics.averageLoss)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Long/Short Ratio</span>
                <span className="text-sm font-semibold">
                  {metrics.longShortRatio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Extremes</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Largest Win</span>
                <span className="text-sm font-semibold text-profit">
                  {formatCurrency(metrics.largestGain)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Largest Loss</span>
                <span className="text-sm font-semibold text-loss">
                  {formatCurrency(metrics.largestLoss)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best Streak</span>
                <span className="text-sm font-semibold text-profit">
                  {metrics.consecutiveWins} wins
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Symbol Performance */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Symbol Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium text-right">Trades</th>
                  <th className="pb-3 font-medium text-right">PnL</th>
                  <th className="pb-3 font-medium text-right">Win Rate</th>
                  <th className="pb-3 font-medium text-right">Avg PnL</th>
                  <th className="pb-3 font-medium text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {symbolPerformance.slice(0, 8).map((symbol) => (
                  <tr key={symbol.symbol} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium">{symbol.symbol}</td>
                    <td className="py-3 text-right text-muted-foreground">{symbol.trades}</td>
                    <td className={`py-3 text-right font-semibold ${getPnLColor(symbol.pnl)}`}>
                      {formatCurrency(symbol.pnl)}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {formatPercentage(symbol.winRate)}
                    </td>
                    <td className={`py-3 text-right ${getPnLColor(symbol.averagePnL)}`}>
                      {formatCurrency(symbol.averagePnL)}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {formatCompactNumber(symbol.volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Type Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orderTypePerformance.map((orderType) => (
            <div key={orderType.orderType} className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase">
                {orderType.orderType} Orders
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Trades</span>
                  <span className="text-sm font-semibold">{orderType.trades}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">PnL</span>
                  <span className={`text-sm font-semibold ${getPnLColor(orderType.pnl)}`}>
                    {formatCurrency(orderType.pnl)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                  <span className="text-sm font-semibold">
                    {formatPercentage(orderType.winRate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg PnL</span>
                  <span className={`text-sm font-semibold ${getPnLColor(orderType.averagePnL)}`}>
                    {formatCurrency(orderType.averagePnL)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Charts Section */}
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          
          {/* Drawdown Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Drawdown Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Track your maximum decline from peak equity
              </p>
            </div>
            <DrawdownChart data={timeSeriesData} height={300} />
          </div>

          {/* Volume Chart */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Trading Volume</h3>
              <p className="text-sm text-muted-foreground">
                Daily trading volume colored by profit/loss
              </p>
            </div>
            <VolumeChart data={timeSeriesData} height={300} />
          </div>

{/* Hourly Heatmap */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Hourly Performance Heatmap</h3>
              <p className="text-sm text-muted-foreground">
                Identify your best trading hours (hover for details)
              </p>
            </div>
            <HourlyHeatmap data={AnalyticsEngine.calculateHourlyPerformance(filteredTrades)} />
          </div>

          {/* Day of Week Performance */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Day of Week Performance</h3>
              <p className="text-sm text-muted-foreground">
                Identify your most profitable trading days
              </p>
            </div>
            <DayOfWeekChart data={AnalyticsEngine.calculateDailyPerformance(filteredTrades)} height={300} />
          </div>

          {/* Fee Analysis */}
          <FeeBreakdownCard feeData={AnalyticsEngine.calculateFeeBreakdown(filteredTrades)} />

          {/* Cumulative Fees */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Cumulative Fees Over Time</h3>
              <p className="text-sm text-muted-foreground">
                Track total fees paid across all trades
              </p>
            </div>
            <CumulativeFeesChart data={timeSeriesData} height={250} />
          </div>
        </div>

      </div>
    </main>
  )
}