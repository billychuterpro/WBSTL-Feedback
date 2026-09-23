import React from 'react';
import {
  TrendingUp,
  Store,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Info,
  Award,
  AlertCircle
} from 'lucide-react';
import { ExecutiveMonthlyReport } from '../types';

interface MysteryShopSlideProps {
  report: ExecutiveMonthlyReport | null;
  selectedMonth: string;
  onOpenUploadModal: () => void;
}

const DEFAULT_VENUES = [
  'The Hogwarts Table',
  'Food Hall',
  'Chocolate Frog',
  'Butterbeer Bar',
  'Backlot Cafe',
  'Dragon RC',
];

export const MysteryShopSlide: React.FC<MysteryShopSlideProps> = ({
  report,
  selectedMonth,
  onOpenUploadModal,
}) => {
  const displayMonth = selectedMonth === 'ALL' ? (report?.monthYear || 'All Months') : selectedMonth;
  const hasData = !!report && (report.feedbackVolume > 0 || (report.mysteryShopMonthlyAvg ?? 0) > 0 || (report.venueSatisfaction && report.venueSatisfaction.length > 0));

  // Compute average score across venues if report exists
  const venueScores = report?.venueSatisfaction || [];
  const avgVenueScore =
    hasData && venueScores.length > 0
      ? Math.round(venueScores.reduce((acc, v) => acc + (v.score || 0), 0) / venueScores.length)
      : 0;

  return (
    <div className="space-y-6">
      {/* Slide Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> BDRC Data Month
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-200 border border-slate-700 text-xs font-mono font-semibold">
              {displayMonth}
            </span>
            {hasData ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Dataset Active
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-medium">
                No report uploaded for this month
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Catering BDRC Research, Quality & Mystery Shop
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {hasData
              ? `Independent BDRC research sentiment, mystery shop visits, venue satisfaction scores, and agreed operational actions for ${displayMonth}.`
              : `Showing placeholder metrics for ${displayMonth}. Upload the monthly PDF slide or select another month to view verified data.`}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenUploadModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/15 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {hasData ? 'Update BDRC Report' : 'Upload BDRC Slide'}
          </button>
        </div>
      </div>

      {/* Top 2 Main Sections: Feedback Volume & Mystery Shop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Section 1: Feedback Volume & Staff Sentiment (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Feedback Overview & Staff Sentiment
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Total Volume: {hasData ? report?.feedbackVolume : 0}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Volume */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Volume</span>
              <div className="text-2xl font-black text-white">{hasData ? report?.feedbackVolume : 0}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono font-medium">
                {hasData ? report?.feedbackVolumeVsLY || 'vs LY' : 'No data'}
              </div>
            </div>

            {/* Staff Complaints */}
            <div className="bg-slate-950/80 border border-rose-900/40 rounded-xl p-3.5 relative overflow-hidden">
              <span className="text-[11px] font-semibold text-rose-300 block mb-1">Staff Complaints</span>
              <div className="text-2xl font-black text-rose-400">{hasData ? report?.staffComplaints : 0}</div>
              <div className="text-[10px] text-rose-300/80 mt-1 font-mono font-medium">
                {hasData ? report?.staffComplaintsVsLY || 'received LY' : 'No data'}
              </div>
            </div>

            {/* Staff Compliments */}
            <div className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-3.5 relative overflow-hidden">
              <span className="text-[11px] font-semibold text-emerald-300 block mb-1">Staff Compliments</span>
              <div className="text-2xl font-black text-emerald-400">{hasData ? report?.staffCompliments : 0}</div>
              <div className="text-[10px] text-emerald-300/80 mt-1 font-mono font-medium">
                {hasData ? report?.staffComplimentsVsLY || 'received LY' : 'No data'}
              </div>
            </div>

            {/* Staff Thank Yous */}
            <div className="bg-slate-950/80 border border-sky-900/40 rounded-xl p-3.5 relative overflow-hidden">
              <span className="text-[11px] font-semibold text-sky-300 block mb-1">Staff Thank Yous</span>
              <div className="text-2xl font-black text-sky-400">{hasData ? report?.staffThankYous : 0}</div>
              <div className="text-[10px] text-sky-300/80 mt-1 font-mono font-medium truncate">
                {hasData ? report?.staffThankYousVsLY || 'positive vs LY' : 'No data'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Mystery Shop (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Award className="w-4 h-4" /> Mystery Shop Visits
            </h3>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
              Monthly Avg: {hasData ? `${report?.mysteryShopMonthlyAvg ?? 0}%` : '0%'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Visit 1 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Visit 1</span>
              <div className="text-2xl font-black text-white">{hasData ? (report?.mysteryShopVisit1 ?? 0) : 0}%</div>
              <div className={`text-[10px] font-mono mt-1 font-semibold ${
                hasData && (report?.mysteryShopVisit1VsLY || '').startsWith('+') ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {hasData ? report?.mysteryShopVisit1VsLY || '-' : 'No data'}
              </div>
            </div>

            {/* Visit 2 */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Visit 2</span>
              <div className="text-2xl font-black text-white">{hasData ? (report?.mysteryShopVisit2 ?? 0) : 0}%</div>
              <div className={`text-[10px] font-mono mt-1 font-semibold ${
                hasData && (report?.mysteryShopVisit2VsLY || '').startsWith('+') ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {hasData ? report?.mysteryShopVisit2VsLY || '-' : 'No data'}
              </div>
            </div>

            {/* Monthly Average */}
            <div className="bg-gradient-to-b from-amber-500/10 to-slate-950 border border-amber-500/30 rounded-xl p-3 text-center shadow-inner">
              <span className="text-[11px] font-bold text-amber-400 block mb-1">Monthly Avg</span>
              <div className="text-2xl font-black text-amber-300">{hasData ? (report?.mysteryShopMonthlyAvg ?? 0) : 0}%</div>
              <div className="text-[10px] font-mono text-slate-300 mt-1 font-semibold">
                {hasData ? report?.mysteryShopMonthlyAvgVsLY || '-' : 'No data'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Research Satisfaction & Venue Scores Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Store className="w-4 h-4" /> Research Satisfaction & Sentiment Ratings
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Independent visitor survey ratings across catering locations, overall staff friendliness, and value for money.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Venue Satisfaction Avg: <strong className="text-white">{avgVenueScore}%</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(hasData && report?.venueSatisfaction && report.venueSatisfaction.length > 0
            ? report.venueSatisfaction
            : DEFAULT_VENUES.map(v => ({ venue: v, score: 0, vsLY: 'No data' }))
          ).map((item, idx) => {
            const isPositiveLY = (item.vsLY || '').startsWith('+');
            const isNA = (item.vsLY || '').toLowerCase().includes('n/a') || (item.vsLY || '').toLowerCase().includes('no data');
            return (
              <div
                key={idx}
                className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/40 transition group"
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block line-clamp-2 h-8 leading-snug">
                    {item.venue}
                  </span>
                  <div className="text-2xl font-black text-white mt-1 group-hover:text-amber-400 transition">
                    {item.score}%
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono font-medium">
                  <span className={isNA ? 'text-slate-500' : isPositiveLY ? 'text-emerald-400' : 'text-rose-400'}>
                    {item.vsLY || 'No data'}
                  </span>
                  <span className="text-slate-500">vs LY</span>
                </div>
              </div>
            );
          })}

          {/* Staff Rating */}
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/60 transition group">
            <div>
              <span className="text-[11px] font-bold text-amber-300 block line-clamp-2 h-8 leading-snug">
                Staff Rating
              </span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {hasData ? (report?.staffRating ?? 0) : 0}%
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono font-medium">
              <span className={hasData ? 'text-emerald-400' : 'text-slate-500'}>
                {hasData ? report?.staffRatingVsLY || '+0% vs LY' : 'No data'}
              </span>
              <span className="text-slate-500">vs LY</span>
            </div>
          </div>

          {/* Catering VFM */}
          <div className="bg-slate-950/90 border border-rose-500/30 rounded-xl p-3 flex flex-col justify-between hover:border-rose-500/60 transition group">
            <div>
              <span className="text-[11px] font-bold text-rose-300 block line-clamp-2 h-8 leading-snug">
                Catering VFM
              </span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {hasData ? (report?.cateringVFM ?? 0) : 0}%
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono font-medium">
              <span className={hasData ? 'text-rose-400' : 'text-slate-500'}>
                {hasData ? report?.cateringVFMVsLY || '0% vs LY' : 'No data'}
              </span>
              <span className="text-slate-500">vs LY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4 & 5: Strategic Qualitative Insights & YoY Mystery Shop Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Key Comments & Operational Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Comments */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Key Executive Comments
            </h4>
            <div className="space-y-2.5">
              {hasData && report?.keyComments && report.keyComments.length > 0 ? (
                report.keyComments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                    <span>{comment}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  No BDRC executive comments available for {displayMonth}. Upload a monthly report PDF to populate.
                </div>
              )}
            </div>
          </div>

          {/* Operational Actions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Operational Action Commitments
            </h4>
            <div className="space-y-2">
              {hasData && report?.actions && report.actions.length > 0 ? (
                report.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{act}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  No operational actions recorded for {displayMonth}.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: YoY Mystery Shop Average Trend Chart (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Catering Monthly Average Trend
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  YoY Mystery Shop - Average Monthly Score Trajectory
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <span className="w-3 h-1 bg-blue-500 rounded"></span> 2025
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <span className="w-3 h-1 bg-amber-500 rounded"></span> 2026
                </span>
              </div>
            </div>

            {/* Custom SVG Trendline Chart */}
            <div className="h-56 w-full flex items-end pt-4 pb-2 relative">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[10px] font-mono text-slate-400">
                <div className="border-b border-slate-500 w-full flex justify-between"><span>100%</span></div>
                <div className="border-b border-slate-500 w-full flex justify-between"><span>90%</span></div>
                <div className="border-b border-slate-500 w-full flex justify-between"><span>80%</span></div>
                <div className="border-b border-slate-500 w-full flex justify-between"><span>70%</span></div>
                <div className="border-b border-slate-500 w-full flex justify-between"><span>65%</span></div>
              </div>

              {/* Monthly Bars / Visual Indicators */}
              <div className="w-full grid grid-cols-12 gap-1 items-end h-40 relative z-10">
                {hasData && report?.yoyTrend && report.yoyTrend.length > 0 ? (
                  report.yoyTrend.map((t, idx) => {
                    const score26 = t.score2026;
                    const score25 = t.score2025;
                    const height26 = score26 ? `${Math.max(10, (score26 - 65) * 2.8)}%` : '0%';
                    const height25 = score25 ? `${Math.max(10, (score25 - 65) * 2.8)}%` : '0%';

                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group">
                        <div className="flex items-end gap-0.5 h-full w-full justify-center">
                          {score25 && (
                            <div
                              style={{ height: height25 }}
                              className="w-1.5 sm:w-2 bg-blue-500/70 rounded-t group-hover:bg-blue-400 transition"
                              title={`2025 ${t.month}: ${score25}%`}
                            ></div>
                          )}
                          {score26 && (
                            <div
                              style={{ height: height26 }}
                              className="w-1.5 sm:w-2 bg-amber-500 rounded-t group-hover:bg-amber-400 transition shadow-md shadow-amber-500/20"
                              title={`2026 ${t.month}: ${score26}%`}
                            ></div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-2 font-mono truncate w-full text-center">
                          {t.month}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-12 h-full flex items-center justify-center text-xs text-slate-500 italic">
                    No trend data available for {displayMonth}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trend Callout Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mt-3 text-xs text-slate-300">
            <div className="flex items-center justify-between font-medium">
              <span>Status:</span>
              <strong className={hasData ? 'text-amber-400' : 'text-slate-500'}>
                {hasData ? `${report?.monthYear} Data Active` : 'No Data Uploaded'}
              </strong>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>Trajectory:</span>
              <span className="text-slate-200">{hasData ? 'Report loaded' : 'Upload monthly PDF to calculate trajectory'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
