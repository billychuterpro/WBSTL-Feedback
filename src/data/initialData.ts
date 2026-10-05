import { ExcelMappingConfig, FeedbackItem } from '../types';

export const DEFAULT_EXCEL_CONFIG: ExcelMappingConfig = {
  startRow: 14,
  areaCol: 'Area',
  typeCol: 'Type',
  feedbackCol: 'Description',
  sheetIndex: 0,
  stopOnBlankArea: false,
};

// Replace embedded base64 XLSX parsing with empty arrays to stop startup zip errors
export const DEMO_AUGUST_2026_ITEMS: FeedbackItem[] = [];
export const DEMO_ALL_MONTHS_ITEMS: FeedbackItem[] = [];
