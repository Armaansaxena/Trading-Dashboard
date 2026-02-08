// src/app/journal/page.tsx
'use client'

import Link from 'next/link'
import { useTradingStore } from '@/store/tradingStore'
import { TradeTable } from '@/app/journal/TradeTable'
import { TradeDetailsModal } from '@/app/journal/TradeDetailsModal'
import { SearchBar } from '@/components/filters/SearchBar'
import { SideFilter } from '@/components/filters/SideFilter'
import { SymbolFilter } from '@/components/filters/SymbolFilter'
import { DateRangeFilter } from '@/components/filters/DateRangeFilter'
import { Trade } from '@/types/trading'
import { ArrowLeft, Download, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getMockTradesForDev } from '@/utils/mockData'
import { WalletButton } from '@/components/wallet/WalletButton'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export default function JournalPage() {
  const { 
    filteredTrades,
    trades,
    filters, 
    setFilters, 
    resetFilters,
    updateTradeNote,
    updateTradeTags,
    setTrades
  } = useTradingStore()

  // Load mock trades on mount (same as dashboard)
  useEffect(() => {
    if (trades.length === 0) {
      const mockTrades = getMockTradesForDev()
      setTrades(mockTrades)
    }
  }, [trades.length, setTrades])

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '')
  const [startDate, setStartDate] = useState<Date | null>(
    filters.dateRange?.start || null
  )
  const [endDate, setEndDate] = useState<Date | null>(
    filters.dateRange?.end || null
  )

  // Get unique symbols from all trades
  const availableSymbols = Array.from(
    new Set(filteredTrades.map(t => t.symbol))
  ).sort()

  // Handle search with debounce effect
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setFilters({ searchQuery: value })
  }

  // Handle side filter
  const handleSideChange = (side: 'all' | 'long' | 'short') => {
    setFilters({ side })
  }

  // Handle symbol filter
  const handleSymbolsChange = (symbols: string[]) => {
    setFilters({ symbols: symbols.length === availableSymbols.length ? undefined : symbols })
  }

  // Handle date range
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start)
    setEndDate(end)
    
    if (start && end) {
      setFilters({ dateRange: { start, end } })
    } else if (!start && !end) {
      setFilters({ dateRange: undefined })
    }
  }

  // Export to CSV
  const handleExport = () => {
    const headers = ['Date', 'Symbol', 'Side', 'Entry', 'Exit', 'Size', 'PnL', 'Fees', 'Duration', 'Type']
    const rows = filteredTrades.map(trade => [
      new Date(trade.timestamp).toISOString(),
      trade.symbol,
      trade.side,
      trade.entryPrice,
      trade.exitPrice || '',
      trade.size,
      trade.pnl,
      trade.fees,
      trade.duration,
      trade.orderType
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Trading Journal</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredTrades.length} trades
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <WalletButton/>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Filters */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-primary hover:underline"
              >
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by symbol, ID, or notes..."
                />
              </div>

              {/* Symbol Filter */}
              <div className="flex justify-end">
                <SymbolFilter
                  availableSymbols={availableSymbols}
                  selectedSymbols={filters.symbols || []}
                  onChange={handleSymbolsChange}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Side Filter */}
              <SideFilter
                value={filters.side || 'all'}
                onChange={handleSideChange}
              />

              {/* Date Range Filter */}
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(date) => handleDateRangeChange(date, endDate)}
                onEndDateChange={(date) => handleDateRangeChange(startDate, date)}
              />
            </div>
          </div>
        )}

        {/* Trade Table */}
        <TradeTable
          trades={filteredTrades}
          onTradeClick={setSelectedTrade}
        />

        {/* Trade Details Modal */}
        <TradeDetailsModal
          trade={selectedTrade}
          isOpen={selectedTrade !== null}
          onClose={() => setSelectedTrade(null)}
          onUpdateNote={updateTradeNote}
          onUpdateTags={updateTradeTags}
        />
      </div>
    </main>
  )
}