// src/components/journal/TradeTable.tsx
"use client";

import { useState } from "react";
import { Trade } from "@/types/trading";
import {
  formatCurrency,
  formatDate,
  formatDuration,
  getPnLColor,
} from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from "lucide-react";

interface TradeTableProps {
  trades: Trade[];
  onTradeClick?: (trade: Trade) => void;
}

type SortField = "timestamp" | "symbol" | "pnl" | "size" | "duration";
type SortDirection = "asc" | "desc";

export function TradeTable({ trades, onTradeClick }: TradeTableProps) {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sorting logic
  const sortedTrades = [...trades].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "timestamp":
        comparison = a.timestamp - b.timestamp;
        break;
      case "symbol":
        comparison = a.symbol.localeCompare(b.symbol);
        break;
      case "pnl":
        comparison = a.pnl - b.pnl;
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "duration":
        comparison = a.duration - b.duration;
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrades = sortedTrades.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <div className="min-w-[900px]">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm">
                <th
                  className="p-3 font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort("timestamp")}
                >
                  <div className="flex items-center gap-2">
                    Date
                    <SortIcon field="timestamp" />
                  </div>
                </th>
                <th
                  className="p-3 font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort("symbol")}
                >
                  <div className="flex items-center gap-2">
                    Symbol
                    <SortIcon field="symbol" />
                  </div>
                </th>
                <th className="p-3 font-medium">Side</th>
                <th className="p-3 font-medium text-right">Entry</th>
                <th className="p-3 font-medium text-right">Exit</th>
                <th
                  className="p-3 font-medium text-right cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort("size")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Size
                    <SortIcon field="size" />
                  </div>
                </th>
                <th
                  className="p-3 font-medium text-right cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort("pnl")}
                >
                  <div className="flex items-center justify-end gap-2">
                    PnL
                    <SortIcon field="pnl" />
                  </div>
                </th>
                <th className="p-3 font-medium text-right">Fees</th>
                <th
                  className="p-3 font-medium text-right cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort("duration")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Duration
                    <SortIcon field="duration" />
                  </div>
                </th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade, index) => (
                <tr
                  key={trade.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 text-sm">
                    {formatDate(trade.timestamp, "short")}
                  </td>
                  <td className="p-3 font-medium text-sm">{trade.symbol}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        trade.side === "long"
                          ? "bg-profit/10 text-profit"
                          : "bg-loss/10 text-loss"
                      }`}
                    >
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right text-muted-foreground">
                    ${trade.entryPrice.toFixed(2)}
                  </td>
                  <td className="p-3 text-sm text-right text-muted-foreground">
                    ${trade.exitPrice?.toFixed(2) || "-"}
                  </td>
                  <td className="p-3 text-sm text-right text-muted-foreground">
                    {trade.size.toFixed(4)}
                  </td>
                  <td
                    className={`p-3 text-sm text-right font-semibold ${getPnLColor(trade.pnl)}`}
                  >
                    {formatCurrency(trade.pnl)}
                  </td>
                  <td className="p-3 text-sm text-right text-muted-foreground">
                    ${trade.fees.toFixed(2)}
                  </td>
                  <td className="p-3 text-sm text-right text-muted-foreground">
                    {formatDuration(trade.duration)}
                  </td>
                  <td className="p-3 text-sm capitalize text-muted-foreground">
                    {trade.orderType}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onTradeClick?.(trade)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + itemsPerPage, sortedTrades.length)} of{" "}
          {sortedTrades.length} trades
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                    currentPage === pageNum
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
