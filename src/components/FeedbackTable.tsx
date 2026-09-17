import React, { useState } from 'react';
import {
  Search,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Trash2,
  Filter,
  RefreshCw,
  MessageSquare,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { FeedbackItem, FeedbackStatus } from '../types';

interface FeedbackTableProps {
  items: FeedbackItem[];
  onUpdateRow: (
    id: string,
    actionTaken: string,
    status: FeedbackStatus,
    actionOwner?: string,
    actionDueDate?: string
  ) => Promise<void> | void;
  onDeleteRow?: (id: string) => void;
  onRefresh?: () => void;
  onExportExcel: () => void;
  isLoading?: boolean;
}

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  items,
  onUpdateRow,
  onDeleteRow,
  onRefresh,
  onExportExcel,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Local state for row modifications before clicking save
  const [rowEdits, setRowEdits] = useState<
    Record<
      string,
      {
        actionTaken: string;
        actionOwner: string;
        actionDueDate: string;
        status: FeedbackStatus;
      }
    >
  >({});

  const [savingRowIds, setSavingRowIds] = useState<Record<string, boolean>>({});
  const [savedSuccessIds, setSavedSuccessIds] = useState<Record<string, boolean>>({});

  const getEditState = (item: FeedbackItem) => {
    const edit = rowEdits[item.id];
    return {
      actionTaken: edit?.actionTaken !== undefined ? edit.actionTaken : item.actionTaken || '',
      actionOwner: edit?.actionOwner !== undefined ? edit.actionOwner : item.actionOwner || '',
      actionDueDate: edit?.actionDueDate !== undefined ? edit.actionDueDate : item.actionDueDate || '',
      status: edit?.status || item.status || 'Pending',
    };
  };

  const updateEditState = (id: string, field: string, val: any, item: FeedbackItem) => {
    const current = getEditState(item);
    setRowEdits((prev) => ({
      ...prev,
      [id]: {
        ...current,
        [field]: val,
      },
    }));
  };

  const handleSaveRow = async (item: FeedbackItem) => {
    const state = getEditState(item);
    setSavingRowIds((prev) => ({ ...prev, [item.id]: true }));

    try {
      await onUpdateRow(
        item.id,
        state.actionTaken,
        state.status,
        state.actionOwner,
        state.actionDueDate
      );
      setSavingRowIds((prev) => ({ ...prev, [item.id]: false }));
      setSavedSuccessIds((prev) => ({ ...prev, [item.id]: true }));

      setTimeout(() => {
        setSavedSuccessIds((prev) => ({ ...prev, [item.id]: false }));
      }, 2500);
    } catch (err) {
      console.error(err);
      setSavingRowIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.id.toLowerCase().includes(searchLower) ||
      item.area.toLowerCase().includes(searchLower) ||
      (item.venue && item.venue.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.toLowerCase().includes(searchLower)) ||
      item.type.toLowerCase().includes(searchLower) ||
      item.feedbackDetail.toLowerCase().includes(searchLower) ||
      item.actionTaken.toLowerCase().includes(searchLower) ||
      (item.actionOwner && item.actionOwner.toLowerCase().includes(searchLower));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'Pending'
        ? item.status === 'Pending'
        : statusFilter === 'InProgress'
        ? item.status === 'InProgress' || (item.status as any) === 'In Progress'
        : item.status === 'Resolved';

    return matchesSearch && matchesStatus;
  });

  const countPending = items.filter((i) => i.status === 'Pending').length;
  const countInProgress = items.filter(
    (i) => i.status === 'InProgress' || (i.status as any) === 'In Progress'
  ).length;
  const countResolved = items.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Filter Control Bar */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-800">
                Feedback Master Register & Comment Action Center
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                {items.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Every comment features a dedicated operational action tracking section (Action Taken, Owner, Due Date, Status)
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                title="Refresh from Google Sheet"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            )}

            <button
              onClick={onExportExcel}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Master .xlsx</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 font-semibold rounded-md transition ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1 font-semibold rounded-md transition ${
                statusFilter === 'Pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Pending ({countPending})
            </button>
            <button
              onClick={() => setStatusFilter('InProgress')}
              className={`px-3 py-1 font-semibold rounded-md transition ${
                statusFilter === 'InProgress'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              In Progress ({countInProgress})
            </button>
            <button
              onClick={() => setStatusFilter('Resolved')}
              className={`px-3 py-1 font-semibold rounded-md transition ${
                statusFilter === 'Resolved'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Resolved ({countResolved})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Area, Category, Feedback, Action..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Records List with Actions Section on Each Comment */}
      <div className="divide-y divide-slate-200">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <span>Fetching feedback data from Google Sheet...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1" />
            <p className="font-semibold text-slate-700">No matching comments found</p>
            <p className="text-slate-400">Try adjusting your search filter or upload an Excel report above.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const editState = getEditState(item);
            const isSaving = Boolean(savingRowIds[item.id]);
            const isSuccess = Boolean(savedSuccessIds[item.id]);
            const isExpanded = expandedRowId === item.id;

            return (
              <div key={item.id} className="p-4 hover:bg-slate-50/70 transition space-y-3">
                {/* Comment Top Line Meta */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.id}
                    </span>
                    <span className="text-slate-500">{item.date}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-semibold rounded border border-slate-200">
                      {item.area} {item.venue ? `(${item.venue})` : ''}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.type === 'Complaint'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : item.type === 'Compliment'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : item.type === 'Suggestion'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {item.type}
                    </span>

                    {item.category && (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-200 font-medium rounded text-[11px]">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                        editState.status === 'Pending'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : editState.status === 'InProgress' || (editState.status as any) === 'In Progress'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      Action Status: {editState.status}
                    </span>

                    <button
                      onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded bg-slate-100 hover:bg-slate-200 transition"
                      title="Toggle Comment Details & Action Log"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Comment Detail / Raw Verbatim Text */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-800 text-xs leading-relaxed font-normal">
                  <span className="font-semibold text-slate-500 block mb-0.5">Visitor / Staff Comment Verbatim:</span>
                  "{item.feedbackDetail}"
                </div>

                {/* --- DEDICATED ACTION SECTION ON EACH COMMENT --- */}
                <div className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/30 p-3.5 rounded-xl border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                    <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Action Taken & Resolution Section for Comment {item.id}
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium">
                      Changes push directly to Google Sheet
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                    {/* Action Taken Description */}
                    <div className="lg:col-span-6">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Action Taken / Follow-up Plan:
                      </label>
                      <textarea
                        rows={2}
                        value={editState.actionTaken}
                        onChange={(e) => updateEditState(item.id, 'actionTaken', e.target.value, item)}
                        placeholder="Describe exact operational action taken or investigation steps..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    {/* Action Owner / Department */}
                    <div className="lg:col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" /> Action Owner:
                      </label>
                      <input
                        type="text"
                        value={editState.actionOwner}
                        onChange={(e) => updateEditState(item.id, 'actionOwner', e.target.value, item)}
                        placeholder="e.g. Aramark QA, Duty Mgr..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <label className="block font-semibold text-slate-700 mt-2 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Target Due Date:
                      </label>
                      <input
                        type="date"
                        value={editState.actionDueDate}
                        onChange={(e) => updateEditState(item.id, 'actionDueDate', e.target.value, item)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Action Status & Save Control */}
                    <div className="lg:col-span-3 flex flex-col justify-between">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Action Status:
                        </label>
                        <select
                          value={editState.status}
                          onChange={(e) => updateEditState(item.id, 'status', e.target.value as FeedbackStatus, item)}
                          className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                            editState.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : editState.status === 'InProgress' || (editState.status as any) === 'In Progress'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="InProgress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => handleSaveRow(item)}
                          disabled={isSaving}
                          className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm ${
                            isSuccess
                              ? 'bg-emerald-600 text-white'
                              : isSaving
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                          }`}
                        >
                          {isSaving ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : isSuccess ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Action Saved!</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Action On Comment</span>
                            </>
                          )}
                        </button>

                        {onDeleteRow && (
                          <button
                            onClick={() => onDeleteRow(item.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete comment record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span>Showing {filteredItems.length} of {items.length} feedback comment records</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Sheet Backend Columns: [ID, Date, Area, Type, Feedback Detail, Action Taken, Status, Action Owner, Action Due Date]
        </span>
      </div>
    </div>
  );
};
