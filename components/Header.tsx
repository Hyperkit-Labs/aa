'use client'

import { ArrowLeft, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onToast: (message: string) => void
  onMenuClick: () => void
}

export function Header({ onToast, onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 border-b border-white/10 flex items-center justify-between px-3 sm:px-5 bg-[#030305] shrink-0 z-40">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>
        
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          onClick={() => onToast('Navigated to Home')}
        >
          <div className="relative flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
            <div className="bg-purple-600 w-3 h-3 rounded-sm rotate-45 blur-[2px] absolute"></div>
            <div className="bg-white w-2 h-2 rounded-[1px] rotate-45 relative z-10"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-tight leading-none text-white text-xs sm:text-sm">DEMO</span>
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium tracking-wide hidden sm:block">ACCOUNT ABSTRACTION</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-1 sm:mx-2 hidden sm:block"></div>
          <span className="text-[10px] sm:text-xs font-medium text-gray-300 hidden sm:inline">Smart Wallet Builder</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => onToast('Navigating to Dashboard...')}
          className="text-[10px] sm:text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 sm:gap-2"
        >
          <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>
        <div
          onClick={() => onToast('Opening Profile Settings...')}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[9px] sm:text-[10px] font-bold border border-white/10 cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all"
        >
          JD
        </div>
      </div>
    </header>
  )
}

