import React, { useState } from 'react';
import { X, Settings, Check, HelpCircle } from 'lucide-react';
import { ExcelMappingConfig } from '../types';

interface LayoutConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ExcelMappingConfig;
  onSave: (newConfig: ExcelMappingConfig) => void;
}

export const LayoutConfigModal: React.FC<LayoutConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formConfig, setFormConfig] = useState<ExcelMappingConfig>({ ...config });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Configure Excel Layout Mapping</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900 leading-relaxed">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
              Intelligent Format Detection
            </p>
            The parser automatically detects header columns (Status, Type, Case #, Department, Area, Description) and grouped hierarchy layouts. The settings below act as the baseline fallback if no headers are found.
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Data Start Row Number
            </label>
            <input
              type="number"
              min={1}
              value={formConfig.startRow}
              onChange={(e) =>
                setFormConfig({ ...formConfig, startRow: parseInt(e.target.value, 10) || 1 })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Area Col</label>
              <input
                type="text"
                value={formConfig.areaCol}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, areaCol: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-center uppercase"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Type Col</label>
              <input
                type="text"
                value={formConfig.typeCol}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, typeCol: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-center uppercase"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Feedback Col</label>
              <input
                type="text"
                value={formConfig.feedbackCol}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, feedbackCol: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-center uppercase"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="stopOnBlank"
              checked={formConfig.stopOnBlankArea}
              onChange={(e) => setFormConfig({ ...formConfig, stopOnBlankArea: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="stopOnBlank" className="text-slate-700 font-medium cursor-pointer">
              Stop reading rows when Area column is blank
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply Config</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
