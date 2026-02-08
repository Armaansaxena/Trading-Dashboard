// src/components/filters/SymbolFilter.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SymbolFilterProps {
  availableSymbols: string[]
  selectedSymbols: string[]
  onChange: (symbols: string[]) => void
}

export function SymbolFilter({ availableSymbols, selectedSymbols, onChange }: SymbolFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSymbol = (symbol: string) => {
    if (selectedSymbols.includes(symbol)) {
      onChange(selectedSymbols.filter(s => s !== symbol))
    } else {
      onChange([...selectedSymbols, symbol])
    }
  }

  const selectAll = () => {
    onChange(availableSymbols)
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-md text-sm hover:bg-muted transition-colors"
      >
        <span className="text-muted-foreground">Symbols:</span>
        <span className="font-medium">
          {selectedSymbols.length === 0 
            ? 'All' 
            : selectedSymbols.length === availableSymbols.length
            ? 'All'
            : `${selectedSymbols.length} selected`
          }
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
            <div className="p-2 border-b border-border flex gap-2">
              <button
                onClick={selectAll}
                className="flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="flex-1 px-2 py-1 text-xs border border-border rounded hover:bg-muted"
              >
                Clear All
              </button>
            </div>
            <div className="p-1">
              {availableSymbols.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => toggleSymbol(symbol)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  <span>{symbol}</span>
                  {selectedSymbols.includes(symbol) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}