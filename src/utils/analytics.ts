// src/utils/analytics.ts
import { 
  Trade, 
  PortfolioMetrics, 
  TimeSeriesData, 
  SymbolPerformance,
  HourlyPerformance,
  DailyPerformance,
  OrderTypePerformance,
  FeeBreakdown
} from '@/types/trading'
import { format } from 'date-fns'

/**
 * Analytics Engine - Calculates all trading metrics
 */
export class AnalyticsEngine {
  
  /**
   * Calculate comprehensive portfolio metrics
   */
  static calculatePortfolioMetrics(trades: Trade[]): PortfolioMetrics {
    const completedTrades = trades.filter(t => t.exitPrice !== null)
    
    if (completedTrades.length === 0) {
      return this.getEmptyMetrics()
    }

    // Basic calculations
    const totalPnL = completedTrades.reduce((sum, t) => sum + t.pnl, 0)
    const totalVolume = completedTrades.reduce((sum, t) => sum + (t.entryPrice * t.size), 0)
    const totalFees = completedTrades.reduce((sum, t) => sum + t.fees, 0)
    
    // Win/Loss analysis
    const winningTrades = completedTrades.filter(t => t.pnl > 0)
    const losingTrades = completedTrades.filter(t => t.pnl < 0)
    const breakEvenTrades = completedTrades.filter(t => t.pnl === 0)
    
    const winRate = completedTrades.length > 0 
      ? (winningTrades.length / completedTrades.length) * 100 
      : 0
    
    // Duration analysis
    const averageTradeDuration = completedTrades.length > 0
      ? completedTrades.reduce((sum, t) => sum + t.duration, 0) / completedTrades.length
      : 0
    
    // Long/Short analysis
    const longTrades = completedTrades.filter(t => t.side === 'long').length
    const shortTrades = completedTrades.filter(t => t.side === 'short').length
    const longShortRatio = shortTrades > 0 ? longTrades / shortTrades : longTrades
    
    // Gain/Loss analysis
    const largestGain = winningTrades.length > 0 
      ? Math.max(...winningTrades.map(t => t.pnl)) 
      : 0
    const largestLoss = losingTrades.length > 0 
      ? Math.min(...losingTrades.map(t => t.pnl)) 
      : 0
    
    // Average win/loss
    const averageWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0
    
    const averageLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
      : 0
    
    // Profit factor
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit
    
    // Risk metrics
    const maxDrawdown = this.calculateMaxDrawdown(completedTrades)
    const sharpeRatio = this.calculateSharpeRatio(completedTrades)
    
    // Streak analysis
    const { consecutiveWins, consecutiveLosses } = this.calculateStreaks(completedTrades)
    
    // Risk/Reward ratio
    const averageRiskRewardRatio = averageLoss > 0 ? averageWin / averageLoss : 0

    return {
      totalPnL,
      totalVolume,
      totalFees,
      winRate,
      tradeCount: completedTrades.length,
      averageTradeDuration,
      longShortRatio,
      largestGain,
      largestLoss,
      averageWin,
      averageLoss,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      consecutiveWins,
      consecutiveLosses,
      averageRiskRewardRatio
    }
  }

  /**
   * Calculate maximum drawdown
   */
  static calculateMaxDrawdown(trades: Trade[]): number {
    let peak = 0
    let maxDrawdown = 0
    let cumulativePnL = 0

    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp)

    sortedTrades.forEach(trade => {
      cumulativePnL += trade.pnl
      
      if (cumulativePnL > peak) {
        peak = cumulativePnL
      }
      
      const drawdown = peak - cumulativePnL
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    return maxDrawdown
  }

  /**
   * Calculate Sharpe Ratio (annualized)
   */
  static calculateSharpeRatio(trades: Trade[]): number {
    if (trades.length < 2) return 0

    const returns = trades.map(t => t.pnl)
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
    
    // Calculate standard deviation
    const squaredDiffs = returns.map(r => Math.pow(r - avgReturn, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length
    const stdDev = Math.sqrt(variance)
    
    if (stdDev === 0) return 0
    
    // Assuming 252 trading days per year and daily returns
    const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252)
    
    return sharpeRatio
  }

  /**
   * Calculate consecutive win/loss streaks
   */
  static calculateStreaks(trades: Trade[]): { consecutiveWins: number; consecutiveLosses: number } {
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp)
    
    let maxWinStreak = 0
    let maxLossStreak = 0
    let currentWinStreak = 0
    let currentLossStreak = 0

    sortedTrades.forEach(trade => {
      if (trade.pnl > 0) {
        currentWinStreak++
        currentLossStreak = 0
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
      } else if (trade.pnl < 0) {
        currentLossStreak++
        currentWinStreak = 0
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
      }
    })

    return {
      consecutiveWins: maxWinStreak,
      consecutiveLosses: maxLossStreak
    }
  }

  /**
   * Generate time series data for charts
   */
  static generateTimeSeriesData(trades: Trade[]): TimeSeriesData[] {
    const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp)
    let cumulativePnL = 0
    let peak = 0
    const result: TimeSeriesData[] = []

    sortedTrades.forEach(trade => {
      cumulativePnL += trade.pnl
      
      if (cumulativePnL > peak) {
        peak = cumulativePnL
      }
      
      const drawdown = peak - cumulativePnL

      result.push({
        timestamp: trade.timestamp,
        date: format(new Date(trade.timestamp), 'MMM dd, yyyy'),
        pnl: trade.pnl,
        cumulativePnL,
        volume: trade.entryPrice * trade.size,
        fees: trade.fees,
        drawdown,
        tradeCount: 1
      })
    })

    return result
  }

