import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, Calendar } from 'lucide-react';
import { ExcelMappingConfig, ParsedPreviewItem } from '../types';
import * as XLSX from 'xlsx';

interface ExcelUploaderProps {
  config?: ExcelMappingConfig;
  onConfirmAppend: (items: ParsedPreviewItem[]) => void;
  isProcessing?: boolean;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onConfirmAppend, isProcessing = false }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isParsingLocal, setIsParsingLocal] = useState(false);
  const [selectedTargetMonth, setSelectedTargetMonth] = useState<string>('September 2026');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const monthOptions = [
    'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
    'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026'
  ];

  const processExcelFile = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsParsingLocal(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        const parsedItems: ParsedPreviewItem[] = [];
        
        let activeStatus = 'Closed';
        let activeType = 'Complaint';

        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || !Array.isArray(row) || row.length === 0) continue;

          const col1 = String(row[1] || '').trim();
          const col2 = String(row[2] || '').trim();
          const col3 = String(row[3] || '').trim();
          const summaryCheck = `${col1} ${col2} ${col3}`.toLowerCase();

          if (summaryCheck.includes('subtotal') || summaryCheck.startsWith('total')) continue;

          if (col1 && !col1.toLowerCase().includes('status')) activeStatus = col1;
          if (col2 && !col2.toLowerCase().includes('type')) activeType = col2;

          const caseNum = String(row[4] || '').trim();
          const category = String(row[5] || 'Tour F&B').trim();
          const subCategory = String(row[6] || '').trim();
          const department = String(row[7] || 'F&B - Aramark').trim();
          const area = String(row[8] || 'General Area').trim();
          const description = String(row[9] || '').trim();

          if (caseNum.toUpperCase().startsWith('WB-')) {
            const isComplaint = activeType.toLowerCase().includes('complaint');
            const initialCaseStatus = isComplaint ? 'Pending Review' : (activeStatus || 'Closed');

            parsedItems.push({
              rowNum: i,
              caseNumber: caseNum,
              caseStatus: initialCaseStatus,
              type: activeType,
              category: category,
              subCategory: subCategory,
              department: department,
              area: area || department,
              venue: area || department,
              visitDate: '2026-09-01',
              monthYear: selectedTargetMonth,
              feedbackDetail: description || '(No description text provided)',
              isValid: true,
            });
          }
        }

        if (parsedItems.length === 0) throw new Error('No valid WB- case numbers found.');

        onConfirmAppend(parsedItems);
        setSuccessMsg(`Imported ${parsedItems.length} cases into "${selectedTargetMonth}".`);
      } catch (err: any) {
        setErrorMsg(`Excel parse failed: ${err.message}`);
      } finally {
        setIsParsingLocal(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const busy = isProcessing || isParsingLocal;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-200">
          <Calendar className="w-5 h-5 text-amber-400"/>
          <span className="font-bold text-sm">Target Report Month:</span>
        </div>
        <select
          value={selectedTargetMonth}
          onChange={(e) => setSelectedTargetMonth(e.target.value)}
          disabled={busy}
          className="bg-slate-800 border border-slate-700 text-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div
        onClick={() => !busy && fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl text-center cursor-pointer bg-slate-950/40 hover:bg-slate-800/40 transition flex flex-col items-center justify-center gap-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => e.target.files?.[0] && processExcelFile(e.target.files[0])}
          className="hidden"
          disabled={busy}
        />
        {busy ? <RefreshCw className="w-8 h-8 animate-spin text-amber-400"/> : <Upload className="w-8 h-8 text-amber-400"/>}
        <p className="text-white font-bold text-sm">
          {busy ? 'Processing Spreadsheet...' : 'Select Excel Document (.xlsx)'}
        </p>
      </div>

      {errorMsg && <p className="text-red-400 mt-3 text-xs font-semibold">{errorMsg}</p>}
      {successMsg && <p className="text-emerald-400 mt-3 text-xs font-semibold">{successMsg}</p>}
    </div>
  );
};
