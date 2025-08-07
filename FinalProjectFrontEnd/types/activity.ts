// types/activity.ts

// ─── PAGINATION INFO ───────────────────────────────────────────────────────
export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ─── ACTIVITY ENTRY MODEL ─────────────────────────────────────────────────
export interface ActivityEntry {
  _id: string;
  ownerId: string;
  date: string; // DD/MM/YYYY format for UI compatibility
  time: string; // HH:mm format
  activityType: string; // feeding, medication, exercise, grooming, etc.
  description: string; // Main description field for display in the UI
  createdAt: string;
  updatedAt: string;
}

// ─── ACTIVITY LIST RESPONSE ───────────────────────────────────────────────
export interface ActivityListResponse {
  success: boolean;
  activities: ActivityEntry[];
  pagination: PaginationInfo;
}

// ─── SINGLE ACTIVITY RESPONSE ─────────────────────────────────────────────
export interface ActivityResponse {
  success: boolean;
  activity: ActivityEntry;
}

// ─── CREATE ACTIVITY REQUEST ──────────────────────────────────────────────
export interface CreateActivityRequest {
  date: string; // DD/MM/YYYY format (e.g., "15/01/2024")
  time: string; // HH:mm format (e.g., "08:30")
  activityType: string; // Type of activity (e.g., "feeding", "medication", "exercise")
  description: string; // Description of the activity
}

// ─── UPDATE ACTIVITY REQUEST ──────────────────────────────────────────────
export interface UpdateActivityRequest {
  date?: string;
  time?: string;
  activityType?: string;
  description?: string;
}

// ─── ACTIVITY SEARCH/FILTER PARAMS ────────────────────────────────────────
export interface ActivitySearchParams {
  limit?: number;
  offset?: number;
  activityType?: string; // Filter by activity type
  dateFrom?: string; // Start date filter (DD/MM/YYYY)
  dateTo?: string; // End date filter (DD/MM/YYYY)
}

// ─── DELETE ACTIVITY RESPONSE ─────────────────────────────────────────────
export interface DeleteActivityResponse {
  success: boolean;
  message: string;
}
