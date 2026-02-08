// src/utils/mockData.ts
import { Trade } from '@/types/trading'

const SYMBOLS = ['SOL/USD', 'BTC/USD', 'ETH/USD', 'BNB/USD', 'AVAX/USD', 'MATIC/USD']
const ORDER_TYPES: ('market' | 'limit' | 'stop')[] = ['market', 'limit', 'stop']
const SIDES: ('long' | 'short')[] = ['long', 'short']

/**
 * Generate a random number between min and max
 */
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

/**
 * Pick a random element from an array
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generate a mock trade
 */
export function generateMockTrade(
  baseTimestamp: number = Date.now(),
  index: number = 0
): Trade {
  const symbol = randomChoice(SYMBOLS)
  const side = randomChoice(SIDES)
  const orderType = randomChoice(ORDER_TYPES)
  
  // Simulate different price ranges for different symbols
  const basePrice = symbol.includes('BTC') ? 45000 
    : symbol.includes('ETH') ? 2500
    : symbol.includes('SOL') ? 100
    : symbol.includes('BNB') ? 300
    : symbol.includes('AVAX') ? 35
    : 1.5
  
  const entryPrice = basePrice * randomBetween(0.95, 1.05)
  const priceMove = randomBetween(-0.05, 0.08) // -5% to +8%
  const exitPrice = entryPrice * (1 + priceMove * (side === 'long' ? 1 : -1))
  
  const size = randomBetween(0.1, 10)
  const notionalValue = entryPrice * size
  const fees = notionalValue * randomBetween(0.0005, 0.002) // 0.05% to 0.2% fees
  
  const pnl = (exitPrice - entryPrice) * size * (side === 'long' ? 1 : -1) - fees
  
  const duration = randomInt(60, 7200) // 1 minute to 2 hours
  const entryTime = baseTimestamp - (index * 3600000) - duration * 1000
  const exitTime = entryTime + duration * 1000
  
  return {
    id: `trade_${Date.now()}_${index}`,
    timestamp: exitTime,
    symbol,
    side,
    entryPrice,
    exitPrice,
    size,
    pnl,
    fees,
    orderType,
    duration,
    signature: `sig_${Math.random().toString(36).substring(2, 15)}`,
    leverage: randomChoice([1, 2, 3, 5, 10]),
    entryTime,
    exitTime,
    notes: Math.random() > 0.7 ? generateRandomNote() : undefined,
    tags: Math.random() > 0.6 ? generateRandomTags() : undefined,
  }
}

/**
 * Generate random trading notes
 */
function generateRandomNote(): string {
  const notes = [
    'Strong breakout pattern',
    'Good entry at support level',
    'Took profit at resistance',
    'Stop loss hit, managing risk',
    'Following the trend',
    'Counter-trend trade',
    'News-driven move',
    'Technical setup played out perfectly',
    'Exit too early, left profit on table',
    'Should have waited for confirmation',
  ]
  return randomChoice(notes)
}

/**
 * Generate random tags
 */
function generateRandomTags(): string[] {
  const allTags = ['breakout', 'trend-following', 'scalp', 'swing', 'news', 'technical', 'reversal', 'momentum']
  const numTags = randomInt(1, 3)
  const tags: string[] = []
  
  for (let i = 0; i < numTags; i++) {
    const tag = randomChoice(allTags)
    if (!tags.includes(tag)) {
      tags.push(tag)
    }
  }
  
  return tags
}

/**
 * Generate multiple mock trades
 */
export function generateMockTrades(count: number = 100): Trade[] {
  const trades: Trade[] = []
  const now = Date.now()
  
  // Generate trades with realistic win/loss distribution (55% win rate)
  for (let i = 0; i < count; i++) {
    let trade = generateMockTrade(now, i)
    
    // Adjust to create more realistic distribution
    if (Math.random() > 0.55) {
      // Make it a losing trade
      const currentPnL = trade.pnl
      if (currentPnL > 0) {
        trade.pnl = -Math.abs(currentPnL) * randomBetween(0.5, 1.2)
        trade.exitPrice = trade.entryPrice - (Math.abs(trade.pnl) / trade.size) * (trade.side === 'long' ? 1 : -1)
      }
    }
    
    trades.push(trade)
  }
  
  return trades.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Generate trades for a specific time period
 */
export function generateTradesForPeriod(
  startDate: Date,
  endDate: Date,
  tradesPerDay: number = 10
): Trade[] {
  const trades: Trade[] = []
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const totalTrades = days * tradesPerDay
  
  for (let i = 0; i < totalTrades; i++) {
    const timestamp = startDate.getTime() + (i / totalTrades) * (endDate.getTime() - startDate.getTime())
    const trade = generateMockTrade(timestamp, i)
    trades.push(trade)
  }
  
  return trades.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Get mock trades for development
 */
export function getMockTradesForDev(): Trade[] {
  // Check if we have cached trades in localStorage
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('mock_trades')
    if (cached) {
      return JSON.parse(cached)
    }
    
    // Generate and cache new trades
    const trades = generateMockTrades(150)
    localStorage.setItem('mock_trades', JSON.stringify(trades))
    return trades
  }
  
  // Fallback for server-side rendering
  return generateMockTrades(150)
}

/**
 * Reset mock data
 */
export function resetMockData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mock_trades')
  }
}
