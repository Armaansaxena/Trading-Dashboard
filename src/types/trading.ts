// src/types/trading.ts

/**
 * Represents a single trade executed on Deriverse
 */
export interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number | null;
  size: number;
  pnl: number;
  fees: number;
  orderType: 'market' | 'limit' | 'stop';
  duration: number; // in seconds
  notes?: string;
  tags?: string[];
  signature: string; // Solana transaction signature
  leverage?: number;
  entryTime: number;
  exitTime?: number;
}

/**
 * Comprehensive portfolio performance metrics
 */
export interface PortfolioMetrics {
  totalPnL: number;
  totalVolume: number;
  totalFees: number;
  winRate: number;
  tradeCount: number;
  averageTradeDuration: number;
  longShortRatio: number;
  largestGain: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio?: number;
  maxDrawdown: number;
  maxDrawdownDuration?: number;
  winningTrades: number;
  losingTrades: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  averageRiskRewardRatio?: number;
}

/**
 * Time series data for historical charts
 */
export interface TimeSeriesData {
  timestamp: number;
  date: string;
  pnl: number;
  cumulativePnL: number;
  volume: number;
  fees: number;
  drawdown: number;
  tradeCount: number;
}

/**
 * Performance breakdown by trading symbol
 */
export interface SymbolPerformance {
  symbol: string;
  trades: number;
  pnl: number;
  winRate: number;
  volume: number;
  averagePnL: number;
  largestWin: number;
  largestLoss: number;
  totalFees: number;
}

/**
 * Filter options for trade history
 */
export interface FilterOptions {
  symbols?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  side?: 'long' | 'short' | 'all';
  orderType?: ('market' | 'limit' | 'stop')[];
  minPnL?: number;
  maxPnL?: number;
  tags?: string[];
  searchQuery?: string;
}

/**
 * Performance by hour of day
 */
export interface HourlyPerformance {
  hour: number;
  averagePnL: number;
  trades: number;
  totalPnL: number;
  winRate: number;
}

/**
 * Performance by day of week
 */
export interface DailyPerformance {
  day: string;
  dayIndex: number;
  averagePnL: number;
  trades: number;
  totalPnL: number;
  winRate: number;
}

/**
 * Order type performance breakdown
 */
export interface OrderTypePerformance {
  orderType: 'market' | 'limit' | 'stop';
  trades: number;
  pnl: number;
  winRate: number;
  averagePnL: number;
  totalFees: number;
}

/**
 * Fee breakdown by category
 */
export interface FeeBreakdown {
  tradingFees: number;
  networkFees: number;
  totalFees: number;
  averageFeePerTrade: number;
  feesAsPercentOfVolume: number;
}

/**
 * Chart configuration options
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'candlestick';
  timeframe: '1h' | '4h' | '1d' | '1w' | '1m' | 'all';
  metric: 'pnl' | 'volume' | 'fees' | 'drawdown';
  showGrid: boolean;
  showLegend: boolean;
}
