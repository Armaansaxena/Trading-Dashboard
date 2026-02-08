// src/components/filters/SideFilter.tsx
'use client'

interface SideFilterProps {
  value: 'all' | 'long' | 'short'
  onChange: (value: 'all' | 'long' | 'short') => void
}

export function SideFilter({ value, onChange }: SideFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Side:</span>
      <div className="flex border border-border rounded-md overflow-hidden">
        <button
          onClick={() => onChange('all')}
          className={`px-3 py-1.5 text-sm transition-colors ${
            value === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-muted'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onChange('long')}
          className={`px-3 py-1.5 text-sm border-l border-border transition-colors ${
            value === 'long'
              ? 'bg-profit text-white'
              : 'bg-background hover:bg-muted'
          }`}
        >
          Long
        </button>
        <button
          onClick={() => onChange('short')}
          className={`px-3 py-1.5 text-sm border-l border-border transition-colors ${
            value === 'short'
              ? 'bg-loss text-white'
              : 'bg-background hover:bg-muted'
          }`}
        >
          Short
        </button>
      </div>
    </div>
  )
}