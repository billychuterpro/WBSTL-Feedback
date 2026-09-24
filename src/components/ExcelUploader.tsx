import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileSpreadsheet, Check, AlertCircle, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import { ExcelMappingConfig, ParsedPreviewItem } from '../types';
import { parseExcelBuffer } from '../utils/excelHelper';
import { MONTH_NAMES, inferMonthFromFileName } from '../utils/dateUtils';

interface ExcelUploaderProps {
  config: ExcelMappingConfig;
  onConfirmAppend: (items: ParsedPreviewItem[]) => void;
  isProcessing?: boolean;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  config,
  onConfirmAppend,
  isProcessing = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isParsingLocal, setIsParsingLocal] = useState(false);

  // Default target month for cases without row-level dates
  const [selectedTargetMonth, setSelectedTargetMonth] = useState<string>('August 2026');
  const [detectedMonthNotice, setDetectedMonthNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Month options for quick selection (current year and surrounding months)
  const monthOptions = [
    'Auto-detect from File',
    'January 2026',
    'February 2026',
    'March 2026',
    'April 2026',
    'May 2026',
    'June 2026',
    'July 2026',
    'August 2026',
    'September 2026',
    'October 2026',
    'November 2026',
    'December 2026',
    'January 2025',
    'February 2025',
    'March 2025',
    'April 2025',
    'May 2025',
    'June 2025',
    'July 2025',
    'August 2025',
    'September 2025',
    'October 2025',
    'November 2025',
    'December 2025',
  ];

  // Auto-dismiss upload status messages after a few seconds
  useEffect(() => {
    if (!successMsg && !errorMsg) return;
    const timer = setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
      setDetectedMonthNotice(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [successMsg, errorMsg]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndUploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const lowerName = droppedFile.name.toLowerCase();
      if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls') && !lowerName.endsWith('.csv')) {
        setErrorMsg('Please upload a valid Excel or CSV spreadsheet (.xlsx, .xls, .csv).');
        return;
      }
      processAndUploadFile(droppedFile);
    }
  };

  const processAndUploadFile = async (selectedFile: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDetectedMonthNotice(null);
    setIsParsingLocal(true);

    try {
      // Check if filename contains a month name or timestamp
      const fileInferredMonth = inferMonthFromFileName(selectedFile.name);
      let effectiveTargetMonth = selectedTargetMonth === 'Auto-detect from File' ? undefined : selectedTargetMonth;

      const arrayBuffer = await selectedFile.arrayBuffer();
      const { items, sheetName, reportMetadata } = parseExcelBuffer(arrayBuffer, config, {
        fileName: selectedFile.name,
        targetMonth: effectiveTargetMonth,
      });

      if (reportMetadata && selectedTargetMonth === 'Auto-detect from File') {
        setDetectedMonthNotice(`Detected from Report Filter: ${reportMetadata.rawRangeText} → Assigned to ${reportMetadata.detectedMonth}`);
      } else if (fileInferredMonth && selectedTargetMonth === 'Auto-detect from File') {
        setDetectedMonthNotice(`Auto-detected month from file name / timestamp: ${fileInferredMonth}`);
      }

      if (items.length === 0) {
        setErrorMsg(
          `No valid WB cases found in "${selectedFile.name}". Please ensure the file contains rows with WB case numbers (e.g. WB-3095854).`
        );
        setIsParsingLocal(false);
        return;
      }

      const validItems = items.filter((i) => i.isValid);

      if (validItems.length === 0) {
        setErrorMsg('No valid items found to import.');
        setIsParsingLocal(false);
        return;
      }

      // Determine which month was assigned
      const assignedMonth = validItems[0]?.monthYear || effectiveTargetMonth || (reportMetadata ? reportMetadata.detectedMonth : 'assigned month');

      // Single-step direct upload: immediately append records to the active dataset
      onConfirmAppend(validItems);
      setSuccessMsg(
        `Imported ${validItems.length} WB cases into "${assignedMonth}" from "${selectedFile.name}" (Sheet: ${sheetName || 'Sheet1'}).`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to parse Excel file: ${err.message || 'Invalid format'}`);
    } finally {
      setIsParsingLocal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const busy = isProcessing || isParsingLocal;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Month Selection Bar for Files without Visit Dates */}
      <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">Target Report Month:</span>
          <span className="text-slate-400 hidden sm:inline">
            (Used if spreadsheet has no visit date column)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTargetMonth}
            onChange={(e) => setSelectedTargetMonth(e.target.value)}
            disabled={busy}
            className="bg-slate-900 border border-slate-700 text-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-slate-100">
                {m}
              </option>
            ))}
          </select>
          {selectedTargetMonth !== 'Auto-detect from File' && (
            <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium rounded-md">
              Assigns to: {selectedTargetMonth}
            </span>
          )}
        </div>
      </div>

      {/* File Drag & Drop Zone */}
      <div className="p-5">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !busy && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : busy
              ? 'border-slate-700 bg-slate-900/50 cursor-wait'
              : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/40 hover:bg-slate-950/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
            onChange={handleFileChange}
            disabled={busy}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                {busy ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  {busy ? 'Parsing & Importing Excel Report...' : 'Upload Monthly Feedback Excel (.xlsx)'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drag and drop your spreadsheet here or click to browse. Automatically extracts WB cases, detects feedback types, and assigns to{' '}
                  <span className="font-semibold text-amber-400">{selectedTargetMonth}</span>.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shrink-0 transition flex items-center gap-2"
            >
              {busy ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose .xlsx File</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback error messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-3.5 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-3.5 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold">{successMsg}</span>
                {detectedMonthNotice && (
                  <span className="text-[11px] text-emerald-400/90">{detectedMonthNotice}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

