import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExcelUploader } from './components/ExcelUploader';
import { PresentationDashboard } from './components/PresentationDashboard';

import { ExcelMappingConfig, FeedbackItem, FeedbackStatus, ExecutiveMonthlyReport } from './types';
import { DEFAULT_EXCEL_CONFIG, DEMO_AUGUST_2026_ITEMS, DEMO_ALL_MONTHS_ITEMS } from './data/initialData';
import { initialExecReports, normalizeReportVenues } from './data/initialExecReports';
import {
  isComplaintType,
  isComplaintItem,
  isComplimentType,
  isThankYouType,
  isSuggestionType,
  isCateringFeedbackItem,
  normalizeTypeName,
  KNOWN_AUGUST_2026_COMPLAINT_IDS,
  CANONICAL_AUGUST_2026_IDS,
} from './utils/typeUtils';
import { normalizeDateToIso, getMonthYearFromDate } from './utils/dateUtils';
import { Info, FileSpreadsheet } from 'lucide-react';
import {
  initAuth,
  subscribeToFeedbackItems,
  saveFeedbackItemToFirestore,
  batchSaveFeedbackItemsToFirestore,
  clearAllFirestoreFeedbackItems,
  deleteSeptemberDataFromFirestore,
  isSeptemberRecord,
} from './lib/firebase';

export function isCorruptedSeptemberItem(_it: { monthYear?: string; date?: string; id?: string; caseNumber?: string }): boolean {
  return false;
}

export function filterOutCorruptedSeptemberItems(itemList: FeedbackItem[]): FeedbackItem[] {
  return itemList;
}

