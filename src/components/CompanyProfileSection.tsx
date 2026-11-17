import React, { useState, useEffect } from 'react';
import { Building2, Layers, Compass, RefreshCw } from 'lucide-react';
import { CompanyProfileInfo, ResearchStock } from '../types';
import { SupportedLanguage } from '../i18n';
import { CURATED_COMPANY_PROFILES, getInstantCompanyProfile } from '../data/companyProfiles';
import { SECTOR_TRANSLATIONS } from '../data/stockLocalization';

interface CompanyProfileSectionProps {
  stock: ResearchStock;
  currentLang?: SupportedLanguage;
}

const CLIENT_PROFILE_CACHE = new Map<string, CompanyProfileInfo>();

export const CompanyProfileSection: React.FC<CompanyProfileSectionProps> = ({
  stock,
  currentLang = 'he',
}) => {
  const isHe = currentLang === 'he';
  const cleanTicker = stock.ticker.toUpperCase().trim();
  const normalizedTicker = cleanTicker.replace('-', '.');

  const isCurated = Boolean(
    stock.companyProfile?.whatItDoesHe ||
      CURATED_COMPANY_PROFILES[cleanTicker] ||
      CURATED_COMPANY_PROFILES[normalizedTicker]
  );

  const [profile, setProfile] = useState<CompanyProfileInfo>(() => {
    return CLIENT_PROFILE_CACHE.get(cleanTicker) || getInstantCompanyProfile(stock);
  });
  const [isEnriching, setIsEnriching] = useState<boolean>(false);

  useEffect(() => {
    const cached = CLIENT_PROFILE_CACHE.get(cleanTicker);
    if (cached) {
      setProfile(cached);
      return;
    }

    setProfile(getInstantCompanyProfile(stock));

    if (isCurated) return;

    let cancelled = false;
    setIsEnriching(true);
    fetch(`/api/company-profile/${encodeURIComponent(cleanTicker)}`, {
      headers: { Accept: 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.profile?.whatItDoesHe) {
          CLIENT_PROFILE_CACHE.set(cleanTicker, data.profile);
          setProfile(data.profile);
        }
      })
      .catch(() => {
        // keep instant contextual fallback
      })
      .finally(() => {
        if (!cancelled) setIsEnriching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cleanTicker, isCurated, stock]);

  const localizedSector =
    SECTOR_TRANSLATIONS[currentLang]?.[stock.sector] ||
    SECTOR_TRANSLATIONS.he?.[stock.sector] ||
    stock.sector;

  const whatItDoes = isHe ? profile.whatItDoesHe : profile.whatItDoesEn || profile.whatItDoesHe;
  const revenueModel = isHe
    ? profile.revenueModelHe
    : profile.revenueModelEn || profile.revenueModelHe;
  const segments = isHe
    ? profile.businessSegmentsHe
    : profile.businessSegmentsEn?.length
    ? profile.businessSegmentsEn
    : profile.businessSegmentsHe;
  const avenues = isHe
    ? profile.investmentAvenuesHe
    : profile.investmentAvenuesEn?.length
    ? profile.investmentAvenuesEn
    : profile.investmentAvenuesHe;

  return (
    <section className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isHe
                ? `מה החברה עושה, תחום פעילות ואפיקי השקעה (${cleanTicker})`
                : `Company Business Profile, Segments & Investment Avenues (${cleanTicker})`}
            </h3>
            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
              <span>
                {isHe ? 'סקטור:' : 'Sector:'}{' '}
                <strong className="text-slate-200">{isHe ? localizedSector : stock.sector}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span>
                {isHe ? 'ענף:' : 'Industry:'}{' '}
                <strong className="text-cyan-300">
                  {profile.secIndustry || stock.industry}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {isEnriching && (
          <span className="text-[11px] text-cyan-400 flex items-center gap-1.5 font-mono">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>{isHe ? 'טוען פרופיל עסקי חי...' : 'Fetching live SEC profile...'}</span>
          </span>
        )}
      </div>

      {/* What it does + Revenue model */}
      <div className="space-y-2.5">
        <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1.5">
          <div className="text-xs font-semibold text-cyan-300">
            {isHe ? 'מה החברה עושה?' : 'What the company does'}
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{whatItDoes}</p>
          {revenueModel && (
            <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/70">
              <strong className="text-slate-300">
                {isHe ? 'מודל הכנסות (איך מרוויחה כסף): ' : 'Revenue Model: '}
              </strong>
              {revenueModel}
            </p>
          )}
        </div>

        {/* Two Columns: Business Segments + Investment Avenues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Core Business Segments */}
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{isHe ? 'תחומי פעילות ומנועי הכנסות' : 'Core Business Segments'}</span>
            </div>
            <ul className="space-y-1.5">
              {segments.map((seg, i) => (
                <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="text-cyan-400 font-bold mt-0.5 shrink-0">•</span>
                  <span>{seg}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Investment Avenues & Capital Allocation */}
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{isHe ? 'אפיקי השקעה והקצאת הון של החברה' : 'Company Investment Avenues & Capital Allocation'}</span>
            </div>
            <ul className="space-y-1.5">
              {avenues.map((ave, i) => (
                <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5 shrink-0">•</span>
                  <span>{ave}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
