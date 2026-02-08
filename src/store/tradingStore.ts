// src/store/tradingStore.ts
import { create } from 'zustand'
import { Trade, FilterOptions, PortfolioMetrics } from '@/types/trading'
import { AnalyticsEngine } from '@/utils/analytics'

interface TradingStore {
  // Data
  trades: Trade[]
  filteredTrades: Trade[]
  
  // Metrics
  metrics: PortfolioMetrics | null
  
  // Filters
  filters: FilterOptions
  
  // UI State
  isLoading: boolean
  selectedTrade: Trade | null
  
  // Actions
  setTrades: (trades: Trade[]) => void
  setFilters: (filters: Partial<FilterOptions>) => void
  resetFilters: () => void
  selectTrade: (trade: Trade | null) => void
  updateTradeNote: (tradeId: string, notes: string) => void
  updateTradeTags: (tradeId: string, tags: string[]) => void
  setLoading: (isLoading: boolean) => void
}

const defaultFilters: FilterOptions = {
  symbols: undefined,
  dateRange: undefined,
  side: 'all',
  orderType: undefined,
  minPnL: undefined,
  maxPnL: undefined,
  tags: undefined,
  searchQuery: undefined
}

export const useTradingStore = create<TradingStore>((set, get) => ({
  // Initial state
  trades: [],
  filteredTrades: [],
  metrics: null,
  filters: defaultFilters,
  isLoading: false,
  selectedTrade: null,

  // Set trades and recalculate everything
  setTrades: (trades: Trade[]) => {
    set({ trades, isLoading: true })
    
    // Apply current filters
    const filtered = filterTrades(trades, get().filters)
    
    // Calculate metrics
    const metrics = AnalyticsEngine.calculatePortfolioMetrics(filtered)
    
    set({ 
      filteredTrades: filtered,
      metrics,
      isLoading: false 
    })
  },

  // Update filters and recalculate
  setFilters: (newFilters: Partial<FilterOptions>) => {
    const filters = { ...get().filters, ...newFilters }
    set({ filters })
    
    // Reapply filters
    const filtered = filterTrades(get().trades, filters)
    const metrics = AnalyticsEngine.calculatePortfolioMetrics(filtered)
    
    set({ 
      filteredTrades: filtered,
      metrics 
    })
  },

  // Reset all filters
  resetFilters: () => {
    set({ filters: defaultFilters })
    const filtered = filterTrades(get().trades, defaultFilters)
    const metrics = AnalyticsEngine.calculatePortfolioMetrics(filtered)
    set({ 
      filteredTrades: filtered,
      metrics 
    })
  },

  // Select a trade for viewing details
  selectTrade: (trade: Trade | null) => {
    set({ selectedTrade: trade })
  },

  // Update trade notes
  updateTradeNote: (tradeId: string, notes: string) => {
    const trades = get().trades.map(trade =>
      trade.id === tradeId ? { ...trade, notes } : trade
    )
    
    set({ trades })
    
    // Refilter with updated trades
    const filtered = filterTrades(trades, get().filters)
    const metrics = AnalyticsEngine.calculatePortfolioMetrics(filtered)
    
    set({ 
      filteredTrades: filtered,
      metrics 
    })
  },

  // Update trade tags
  updateTradeTags: (tradeId: string, tags: string[]) => {
    const trades = get().trades.map(trade =>
      trade.id === tradeId ? { ...trade, tags } : trade
    )
    
    set({ trades })
    
    // Refilter with updated trades
    const filtered = filterTrades(trades, get().filters)
    const metrics = AnalyticsEngine.calculatePortfolioMetrics(filtered)
    
    set({ 
      filteredTrades: filtered,
      metrics 
    })
  },

  // Set loading state
  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  }
}))

/**
 * Filter trades based on filter options
 */
function filterTrades(trades: Trade[], filters: FilterOptions): Trade[] {
  let filtered = [...trades]

  // Filter by symbols
  if (filters.symbols && filters.symbols.length > 0) {
    filtered = filtered.filter(trade => 
      filters.symbols!.includes(trade.symbol)
    )
  }

  // Filter by date range
  if (filters.dateRange) {
    const start = filters.dateRange.start.getTime()
    const end = filters.dateRange.end.getTime()
    filtered = filtered.filter(trade => 
      trade.timestamp >= start && trade.timestamp <= end
    )
  }

  // Filter by side
  if (filters.side && filters.side !== 'all') {
    filtered = filtered.filter(trade => trade.side === filters.side)
  }

  // Filter by order type
  if (filters.orderType && filters.orderType.length > 0) {
    filtered = filtered.filter(trade => 
      filters.orderType!.includes(trade.orderType)
    )
  }

  // Filter by PnL range
  if (filters.minPnL !== undefined) {
    filtered = filtered.filter(trade => trade.pnl >= filters.minPnL!)
  }
  if (filters.maxPnL !== undefined) {
    filtered = filtered.filter(trade => trade.pnl <= filters.maxPnL!)
  }

  // Filter by tags - FIXED: Changed 'tag' to 'tags'
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(trade => 
      trade.tags && trade.tags.some(tag => filters.tags!.includes(tag))
    )
  }

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(trade =>
      trade.symbol.toLowerCase().includes(query) ||
      trade.id.toLowerCase().includes(query) ||
      trade.notes?.toLowerCase().includes(query)
    )
  }

  return filtered
}