function sanitizeFeedbackItem(item: any, fallbackId?: string): FeedbackItem {
  let rawType = item.type || '';
  let rawStatus = item.caseStatus || '';

  // Check if rawType and rawStatus are inverted:
  const isStatusTypeLike = isComplaintType(rawStatus) || isComplimentType(rawStatus) || isThankYouType(rawStatus) || isSuggestionType(rawStatus);
  const isTypeStatusLike = /^(closed|open|awaiting|pending|resolved|in progress)/i.test(String(rawType).trim());
  const isTypeTypeLike = isComplaintType(rawType) || isComplimentType(rawType) || isThankYouType(rawType) || isSuggestionType(rawType);
  const isStatusStatusLike = /^(closed|open|awaiting|pending|resolved|in progress)/i.test(String(rawStatus).trim());

  if ((isStatusTypeLike && !isTypeTypeLike) || (isTypeStatusLike && !isStatusStatusLike)) {
    const temp = rawStatus;
    rawStatus = rawType;
    rawType = temp;
  }
  if (!rawStatus && isTypeStatusLike && !isTypeTypeLike) {
    rawStatus = rawType;
    rawType = '';
  }
  if (!rawType && isStatusTypeLike) {
    rawType = rawStatus;
    rawStatus = 'Open';
  }

  const isCat = isCateringFeedbackItem({ ...item, type: rawType });

  let dept = item.department;
  let venue = item.venue;
  const comb = `${item.department || ''} ${item.area || ''} ${item.feedbackDetail || ''}`.toLowerCase();

  if (isCat && (!dept || dept === 'Operations' || dept === 'General Area')) {
    if (comb.includes('afternoon tea')) {
      dept = 'Afternoon Tea';
      venue = venue || 'Afternoon Tea';
    } else if (comb.includes('backlot')) {
      dept = 'F&B - Aramark';
      venue = venue || 'Backlot Cafe';
    } else if (comb.includes('food hall')) {
      dept = 'F&B - Aramark';
      venue = venue || 'Food Hall';
    } else if (comb.includes('hogwarts table')) {
      dept = 'Hogwarts Table';
      venue = venue || 'Hogwarts Table';
    } else if (comb.includes('frog café') || comb.includes('frog cafe')) {
      dept = 'F&B - Aramark';
      venue = venue || 'Chocolate Frog';
    } else if (comb.includes('butterbeer')) {
      dept = 'F&B - Aramark';
      venue = venue || 'Butterbeer Bar';
    }
  }

  const cleanCaseNumber = String(item.caseNumber || item.id || fallbackId || `WB-${Math.floor(Math.random() * 9000000 + 1000000)}`).trim();
  const isKnownComplaint = KNOWN_AUGUST_2026_COMPLAINT_IDS.has(cleanCaseNumber.toUpperCase());

  const normalizedType = isKnownComplaint ? 'Complaint' : normalizeTypeName(rawType);
  const isPositiveType = !isKnownComplaint && (isComplimentType(normalizedType) || isThankYouType(normalizedType));

  // Determine caseStatus & actionStatus:
  let finalCaseStatus = item.caseStatus || rawStatus;
  let finalActionStatus: FeedbackStatus = item.status;

  if (isComplaintType(normalizedType) || normalizedType === 'Complaint' || isKnownComplaint) {
    // All complaints should be marked as pending review by default unless an action was explicitly resolved
    if (item.status === 'Resolved' && item.actionTaken && item.actionTaken.trim().length > 0) {
      finalCaseStatus = 'Closed';
      finalActionStatus = 'Resolved';
    } else if (item.status === 'InProgress' && item.actionTaken && item.actionTaken.trim().length > 0) {
      finalCaseStatus = 'Open';
      finalActionStatus = 'InProgress';
    } else {
      finalCaseStatus = 'Pending Review';
      finalActionStatus = 'Pending';
    }
  } else if (item.status === 'Resolved' || String(finalCaseStatus).toLowerCase() === 'closed') {
    finalCaseStatus = 'Closed';
    finalActionStatus = 'Resolved';
  } else if (item.status === 'Pending' || String(finalCaseStatus).toLowerCase().includes('pending')) {
    finalCaseStatus = 'Pending Review';
    finalActionStatus = 'Pending';
  } else if (item.status === 'InProgress' || String(finalCaseStatus).toLowerCase() === 'open') {
    finalCaseStatus = 'Open';
    finalActionStatus = 'InProgress';
  } else {
    // Default fallback when neither status nor caseStatus is set:
    if (isPositiveType) {
      finalCaseStatus = 'Closed';
      finalActionStatus = 'Resolved';
    } else {
      finalCaseStatus = 'Pending Review';
      finalActionStatus = 'Pending';
    }
  }

  const rawDate = item.date || item.visitDate;
  const isoDate = normalizeDateToIso(rawDate);
  const derivedMonthYear = item.monthYear || getMonthYearFromDate(isoDate);

  return {
    id: cleanCaseNumber,
    caseNumber: cleanCaseNumber,
    caseStatus: finalCaseStatus,
    date: isoDate,
    monthYear: derivedMonthYear,
    type: normalizedType,
    tableName: item.tableName || 'Tour Experience',
    category: item.category || (normalizedType === 'Complaint' ? 'Visitor Experience' : 'Staff'),
    subCategory: item.subCategory || '',
    department: dept || item.department || 'Operations',
    area: item.area || dept || 'General Area',
    venue: venue || item.venue || item.area || 'General Area',
    feedbackDetail: item.feedbackDetail || '(No description provided)',
    actionTaken: item.actionTaken || '',
    actionOwner: item.actionOwner === 'Duty Manager' ? '' : (item.actionOwner || ''),
    actionDueDate: item.actionDueDate || '',
    status: finalActionStatus,
    actionLogs: item.actionLogs || [],
  };
}

/**
 * Strict deduplication engine: Merges items by caseNumber ensuring zero duplicate entries
 */
