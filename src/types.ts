export type FeedbackStatus = 'Pending' | 'InProgress' | 'Resolved';
export type FeedbackType = 'Complaint' | 'Compliment' | 'Suggestion' | 'Thank You' | 'Thank you';

export interface ActionLog {
  id: string;
  timestamp: string;
  author: string;
  note: string;
}

export interface FeedbackItem {
  id: string;               // e.g. "WB-3099452" or auto-generated ID
  caseNumber?: string;       // e.g. "WB-3099452"
  caseStatus?: string;       // e.g. "Open", "Awaiting Response from Customer", "Awaiting Departmental feedback", "Closed"
  date: string;              // Visit Date e.g. "2026-08-04"
  monthYear?: string;        // e.g. "August 2026"
  type: FeedbackType | string; // "Complaint" | "Compliment" | "Suggestion" | "Thank You"
  tableName?: string;        // e.g. "Tour Experience"
  category?: string;         // e.g. "Staff", "Visitor Experience", "Allegation of Food Poisoning", "Food Quality", "Order Issue", "Cost", "Dietary Requirements"
  subCategory?: string;      // e.g. "Staff", "Visitor Experience"
  department?: string;       // e.g. "F&B - Aramark", "Hogwarts Table", "Deluxe Tour", "Admissions", "Interactors", "Call Centre", "Afternoon Tea", "Marketing", "Security", "Photography", "Retail", "Customer Service"
  area: string;              // e.g. "F&B- Chocolate Frog Café", "Afternoon Tea", "F&B- Butterbeer Bar", "F&B- Backlot Café", "F&B- Food Hall", "Studio Tour LND"
  venue?: string;            // e.g. "Hogwarts Table", "Backlot Cafe", "Food Hall", "Afternoon Tea", "Butterbeer Bar"
  feedbackDetail: string;    // Description / comment text

  // Dedicated Action Section on Each Comment
  actionTaken: string;       // Detailed action taken description
  actionOwner?: string;      // Assignee / Department owner e.g. "Aramark Quality Manager"
  actionDueDate?: string;    // Target resolution date
  status: FeedbackStatus;    // 'Pending' | 'InProgress' | 'Resolved'
  actionLogs?: ActionLog[];

  isEditing?: boolean;
  isSaving?: boolean;
}

export interface ExcelMappingConfig {
  startRow: number;         // Default 1 or auto-detect header row
  areaCol: string;          // Default 'H' or auto-map
  typeCol: string;          // Default 'B' or auto-map
  feedbackCol: string;      // Default 'I' or auto-map
  sheetIndex: number;
  stopOnBlankArea: boolean;
}

export interface ParsedPreviewItem {
  rowNum: number;
  caseNumber?: string;
  caseStatus?: string;
  type: string;
  category?: string;
  subCategory?: string;
  department?: string;
  area: string;
  venue?: string;
  tableName?: string;
  feedbackDetail: string;
  visitDate?: string;
  monthYear?: string;
  isValid: boolean;
  notes?: string;
}

export type StorageMode = 'simulation' | 'gas_endpoint';

export interface VenueSatisfactionScore {
  venue: string;
  score: number;
  vsLY?: string;
}

export interface ExecutiveMonthlyReport {
  id: string; // e.g. "July 2026"
  monthYear: string; // e.g. "July 2026"
  feedbackVolume: number;
  feedbackVolumeVsLY?: string;
  staffComplaints: number;
  staffComplaintsVsLY?: string;
  staffCompliments: number;
  staffComplimentsVsLY?: string;
  staffThankYous: number;
  staffThankYousVsLY?: string;
  mysteryShopVisit1?: number;
  mysteryShopVisit1VsLY?: string;
  mysteryShopVisit2?: number;
  mysteryShopVisit2VsLY?: string;
  mysteryShopMonthlyAvg?: number;
  mysteryShopMonthlyAvgVsLY?: string;
  venueSatisfaction: VenueSatisfactionScore[];
  staffRating?: number;
  staffRatingVsLY?: string;
  cateringVFM?: number;
  cateringVFMVsLY?: string;
  keyComments: string[];
  actions: string[];
  yoyTrend?: {
    month: string;
    score2025?: number;
    score2026?: number;
  }[];
  updatedAt?: string;
}

