// src/components/journal/TradeDetailsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Trade } from '@/types/trading'
import { formatCurrency, formatDate, formatDuration, getPnLColor, getPnLBgColor } from '@/lib/utils'
import { X, TrendingUp, TrendingDown, Clock, DollarSign, Activity, Tag } from 'lucide-react'

interface TradeDetailsModalProps {
  trade: Trade | null
  isOpen: boolean
  onClose: () => void
  onUpdateNote?: (tradeId: string, notes: string) => void
  onUpdateTags?: (tradeId: string, tags: string[]) => void
}

export function TradeDetailsModal({ 
  trade, 
  isOpen, 
  onClose,
  onUpdateNote,
  onUpdateTags 
}: TradeDetailsModalProps) {
  const [localTrade, setLocalTrade] = useState<Trade | null>(null)
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isEditingTags, setIsEditingTags] = useState(false)

  // Update local trade and state when trade changes
  useEffect(() => {
    if (trade) {
      setLocalTrade(trade)
      setNotes(trade.notes || '')
      setTags(trade.tags?.join(', ') || '')
    }
  }, [trade])

  if (!isOpen || !localTrade) return null

  const handleSaveNotes = () => {
    if (onUpdateNote) {
      onUpdateNote(localTrade.id, notes)
      // Update local trade immediately
      setLocalTrade({
        ...localTrade,
        notes: notes
      })
    }
    setIsEditingNotes(false)
  }

  const handleSaveTags = () => {
    if (onUpdateTags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean)
      onUpdateTags(localTrade.id, tagArray)
      // Update local trade immediately
      setLocalTrade({
        ...localTrade,
        tags: tagArray
      })
    }
    setIsEditingTags(false)
  }

  const handleCancelNotes = () => {
    setIsEditingNotes(false)
    setNotes(localTrade.notes || '')
  }

  const handleCancelTags = () => {
    setIsEditingTags(false)
    setTags(localTrade.tags?.join(', ') || '')
  }

  const profitLoss = localTrade.pnl
  const returnPercentage = ((profitLoss / (localTrade.entryPrice * localTrade.size)) * 100).toFixed(2)
  const netPnL = profitLoss - localTrade.fees

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">{localTrade.symbol}</h2>
            <p className="text-sm text-muted-foreground">
              {formatDate(localTrade.timestamp, 'long')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* PnL Summary */}
          <div className={`${getPnLBgColor(profitLoss)} border ${
            profitLoss >= 0 ? 'border-profit/20' : 'border-loss/20'
          } rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {profitLoss >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-profit" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-loss" />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  Profit & Loss
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                localTrade.side === 'long' 
                  ? 'bg-profit/10 text-profit' 
                  : 'bg-loss/10 text-loss'
              }`}>
                {localTrade.side.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gross PnL</p>
                <p className={`text-3xl font-bold ${getPnLColor(profitLoss)}`}>
                  {formatCurrency(profitLoss)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Return %</p>
                <p className={`text-3xl font-bold ${getPnLColor(profitLoss)}`}>
                  {returnPercentage}%
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fees</span>
                <span className="text-sm font-semibold text-loss">
                  -{formatCurrency(localTrade.fees)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                <span className="text-sm font-medium">Net PnL</span>
                <span className={`text-lg font-bold ${getPnLColor(netPnL)}`}>
                  {formatCurrency(netPnL)}
                </span>
              </div>
            </div>
          </div>

          {/* Trade Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Entry Price</span>
              </div>
              <p className="text-xl font-bold">${localTrade.entryPrice.toFixed(2)}</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Exit Price</span>
              </div>
              <p className="text-xl font-bold">${localTrade.exitPrice?.toFixed(2) || 'N/A'}</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Position Size</span>
              </div>
              <p className="text-xl font-bold">{localTrade.size.toFixed(4)}</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Duration</span>
              </div>
              <p className="text-xl font-bold">{formatDuration(localTrade.duration)}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Trade Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Type</span>
                <span className="font-medium capitalize">{localTrade.orderType}</span>
              </div>
              {localTrade.leverage && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leverage</span>
                  <span className="font-medium">{localTrade.leverage}x</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry Time</span>
                <span className="font-medium">{formatDate(localTrade.entryTime, 'long')}</span>
              </div>
              {localTrade.exitTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exit Time</span>
                  <span className="font-medium">{formatDate(localTrade.exitTime, 'long')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">{localTrade.signature.slice(0, 16)}...</span>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Tags</h3>
              </div>
              {!isEditingTags && (
                <button
                  onClick={() => setIsEditingTags(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            
            {isEditingTags ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Enter tags separated by commas"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTags}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelTags}
                    className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {localTrade.tags && localTrade.tags.length > 0 ? (
                  localTrade.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags added</span>
                )}
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Notes</h3>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your trading notes here..."
                  rows={4}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelNotes}
                    className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {localTrade.notes || 'No notes added for this trade.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}