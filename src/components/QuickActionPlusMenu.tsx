import React, { useState, useRef, useEffect } from 'react';
import { ResearchStock, WatchlistItem } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage } from '../i18n';
import { Plus, Star, Briefcase, Check, Bell } from 'lucide-react';

interface QuickActionPlusMenuProps {
  stock: ResearchStock;
  watchlist: WatchlistItem[];
  onToggleWatchlist: (stock: ResearchStock) => void;
  onAddToPortfolio: (stock: ResearchStock) => void;
  currentLang?: SupportedLanguage;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuickActionPlusMenu: React.FC<QuickActionPlusMenuProps> = ({
  stock,
  watchlist = [],
  onToggleWatchlist,
  onAddToPortfolio,
  currentLang = 'he',
  size = 'md',
  className = '',
}) => {
  const isHe = currentLang === 'he';
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isWatched = watchlist.some((w) => w.ticker === stock.ticker);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-7 h-7 text-xs',
    lg: 'w-8 h-8 text-sm',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Plus Action Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        id={`btn-plus-action-${stock.ticker}`}
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center font-bold transition-all shadow-sm cursor-pointer ${
          isOpen
            ? 'bg-cyan-500 text-slate-950 scale-105 ring-2 ring-cyan-400'
            : isWatched
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
            : 'bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white border border-slate-700/80 hover:border-cyan-500'
        }`}
        title={isHe ? `פעולות מהירות עבור ${stock.ticker}` : `Quick Actions for ${stock.ticker}`}
      >
        <Plus className={`${iconSizes[size]} transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 mt-1 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 font-sans left-0 rtl:left-auto rtl:right-0"
        >
          <div className="px-2.5 py-1.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StockLogoBadge ticker={stock.ticker} size="xs" />
              <span className="font-mono font-bold text-xs text-white">{stock.ticker}</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">
              {stock.investmentScore}/100
            </span>
          </div>

          {/* Option 1: Watchlist & Alerts */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(stock);
              setIsOpen(false);
            }}
            className={`w-full text-left rtl:text-right px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
              isWatched
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80 hover:bg-amber-900/50'
                : 'text-slate-200 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${isWatched ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'}`}>
                <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-current' : ''}`} />
              </div>
              <div>
                <div className="font-semibold">
                  {isWatched
                    ? isHe ? 'הסר מרשימת המעקב' : 'Remove from Watchlist'
                    : isHe ? 'הוסף לרשימת מעקב והתראות' : 'Add to Watchlist & Alerts'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isHe ? 'מעקב מחיר יעד, חפיר והתראות תזה' : 'Track target price & thesis alerts'}
                </div>
              </div>
            </div>
            {isWatched && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          </button>

          {/* Option 2: Active Portfolio */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToPortfolio(stock);
              setIsOpen(false);
            }}
            className="w-full text-left rtl:text-right px-2.5 py-2 rounded-lg text-xs text-slate-200 hover:bg-slate-800 hover:text-cyan-300 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-slate-800 text-cyan-400">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-semibold">
                  {isHe ? 'הוסף לתיק ההשקעות שלי' : 'Add to My Portfolio'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isHe ? 'הזן כמות מניות ומחיר רכישה' : 'Log shares & purchase price'}
                </div>
              </div>
            </div>
            <Plus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
};
