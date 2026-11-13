import React, { useState } from 'react';
import { ResearchStock } from '../types';
import { SupportedLanguage } from '../i18n';
import { localizeStock } from '../data/stockLocalization';
import { getStockCompetitiveProfile } from '../data/thesisAndCompetitiveData';
import { StockLogoBadge } from './StockLogoBadge';
import {
  buildStockShareMetrics,
  openWhatsAppShare,
  openEmailShare,
  generateWhatsAppShareText,
  generateEmailShareData,
  StockShareData,
} from '../utils/shareUtils';
import {
  X,
  Share2,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  ShieldCheck,
  Calculator,
} from 'lucide-react';

interface ShareStockReportModalProps {
  stock: ResearchStock | null;
  isOpen: boolean;
  onClose: () => void;
  currentLang?: SupportedLanguage | string;
  livePrice?: number;
}

export const ShareStockReportModal: React.FC<ShareStockReportModalProps> = ({
  stock: rawStock,
  isOpen,
  onClose,
  currentLang = 'he',
  livePrice,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'whatsapp' | 'email'>('whatsapp');

  if (!isOpen || !rawStock) return null;

  const stock = localizeStock(rawStock, currentLang);
  const isHe = currentLang === 'he';
  const currentPriceNum = livePrice || parseFloat(stock.currentPrice.replace(/[^0-9.]/g, '')) || 150;
  const profile = getStockCompetitiveProfile(rawStock, currentPriceNum);
  const metrics = buildStockShareMetrics(stock, profile, currentPriceNum);

  const shareData: StockShareData = {
    stock,
    profile,
    currentPrice: currentPriceNum,
    fairValue: metrics.fairValue,
    marginOfSafety: metrics.marginOfSafety,
    actionRecommendation: isHe ? metrics.actionRecommendation : metrics.actionRecommendationEn,
    currentLang,
  };

  const whatsappText = generateWhatsAppShareText(shareData);
  const emailData = generateEmailShareData(shareData);

  const handleCopyText = async () => {
    const textToCopy = activePreviewTab === 'whatsapp' ? whatsappText : `${emailData.subject}\n\n${emailData.body}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-slate-900 border border-cyan-800/80 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-5 p-5 sm:p-6 relative animate-in fade-in zoom-in-95 duration-200 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                SHARE REPORT
              </span>
              <h3 className="text-lg font-bold text-white">
                {isHe ? `שיתוף דוח השקעה: ${stock.ticker}` : `Share Investment Memo: ${stock.ticker}`}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isHe
                ? 'שתף את דוח ההערכה המלא, מרווח הביטחון והמלצת ההשקעה בוואטסאפ או באימייל בלחיצת כפתור אחת.'
                : 'Instantly share the research report, DCF fair value, and investment decision via WhatsApp or Email.'}
            </p>
          </div>
        </div>

        {/* Stock Mini Summary Strip */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-3">
            <StockLogoBadge ticker={stock.ticker} name={stock.companyName} size="md" />
            <div>
              <div className="font-bold text-white text-sm">{stock.companyName} ({stock.ticker})</div>
              <div className="text-slate-400 text-[11px]">{stock.sector} • ${currentPriceNum.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              <span className="text-slate-500 text-[10px] block">{isHe ? 'שווי הוגן' : 'Fair Value'}</span>
              <strong className="text-white">${metrics.fairValue}</strong>
            </div>
            <div className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
              <span className="text-emerald-500 text-[10px] block">{isHe ? 'מרווח ביטחון' : 'Margin'}</span>
              <strong>{metrics.marginOfSafety >= 0 ? `+${metrics.marginOfSafety}%` : `${metrics.marginOfSafety}%`}</strong>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons: WhatsApp & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* WhatsApp Button */}
          <button
            onClick={() => openWhatsAppShare(shareData)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition transform active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{isHe ? 'שתף בוואטסאפ (WhatsApp)' : 'Share on WhatsApp'}</span>
          </button>

          {/* Email Button */}
          <button
            onClick={() => openEmailShare(shareData)}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition transform active:scale-[0.98] cursor-pointer"
          >
            <Mail className="w-5 h-5" />
            <span>{isHe ? 'שתף במייל (Email)' : 'Send via Email'}</span>
          </button>
        </div>

        {/* Copy Options */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopyText}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono font-medium transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedText ? (isHe ? 'הועתק ללוח!' : 'Copied!') : (isHe ? 'העתק תוכן דוח מלא' : 'Copy Full Summary')}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-mono font-medium transition border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <ExternalLink className="w-4 h-4 text-slate-400" />}
            <span>{copiedLink ? (isHe ? 'קישור הועתק!' : 'Link Copied!') : (isHe ? 'העתק קישור ישיר' : 'Copy Direct Link')}</span>
          </button>
        </div>

        {/* Preview Container */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              {isHe ? 'תצוגה מקדימה של ההודעה:' : 'Message Preview:'}
            </span>
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActivePreviewTab('whatsapp')}
                className={`px-2.5 py-1 rounded transition ${activePreviewTab === 'whatsapp' ? 'bg-emerald-900/60 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setActivePreviewTab('email')}
                className={`px-2.5 py-1 rounded transition ${activePreviewTab === 'email' ? 'bg-cyan-900/60 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Email
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 max-h-52 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {activePreviewTab === 'whatsapp' ? (
              whatsappText
            ) : (
              `Subject: ${emailData.subject}\n\n${emailData.body}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
