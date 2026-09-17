import React from 'react';
import {
  TrendingUp,
  Clock,
  MessageSquare,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Award,
  UtensilsCrossed,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { FeedbackItem, FeedbackStatus } from '../types';
import {
  isComplaintItem,
  isComplimentType,
  isSuggestionType,
  isThankYouType,
} from '../utils/typeUtils';

interface ClientBreakdownDashboardProps {
  items: FeedbackItem[];
  onSelectCategoryFilter?: (type: string, category?: string) => void;
}

export const ClientBreakdownDashboard: React.FC<ClientBreakdownDashboardProps> = ({
  items,
  onSelectCategoryFilter,
}) => {
  const totalItems = items.length;

  if (totalItems === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm mb-6">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Feedback Data Loaded</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Upload an Excel document (<span className="font-mono text-blue-600">.xlsx</span> / <span className="font-mono text-blue-600">.xls</span>) using the uploader below to populate feedback analytics, department breakdowns, and comment action tracking.
        </p>
      </div>
    );
  }

  // Real-time dynamic calculation from uploaded items
  const complaints = items.filter((i) => isComplaintItem(i)).length;
  const compliments = items.filter((i) => !isComplaintItem(i) && isComplimentType(i.type)).length;
  const suggestions = items.filter((i) => !isComplaintItem(i) && isSuggestionType(i.type)).length;
  const thankYous = items.filter((i) => !isComplaintItem(i) && isThankYouType(i.type)).length;

  const pendingActions = items.filter((i) => i.status === 'Pending').length;
  const inProgressActions = items.filter((i) => i.status === 'InProgress' || (i.status as any) === 'In Progress').length;
  const resolvedActions = items.filter((i) => i.status === 'Resolved').length;

  // Category counts
  const foodPoisoningCount = items.filter((i) => (i.category && i.category.toLowerCase().includes('poisoning')) || i.feedbackDetail.toLowerCase().includes('poison')).length;
  const foodQualityCount = items.filter((i) => (i.category && i.category.toLowerCase().includes('quality')) || i.feedbackDetail.toLowerCase().includes('quality')).length;
  const orderIssuesCount = items.filter((i) => (i.category && i.category.toLowerCase().includes('order')) || i.feedbackDetail.toLowerCase().includes('wait') || i.feedbackDetail.toLowerCase().includes('delay')).length;
  const staffComplimentsCount = items.filter((i) => !isComplaintItem(i) && (isComplimentType(i.type) || isThankYouType(i.type))).length;

  // Dynamic Department Mentions
  const deptMap: Record<string, number> = {};
  items.forEach((item) => {
    const areaName = item.area || 'General';
    deptMap[areaName] = (deptMap[areaName] || 0) + 1;
  });

  const staffDepartments = Object.entries(deptMap)
    .map(([name, count]) => ({
      name,
      count,
      percentage: `${((count / totalItems) * 100).toFixed(1)}%`,
    }))
    .sort((a, b) => b.count - a.count);

  // Dynamic Venue Breakdown
  const venueMap: Record<string, number> = {};
  items.forEach((item) => {
    if (item.venue) {
      venueMap[item.venue] = (venueMap[item.venue] || 0) + 1;
    }
  });

  const cateringVenues = Object.entries(venueMap)
    .map(([name, total]) => ({
      name,
      total,
      share: `${((total / totalItems) * 100).toFixed(0)}% of total`,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 mb-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-xs font-bold rounded-full border border-blue-500/30">
              Live Provided Data Analytics &bull; {totalItems} Records
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold rounded-full border border-emerald-500/30">
              Comment Action Tracking Active
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight mt-1 text-white">
            Feedback Analytics & Operational Actions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics generated strictly from uploaded spreadsheet records.
          </p>
        </div>

        {/* Action Status Summary */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 text-xs">
          <div className="text-center px-2 border-r border-slate-700">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Pending Actions</p>
            <p className="text-amber-400 font-extrabold text-base">{pendingActions}</p>
          </div>
          <div className="text-center px-2 border-r border-slate-700">
            <p className="text-slate-400 text-[10px] uppercase font-bold">In Progress</p>
            <p className="text-blue-400 font-extrabold text-base">{inProgressActions}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Resolved</p>
            <p className="text-emerald-400 font-extrabold text-base">{resolvedActions}</p>
          </div>
        </div>
      </div>

      {/* Slide 1: Feedback Volume Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Records Received */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>Total Records</span>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalItems}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Uploaded Feedback Records</p>
        </div>

        {/* Resolved Actions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>Resolved Actions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{resolvedActions}</div>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            {totalItems > 0 ? `${((resolvedActions / totalItems) * 100).toFixed(0)}% Completion` : '0%'}
          </p>
        </div>

        {/* Compliments */}
        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-900 mb-1 text-xs font-semibold">
            <span>Compliments / Thanks</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">{compliments + thankYous}</div>
          <p className="text-[11px] text-emerald-800 mt-1 font-medium">Positive Visitor Feedback</p>
        </div>

        {/* Complaints */}
        <div className="bg-red-50/60 p-4 rounded-xl border border-red-200/80 shadow-sm">
          <div className="flex items-center justify-between text-red-900 mb-1 text-xs font-semibold">
            <span>Complaints</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-950">{complaints}</div>
          <p className="text-[11px] text-red-800 mt-1 font-medium">Action Required</p>
        </div>
      </div>

      {/* Visitor Feedback Type Breakdown Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-600" />
              Feedback Volume by Type
            </h3>
            <span className="text-xs font-semibold text-slate-500">{totalItems} Total</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            {/* Complaints */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Complaint
                </span>
                <span className="font-bold text-slate-900">
                  {complaints} ({totalItems > 0 ? ((complaints / totalItems) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${totalItems > 0 ? (complaints / totalItems) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Compliment */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Compliment
                </span>
                <span className="font-bold text-slate-900">
                  {compliments} ({totalItems > 0 ? ((compliments / totalItems) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalItems > 0 ? (compliments / totalItems) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Suggestion */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Suggestion
                </span>
                <span className="font-bold text-slate-900">
                  {suggestions} ({totalItems > 0 ? ((suggestions / totalItems) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalItems > 0 ? (suggestions / totalItems) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Thank You */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  Thank You
                </span>
                <span className="font-bold text-slate-900">
                  {thankYous} ({totalItems > 0 ? ((thankYous / totalItems) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${totalItems > 0 ? (thankYous / totalItems) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Categories Breakdown */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-600" />
              Category Breakdown
            </h3>
            <span className="px-2 py-0.5 text-[11px] bg-blue-100 text-blue-800 font-bold rounded-md">
              From Provided Spreadsheet
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between font-bold text-red-900">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Poisoning / Safety
                </span>
                <span>{foodPoisoningCount}x</span>
              </div>
              <p className="text-[10px] text-red-700 mt-1">Investigation & action tracking</p>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span>Quality Issues</span>
                <span>{foodQualityCount}x</span>
              </div>
              <p className="text-[10px] text-amber-700 mt-1">Product & service standards</p>
            </div>

            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span>Order / Delay Issues</span>
                <span>{orderIssuesCount}x</span>
              </div>
              <p className="text-[10px] text-blue-700 mt-1">Service speed & order accuracy</p>
            </div>

            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center justify-between font-bold text-emerald-900">
                <span>Staff Praise</span>
                <span>{staffComplimentsCount}x</span>
              </div>
              <p className="text-[10px] text-emerald-700 mt-1">Positive staff mentions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Mentions Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Department Leaderboard */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Area / Department Breakdown
            </h3>
            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
              {staffDepartments.length} Areas Identified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
            {staffDepartments.map((dept, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-blue-50/50 hover:border-blue-200 transition cursor-default"
              >
                <span className="font-medium text-slate-700 truncate pr-1">{dept.name}</span>
                <span className="font-extrabold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                  {dept.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Venues Breakdown */}
        {cateringVenues.length > 0 && (
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                Venue Breakdown
              </h3>
              <span className="text-xs text-slate-500 font-medium">{cateringVenues.length} Venues</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {cateringVenues.map((venue, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-800">{venue.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">{venue.share}</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {venue.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
