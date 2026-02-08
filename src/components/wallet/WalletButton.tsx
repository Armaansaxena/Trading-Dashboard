// src/components/wallet/WalletButton.tsx
'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { truncateAddress } from '@/lib/utils'
import { ChevronDown, Wallet, LogOut, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setShowMenu(false)
  }

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors font-medium flex items-center gap-2"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium flex items-center gap-2 border border-border/50 shadow-sm"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        <span className="font-mono text-sm tracking-tight">
          {truncateAddress(publicKey!.toString())}
        </span>
        <ChevronDown className={`h-4 w-4 opacity-70 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-12" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-4 border-b border-border">
              <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
              <p className="text-md font-mono break-all">{publicKey!.toString()}</p>
            </div>
            
            <div className="p-1 ">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-8 w-6" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-loss hover:bg-loss/10 rounded transition-colors"
              >
                <LogOut className="h-8 w-6" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}