  /**
   * Calculate symbol performance
   */
  static calculateSymbolPerformance(trades: Trade[]): SymbolPerformance[] {
    const symbolMap = new Map<string, Trade[]>()
    
    trades.forEach(trade => {
      if (!symbolMap.has(trade.symbol)) {
        symbolMap.set(trade.symbol, [])
      }
      symbolMap.get(trade.symbol)!.push(trade)
    })
    
    const result: SymbolPerformance[] = []
    
    symbolMap.forEach((symbolTrades, symbol) => {
      const pnl = symbolTrades.reduce((sum, t) => sum + t.pnl, 0)
      const volume = symbolTrades.reduce((sum, t) => sum + (t.entryPrice * t.size), 0)
      const totalFees = symbolTrades.reduce((sum, t) => sum + t.fees, 0)
      const winningTrades = symbolTrades.filter(t => t.pnl > 0).length
      const winRate = (winningTrades / symbolTrades.length) * 100
      const averagePnL = pnl / symbolTrades.length
      const largestWin = Math.max(...symbolTrades.map(t => t.pnl), 0)
      const largestLoss = Math.min(...symbolTrades.map(t => t.pnl), 0)
      
      result.push({
        symbol,
        trades: symbolTrades.length,
        pnl,
        winRate,
        volume,
        averagePnL,
        largestWin,
        largestLoss,
        totalFees
      })
    })
    
    return result.sort((a, b) => b.pnl - a.pnl)
  }

  /**
   * Calculate hourly performance
   */
  static calculateHourlyPerformance(trades: Trade[]): HourlyPerformance[] {
    const hourlyData = new Array(24).fill(0).map(() => ({ 
      pnl: 0, 
      count: 0,
      wins: 0 
    }))
    
    trades.forEach(trade => {
      const hour = new Date(trade.timestamp).getHours()
      hourlyData[hour].pnl += trade.pnl
      hourlyData[hour].count += 1
      if (trade.pnl > 0) hourlyData[hour].wins += 1
    })
    
    return hourlyData.map((data, hour) => ({
      hour,
      averagePnL: data.count > 0 ? data.pnl / data.count : 0,
      trades: data.count,
      totalPnL: data.pnl,
      winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0
    }))
  }

  /**
   * Calculate daily (day of week) performance
   */
  static calculateDailyPerformance(trades: Trade[]): DailyPerformance[] {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dailyData = new Array(7).fill(0).map(() => ({ 
      pnl: 0, 
      count: 0,
      wins: 0 
    }))
    
    trades.forEach(trade => {
      const day = new Date(trade.timestamp).getDay()
      dailyData[day].pnl += trade.pnl
      dailyData[day].count += 1
      if (trade.pnl > 0) dailyData[day].wins += 1
    })
    
    return dailyData.map((data, index) => ({
      day: days[index],
      dayIndex: index,
      averagePnL: data.count > 0 ? data.pnl / data.count : 0,
      trades: data.count,
      totalPnL: data.pnl,
      winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0
    }))
  }

  /**
   * Calculate order type performance
   */
  static calculateOrderTypePerformance(trades: Trade[]): OrderTypePerformance[] {
    const orderTypes: ('market' | 'limit' | 'stop')[] = ['market', 'limit', 'stop']
    
    return orderTypes.map(orderType => {
      const typeTrades = trades.filter(t => t.orderType === orderType)
      const pnl = typeTrades.reduce((sum, t) => sum + t.pnl, 0)
      const totalFees = typeTrades.reduce((sum, t) => sum + t.fees, 0)
      const wins = typeTrades.filter(t => t.pnl > 0).length
      const winRate = typeTrades.length > 0 ? (wins / typeTrades.length) * 100 : 0
      const averagePnL = typeTrades.length > 0 ? pnl / typeTrades.length : 0
      
      return {
        orderType,
        trades: typeTrades.length,
        pnl,
        winRate,
        averagePnL,
        totalFees
      }
    }).filter(data => data.trades > 0)
  }

  /**
   * Calculate fee breakdown
   */
  static calculateFeeBreakdown(trades: Trade[]): FeeBreakdown {
    const totalFees = trades.reduce((sum, t) => sum + t.fees, 0)
    const totalVolume = trades.reduce((sum, t) => sum + (t.entryPrice * t.size), 0)
    const averageFeePerTrade = trades.length > 0 ? totalFees / trades.length : 0
    const feesAsPercentOfVolume = totalVolume > 0 ? (totalFees / totalVolume) * 100 : 0
    
    // Assuming 80% trading fees, 20% network fees (adjust based on Deriverse)
    const tradingFees = totalFees * 0.8
    const networkFees = totalFees * 0.2
    
    return {
      tradingFees,
      networkFees,
      totalFees,
      averageFeePerTrade,
      feesAsPercentOfVolume
    }
  }

  /**
   * Get empty metrics (for when there are no trades)
   */
  private static getEmptyMetrics(): PortfolioMetrics {
    return {
      totalPnL: 0,
      totalVolume: 0,
      totalFees: 0,
      winRate: 0,
      tradeCount: 0,
      averageTradeDuration: 0,
      longShortRatio: 0,
      largestGain: 0,
      largestLoss: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winningTrades: 0,
      losingTrades: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      averageRiskRewardRatio: 0
    }
  }
}