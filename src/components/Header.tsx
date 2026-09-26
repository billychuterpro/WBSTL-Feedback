import React from 'react';
import { FileSpreadsheet, Database, Cloud } from 'lucide-react';

interface HeaderProps {
  firestoreConnected?: boolean;
  itemCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ firestoreConnected = true, itemCount = 0 }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">Monthly Feedback Tracker & Action Register</h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Operations & Catering
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Single-Step SheetJS Excel Import &bull; WB Case Processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
          </div>
        </div>
      </div>
    </header>
  );
};