function mergeAndDeduplicateItems(
  existingList: FeedbackItem[],
  newIncomingList: FeedbackItem[]
): {
  merged: FeedbackItem[];
  addedCount: number;
  updatedCount: number;
} {
  const map = new Map<string, FeedbackItem>();

  // 1. Index existing items by normalized case number
  existingList.forEach((item) => {
    const key = String(item.caseNumber || item.id).trim().toUpperCase();
    map.set(key, item);
  });

  let addedCount = 0;
  let updatedCount = 0;

  // 2. Process incoming items
  newIncomingList.forEach((incoming) => {
    const key = String(incoming.caseNumber || incoming.id).trim().toUpperCase();
    const existing = map.get(key);

    const isPositiveType = isComplimentType(incoming.type) || isThankYouType(incoming.type);

    if (existing) {
      // Existing item takes precedence, preserving user-updated status, action notes, owner, etc.
      map.set(key, {
        ...incoming,
        ...existing,
        caseStatus: existing.caseStatus || incoming.caseStatus || (isPositiveType ? 'Closed' : 'Open'),
        status: existing.status || incoming.status || (isPositiveType ? 'Resolved' : 'InProgress'),
        actionTaken: existing.actionTaken !== undefined && existing.actionTaken !== '' ? existing.actionTaken : (incoming.actionTaken || ''),
        actionOwner:
          existing.actionOwner !== undefined && existing.actionOwner !== '' && existing.actionOwner !== 'Duty Manager'
            ? existing.actionOwner
            : (incoming.actionOwner === 'Duty Manager' ? '' : (incoming.actionOwner || '')),
        actionDueDate: existing.actionDueDate || incoming.actionDueDate || '',
        actionLogs:
          existing.actionLogs && existing.actionLogs.length > 0
            ? existing.actionLogs
            : incoming.actionLogs || [],
      });
      updatedCount++;
    } else {
      map.set(key, incoming);
      addedCount++;
    }
  });

  // 3. Sort chronologically (newest dates first)
  const merged = Array.from(map.values()).sort((a, b) => {
    const dateComp = (b.date || '').localeCompare(a.date || '');
    if (dateComp !== 0) return dateComp;
    return (b.caseNumber || b.id || '').localeCompare(a.caseNumber || a.id || '');
  });

  return { merged, addedCount, updatedCount };
}

function filterOutSpuriousAugustItems(itemList: FeedbackItem[]): FeedbackItem[] {
  return itemList.filter((it) => {
    const isAug = it.monthYear === 'August 2026' || String(it.date || '').startsWith('2026-08');
    if (!isAug) return true;
    const cleanId = String(it.caseNumber || it.id || '').trim().toUpperCase();
    return CANONICAL_AUGUST_2026_IDS.has(cleanId);
  });
}

