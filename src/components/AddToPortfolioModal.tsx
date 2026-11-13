import React, { useState } from 'react';
import { ResearchStock, WatchlistItem, PortfolioPosition } from '../types';
import { StockLogoBadge } from './StockLogoBadge';
import { SupportedLanguage, translations } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import {
  Briefcase,
  X,
  Plus,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface AddToPortfolioModalProps {
  stock: ResearchStock | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdd: (stock: ResearchStock, shares: number, buyPrice: number, notes: string, actionFee?: number) => void;
  currentLang?: SupportedLanguage;
  livePrice?: number;
}

const ACTION_FEE_USD = 7.00; // כל פעולה היא 7.00 דולר כולל לפעולה (מעודכן מהיום קדימה)

export const AddToPortfolioModal: React.FC<AddToPortfolioModalProps> = ({
  stock,
  isOpen,
  onClose,
  onConfirmAdd,
  currentLang = 'he',
  livePrice,
}) => {
  if (!isOpen || !stock) return null;

  const isHe = currentLang === 'he';
  const localized = localizeStock(stock, currentLang);

  const defaultPrice = livePrice || parseFloat(stock.currentPrice.replace(/[^0-9.]/g, '')) || 100;
  const [sharesInput, setSharesInput] = useState<string>('10');
  const [buyPriceInput, setBuyPriceInput] = useState<string>(defaultPrice.toFixed(2));
  const [notesInput, setNotesInput] = useState<string>(
    isHe
      ? `פוזיציית איכות לשנתיים (FY2). ציון מודל: ${stock.investmentScore}/100.`
      : `Core 2Y quality position. Model score: ${stock.investmentScore}/100.`
  );

  const sharesNum = parseFloat(sharesInput) || 0;
  const priceNum = parseFloat(buyPriceInput) || 0;
  const grossCost = sharesNum * priceNum;
  const totalCostWithFee = grossCost > 0 ? grossCost + ACTION_FEE_USD : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sharesNum <= 0 || priceNum <= 0) return;
    onConfirmAdd(stock, sharesNum, priceNum, notesInput, ACTION_FEE_USD);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <StockLogoBadge ticker={stock.ticker} size="sm" />
                <h2 className="text-lg font-bold text-white font-mono">{stock.ticker}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  Score {stock.investmentScore}/100
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-[280px]">
                {localized.companyName}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Number of Shares */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">
                {isHe ? 'כמות מניות:' : 'Number of Shares:'}
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={sharesInput}
                onChange={(e) => setSharesInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                placeholder="10"
              />
            </div>

            {/* Purchase Price Per Share */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">
                {isHe ? 'מחיר רכישה למניה ($):' : 'Buy Price Per Share ($):'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 font-mono text-sm rtl:left-auto rtl:right-3">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={buyPriceInput}
                  onChange={(e) => setBuyPriceInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 rtl:pl-3 rtl:pr-7 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  placeholder={defaultPrice.toFixed(2)}
                />
              </div>
            </div>
          </div>

          {/* Total Cost & Action Fee Summary Banner */}
          <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-sans">{isHe ? 'עלות מניות ברוטו:' : 'Gross Shares Cost:'}</span>
              <span>${grossCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-amber-300">
              <span className="font-sans flex items-center gap-1">
                <span>{isHe ? 'מחיר פעולה (קבוע לפעולה):' : 'Action Fee (Flat per order):'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold">
                  {isHe ? 'לא למניה' : 'per trade'}
                </span>
              </span>
              <span className="font-bold">+${ACTION_FEE_USD.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-bold">
              <span className="text-slate-300 font-sans">{isHe ? 'סך עלות השקעה כוללת (כולל פעולה):' : 'Total Capital Invested (incl. Fee):'}</span>
              <span className="text-base font-extrabold text-cyan-300">
                ${totalCostWithFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Investment Thesis / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400">
              {isHe ? 'הערות ותזת רכישה (אופציונלי):' : 'Thesis / Position Notes (Optional):'}
            </label>
            <textarea
              rows={3}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed"
              placeholder={isHe ? 'תעד כאן את הסיבות לרכישה...' : 'Record purchase thesis here...'}
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              {isHe ? 'ביטול' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isHe ? 'הוסף לתיק ההשקעות' : 'Confirm Add to Portfolio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
