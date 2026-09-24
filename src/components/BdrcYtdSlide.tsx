import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Store,
  Award,
  Upload,
  Clock,
  Flame,
  AlertCircle
} from 'lucide-react';
import { ExecutiveMonthlyReport } from '../types';
import { normalizeBdrcVenueName } from '../data/initialExecReports';

interface BdrcYtdSlideProps {
  reports: ExecutiveMonthlyReport[];
  onOpenUploadModal: () => void;
}

export type FiscalPeriodType = 'financial_year' | 'calendar_year';

export const BdrcYtdSlide: React.FC<BdrcYtdSlideProps> = ({
  reports,
  onOpenUploadModal,
}) => {
  // Toggle between "Aramark Financial Year" (Oct - Sep) and "Calendar Year" (Jan - Dec)
  const [periodType, setPeriodType] = useState<FiscalPeriodType>('financial_year');
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Month parsing helper: "July 2026" -> { month: "July", monthIndex: 6 (0-indexed), year: 2026 }
  const parsedReports = useMemo(() => {
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];

    return (reports || []).map((r) => {
      const parts = r.monthYear.trim().split(/\s+/);
      const mName = parts[0] || '';
      const yNum = parseInt(parts[1] || '2026', 10);
      const mIdx = monthNames.findIndex((m) => mName.toLowerCase().startsWith(m.slice(0, 3)));
      return {
        ...r,
        monthName: mName,
        yearNumber: isNaN(yNum) ? 2026 : yNum,
        monthIndex: mIdx >= 0 ? mIdx : 0, // 0 = Jan, 9 = Oct
      };
    });
  }, [reports]);

  // Filter reports strictly according to uploaded reports in selected period
  const filteredReports = useMemo(() => {
    return parsedReports.filter((r) => {
      if (periodType === 'calendar_year') {
        // Jan 1 to Dec 31 of selectedYear
        return r.yearNumber === selectedYear;
      } else {
        // Aramark Financial Year: October (selectedYear - 1) to September (selectedYear)
        // e.g., FY26 = Oct 2025, Nov 2025, Dec 2025, Jan 2026 ... Sep 2026
        const isPrevYearOctNovDec =
          r.yearNumber === selectedYear - 1 && r.monthIndex >= 9; // Oct(9), Nov(10), Dec(11)
        const isCurrentYearJanToSep =
          r.yearNumber === selectedYear && r.monthIndex <= 8; // Jan(0) to Sep(8)
        return isPrevYearOctNovDec || isCurrentYearJanToSep;
      }
    }).sort((a, b) => {
      // Sort chronologically: oldest first for YTD timeline
      if (a.yearNumber !== b.yearNumber) return a.yearNumber - b.yearNumber;
      return a.monthIndex - b.monthIndex;
    });
  }, [parsedReports, periodType, selectedYear]);

  // Combined Totals and Averages strictly from uploaded reports
  const ytdTotals = useMemo(() => {
    if (filteredReports.length === 0) {
      return {
        monthCount: 0,
        feedbackVolume: 0,
        staffComplaints: 0,
        staffCompliments: 0,
        staffThankYous: 0,
        avgMysteryShop: 0,
        avgVisit1: 0,
        avgVisit2: 0,
        avgStaffRating: 0,
        avgCateringVFM: 0,
        venueAverages: [] as { venue: string; avgScore: number; count: number }[],
      };
    }

    let totalFeedback = 0;
    let totalComplaints = 0;
    let totalCompliments = 0;
    let totalThankYous = 0;
    let sumMysteryShop = 0;
    let countMysteryShop = 0;
    let sumVisit1 = 0;
    let countVisit1 = 0;
    let sumVisit2 = 0;
    let countVisit2 = 0;
    let sumStaffRating = 0;
    let countStaffRating = 0;
    let sumVFM = 0;
    let countVFM = 0;

    const venueMap = new Map<string, { sum: number; count: number }>();

    filteredReports.forEach((r) => {
      totalFeedback += r.feedbackVolume || 0;
      totalComplaints += r.staffComplaints || 0;
      totalCompliments += r.staffCompliments || 0;
      totalThankYous += r.staffThankYous || 0;

      if (typeof r.mysteryShopMonthlyAvg === 'number' && r.mysteryShopMonthlyAvg > 0) {
        sumMysteryShop += r.mysteryShopMonthlyAvg;
        countMysteryShop++;
      }
      if (typeof r.mysteryShopVisit1 === 'number' && r.mysteryShopVisit1 > 0) {
        sumVisit1 += r.mysteryShopVisit1;
        countVisit1++;
      }
      if (typeof r.mysteryShopVisit2 === 'number' && r.mysteryShopVisit2 > 0) {
        sumVisit2 += r.mysteryShopVisit2;
        countVisit2++;
      }
      if (typeof r.staffRating === 'number' && r.staffRating > 0) {
        sumStaffRating += r.staffRating;
        countStaffRating++;
      }
      if (typeof r.cateringVFM === 'number' && r.cateringVFM > 0) {
        sumVFM += r.cateringVFM;
        countVFM++;
      }

      (r.venueSatisfaction || []).forEach((vs) => {
        if (vs.score > 0) {
          const vKey = normalizeBdrcVenueName(vs.venue);
          const existing = venueMap.get(vKey) || { sum: 0, count: 0 };
          venueMap.set(vKey, { sum: existing.sum + vs.score, count: existing.count + 1 });
        }
      });
    });

    const venueAverages = Array.from(venueMap.entries()).map(([venue, data]) => ({
      venue,
      avgScore: Math.round(data.sum / data.count),
      count: data.count,
    })).sort((a, b) => b.avgScore - a.avgScore);

    return {
      monthCount: filteredReports.length,
      feedbackVolume: totalFeedback,
      staffComplaints: totalComplaints,
      staffCompliments: totalCompliments,
      staffThankYous: totalThankYous,
      avgMysteryShop: countMysteryShop > 0 ? Math.round(sumMysteryShop / countMysteryShop) : 0,
      avgVisit1: countVisit1 > 0 ? Math.round(sumVisit1 / countVisit1) : 0,
      avgVisit2: countVisit2 > 0 ? Math.round(sumVisit2 / countVisit2) : 0,
      avgStaffRating: countStaffRating > 0 ? Math.round(sumStaffRating / countStaffRating) : 0,
      avgCateringVFM: countVFM > 0 ? Math.round(sumVFM / countVFM) : 0,
      venueAverages,
    };
  }, [filteredReports]);

  // Recurring Issues Intelligence across all uploaded reports in the selected period
  const recurringIssues = useMemo(() => {
    if (filteredReports.length === 0) return [];

    const issueThemes = [
      {
        id: 'food_quality',
        title: 'Food Quality & Temperature Consistency',
        keywords: ['food quality', 'quality', 'temperature', 'cold', 'lukewarm', 'portion', 'freshness', 'burnt', 'raw'],
        category: 'Food Quality',
        severity: 'high' as const,
        description: 'Repeated mentions of food temperature hold checks, consistency in hot holding units, and meal presentation.',
      },
      {
        id: 'service_delays',
        title: 'Speed of Service & Lunch Peak Delays',
        keywords: ['delay', 'delays', 'slow', 'speed of service', 'wait', 'queue', 'waiting', 'backlog', 'congestion'],
        category: 'Operations & Speed',
        severity: 'high' as const,
        description: 'Persistent lunch peak queues and service delays particularly at Backlot Café, Food Hall hot counter, and Butterbeer Bar.',
      },
      {
        id: 'pricing_vfm',
        title: 'Value For Money & Individual Item Pricing',
        keywords: ['cost', 'price', 'pricing', 'vfm', 'expensive', 'value for money', 'combo'],
        category: 'Pricing & Perception',
        severity: 'medium' as const,
        description: 'Visitor perception regarding the cost of individual items and combo value clarity across catering outlets.',
      },
      {
        id: 'staff_lethargy_peak',
        title: 'Staff Energy & Peak Rush Attentiveness',
        keywords: ['lethargy', 'morale', 'attentiveness', 'staff', 'team', 'exhaustion', 'peak', 'super peak'],
        category: 'Staffing & Morale',
        severity: 'medium' as const,
        description: 'Fluctuations in staff attentiveness during super-peak periods requiring leave rotation and proactive floor engagement.',
      },
      {
        id: 'table_turnaround',
        title: 'Table Availability & Dining Area Cleanliness',
        keywords: ['table', 'tables', 'cleanliness', 'turnaround', 'clearing', 'seating', 'bank holiday'],
        category: 'Facilities & Cleanliness',
        severity: 'low' as const,
        description: 'Demand spikes affecting table availability during peak bank holidays and weekend lunch rushes.',
      },
    ];

    const results = issueThemes.map((theme) => {
      const occurrences: { month: string; text: string; type: 'comment' | 'action' }[] = [];

      filteredReports.forEach((r) => {
        (r.keyComments || []).forEach((comment) => {
          const lower = comment.toLowerCase();
          if (theme.keywords.some((kw) => lower.includes(kw))) {
            occurrences.push({ month: r.monthYear, text: comment, type: 'comment' });
          }
        });

        (r.actions || []).forEach((action) => {
          const lower = action.toLowerCase();
          if (theme.keywords.some((kw) => lower.includes(kw))) {
            occurrences.push({ month: r.monthYear, text: action, type: 'action' });
          }
        });
      });

      const uniqueMonths = Array.from(new Set(occurrences.map((o) => o.month)));

      return {
        ...theme,
        occurrences,
        count: occurrences.length,
        monthsCount: uniqueMonths.length,
        months: uniqueMonths,
        isRecurring: uniqueMonths.length >= 2,
      };
    }).filter(i => i.monthsCount > 0);

    return results.sort((a, b) => b.monthsCount - a.monthsCount);
  }, [filteredReports]);

  const periodLabel = periodType === 'financial_year'
    ? `Aramark FY${String(selectedYear).slice(-2)} (Oct ${selectedYear - 1} – Sep ${selectedYear})`
    : `Calendar Year ${selectedYear} (Jan – Dec)`;

  return (
    <div className="space-y-6">
      {/* Slide Top Header with Period Toggle & Quick Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> BDRC YTD (Year-to-Date)
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-200 border border-slate-700 text-xs font-mono font-semibold">
              {filteredReports.length} {filteredReports.length === 1 ? 'Month' : 'Months'} Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[11px] font-mono">
              {periodLabel}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            BDRC Catering Year-to-Date (YTD) Performance & Quality Review
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {filteredReports.length > 0
              ? 'Cumulative executive benchmark combining uploaded BDRC reports, venue satisfaction scores, running qualitative logs, and recurring operational issue detection.'
              : `No BDRC monthly reports have been uploaded for ${periodLabel}. Metrics default to zero until reports are imported.`}
          </p>
        </div>

        {/* Period Switcher & Ingestion Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {/* Calendar Year vs Aramark Financial Year Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center shadow-inner">
            <button
              onClick={() => setPeriodType('financial_year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'financial_year'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Aramark Financial Year runs from October to September"
            >
              <Calendar className="w-3.5 h-3.5" />
              Aramark FY (Oct–Sep)
            </button>
            <button
              onClick={() => setPeriodType('calendar_year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                periodType === 'calendar_year'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Standard Calendar Year runs from January to December"
            >
              <Clock className="w-3.5 h-3.5" />
              Calendar Year (Jan–Dec)
            </button>
          </div>

          {/* Year Picker */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
          >
            <option value={2026}>2026 {periodType === 'financial_year' ? '(FY26)' : '(CY26)'}</option>
            <option value={2025}>2025 {periodType === 'financial_year' ? '(FY25)' : '(CY25)'}</option>
            <option value={2024}>2024 {periodType === 'financial_year' ? '(FY24)' : '(CY24)'}</option>
          </select>

          {/* Upload CTA */}
          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/15"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Report
          </button>
        </div>
      </div>

      {/* YTD Cumulative KPI Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Feedback Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            YTD Feedback Volume
          </span>
          <div className="text-3xl font-black text-white mt-1">{ytdTotals.feedbackVolume}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
            <span>{ytdTotals.monthCount} uploaded months</span>
            <span className="text-amber-400 font-bold">
              {ytdTotals.monthCount > 0 ? `~${Math.round(ytdTotals.feedbackVolume / ytdTotals.monthCount)}/mo` : '0/mo'}
            </span>
          </div>
        </div>

        {/* Staff Thank Yous YTD */}
        <div className="bg-slate-900/90 border border-sky-900/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-sky-700/60 transition">
          <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider block">
            YTD Staff Thank Yous
          </span>
          <div className="text-3xl font-black text-sky-400 mt-1">{ytdTotals.staffThankYous}</div>
          <div className="text-[10px] text-sky-300/80 font-mono mt-1 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
            <span>Positive Staff Sentiment</span>
            <span className="text-emerald-400 font-bold">{ytdTotals.staffThankYous > 0 ? 'Logged' : 'No data'}</span>
          </div>
        </div>

        {/* Staff Compliments YTD */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-emerald-700/60 transition">
          <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
            YTD Staff Compliments
          </span>
          <div className="text-3xl font-black text-emerald-400 mt-1">{ytdTotals.staffCompliments}</div>
          <div className="text-[10px] text-emerald-300/80 font-mono mt-1 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
            <span>Complaints: {ytdTotals.staffComplaints}</span>
            <span className="text-emerald-400 font-bold">
              {ytdTotals.staffCompliments + ytdTotals.staffComplaints > 0
                ? `${Math.round((ytdTotals.staffCompliments / (ytdTotals.staffComplaints + ytdTotals.staffCompliments)) * 100)}% Pos`
                : '0% Pos'}
            </span>
          </div>
        </div>

        {/* YTD Mystery Shop Average */}
        <div className="bg-gradient-to-b from-amber-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-amber-500/50 transition">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
            YTD Mystery Shop Avg
          </span>
          <div className="text-3xl font-black text-amber-300 mt-1">{ytdTotals.avgMysteryShop}%</div>
          <div className="text-[10px] text-amber-200/80 font-mono mt-1 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
            <span>V1: {ytdTotals.avgVisit1}% | V2: {ytdTotals.avgVisit2}%</span>
            <span className="text-amber-400 font-bold">{ytdTotals.avgMysteryShop > 0 ? 'Avg' : 'No data'}</span>
          </div>
        </div>

        {/* Staff Rating YTD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
            YTD Staff Rating Avg
          </span>
          <div className="text-3xl font-black text-white mt-1">{ytdTotals.avgStaffRating}%</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
            <span>Target: &gt;88%</span>
            <span className="font-bold">{ytdTotals.avgStaffRating >= 88 ? 'Passing' : ytdTotals.avgStaffRating > 0 ? 'Needs Attention' : 'No data'}</span>
          </div>
        </div>

        {/* Catering VFM YTD */}
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-rose-700/60 transition">
          <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block">
            YTD Catering VFM Avg
          </span>
          <div className="text-3xl font-black text-rose-400 mt-1">{ytdTotals.avgCateringVFM}%</div>
          <div className="text-[10px] text-rose-300/80 font-mono mt-1 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
            <span>Value for Money</span>
            <span className="text-rose-400 font-bold">{ytdTotals.avgCateringVFM > 0 ? 'Focus' : 'No data'}</span>
          </div>
        </div>
      </div>

      {/* SECTION: YTD Venue Satisfaction Leaderboard */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Store className="w-4 h-4" /> YTD Venue Satisfaction Averages
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated independent visitor survey scores across all uploaded reporting months in {periodLabel}.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            {filteredReports.length > 0 ? (
              <span>Period: <strong className="text-slate-200">{filteredReports[0]?.monthYear} – {filteredReports[filteredReports.length - 1]?.monthYear}</strong></span>
            ) : (
              <span>No uploaded period data</span>
            )}
          </div>
        </div>

        {ytdTotals.venueAverages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {ytdTotals.venueAverages.map((va, idx) => (
              <div
                key={idx}
                className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-500/40 transition group"
              >
                <div>
                  <span className="text-[11px] font-semibold text-slate-300 block line-clamp-2 h-8 leading-snug">
                    {va.venue}
                  </span>
                  <div className="text-2xl font-black text-white mt-1 group-hover:text-amber-400 transition">
                    {va.avgScore}%
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{va.count} mos avg</span>
                  <span className={`font-bold ${va.avgScore >= 85 ? 'text-emerald-400' : va.avgScore >= 78 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {va.avgScore >= 85 ? 'High' : va.avgScore >= 78 ? 'Good' : 'Needs Focus'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            No venue satisfaction data available for {periodLabel}. Upload monthly BDRC reports to compute outlet averages.
          </div>
        )}
      </div>

      {/* SECTION: RECURRING OPERATIONAL ISSUES INTELLIGENCE */}
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Recurring Issues & Persistent Operational Patterns (YTD)
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono">
                  Pattern Intelligence
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically detects repeat concerns across monthly BDRC key comments and actions to highlight chronic operational bottlenecks.
              </p>
            </div>
          </div>
        </div>

        {recurringIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recurringIssues.map((issue) => {
              const isHigh = issue.severity === 'high';
              return (
                <div
                  key={issue.id}
                  className={`bg-slate-950 border rounded-xl p-4 flex flex-col justify-between transition relative overflow-hidden ${
                    issue.isRecurring
                      ? isHigh
                        ? 'border-rose-900/50 hover:border-rose-500/80'
                        : 'border-amber-900/50 hover:border-amber-500/80'
                      : 'border-slate-800 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        issue.isRecurring
                          ? isHigh
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {issue.category}
                      </span>

                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {issue.monthsCount} of {filteredReports.length} Months
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1.5">
                      {issue.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {issue.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2.5">
                    <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                      Flagged in Months:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {issue.months.map((m, mIdx) => (
                        <span
                          key={mIdx}
                          className="text-[10px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800 font-mono"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            {filteredReports.length === 0
              ? 'No BDRC reports uploaded for this period. Upload reports to detect recurring patterns.'
              : 'No recurring issues detected across the uploaded reports in this period.'}
          </div>
        )}
      </div>
    </div>
  );
};
