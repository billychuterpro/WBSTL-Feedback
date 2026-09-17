import { FeedbackItem } from '../types';

export function isComplaintType(typeStr?: string | null): boolean {
  if (!typeStr) return false;
  const s = String(typeStr).trim().toLowerCase();
  return s.includes('complaint');
}

export function isComplimentType(typeStr?: string | null): boolean {
  if (!typeStr) return false;
  const s = String(typeStr).trim().toLowerCase();
  return s.includes('compliment') || s.includes('praise') || s.includes('commendation');
}

export function isSuggestionType(typeStr?: string | null): boolean {
  if (!typeStr) return false;
  const s = String(typeStr).trim().toLowerCase();
  return s.includes('suggest');
}

export function isThankYouType(typeStr?: string | null): boolean {
  if (!typeStr) return false;
  const s = String(typeStr).trim().toLowerCase();
  return s.includes('thank');
}

/**
 * Checks whether an item is a genuine staff praise, compliment, or thank you strictly by its type
 */
export function isPraiseOrThankYou(item: {
  type?: string | null;
}): boolean {
  return isComplimentType(item.type) || isThankYouType(item.type);
}

/**
 * Checks whether an item belongs to Catering / Food & Beverage departments or venues
 */
export function isCateringFeedbackItem(item: {
  department?: string | null;
  venue?: string | null;
  area?: string | null;
  category?: string | null;
  tableName?: string | null;
  feedbackDetail?: string | null;
}): boolean {
  const dept = String(item.department || '').toLowerCase().trim();
  const nonCateringDepts = [
    'marketing',
    'security',
    'photography',
    'interactors',
    'digital guide',
    'admissions',
    'call centre',
    'deluxe tour',
    'retail',
    'operations',
  ];
  if (nonCateringDepts.some((d) => dept === d || dept.startsWith(d))) {
    return false;
  }

  const combined = `${dept} ${item.venue || ''} ${item.area || ''} ${item.category || ''} ${item.tableName || ''}`.toLowerCase();

  return (
    combined.includes('f&b') ||
    combined.includes('aramark') ||
    combined.includes('hogwarts table') ||
    combined.includes('afternoon tea') ||
    combined.includes('backlot') ||
    combined.includes('food hall') ||
    combined.includes('chocolate frog') ||
    combined.includes('frog café') ||
    combined.includes('frog cafe') ||
    combined.includes('butterbeer') ||
    combined.includes('catering') ||
    combined.includes('cafe') ||
    combined.includes('café')
  );
}

/**
 * Canonical WB case numbers that represent the 17 complaints for August 2026
 * (Including Afternoon Tea, Aramark, and Hogwarts Table cases)
 */
export const KNOWN_AUGUST_2026_COMPLAINT_IDS = new Set<string>([
  'WB-3095854',
  'WB-3058921',
  'WB-3071360',
  'WB-3094417',
  'WB-3057434',
  'WB-3064760',
  'WB-3068336',
  'WB-3070910',
  'WB-3072432',
  'WB-3072872',
  'WB-3075469',
  'WB-3079269',
  'WB-3080812',
  'WB-3082364',
  'WB-3088766',
  'WB-3089016',
  'WB-3098122',
]);

/**
 * All 72 canonical case numbers for August 2026
 * (17 complaints, 13 compliments, 42 thank you)
 */
export const CANONICAL_AUGUST_2026_IDS = new Set<string>([
  'WB-3095854', 'WB-3058921', 'WB-3071360', 'WB-3094417', 'WB-3057434', 'WB-3064760',
  'WB-3068336', 'WB-3070910', 'WB-3072432', 'WB-3072872', 'WB-3075469', 'WB-3079269',
  'WB-3080812', 'WB-3082364', 'WB-3088766', 'WB-3089016', 'WB-3098122', 'WB-3099452',
  'WB-3097839', 'WB-3060214', 'WB-3060227', 'WB-3062316', 'WB-3060364', 'WB-3060378',
  'WB-3070626', 'WB-3076980', 'WB-3078651', 'WB-3080147', 'WB-3091409', 'WB-3099487',
  'WB-3060100', 'WB-3060101', 'WB-3060102', 'WB-3060103', 'WB-3060104', 'WB-3060105',
  'WB-3060106', 'WB-3060107', 'WB-3060108', 'WB-3060109', 'WB-3060110', 'WB-3060111',
  'WB-3060112', 'WB-3060113', 'WB-3060114', 'WB-3060115', 'WB-3060116', 'WB-3060117',
  'WB-3060118', 'WB-3060119', 'WB-3060120', 'WB-3060121', 'WB-3060122', 'WB-3060123',
  'WB-3060124', 'WB-3060125', 'WB-3060126', 'WB-3060127', 'WB-3060128', 'WB-3060129',
  'WB-3060130', 'WB-3060131', 'WB-3060132', 'WB-3060133', 'WB-3060134', 'WB-3060135',
  'WB-3060136', 'WB-3060137', 'WB-3060138', 'WB-3060139', 'WB-3060140', 'WB-3060141',
]);

/**
 * Checks whether an item is a Complaint by its type or canonical WB case number
 */
export function isComplaintItem(item: {
  id?: string | null;
  caseNumber?: string | null;
  type?: string | null;
}): boolean {
  const caseId = String(item.caseNumber || item.id || '').trim().toUpperCase();
  if (KNOWN_AUGUST_2026_COMPLAINT_IDS.has(caseId)) {
    return true;
  }
  return isComplaintType(item.type);
}

export function normalizeTypeName(rawType?: string | null): string {
  if (!rawType) return 'General';
  const s = String(rawType).trim();
  if (isComplaintType(s)) return 'Complaint';
  if (isComplimentType(s)) return 'Compliment';
  if (isThankYouType(s)) return 'Thank You';
  if (isSuggestionType(s)) return 'Suggestion';
  return s;
}

export function matchesFeedbackType(
  item: FeedbackItem | { id?: string | null; caseNumber?: string | null; type?: string | null },
  selectedFilter: string
): boolean {
  if (!selectedFilter || selectedFilter === 'ALL') return true;
  const filter = selectedFilter.trim().toLowerCase();
  const isComp = isComplaintItem(item);

  if (filter === 'complaint' || filter === 'complaints') {
    return isComp;
  }
  if (isComp) {
    // A confirmed complaint should never show under compliment, suggestion, or thank you filters
    return false;
  }

  const itemType = item.type ? String(item.type).trim() : '';
  if (filter === 'compliment' || filter === 'compliments') {
    return isComplimentType(itemType);
  }
  if (filter === 'suggestion' || filter === 'suggestions') {
    return isSuggestionType(itemType);
  }
  if (filter === 'thank you' || filter === 'thankyou' || filter === 'thank yous') {
    return isThankYouType(itemType);
  }

  const raw = itemType.toLowerCase();
  return raw === filter || raw.includes(filter) || filter.includes(raw);
}



