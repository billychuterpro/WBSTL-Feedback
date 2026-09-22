import React, { useState, useMemo, useEffect } from 'react';
import { FeedbackItem, FeedbackStatus } from '../types';
import { DonutChart } from './DonutChart';
import {
  isComplaintType,
  isComplimentType,
  isSuggestionType,
  isThankYouType,
  isComplaintItem,
  isCateringFeedbackItem,
  matchesFeedbackType,
  isPraiseOrThankYou,
} from '../utils/typeUtils';
import {
  getMonthYearFromDate,
  getSortableMonthKey,
  getPriorMonth,
  getPriorYearSameMonth,
} from '../utils/dateUtils';
import {
  BarChart2,
  PieChart as PieIcon,
  Users,
  Utensils,
  Store,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Save,
  MessageSquare,
  Building2,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface PresentationDashboardProps {
  items: FeedbackItem[];
  onUpdateItem: (updated: FeedbackItem) => void;
  onLoadDemoData: () => void;
  onClearData?: () => void;
}

export const PresentationDashboard: React.FC<PresentationDashboardProps> = ({
  items,
  onUpdateItem,
  onLoadDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'visitor' | 'staff' | 'catering' | 'venues' | 'cases'
  >('visitor');

  // Month Selection State
  const availableMonths = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const m = item.monthYear || getMonthYearFromDate(item.date);
      map.set(m, (map.get(m) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([month, count]) => ({ month, count, sortKey: getSortableMonthKey(month) }))
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [items]);

  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // Auto-set selectedMonth to newest available month on first load
  useEffect(() => {
    if (availableMonths.length > 0 && selectedMonth === 'ALL') {
      setSelectedMonth(availableMonths[0].month);
    }
  }, [availableMonths]);

  // Active items filtered strictly by parsed visit date / month
  const activeItems = useMemo(() => {
    if (selectedMonth === 'ALL') return items;
    return items.filter((i) => (i.monthYear || getMonthYearFromDate(i.date)) === selectedMonth);
  }, [items, selectedMonth]);

  // Prior month & prior year calculations for dynamic MoM and YoY metrics
  const priorMonthName = useMemo(() => {
    if (selectedMonth === 'ALL') return null;
    return getPriorMonth(selectedMonth);
  }, [selectedMonth]);

  const priorYearMonthName = useMemo(() => {
    if (selectedMonth === 'ALL') return null;
    return getPriorYearSameMonth(selectedMonth);
  }, [selectedMonth]);

  const priorMonthItems = useMemo(() => {
    if (!priorMonthName) return [];
    return items.filter((i) => (i.monthYear || getMonthYearFromDate(i.date)) === priorMonthName);
  }, [items, priorMonthName]);

  const priorYearItems = useMemo(() => {
    if (!priorYearMonthName) return [];
    return items.filter((i) => (i.monthYear || getMonthYearFromDate(i.date)) === priorYearMonthName);
  }, [items, priorYearMonthName]);

  // Dynamic YoY & MoM rate for overall cases
  const yoyCasesPct = useMemo(() => {
    if (priorYearItems.length === 0 || activeItems.length === 0) return null;
    const diff = activeItems.length - priorYearItems.length;
    const pct = Math.round((diff / priorYearItems.length) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }, [activeItems.length, priorYearItems.length]);

  const momCasesPct = useMemo(() => {
    if (priorMonthItems.length === 0 || activeItems.length === 0) return null;
    const diff = activeItems.length - priorMonthItems.length;
    const pct = Math.round((diff / priorMonthItems.length) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }, [activeItems.length, priorMonthItems.length]);

  // Filters for Cases View
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [venueFilter, setVenueFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Currently expanded case for adding action
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // Form edit state for active action being edited
  const [editActionItem, setEditActionItem] = useState<FeedbackItem | null>(null);

  // Compute key statistics for active items
  const activeCasesCount = activeItems.length;
  const totalCasesAllMonths = items.length;

  // Slide 1 Metrics
  const complaintCount = useMemo(
    () => activeItems.filter((i) => isComplaintItem(i)).length,
    [activeItems]
  );
  const complimentCount = useMemo(
    () => activeItems.filter((i) => !isComplaintItem(i) && isComplimentType(i.type)).length,
    [activeItems]
  );
  const suggestionCount = useMemo(
    () => activeItems.filter((i) => !isComplaintItem(i) && isSuggestionType(i.type)).length,
    [activeItems]
  );
  const thankYouCount = useMemo(
    () => activeItems.filter((i) => !isComplaintItem(i) && isThankYouType(i.type)).length,
    [activeItems]
  );

  const inProgressCount = useMemo(
    () =>
      activeItems.filter(
        (i) =>
          (i.status === 'InProgress' || i.status === 'Pending' || String(i.caseStatus).toLowerCase() === 'open') &&
          String(i.caseStatus).toLowerCase() !== 'closed' &&
          i.status !== 'Resolved'
      ).length,
    [activeItems]
  );
  const resolvedCount = useMemo(
    () => activeItems.filter((i) => i.status === 'Resolved' || String(i.caseStatus).toLowerCase() === 'closed').length,
    [activeItems]
  );
  const pendingCount = useMemo(
    () => activeItems.filter((i) => i.status === 'Pending').length,
    [activeItems]
  );

  // Unique departments & venues for dropdowns
  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    activeItems.forEach((i) => {
      if (i.department) set.add(i.department);
    });
    return Array.from(set).sort();
  }, [activeItems]);

  const availableVenues = useMemo(() => {
    const set = new Set<string>();
    activeItems.forEach((i) => {
      if (i.venue) set.add(i.venue);
      if (i.area) set.add(i.area);
    });
    return Array.from(set).sort();
  }, [activeItems]);

  // Department counts
  const departmentBreakdown = useMemo(() => {
    const map: Record<string, { complaint: number; compliment: number; thankYou: number; total: number }> = {};
    activeItems.forEach((item) => {
      const dept = item.department || item.area || 'General';
      if (!map[dept]) {
        map[dept] = { complaint: 0, compliment: 0, thankYou: 0, total: 0 };
      }
      map[dept].total += 1;
      if (isComplaintItem(item)) map[dept].complaint += 1;
      else if (isComplimentType(item.type)) map[dept].compliment += 1;
      else map[dept].thankYou += 1;
    });
    return Object.entries(map)
      .map(([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => b.total - a.total);
  }, [activeItems]);

  // Catering Items - all data provided is for catering, so activeItems represents all catering records
  const cateringItems = useMemo(
    () => activeItems,
    [activeItems]
  );

  const cateringComplaintCount = complaintCount;
  const cateringComplimentCount = complimentCount;
  const cateringThankYouCount = thankYouCount;

  // SubCategory breakdown dynamically tallied from the Sub Category column
  const subCategoryBreakdown = useMemo(() => {
    const map: Record<string, { count: number; complaints: number; compliments: number; thankYous: number }> = {};
    activeItems.forEach((item) => {
      const sc = item.subCategory && item.subCategory.trim() ? item.subCategory.trim() : 'Other / General';
      if (!map[sc]) {
        map[sc] = { count: 0, complaints: 0, compliments: 0, thankYous: 0 };
      }
      map[sc].count += 1;
      if (isComplaintItem(item)) {
        map[sc].complaints += 1;
      } else if (isComplimentType(item.type)) {
        map[sc].compliments += 1;
      } else {
        map[sc].thankYous += 1;
      }
    });

    return Object.entries(map)
      .map(([label, stats]) => {
        let color = 'bg-amber-400';
        if (stats.complaints > 0 && stats.complaints >= stats.compliments) {
          color = 'bg-rose-500';
        } else if (stats.compliments > 0) {
          color = 'bg-emerald-400';
        } else if (stats.thankYous > 0) {
          color = 'bg-yellow-400';
        }
        return {
          label,
          count: stats.count,
          complaints: stats.complaints,
          compliments: stats.compliments,
          thankYous: stats.thankYous,
          color,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [activeItems]);

  const complaintSubCategories = useMemo(() => {
    return subCategoryBreakdown
      .filter((sc) => sc.complaints > 0)
      .map((sc) => ({ label: sc.label, count: sc.complaints }))
      .sort((a, b) => b.count - a.count);
  }, [subCategoryBreakdown]);

  const positiveSubCategories = useMemo(() => {
    return subCategoryBreakdown
      .filter((sc) => sc.compliments > 0 || sc.thankYous > 0)
      .map((sc) => ({
        label: sc.label,
        count: sc.compliments + sc.thankYous,
        compliments: sc.compliments,
        thankYous: sc.thankYous,
      }))
      .sort((a, b) => b.count - a.count);
  }, [subCategoryBreakdown]);

  // Dynamic statistics for Slide 4 venue breakdowns
  const afternoonTeaStats = useMemo(() => {
    const afternoonTeaItems = activeItems.filter(
      (i) =>
        i.department === 'Afternoon Tea' ||
        (i.area && i.area.toLowerCase().includes('afternoon tea')) ||
        (i.venue && i.venue.toLowerCase().includes('afternoon tea'))
    );
    const complaints = afternoonTeaItems.filter((i) => isComplaintItem(i)).length;
    const compliments = afternoonTeaItems.filter((i) => !isComplaintItem(i) && isComplimentType(i.type)).length;
    const thankYous = afternoonTeaItems.filter((i) => !isComplaintItem(i) && isThankYouType(i.type)).length;
    return { total: afternoonTeaItems.length, complaints, compliments, thankYous };
  }, [activeItems]);

  const hogwartsTableStats = useMemo(() => {
    const hogwartsItems = activeItems.filter(
      (i) =>
        i.department === 'Hogwarts Table' ||
        (i.area && i.area.toLowerCase().includes('hogwarts table')) ||
        (i.venue && i.venue.toLowerCase().includes('hogwarts table'))
    );
    const complaints = hogwartsItems.filter((i) => isComplaintItem(i)).length;
    const compliments = hogwartsItems.filter((i) => !isComplaintItem(i) && isComplimentType(i.type)).length;
    const thankYous = hogwartsItems.filter((i) => !isComplaintItem(i) && isThankYouType(i.type)).length;
    return { total: hogwartsItems.length, complaints, compliments, thankYous };
  }, [activeItems]);

  const backlotStats = useMemo(() => {
    const backlotItems = activeItems.filter(
      (i) =>
        (i.venue && i.venue.toLowerCase().includes('backlot')) ||
        (i.area && i.area.toLowerCase().includes('backlot'))
    );
    const complaints = backlotItems.filter((i) => isComplaintItem(i)).length;
    const compliments = backlotItems.filter((i) => !isComplaintItem(i) && isComplimentType(i.type)).length;
    const thankYous = backlotItems.filter((i) => !isComplaintItem(i) && isThankYouType(i.type)).length;
    return { total: backlotItems.length, complaints, compliments, thankYous };
  }, [activeItems]);

  const foodHallStats = useMemo(() => {
    const foodHallItems = activeItems.filter(
      (i) =>
        (i.venue && i.venue.toLowerCase().includes('food hall')) ||
        (i.area && i.area.toLowerCase().includes('food hall'))
    );
    const complaints = foodHallItems.filter((i) => isComplaintItem(i)).length;
    const compliments = foodHallItems.filter((i) => !isComplaintItem(i) && isComplimentType(i.type)).length;
    const thankYous = foodHallItems.filter((i) => !isComplaintItem(i) && isThankYouType(i.type)).length;
    return { total: foodHallItems.length, complaints, compliments, thankYous };
  }, [activeItems]);

  // Filtered cases for cases tab
  const filteredCases = useMemo(() => {
    return activeItems.filter((item) => {
      // Exclude any accidental summary or total rows
      const tLower = (item.type || '').toLowerCase();
      const cLower = (item.caseNumber || '').toLowerCase();
      if (tLower === 'total' || cLower.includes('total')) return false;

      const matchesSearch =
        !searchTerm ||
        (item.caseNumber && item.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.feedbackDetail && item.feedbackDetail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.area && item.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.venue && item.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = matchesFeedbackType(item, typeFilter);

      const matchesDept =
        departmentFilter === 'ALL' ||
        (departmentFilter === 'CATERING_ALL' && isCateringFeedbackItem(item)) ||
        item.department === departmentFilter;

      const matchesVenue =
        venueFilter === 'ALL' ||
        item.venue === venueFilter ||
        item.area === venueFilter ||
        (item.area && item.area.toLowerCase().includes(venueFilter.toLowerCase())) ||
        (item.venue && item.venue.toLowerCase().includes(venueFilter.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'Resolved' || statusFilter === 'Closed'
          ? item.status === 'Resolved' || String(item.caseStatus).toLowerCase() === 'closed'
          : statusFilter === 'InProgress' || statusFilter === 'Open'
          ? (item.status === 'InProgress' || item.status === 'Pending' || String(item.caseStatus).toLowerCase() === 'open') &&
            String(item.caseStatus).toLowerCase() !== 'closed' &&
            item.status !== 'Resolved'
          : item.status === statusFilter);

      return matchesSearch && matchesType && matchesDept && matchesVenue && matchesStatus;
    });
  }, [activeItems, searchTerm, typeFilter, departmentFilter, venueFilter, statusFilter]);

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (editActionItem) {
      onUpdateItem(editActionItem);
      setExpandedCaseId(null);
      setEditActionItem(null);
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen pb-16 font-sans">
      {/* Presentation Top Header Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
                Monthly Visitor & Operations Feedback
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  {selectedMonth === 'ALL' ? 'All Months Combined' : selectedMonth}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Aramark & Operations Executive Meeting Presentation Deck
              </p>
            </div>
          </div>

          {/* Month Selector & Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Dedicated Month Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 font-medium hidden sm:inline">Viewing Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  All Uploaded Months ({totalCasesAllMonths} cases)
                </option>
                {availableMonths.map((m) => (
                  <option key={m.month} value={m.month} className="bg-slate-900 text-white">
                    {m.month} ({m.count} cases)
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-400 pl-2 border-l border-slate-800 font-mono">
              Month Cases: <strong className="text-amber-400">{activeCasesCount}</strong>
            </div>
          </div>
        </div>

        {/* Slide Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-1 pb-1">
          <button
            onClick={() => setActiveTab('visitor')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'visitor'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Slide 1: Visitor Overview
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Slide 2: Staff Feedback
          </button>

          <button
            onClick={() => setActiveTab('catering')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'catering'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Slide 3: Catering Overall
          </button>

          <button
            onClick={() => setActiveTab('venues')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'venues'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Slide 4: Venue Breakdowns
          </button>

          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition flex items-center gap-2 whitespace-nowrap ml-auto ${
              activeTab === 'cases'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Case Action Register & Comments ({activeCasesCount})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Zero Data Banner */}
        {totalCasesAllMonths === 0 && (
          <div className="p-5 mb-6 bg-slate-900 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300">No Feedback Data Currently Held (0 Records)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  State and local storage are clean. Upload your monthly Excel reports (.xlsx) below or click "Load Demo Dataset" to populate presentation figures and cases.
                </p>
              </div>
            </div>
            <button
              onClick={onLoadDemoData}
              className="shrink-0 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Load Demo Dataset
            </button>
          </div>
        )}

        {/* SLIDE 1: VISITOR FEEDBACK OVERVIEW */}
        {activeTab === 'visitor' && (
          <div className="space-y-6">
            <div className="text-center py-2 border-b border-slate-800 mb-4 flex flex-col items-center">
              <h2 className="text-2xl font-serif font-bold text-slate-100 tracking-wide">
                Visitor Feedback Overview
              </h2>
              <p className="text-xs text-amber-400 font-medium mt-1">
                {selectedMonth === 'ALL'
                  ? `Aggregated statistics across all ${availableMonths.length} uploaded months (${activeCasesCount} total cases)`
                  : `Monthly review for ${selectedMonth} (${activeCasesCount} cases)`}
              </p>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-lg text-center">
                <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">
                  Cases Received
                </span>
                <div className="text-3xl font-extrabold text-white my-1">
                  {activeCasesCount}
                </div>
                <div className="text-xs text-amber-400 font-semibold">
                  {yoyCasesPct ? (
                    <span className="flex items-center justify-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> ({yoyCasesPct} vs. {priorYearMonthName})
                    </span>
                  ) : momCasesPct ? (
                    <span>({momCasesPct} vs. {priorMonthName})</span>
                  ) : (
                    <span>({activeCasesCount > 0 ? (selectedMonth === 'ALL' ? 'Total' : selectedMonth) : 'No records'})</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-lg text-center">
                <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">
                  Cases Closed
                </span>
                <div className="text-3xl font-extrabold text-white my-1">
                  {resolvedCount}
                </div>
                <div className="text-xs text-emerald-400 font-semibold">
                  {activeCasesCount > 0 ? `(${Math.round((resolvedCount / activeCasesCount) * 100)}% resolved/closed)` : 'No records'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-lg text-center">
                <span className="text-xs uppercase font-medium text-slate-400 tracking-wider">
                  Open Actions
                </span>
                <div className="text-3xl font-extrabold text-amber-300 my-1">
                  {pendingCount + inProgressCount}
                </div>
                <div className="text-xs text-slate-400">
                  ({inProgressCount} in progress, {pendingCount} pending)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/60 shadow-lg text-center bg-amber-500/5">
                <span className="text-xs uppercase font-medium text-amber-400 tracking-wider">
                  Complaints
                </span>
                <div className="text-2xl font-extrabold text-rose-400 my-1">
                  {complaintCount}
                </div>
                <div className="text-[11px] text-slate-300">
                  {activeCasesCount > 0 ? `${((complaintCount / activeCasesCount) * 100).toFixed(1)}% of volume` : '0%'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/60 shadow-lg text-center bg-emerald-500/5 col-span-2 md:col-span-1">
                <span className="text-xs uppercase font-medium text-emerald-400 tracking-wider">
                  Praise & Compliments
                </span>
                <div className="text-2xl font-extrabold text-emerald-300 my-1">
                  {complimentCount + thankYouCount}
                </div>
                <div className="text-[11px] text-slate-300">
                  {activeCasesCount > 0 ? `${(((complimentCount + thankYouCount) / activeCasesCount) * 100).toFixed(1)}% positive` : '0%'}
                </div>
                {(complimentCount > 0 || thankYouCount > 0) && (
                  <div className="text-[10px] text-emerald-400 font-medium mt-1">
                    {complimentCount} compliments · {thankYouCount} thank you
                  </div>
                )}
              </div>
            </div>

            {/* Slide 1 Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Left Bar Chart */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-amber-400" />
                  Visitor Feedback Type Volume ({selectedMonth === 'ALL' ? 'All Months' : selectedMonth})
                </h3>

                <div className="space-y-4 my-auto pt-4">
                  {/* Complaint */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Complaint
                      </span>
                      <span className="font-mono text-slate-400 font-bold">
                        {complaintCount} (
                        {activeCasesCount > 0 ? ((complaintCount / activeCasesCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${activeCasesCount > 0 ? (complaintCount / activeCasesCount) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Compliment */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Compliment
                      </span>
                      <span className="font-mono text-slate-400 font-bold">
                        {complimentCount} (
                        {activeCasesCount > 0 ? ((complimentCount / activeCasesCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${activeCasesCount > 0 ? (complimentCount / activeCasesCount) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Suggestion
                      </span>
                      <span className="font-mono text-slate-400 font-bold">
                        {suggestionCount} (
                        {activeCasesCount > 0 ? ((suggestionCount / activeCasesCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${activeCasesCount > 0 ? (suggestionCount / activeCasesCount) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Thank You */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Thank You
                      </span>
                      <span className="font-mono text-slate-400 font-bold">
                        {thankYouCount} (
                        {activeCasesCount > 0 ? ((thankYouCount / activeCasesCount) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${activeCasesCount > 0 ? (thankYouCount / activeCasesCount) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('cases');
                    setTypeFilter('Complaint');
                    setDepartmentFilter('ALL');
                    setVenueFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="mt-6 w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center justify-between"
                >
                  <span>View All {complaintCount} Complaints in Case Register</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Right Donut Distribution */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">
                  Feedback Share Distribution
                </h3>

                <div className="flex items-center justify-around py-4">
                  <DonutChart
                    size={176}
                    strokeWidth={18}
                    totalLabel="Total"
                    segments={[
                      { label: 'Complaint', count: complaintCount, hex: '#f43f5e' },
                      { label: 'Compliment', count: complimentCount, hex: '#34d399' },
                      { label: 'Suggestion', count: suggestionCount, hex: '#fbbf24' },
                      { label: 'Thank You', count: thankYouCount, hex: '#facc15' },
                    ]}
                  />

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-rose-500"></span>
                      <span className="text-slate-300">Complaint</span>
                      <span className="font-mono text-slate-400 font-bold">{complaintCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-emerald-400"></span>
                      <span className="text-slate-300">Compliment</span>
                      <span className="font-mono text-slate-400 font-bold">{complimentCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-amber-400"></span>
                      <span className="text-slate-300">Suggestion</span>
                      <span className="font-mono text-slate-400 font-bold">{suggestionCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-yellow-400"></span>
                      <span className="text-slate-300">Thank You</span>
                      <span className="font-mono text-slate-400 font-bold">{thankYouCount}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>F&B / Catering Share:</span>
                    <strong className="text-amber-400">
                      {activeCasesCount} cases (100% of dataset)
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: STAFF FEEDBACK */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="text-center py-2 border-b border-slate-800 mb-4">
              <h2 className="text-2xl font-serif font-bold text-slate-100 tracking-wide">
                Staff Feedback – {selectedMonth === 'ALL' ? 'All Uploaded Months' : selectedMonth}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Visitor recognition, staff compliments, and positive mentions recorded for the operations and catering team.
              </p>
            </div>

            {/* KPI Cards Slide 2 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-lg text-center">
                <span className="text-xs uppercase font-medium text-slate-400">
                  {priorYearMonthName ? 'YOY Growth' : priorMonthName ? 'MoM Growth' : 'Period Praise'}
                </span>
                <div className="text-2xl font-extrabold text-amber-400 my-1.5">
                  {yoyCasesPct ? yoyCasesPct : momCasesPct ? momCasesPct : `${complimentCount + thankYouCount}`}
                </div>
                <div className="text-[11px] text-slate-300">
                  {priorYearMonthName
                    ? `vs. ${priorYearMonthName}`
                    : priorMonthName
                    ? `vs. ${priorMonthName}`
                    : `Positive mentions in ${selectedMonth}`}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-lg text-center">
                <span className="text-xs uppercase font-medium text-slate-400">Positive Feedback</span>
                <div className="text-2xl font-extrabold text-emerald-400 my-1.5">
                  {complimentCount + thankYouCount}
                </div>
                <div className="text-[11px] text-slate-300">
                  {activeCasesCount > 0 ? `${(((complimentCount + thankYouCount) / activeCasesCount) * 100).toFixed(0)}% of month total` : '0%'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-lg text-center">
                <span className="text-xs uppercase font-medium text-slate-400">Compliments</span>
                <div className="text-2xl font-extrabold text-blue-400 my-1.5">
                  {complimentCount}
                </div>
                <div className="text-[11px] text-slate-300">
                  Direct visitor compliments
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-lg text-center">
                <span className="text-xs uppercase font-medium text-slate-400">Thank Yous</span>
                <div className="text-2xl font-extrabold text-white my-1.5">
                  {thankYouCount}
                </div>
                <div className="text-[11px] text-slate-300">
                  Visitor thank you notes
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/40 shadow-lg text-center col-span-2 md:col-span-1">
                <span className="text-xs uppercase font-medium text-slate-400">Complaints</span>
                <div className="text-2xl font-extrabold text-rose-400 my-1.5">
                  {complaintCount}
                </div>
                <div className="text-[11px] text-slate-300">
                  {activeCasesCount > 0 ? `${((complaintCount / activeCasesCount) * 100).toFixed(1)}% of total` : '0%'}
                </div>
              </div>
            </div>

            {/* Donut & Summary Slide 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  Staff & Visitor Feedback Split ({activeCasesCount} Total Cases)
                </h3>

                <div className="flex items-center justify-around py-6">
                  <DonutChart
                    size={160}
                    strokeWidth={16}
                    totalLabel="Total Count"
                    segments={[
                      { label: 'Compliment', count: complimentCount, hex: '#34d399' },
                      { label: 'Thank You', count: thankYouCount, hex: '#facc15' },
                      { label: 'Complaint', count: complaintCount, hex: '#f43f5e' },
                      { label: 'Suggestion', count: suggestionCount, hex: '#818cf8' },
                    ]}
                  />

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-rose-500"></span>
                      <span className="text-slate-300">Complaint</span>
                      <span className="font-mono text-slate-400">{complaintCount} ({activeCasesCount > 0 ? ((complaintCount / activeCasesCount) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-emerald-400"></span>
                      <span className="text-slate-300">Compliment</span>
                      <span className="font-mono text-slate-400">{complimentCount} ({activeCasesCount > 0 ? ((complimentCount / activeCasesCount) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-amber-400"></span>
                      <span className="text-slate-300">Thank You</span>
                      <span className="font-mono text-slate-400">{thankYouCount} ({activeCasesCount > 0 ? ((thankYouCount / activeCasesCount) * 100).toFixed(1) : 0}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Recognized Staff Members & Star Mentions
                </h3>
                <div className="space-y-3 my-auto">
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300">Sarina (Afternoon Tea)</span>
                      <p className="text-[11px] text-slate-400">Consistently praised for exceptional Afternoon Tea hospitality and table service.</p>
                    </div>
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded">Most Praised</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Tamara (Hogwarts Table)</span>
                      <p className="text-[11px] text-slate-400">Special recognition for caring allergen checks and attentiveness with dietary requirements.</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded">Allergen Star</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Frog Café & Butterbeer Bar Teams</span>
                      <p className="text-[11px] text-slate-400">Fast counter service and friendly guest assistance across beverage stations.</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded">Service Team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: CATERING OVERALL */}
        {activeTab === 'catering' && (
          <div className="space-y-6">
            <div className="text-center py-2 border-b border-slate-800 mb-4">
              <h2 className="text-2xl font-serif font-bold text-slate-100 tracking-wide">
                Catering - Overall
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                {selectedMonth === 'ALL'
                  ? `All Catering Records: ${activeCasesCount} cases (All data provided is for catering)`
                  : `Catering Feedback for ${selectedMonth}: ${activeCasesCount} cases (100% of dataset)`}
              </p>
            </div>

            {/* Slide 3 Top Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Catering Ring */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">
                    Catering Feedback Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4 font-mono">
                    {activeCasesCount} Total Cases (All Catering)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-4">
                  <DonutChart
                    size={160}
                    strokeWidth={16}
                    totalLabel="Record Count"
                    segments={[
                      { label: 'Complaint', count: complaintCount, hex: '#f43f5e' },
                      { label: 'Compliment', count: complimentCount, hex: '#34d399' },
                      { label: 'Thank You', count: thankYouCount, hex: '#facc15' },
                    ]}
                  />

                  <div className="space-y-3 text-xs w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-rose-500"></span>
                        <span className="text-slate-300 font-medium">Complaint</span>
                      </div>
                      <span className="font-mono text-slate-200 font-bold">
                        {complaintCount} <span className="text-slate-500 font-normal">({activeCasesCount > 0 ? ((complaintCount / activeCasesCount) * 100).toFixed(1) : 0}%)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-400"></span>
                        <span className="text-slate-300 font-medium">Compliment</span>
                      </div>
                      <span className="font-mono text-slate-200 font-bold">
                        {complimentCount} <span className="text-slate-500 font-normal">({activeCasesCount > 0 ? ((complimentCount / activeCasesCount) * 100).toFixed(1) : 0}%)</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-yellow-400"></span>
                        <span className="text-slate-300 font-medium">Thank You</span>
                      </div>
                      <span className="font-mono text-slate-200 font-bold">
                        {thankYouCount} <span className="text-slate-500 font-normal">({activeCasesCount > 0 ? ((thankYouCount / activeCasesCount) * 100).toFixed(1) : 0}%)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Positive ratio: <strong className="text-emerald-400">{activeCasesCount > 0 ? (((complimentCount + thankYouCount) / activeCasesCount) * 100).toFixed(1) : 0}%</strong></span>
                  <span>Complaint ratio: <strong className="text-rose-400">{activeCasesCount > 0 ? ((complaintCount / activeCasesCount) * 100).toFixed(1) : 0}%</strong></span>
                </div>
              </div>

              {/* Right Horizontal Bar Chart: Subcategory Breakdown */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-amber-400" />
                      Catering Subcategory Breakdown
                    </h3>
                    <span className="text-[11px] font-mono text-amber-400 font-semibold">
                      {activeCasesCount} Total Cases
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Direct tally from the <strong className="text-slate-300">Sub Category</strong> column across all cases
                  </p>

                  <div className="space-y-2 text-xs">
                    {subCategoryBreakdown.map((cat) => {
                      const pct = activeCasesCount > 0 ? ((cat.count / activeCasesCount) * 100).toFixed(1) : '0';
                      return (
                        <button
                          key={cat.label}
                          onClick={() => {
                            setActiveTab('cases');
                            setSearchTerm(cat.label === 'Other / General' ? '' : cat.label);
                            setTypeFilter('ALL');
                            setDepartmentFilter('ALL');
                            setVenueFilter('ALL');
                            setStatusFilter('ALL');
                          }}
                          className="w-full text-left group hover:bg-slate-800/50 p-1.5 -mx-1.5 rounded-lg transition"
                          title={`Click to view ${cat.count} cases in ${cat.label}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300 font-medium group-hover:text-white transition flex items-center gap-1.5 text-xs">
                              <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                              {cat.label}
                            </span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-slate-400 text-[11px]">
                                {cat.complaints > 0 && (
                                  <span className="text-rose-400 mr-1.5 font-semibold">
                                    {cat.complaints} comp
                                  </span>
                                )}
                                {cat.compliments > 0 && (
                                  <span className="text-emerald-400 mr-1.5 font-semibold">
                                    {cat.compliments} praise
                                  </span>
                                )}
                                {cat.thankYous > 0 && (
                                  <span className="text-yellow-400 mr-1.5 font-semibold">
                                    {cat.thankYous} ty
                                  </span>
                                )}
                              </span>
                              <span className="font-bold text-slate-100 min-w-[20px] text-right">
                                {cat.count}
                              </span>
                              <span className="text-slate-500 text-[11px] w-12 text-right">
                                ({pct}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`${cat.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${Math.max(3, (cat.count / activeCasesCount) * 100)}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Click any subcategory to filter the Case Register</span>
                  <span className="text-amber-400 font-medium hover:underline cursor-pointer" onClick={() => setActiveTab('cases')}>
                    Open Case Register &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* Slide 3 Key Detail Highlight Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Complaints Box */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {complaintCount} Catering Complaints in {selectedMonth === 'ALL' ? 'All Months' : selectedMonth}
                  </div>
                  <span className="text-xs font-mono text-rose-400 font-bold">
                    {activeCasesCount > 0 ? ((complaintCount / activeCasesCount) * 100).toFixed(1) : 0}% of volume
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="text-slate-400 font-medium">Subcategory breakdown for complaints ({complaintCount} total):</p>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {complaintSubCategories.map((sc) => (
                      <button
                        key={sc.label}
                        onClick={() => {
                          setActiveTab('cases');
                          setSearchTerm(sc.label);
                          setTypeFilter('Complaint');
                        }}
                        className="flex justify-between items-center p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-rose-500/40 transition text-left"
                      >
                        <span className="text-slate-300 truncate pr-2 font-medium">{sc.label}</span>
                        <span className="font-mono font-bold text-rose-400 shrink-0">{sc.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compliments Box */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      {complimentCount + thankYouCount} Catering Compliments & Thank Yous
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {activeCasesCount > 0 ? (((complimentCount + thankYouCount) / activeCasesCount) * 100).toFixed(1) : 0}% positive
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300 mt-2">
                    <p className="text-slate-400 font-medium">Subcategory breakdown for praise ({complimentCount + thankYouCount} total):</p>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      {positiveSubCategories.map((sc) => (
                        <button
                          key={sc.label}
                          onClick={() => {
                            setActiveTab('cases');
                            setSearchTerm(sc.label);
                          }}
                          className="flex justify-between items-center p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition text-left"
                        >
                          <span className="text-slate-300 truncate pr-2 font-medium">{sc.label}</span>
                          <span className={`font-mono font-bold shrink-0 ${sc.compliments > 0 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {sc.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 italic text-xs text-emerald-200 mt-2">
                  “Tamara was amazingly courteous and caring with our severe allergy requirements. 5 stars for excellence.”
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: VENUE BREAKDOWNS */}
        {activeTab === 'venues' && (
          <div className="space-y-6">
            <div className="text-center py-2 border-b border-slate-800 mb-4">
              <h2 className="text-2xl font-serif font-bold text-slate-100 tracking-wide">
                Catering - Venue Breakdowns ({selectedMonth === 'ALL' ? 'All Months' : selectedMonth})
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Click any venue card below to inspect and record actions for its specific complaints in the Action Register.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Afternoon Tea */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 shadow-xl space-y-3 transition">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-200 text-sm">Afternoon Tea</h3>
                  <span className="text-xs text-amber-400 font-mono">
                    {afternoonTeaStats.total} Feedback ({cateringItems.length > 0 ? Math.round((afternoonTeaStats.total / cateringItems.length) * 100) : 0}% of Catering)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-amber-400">{afternoonTeaStats.total}</div>
                    <div className="text-[10px] text-slate-400">Total mentions</div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>Complaint:</span><span className="font-bold text-rose-400">{afternoonTeaStats.complaints}</span></div>
                    <div className="flex justify-between"><span>Compliment:</span><span className="font-bold text-emerald-400">{afternoonTeaStats.compliments}</span></div>
                    <div className="flex justify-between"><span>Thank You:</span><span className="font-bold text-yellow-400">{afternoonTeaStats.thankYous}</span></div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('cases');
                    setTypeFilter('Complaint');
                    setDepartmentFilter('Afternoon Tea');
                    setVenueFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="w-full mt-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition flex items-center justify-between"
                >
                  <span>View {afternoonTeaStats.complaints} Afternoon Tea Complaints</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* The Hogwarts Table */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 shadow-xl space-y-3 transition">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-200 text-sm">The Hogwarts Table</h3>
                  <span className="text-xs text-emerald-400 font-mono">
                    {hogwartsTableStats.total} Feedback ({cateringItems.length > 0 ? Math.round((hogwartsTableStats.total / cateringItems.length) * 100) : 0}% of Catering)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-emerald-400">{hogwartsTableStats.total}</div>
                    <div className="text-[10px] text-slate-400">Total mentions</div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>Complaint:</span><span className="font-bold text-rose-400">{hogwartsTableStats.complaints}</span></div>
                    <div className="flex justify-between"><span>Compliment:</span><span className="font-bold text-emerald-400">{hogwartsTableStats.compliments}</span></div>
                    <div className="flex justify-between"><span>Thank You:</span><span className="font-bold text-yellow-400">{hogwartsTableStats.thankYous}</span></div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('cases');
                    setTypeFilter('Complaint');
                    setDepartmentFilter('Hogwarts Table');
                    setVenueFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="w-full mt-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition flex items-center justify-between"
                >
                  <span>View {hogwartsTableStats.complaints} Hogwarts Table Complaints</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Backlot Cafe */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 shadow-xl space-y-3 transition">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-200 text-sm">Backlot Café</h3>
                  <span className="text-xs text-blue-400 font-mono">
                    {backlotStats.total} Feedback ({cateringItems.length > 0 ? Math.round((backlotStats.total / cateringItems.length) * 100) : 0}% of Catering)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-blue-400">{backlotStats.total}</div>
                    <div className="text-[10px] text-slate-400">Total mentions</div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>Complaint:</span><span className="font-bold text-rose-400">{backlotStats.complaints}</span></div>
                    <div className="flex justify-between"><span>Compliment:</span><span className="font-bold text-emerald-400">{backlotStats.compliments}</span></div>
                    <div className="flex justify-between"><span>Thank You:</span><span className="font-bold text-yellow-400">{backlotStats.thankYous}</span></div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('cases');
                    setTypeFilter('Complaint');
                    setVenueFilter('Backlot Cafe');
                    setDepartmentFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="w-full mt-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition flex items-center justify-between"
                >
                  <span>View {backlotStats.complaints} Backlot Complaints</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Food Hall & Other F&B */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-yellow-500/50 shadow-xl space-y-3 transition">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-200 text-sm">Food Hall & Other Outlets</h3>
                  <span className="text-xs text-yellow-400 font-mono">
                    {foodHallStats.total} Feedback
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-yellow-400">{foodHallStats.total}</div>
                    <div className="text-[10px] text-slate-400">Total mentions</div>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span>Complaint:</span><span className="font-bold text-rose-400">{foodHallStats.complaints}</span></div>
                    <div className="flex justify-between"><span>Compliment:</span><span className="font-bold text-emerald-400">{foodHallStats.compliments}</span></div>
                    <div className="flex justify-between"><span>Thank You:</span><span className="font-bold text-yellow-400">{foodHallStats.thankYous}</span></div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('cases');
                    setTypeFilter('Complaint');
                    setVenueFilter('Food Hall');
                    setDepartmentFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="w-full mt-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition flex items-center justify-between"
                >
                  <span>View {foodHallStats.complaints} Food Hall Complaints</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Full Catering Callout */}
              <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-lg">
                    {cateringComplaintCount}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Full Catering Complaint Action Register</h4>
                    <p className="text-xs text-slate-400">All {cateringComplaintCount} verified catering complaints across all venues for {selectedMonth === 'ALL' ? 'all months' : selectedMonth}.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('cases');
                    setTypeFilter('Complaint');
                    setDepartmentFilter('CATERING_ALL');
                    setVenueFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>View All {cateringComplaintCount} Catering Complaints</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CASE ACTION REGISTER & COMMENTS TAB */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Case Action Register & Comments
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                      Showing {filteredCases.length} of {activeCasesCount} Cases ({selectedMonth === 'ALL' ? 'All Months' : selectedMonth})
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any case below to expand and view the <strong className="text-amber-300">full description text</strong> and assign action notes.
                  </p>
                </div>

                {/* Quick Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => {
                      setTypeFilter('ALL');
                      setDepartmentFilter('ALL');
                      setVenueFilter('ALL');
                      setStatusFilter('ALL');
                      setSearchTerm('');
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                      typeFilter === 'ALL' && departmentFilter === 'ALL' && venueFilter === 'ALL' && statusFilter === 'ALL' && !searchTerm
                        ? 'bg-slate-700 text-white font-semibold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    All ({activeCasesCount})
                  </button>

                  <button
                    onClick={() => {
                      setTypeFilter('Complaint');
                      setDepartmentFilter('ALL');
                      setVenueFilter('ALL');
                      setStatusFilter('ALL');
                      setSearchTerm('');
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition flex items-center gap-1 ${
                      typeFilter === 'Complaint' && departmentFilter === 'ALL' && venueFilter === 'ALL' && statusFilter === 'ALL' && !searchTerm
                        ? 'bg-rose-500 text-slate-950 font-bold shadow'
                        : 'bg-rose-950/50 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50'
                    }`}
                  >
                    Complaints ({complaintCount})
                  </button>

                  <button
                    onClick={() => {
                      setTypeFilter('Compliment');
                      setDepartmentFilter('ALL');
                      setVenueFilter('ALL');
                      setStatusFilter('ALL');
                      setSearchTerm('');
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition flex items-center gap-1 ${
                      typeFilter === 'Compliment' && departmentFilter === 'ALL' && venueFilter === 'ALL' && statusFilter === 'ALL' && !searchTerm
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                        : 'bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/50'
                    }`}
                  >
                    Compliments ({complimentCount})
                  </button>

                  <button
                    onClick={() => {
                      setTypeFilter('Thank You');
                      setDepartmentFilter('ALL');
                      setVenueFilter('ALL');
                      setStatusFilter('ALL');
                      setSearchTerm('');
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition flex items-center gap-1 ${
                      typeFilter === 'Thank You' && departmentFilter === 'ALL' && venueFilter === 'ALL' && statusFilter === 'ALL' && !searchTerm
                        ? 'bg-yellow-400 text-slate-950 font-bold shadow'
                        : 'bg-yellow-950/50 text-yellow-300 hover:bg-yellow-900/60 border border-yellow-800/50'
                    }`}
                  >
                    Thank Yous ({thankYouCount})
                  </button>

                  <button
                    onClick={() => {
                      setTypeFilter('Complaint');
                      setDepartmentFilter('CATERING_ALL');
                      setVenueFilter('ALL');
                      setSearchTerm('');
                      setStatusFilter('ALL');
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition flex items-center gap-1.5 ${
                      typeFilter === 'Complaint' && departmentFilter === 'CATERING_ALL'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow'
                        : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/80 border border-amber-800/60'
                    }`}
                  >
                    <Utensils className="w-3 h-3" />
                    Catering Complaints ({cateringComplaintCount})
                  </button>

                  <button
                    onClick={() => {
                      setStatusFilter(statusFilter === 'InProgress' ? 'ALL' : 'InProgress');
                      setTypeFilter('ALL');
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition flex items-center gap-1 ${
                      statusFilter === 'InProgress'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow'
                        : 'bg-amber-950/50 text-amber-300 hover:bg-amber-900/60 border border-amber-800/50'
                    }`}
                  >
                    In Progress ({inProgressCount})
                  </button>

                  <button
                    onClick={() => {
                      setStatusFilter(statusFilter === 'Closed' ? 'ALL' : 'Closed');
                      setTypeFilter('ALL');
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition flex items-center gap-1 ${
                      statusFilter === 'Closed'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                        : 'bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/50'
                    }`}
                  >
                    Closed ({resolvedCount})
                  </button>
                </div>
              </div>

              {/* Advanced Search & Select Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 pt-1">
                {/* Search */}
                <div className="relative sm:col-span-2 md:col-span-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search keywords or Case ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Month Filter */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Months ({totalCasesAllMonths})</option>
                  {availableMonths.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.month} ({m.count})
                    </option>
                  ))}
                </select>

                {/* Feedback Type */}
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    if (statusFilter !== 'ALL' && e.target.value !== 'ALL') {
                      setStatusFilter('ALL');
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Feedback Types</option>
                  <option value="Complaint">Complaints ({complaintCount})</option>
                  <option value="Compliment">Compliments ({complimentCount})</option>
                  <option value="Suggestion">Suggestions ({suggestionCount})</option>
                  <option value="Thank You">Thank Yous ({thankYouCount})</option>
                </select>

                {/* Department Filter */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Departments</option>
                  <option value="CATERING_ALL">Catering (All F&B)</option>
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                {/* Venue Filter */}
                <select
                  value={venueFilter}
                  onChange={(e) => setVenueFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Venues / Areas</option>
                  {availableVenues.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cases Table List */}
            {filteredCases.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800">
                <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300">No Cases Match Active Filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Try clearing your search term or switching months to review other records.
                </p>
                <button
                  onClick={() => {
                    setTypeFilter('ALL');
                    setDepartmentFilter('ALL');
                    setVenueFilter('ALL');
                    setStatusFilter('ALL');
                    setSearchTerm('');
                    setSelectedMonth('ALL');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCases.map((item) => {
                  const isExpanded = expandedCaseId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border transition-all ${
                        isExpanded
                          ? 'bg-slate-900 border-amber-500/80 shadow-2xl ring-1 ring-amber-500/40'
                          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Case Row Header */}
                      <div
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedCaseId(null);
                            setEditActionItem(null);
                          } else {
                            setExpandedCaseId(item.id);
                            setEditActionItem({ ...item });
                          }
                        }}
                        className="p-4 cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {/* Type Pill */}
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase shrink-0 ${
                              String(item.type).toLowerCase() === 'complaint'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : String(item.type).toLowerCase() === 'compliment'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : String(item.type).toLowerCase() === 'suggestion'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            }`}
                          >
                            {item.type}
                          </span>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap text-xs">
                              <span className="font-mono font-bold text-amber-400">
                                {item.caseNumber || item.id}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono">
                                {item.monthYear || getMonthYearFromDate(item.date)}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-200 font-semibold">{item.venue || item.area}</span>
                              {item.department && (
                                <>
                                  <span className="text-slate-500">|</span>
                                  <span className="text-slate-400">{item.department}</span>
                                </>
                              )}
                              <span className="text-slate-500">|</span>
                              <span className="text-slate-400">{item.date}</span>
                            </div>

                            {/* Collapsed Preview Snippet - Only shown when closed */}
                            {!isExpanded && (
                              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                {item.feedbackDetail}
                              </p>
                            )}

                            {/* Existing Action Summary Badge if any */}
                            {item.actionTaken && !isExpanded && (
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  Action Logged: {item.actionTaken.slice(0, 70)}...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status & Expand Toggle */}
                        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === 'Resolved' || String(item.caseStatus).toLowerCase() === 'closed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : item.status === 'InProgress' || String(item.caseStatus).toLowerCase() === 'open'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {item.status === 'Resolved' || String(item.caseStatus).toLowerCase() === 'closed'
                              ? 'Closed'
                              : item.status === 'InProgress' || String(item.caseStatus).toLowerCase() === 'open'
                              ? 'In Progress'
                              : item.status === 'Pending'
                              ? 'Pending Review'
                              : (item.caseStatus || 'Open')}
                          </span>

                          <button className="p-1 text-slate-400 hover:text-white transition">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-amber-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Full View & Action Editor */}
                      {isExpanded && editActionItem && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/60 rounded-b-xl">
                          {/* Full Comment Description */}
                          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-inner">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" /> Full Visitor Comment / Case Description
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {item.caseNumber || item.id} • {item.monthYear || getMonthYearFromDate(item.date)}
                              </span>
                            </div>
                            <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 max-h-72 overflow-y-auto">
                              {item.feedbackDetail}
                            </div>
                          </div>

                          {/* Action Items Form */}
                          <form onSubmit={handleSaveAction} className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 space-y-3.5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Dedicated Case Action Plan & Status
                              </h4>
                              <span className="text-[11px] text-slate-400">
                                Owner & Operations Follow-up
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              {/* Status Dropdown */}
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                  Action Status
                                </label>
                                <select
                                  value={
                                    editActionItem.status === 'Resolved' || String(editActionItem.caseStatus).toLowerCase() === 'closed'
                                      ? 'Resolved'
                                      : editActionItem.status === 'Pending'
                                      ? 'Pending'
                                      : 'InProgress'
                                  }
                                  onChange={(e) => {
                                    const nextStatus = e.target.value as FeedbackStatus;
                                    setEditActionItem({
                                      ...editActionItem,
                                      status: nextStatus,
                                      caseStatus: nextStatus === 'Resolved' ? 'Closed' : 'Open',
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                                >
                                  <option value="InProgress">Open (In Progress)</option>
                                  <option value="Resolved">Closed</option>
                                  <option value="Pending">Pending Review</option>
                                </select>
                              </div>

                              {/* Assignee / Owner */}
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                  Action Owner / Lead
                                </label>
                                <input
                                  type="text"
                                  value={editActionItem.actionOwner || ''}
                                  placeholder="e.g. Aramark Duty Manager"
                                  onChange={(e) =>
                                    setEditActionItem({
                                      ...editActionItem,
                                      actionOwner: e.target.value,
                                    })
                                  }
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              {/* Visit / Report Date */}
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                  Visit / Report Date
                                </label>
                                <input
                                  type="date"
                                  value={editActionItem.date ? editActionItem.date.slice(0, 10) : ''}
                                  onChange={(e) => {
                                    const newDate = e.target.value;
                                    const newMonth = getMonthYearFromDate(newDate);
                                    setEditActionItem({
                                      ...editActionItem,
                                      date: newDate,
                                      monthYear: newMonth,
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              {/* Target Resolution Due Date */}
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                  Target Resolution Date
                                </label>
                                <input
                                  type="date"
                                  value={editActionItem.actionDueDate || ''}
                                  onChange={(e) =>
                                    setEditActionItem({
                                      ...editActionItem,
                                      actionDueDate: e.target.value,
                                    })
                                  }
                                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            {/* Action Taken Note Text */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Action Taken & Operational Resolution Notes
                              </label>
                              <textarea
                                rows={3}
                                value={editActionItem.actionTaken || ''}
                                placeholder="Detail steps taken: customer contact, refund given, supplier investigation, staff retraining..."
                                onChange={(e) =>
                                  setEditActionItem({
                                    ...editActionItem,
                                    actionTaken: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                              />
                            </div>

                            {/* Action Save Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedCaseId(null);
                                  setEditActionItem(null);
                                }}
                                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 text-xs font-bold text-slate-950 rounded-lg bg-amber-500 hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save Action
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