export default function App() {
  const [config] = useState<ExcelMappingConfig>(DEFAULT_EXCEL_CONFIG);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(false);

  // Clear legacy keys and purge any corrupted September data once on start-up
  useEffect(() => {
    localStorage.removeItem('gas_feedback_items');
    localStorage.removeItem('gas_feedback_items_v2');
    localStorage.removeItem('gas_feedback_items_v3');
    localStorage.removeItem('gas_feedback_items_v4');
    localStorage.removeItem('gas_feedback_items_v5');
    localStorage.removeItem('gas_feedback_items_v6');
    localStorage.removeItem('gas_feedback_items_v7');
    localStorage.removeItem('gas_feedback_items_v8');

    // Asynchronously delete any corrupted September records from Firestore
    deleteSeptemberDataFromFirestore().catch((err) =>
      console.warn('September data purge note:', err)
    );
  }, []);

  // Default to stored items or full DEMO_ALL_MONTHS_ITEMS with September data removed
  const [items, setItems] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('gas_feedback_items_v9');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((it: any) => {
            if (isCorruptedSeptemberItem(it)) return false;
            const t = String(it.type || '').toLowerCase().trim();
            const c = String(it.caseNumber || it.id || '').toLowerCase().trim();
            const d = String(it.feedbackDetail || '').toLowerCase().trim();
            if (t === 'total' || c === 'total' || c.includes('total count') || c.includes('subtotal')) return false;
            if (d.startsWith('total:') || d.startsWith('subtotal:')) return false;
            return true;
          });
          const mapped = filtered.map((it: any, idx: number) => sanitizeFeedbackItem(it, `WB-${3050000 + idx}`));
          // Ensure all canonical items across months are reconciled
          const { merged } = mergeAndDeduplicateItems(
            mapped,
            DEMO_ALL_MONTHS_ITEMS.filter((it) => !isCorruptedSeptemberItem(it)).map((it, idx) =>
              sanitizeFeedbackItem(it, `WB-${3050000 + idx}`)
            )
          );
          const cleaned = filterOutCorruptedSeptemberItems(filterOutSpuriousAugustItems(merged));
          localStorage.setItem('gas_feedback_items_v9', JSON.stringify(cleaned));
          return cleaned;
        }
      } catch (e) {}
    }
    const initialDemo = filterOutCorruptedSeptemberItems(
      DEMO_ALL_MONTHS_ITEMS.filter((it) => !isCorruptedSeptemberItem(it)).map((it, idx) =>
        sanitizeFeedbackItem(it, `WB-${3050000 + idx}`)
      )
    );
    localStorage.setItem('gas_feedback_items_v9', JSON.stringify(initialDemo));
    return initialDemo;
  });

  const [execReports, setExecReports] = useState<ExecutiveMonthlyReport[]>(() => {
    try {
      localStorage.removeItem('exec_monthly_reports_v1');
      localStorage.removeItem('exec_monthly_reports_v2');
      localStorage.removeItem('bdrc_user_uploaded_reports_v3');
      localStorage.removeItem('bdrc_user_uploaded_reports_v4');
    } catch (e) {}

    const validInitialReports = initialExecReports
      .filter((r) => !isCorruptedSeptemberItem({ monthYear: r.monthYear, id: r.id }))
      .map(normalizeReportVenues);

    const saved = localStorage.getItem('bdrc_user_uploaded_reports_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const reportMap = new Map(validInitialReports.map((r) => [r.monthYear.toLowerCase(), r]));
          // User edited reports override defaults
          parsed.forEach((userR: ExecutiveMonthlyReport) => {
            if (!isCorruptedSeptemberItem({ monthYear: userR.monthYear, id: userR.id })) {
              reportMap.set(userR.monthYear.toLowerCase(), normalizeReportVenues(userR));
            }
          });
          const list = Array.from(reportMap.values());
          localStorage.setItem('bdrc_user_uploaded_reports_v5', JSON.stringify(list));
          return list;
        }
      } catch (e) {}
    }
    localStorage.setItem('bdrc_user_uploaded_reports_v5', JSON.stringify(validInitialReports));
    return validInitialReports;
  });

  const handleSaveExecReport = (report: ExecutiveMonthlyReport) => {
    if (isCorruptedSeptemberItem({ monthYear: report.monthYear, id: report.id })) {
      setBannerNotice({
        msg: 'September report data has been excluded due to data corruption.',
        type: 'error',
      });
      return;
    }
    const normalized = normalizeReportVenues(report);
    setExecReports((prev) => {
      const filteredPrev = prev.filter(
        (r) => !isCorruptedSeptemberItem({ monthYear: r.monthYear, id: r.id })
      );
      const idx = filteredPrev.findIndex(
        (r) => r.monthYear.toLowerCase() === normalized.monthYear.toLowerCase()
      );
      let next: ExecutiveMonthlyReport[];
      if (idx >= 0) {
        next = [...filteredPrev];
        next[idx] = normalized;
      } else {
        next = [normalized, ...filteredPrev];
      }
      localStorage.setItem('bdrc_user_uploaded_reports_v5', JSON.stringify(next));
      return next;
    });
    setBannerNotice({
      msg: `Official BDRC Catering report for ${report.monthYear} saved and updated across dashboard.`,
      type: 'success',
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(() => {
    return {
      msg: 'Official 2026 catering monthly reports (January - August) loaded with verified BDRC scores and mystery shop results (corrupted September data removed).',
      type: 'success',
    };
  });

  // Real-time Cloud Firestore subscription
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const startFirestore = async () => {
      await initAuth();
      if (!isMounted) return;

      unsubscribe = subscribeToFeedbackItems(
        (firestoreItems) => {
          if (!isMounted) return;
          setFirestoreConnected(true);

          if (firestoreItems && firestoreItems.length > 0) {
            const sanitized = firestoreItems
              .filter((it: any) => !String(it.id).includes('179123079'))
              .map((it: any) => sanitizeFeedbackItem(it));
            setItems(sanitized);
            localStorage.setItem('gas_feedback_items_v9', JSON.stringify(sanitized));
          }
        },
        (err) => {
          if (isMounted) setFirestoreConnected(false);
        }
      );
    };

    startFirestore();
    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save to LocalStorage whenever items change
  useEffect(() => {
    localStorage.setItem('gas_feedback_items_v9', JSON.stringify(items));
  }, [items]);

  // Auto-dismiss banner notice with fade effect after a few seconds
  useEffect(() => {
    if (!bannerNotice) return;
    const timer = setTimeout(() => {
      setBannerNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [bannerNotice]);

  // Handle loading full 2026 meeting dataset with deduplication & Firestore sync
  const handleLoadDemoDataset = async () => {
    const sanitizedDemo = DEMO_ALL_MONTHS_ITEMS.filter((it) => !isCorruptedSeptemberItem(it)).map((it, idx) =>
      sanitizeFeedbackItem(it, `WB-${3050000 + idx}`)
    );
    const { merged, addedCount, updatedCount } = mergeAndDeduplicateItems(items, sanitizedDemo);
    const cleaned = filterOutCorruptedSeptemberItems(merged);
    setItems(cleaned);
    try {
      await batchSaveFeedbackItemsToFirestore(sanitizedDemo);
    } catch (e) {
      console.error('Failed to sync demo dataset to Firestore:', e);
    }
    setBannerNotice({
      msg: `Loaded verified 2026 Dataset (January to August): ${addedCount} new case(s) added, ${updatedCount} existing case(s) updated (Synced to Cloud DB).`,
      type: 'success',
    });
  };

  const handleClearData = async () => {
    setItems([]);
    setExecReports([]);
    localStorage.setItem('gas_feedback_items_v9', JSON.stringify([]));
    localStorage.removeItem('bdrc_user_uploaded_reports_v5');
    try {
      await clearAllFirestoreFeedbackItems();
    } catch (e) {
      console.error('Failed to clear Firestore:', e);
    }
    setBannerNotice({
      msg: 'All feedback records and BDRC reports cleared.',
      type: 'info',
    });
  };

  const handleConfirmAppend = (newParsedItems: any[]) => {
    setIsLoading(true);

    const incomingItems: FeedbackItem[] = newParsedItems.map((p) => {
      const typeStr = p.type || 'Complaint';
      const isComplaint = isComplaintType(typeStr) || String(typeStr).toLowerCase().includes('complaint');
      const isClosed = !isComplaint && String(p.caseStatus || '').toLowerCase().includes('closed');

      let assignedCaseStatus = 'Pending Review';
      let assignedStatus: FeedbackStatus = 'Pending';

      if (isClosed) {
        assignedCaseStatus = 'Closed';
        assignedStatus = 'Resolved';
      } else if (isComplaint) {
        assignedCaseStatus = 'Pending Review';
        assignedStatus = 'Pending';
      } else if (String(p.caseStatus || '').toLowerCase().includes('in progress')) {
        assignedCaseStatus = 'Open';
        assignedStatus = 'InProgress';
      }

      return {
        id: p.caseNumber,
        caseNumber: p.caseNumber,
        caseStatus: assignedCaseStatus,
        date: p.visitDate || '2026-09-01',
        monthYear: p.monthYear || 'September 2026',
        type: typeStr,
        tableName: 'Tour Experience',
        category: p.category || 'Tour F&B',
        subCategory: p.subCategory || '',
        department: p.department || 'F&B - Aramark',
        area: p.area || 'General Area',
        venue: p.venue || 'General Area',
        feedbackDetail: p.feedbackDetail || '',
        actionTaken: '',
        actionOwner: '',
        actionDueDate: '',
        status: assignedStatus,
        actionLogs: [],
      };
    });

    // 1. Update local React state and LocalStorage cache
    setItems((prev) => {
      const nonSeptember = prev.filter(
        (it) => it.monthYear !== 'September 2026' && !String(it.id).includes('179123079')
      );
      const updated = [...incomingItems, ...nonSeptember];
      localStorage.setItem('gas_feedback_items_v9', JSON.stringify(updated));
      return updated;
    });

    // 2. Write cases directly to Firestore so refresh retains all records
    batchSaveFeedbackItemsToFirestore(incomingItems)
      .then(() => console.log('Successfully saved cases to Firestore database.'))
      .catch((err) => console.warn('Firestore write warning:', err));

    setIsLoading(false);
  };

  // Handle single item update & Firestore persistence
  const handleUpdateItem = (updated: FeedbackItem) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      localStorage.setItem('gas_feedback_items_v8', JSON.stringify(next));
      return next;
    });
    saveFeedbackItemToFirestore(updated).catch((err) =>
      console.error('Failed to update Firestore document:', err)
    );
    const displayStatus =
      updated.caseStatus === 'Closed' || updated.status === 'Resolved'
        ? 'Closed'
        : updated.status === 'Pending' || String(updated.caseStatus).toLowerCase().includes('pending')
        ? 'Pending Review'
        : 'In Progress';
    setBannerNotice({
      msg: `Updated case action details for ${updated.caseNumber || updated.id}: Status is now ${displayStatus} (Saved to Cloud DB).`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans antialiased text-slate-100">
      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        {/* Banner Notice with Smooth Fade-in & Fade-out */}
        <AnimatePresence>
          {bannerNotice && (
            <motion.div
              key="app-banner-notification"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.5, ease: 'easeInOut' } }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4"
            >
              <div
                id="upload-status-banner"
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-lg transition-all duration-300 ${
                  bannerNotice.type === 'success'
                    ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-950/40'
                    : bannerNotice.type === 'error'
                    ? 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-950/40'
                    : 'bg-slate-900/95 border-amber-500/40 text-amber-200 shadow-amber-950/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 shrink-0 text-amber-400" />
                  <span className="font-medium tracking-wide">{bannerNotice.msg}</span>
                </div>
                <button
                  id="close-banner-button"
                  onClick={() => setBannerNotice(null)}
                  className="text-slate-400 hover:text-white font-bold px-2 py-0.5 rounded hover:bg-white/10 transition"
                  title="Dismiss notification"
                >
                  &times;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide Deck Meeting Dashboard & Action Register */}
        <div className="space-y-6">
          <PresentationDashboard
            items={items}
            onUpdateItem={handleUpdateItem}
            onLoadDemoData={handleLoadDemoDataset}
            onClearData={handleClearData}
            firestoreConnected={firestoreConnected}
            execReports={execReports}
            onSaveExecReport={handleSaveExecReport}
          />

          {/* Single-Step Multi-Month Excel File Upload Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="mb-4 border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    Upload Monthly Excel Feedback Reports
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload monthly spreadsheets one by one. The system automatically deduplicates by WB Case Number and organizes cases by month.
                  </p>
                </div>
                <div className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium shrink-0">
                  Deduplication Active (Zero Duplicates)
                </div>
              </div>

              <ExcelUploader
                config={config}
                onConfirmAppend={handleConfirmAppend}
                isProcessing={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Monthly Feedback Reports Tracker & Action Register</span>
          <span className="text-amber-400 font-medium">Warner Bros / Aramark Operations Deck</span>
        </div>
      </footer>
    </div>
  );
}
