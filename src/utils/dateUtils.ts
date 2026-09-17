/**
 * Comprehensive Date and Month Parsing Engine for Feedback Reports
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_ABBR = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

/**
 * Converts Excel serial date number to ISO YYYY-MM-DD string
 */
export function excelSerialToIsoDate(serial: number): string {
  // Excel base date: Dec 30 1899 (due to the 1900 leap-year bug)
  const utcDays = Math.floor(serial - 25569);
  const dateObj = new Date(utcDays * 86400 * 1000);
  if (isNaN(dateObj.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Checks if a string or value looks like a valid date or date representation
 */
export function isRecognizableDate(rawDate: any): boolean {
  if (rawDate === null || rawDate === undefined) return false;

  // Numeric serial
  if (typeof rawDate === 'number' && rawDate > 30000 && rawDate < 80000) return true;

  const str = String(rawDate).trim();
  if (!str) return false;

  // Numeric string (Excel serial)
  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    return num > 30000 && num < 80000;
  }

  // ISO format YYYY-MM-DD
  if (/^\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}/.test(str)) return true;

  // DD/MM/YYYY or MM/DD/YYYY
  if (/^\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(str)) return true;

  // Named month string (e.g. 14-Aug-2026, August 2026, 14th August)
  const lower = str.toLowerCase();
  for (const mName of MONTH_NAMES) {
    if (lower.includes(mName.toLowerCase())) return true;
  }
  for (const mAbbr of MONTH_ABBR) {
    if (new RegExp(`\\b${mAbbr}\\b`, 'i').test(lower)) return true;
  }

  // Standard JS Date check
  const parsed = Date.parse(str);
  return !isNaN(parsed);
}

/**
 * Parses any date value (serial number, string, Date, timestamp) into standard YYYY-MM-DD
 */
export function normalizeDateToIso(rawDate: any): string {
  if (rawDate === null || rawDate === undefined) {
    return new Date().toISOString().slice(0, 10);
  }

  // 1. JavaScript Date instance
  if (rawDate instanceof Date) {
    if (!isNaN(rawDate.getTime())) {
      const y = rawDate.getFullYear();
      const m = String(rawDate.getMonth() + 1).padStart(2, '0');
      const d = String(rawDate.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  // 2. Numeric Excel serial number (e.g. 46238 = Aug 2026, 45500 = 2024, etc.)
  if (typeof rawDate === 'number' && rawDate > 20000 && rawDate < 100000) {
    return excelSerialToIsoDate(rawDate);
  }

  const str = String(rawDate).trim();
  if (!str) return new Date().toISOString().slice(0, 10);

  // 3. String numeric Excel serial
  if (/^\d{5}(\.\d+)?$/.test(str)) {
    const num = parseFloat(str);
    if (num > 20000 && num < 100000) {
      return excelSerialToIsoDate(num);
    }
  }

  // 4. ISO formatted YYYY-MM-DD (e.g. "2026-08-04" or "2026-08-04T12:00:00Z")
  const isoMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 5. Day-Month-Year e.g. "04/08/2026", "4/8/2026", "04-08-2026", "04.08.2026"
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10);
    const p2 = parseInt(dmyMatch[2], 10);
    let yearStr = dmyMatch[3];
    if (yearStr.length === 2) {
      yearStr = `20${yearStr}`;
    }

    // Determine Day vs Month: standard UK/International format DD/MM/YYYY
    let day = p1;
    let month = p2;

    // If month > 12 and day <= 12, it's MM/DD/YYYY
    if (month > 12 && day <= 12) {
      const temp = day;
      day = month;
      month = temp;
    }

    if (month >= 1 && month <= 12) {
      return `${yearStr}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // 6. Named Month formats (e.g. "14-Aug-2026", "14 August 2026", "August 14, 2026", "14th Aug 2026")
  const lower = str.toLowerCase();
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    const full = MONTH_NAMES[i].toLowerCase();
    const abbr = MONTH_ABBR[i];

    if (lower.includes(full) || new RegExp(`\\b${abbr}\\b`, 'i').test(lower)) {
      const monthNum = String(i + 1).padStart(2, '0');
      // Extract year (e.g. 2026, 2025, 2024)
      const yearMatch = str.match(/\b(20\d\d)\b/);
      const year = yearMatch ? yearMatch[1] : '2026';

      // Extract day number (e.g. 14 or 14th)
      const dayMatch = str.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b/);
      let dayNum = '01';
      if (dayMatch) {
        const dVal = parseInt(dayMatch[1], 10);
        if (dVal >= 1 && dVal <= 31 && dVal !== parseInt(year, 10)) {
          dayNum = String(dVal).padStart(2, '0');
        }
      }
      return `${year}-${monthNum}-${dayNum}`;
    }
  }

  // 7. Native Date fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Extracts "Month YYYY" formatted string strictly from a date
 * e.g., "2026-07-15" -> "July 2026"
 * e.g., "2026-08-04" -> "August 2026"
 * e.g., "2026-09-22" -> "September 2026"
 */
export function getMonthYearFromDate(dateStr: string | null | undefined): string {
  if (!dateStr) {
    const now = new Date();
    return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  }

  const iso = normalizeDateToIso(dateStr);
  const parts = iso.split('-');
  if (parts.length >= 2) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      return `${MONTH_NAMES[m - 1]} ${y}`;
    }
  }

  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

/**
 * Gets sortable key "YYYY-MM" from "Month YYYY" or ISO date
 */
export function getSortableMonthKey(monthYearStr: string): string {
  if (!monthYearStr) return '0000-00';
  const lower = monthYearStr.toLowerCase();

  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (lower.includes(MONTH_NAMES[i].toLowerCase()) || lower.includes(MONTH_ABBR[i])) {
      const yearMatch = monthYearStr.match(/\b(20\d\d)\b/);
      const year = yearMatch ? yearMatch[1] : '2026';
      const m = String(i + 1).padStart(2, '0');
      return `${year}-${m}`;
    }
  }

  if (/^\d{4}-\d{2}/.test(monthYearStr)) {
    return monthYearStr.slice(0, 7);
  }

  return monthYearStr;
}

/**
 * Extracts month name and year from a filename, sheet name, or timestamp
 * e.g., "July 2026 Operations.xlsx" -> "July 2026"
 * e.g., "March Feedback.xlsx" -> "March 2026"
 * e.g., "Monthly Aramark Feedback-2026-09-03-17-47-31.xlsx" -> "August 2026" (Run on Sept 3 for Last Month)
 * e.g., "Monthly Aramark Feedback-2026-04-01-10-00-00.xlsx" -> "March 2026" (Run on April 1 for Last Month)
 */
export function inferMonthFromFileName(fileName: string): string | null {
  if (!fileName) return null;
  const lower = fileName.toLowerCase();

  // 1. Check for explicit named months in the filename (e.g. "March", "August")
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    const full = MONTH_NAMES[i].toLowerCase();
    const abbr = MONTH_ABBR[i];
    if (lower.includes(full) || new RegExp(`\\b${abbr}\\b`, 'i').test(lower)) {
      const yearMatch = fileName.match(/\b(20\d\d)\b/);
      const year = yearMatch ? yearMatch[1] : '2026';
      return `${MONTH_NAMES[i]} ${year}`;
    }
  }

  // 2. Check for timestamp format: YYYY-MM-DD-HH-MM-SS or YYYY-MM-DD (e.g., 2026-09-03-17-47-31 or 2026-04-01)
  const timestampMatch = fileName.match(/\b(20\d\d)[-_](\d{1,2})[-_](\d{1,2})/);
  if (timestampMatch) {
    const year = parseInt(timestampMatch[1], 10);
    const monthNum = parseInt(timestampMatch[2], 10); // 1-12
    const dayNum = parseInt(timestampMatch[3], 10);   // 1-31

    // If it's a "Monthly" report run early in the month (e.g. day 1 to 15),
    // it was generated for the previous month (e.g. 2026-09-03 was run for August 2026)
    if (dayNum <= 15 && monthNum >= 1 && monthNum <= 12) {
      let targetMonthIdx = monthNum - 2; // 0-indexed prior month (e.g. 9 -> 8 - 1 = 7 which is August)
      let targetYear = year;
      if (targetMonthIdx < 0) {
        targetMonthIdx = 11; // December
        targetYear -= 1;
      }
      return `${MONTH_NAMES[targetMonthIdx]} ${targetYear}`;
    } else if (monthNum >= 1 && monthNum <= 12) {
      // Run later in month, likely for current month
      return `${MONTH_NAMES[monthNum - 1]} ${year}`;
    }
  }

  return null;
}

/**
 * Scans top spreadsheet header rows (metadata section) for explicit date ranges
 * e.g., "Date Field: equals Last Month (01/08/2026 to 31/08/2026)" -> August 2026
 * e.g., "Date Field: equals Last Month (01/03/2026 to 31/03/2026)" -> March 2026
 * e.g., "As of 2026-09-03 17:47:31" + "equals Last Month" -> August 2026
 */
export function extractReportMetadataFromRows(rawRows: string[][]): {
  detectedMonth: string;
  startDateIso: string;
  rawRangeText: string;
} | null {
  if (!rawRows || rawRows.length === 0) return null;

  const maxScan = Math.min(30, rawRows.length);
  let allText = '';
  for (let r = 0; r < maxScan; r++) {
    const row = rawRows[r] || [];
    allText += ' ' + row.join(' ');
  }

  // 1. Look for explicit Date range like (01/08/2026 to 31/08/2026) or (01-08-2026 to 31-08-2026)
  const dmyRangeMatch = allText.match(
    /\((\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\s+to\s+(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\)/i
  );
  if (dmyRangeMatch) {
    const startDay = parseInt(dmyRangeMatch[1], 10);
    const startMonth = parseInt(dmyRangeMatch[2], 10);
    let startYearStr = dmyRangeMatch[3];
    if (startYearStr.length === 2) startYearStr = `20${startYearStr}`;
    const startYear = parseInt(startYearStr, 10);

    if (startMonth >= 1 && startMonth <= 12) {
      const monthName = MONTH_NAMES[startMonth - 1];
      const monthYear = `${monthName} ${startYear}`;
      const isoDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(
        Math.min(28, startDay)
      ).padStart(2, '0')}`;
      return {
        detectedMonth: monthYear,
        startDateIso: isoDate,
        rawRangeText: dmyRangeMatch[0],
      };
    }
  }

  // 2. Look for ISO range like (2026-08-01 to 2026-08-31)
  const isoRangeMatch = allText.match(
    /\((\d{4})[/.-](\d{1,2})[/.-](\d{1,2})\s+to\s+(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})\)/i
  );
  if (isoRangeMatch) {
    const startYear = parseInt(isoRangeMatch[1], 10);
    const startMonth = parseInt(isoRangeMatch[2], 10);
    const startDay = parseInt(isoRangeMatch[3], 10);

    if (startMonth >= 1 && startMonth <= 12) {
      const monthName = MONTH_NAMES[startMonth - 1];
      const monthYear = `${monthName} ${startYear}`;
      const isoDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(
        Math.min(28, startDay)
      ).padStart(2, '0')}`;
      return {
        detectedMonth: monthYear,
        startDateIso: isoDate,
        rawRangeText: isoRangeMatch[0],
      };
    }
  }

  // 3. Look for "As of YYYY-MM-DD" + "Last Month"
  const asOfMatch = allText.match(/As of (\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/i);
  if (asOfMatch && /last month/i.test(allText)) {
    const year = parseInt(asOfMatch[1], 10);
    const monthNum = parseInt(asOfMatch[2], 10);
    let targetMonthIdx = monthNum - 2;
    let targetYear = year;
    if (targetMonthIdx < 0) {
      targetMonthIdx = 11;
      targetYear -= 1;
    }
    const monthName = MONTH_NAMES[targetMonthIdx];
    const monthYear = `${monthName} ${targetYear}`;
    const isoDate = `${targetYear}-${String(targetMonthIdx + 1).padStart(2, '0')}-01`;
    return {
      detectedMonth: monthYear,
      startDateIso: isoDate,
      rawRangeText: `As of ${asOfMatch[0]} (Last Month: ${monthYear})`,
    };
  }

  return null;
}

/**
 * Gets prior month string from "Month YYYY"
 * e.g. "August 2026" -> "July 2026", "January 2026" -> "December 2025"
 */
export function getPriorMonth(monthYearStr: string): string | null {
  if (!monthYearStr) return null;
  const lower = monthYearStr.toLowerCase();

  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (lower.includes(MONTH_NAMES[i].toLowerCase()) || lower.includes(MONTH_ABBR[i])) {
      const yearMatch = monthYearStr.match(/\b(20\d\d)\b/);
      let year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
      let prevIdx = i - 1;
      if (prevIdx < 0) {
        prevIdx = 11;
        year -= 1;
      }
      return `${MONTH_NAMES[prevIdx]} ${year}`;
    }
  }
  return null;
}

/**
 * Gets prior year string for same month
 * e.g. "August 2026" -> "August 2025"
 */
export function getPriorYearSameMonth(monthYearStr: string): string | null {
  if (!monthYearStr) return null;
  const yearMatch = monthYearStr.match(/\b(20\d\d)\b/);
  if (yearMatch) {
    const curYear = parseInt(yearMatch[1], 10);
    const prevYear = curYear - 1;
    return monthYearStr.replace(String(curYear), String(prevYear));
  }
  return null;
}
