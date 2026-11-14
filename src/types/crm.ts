export type UserRole = 'TELECALLER' | 'ADMIN';

export type PipelineStage =
  | 'New'
  | 'Ringing / Callback'
  | 'Follow-Up'
  | 'Hot / Interested'
  | 'Site Visit Scheduled'
  | 'Site Visit Done'
  | 'Negotiation'
  | 'Booked'
  | 'Lost / Invalid';

export const PIPELINE_STAGES: PipelineStage[] = [
  'New',
  'Ringing / Callback',
  'Follow-Up',
  'Hot / Interested',
  'Site Visit Scheduled',
  'Site Visit Done',
  'Negotiation',
  'Booked',
  'Lost / Invalid',
];

export const MANDATORY_FOLLOWUP_STAGES: PipelineStage[] = [
  'Follow-Up',
  'Ringing / Callback',
  'Hot / Interested',
  'Site Visit Scheduled',
];

export const CAMPAIGN_FILTERS = [
  'All',
  'Magarpatta Residents',
  'Burgundy',
  'Godrej',
  'Kharadi Kohinoor',
  'Prospects',
] as const;

export type CampaignFilter = (typeof CAMPAIGN_FILTERS)[number];

export interface CrmUser {
  User_ID: string;
  Name: string;
  Phone: string;
  Username: string;
  Pin: string;
  Role: UserRole;
  Active: boolean;
}

export interface Lead {
  Lead_ID: string;
  Name: string;
  Phone: string; // Normalized 10 digits
  Project_Interest: string;
  Campaign_Source: string;
  Config_Requirement: string;
  Preferred_Location: string;
  Budget: string;
  Assigned_To: string; // User_ID of Telecaller
  Status: PipelineStage;
  Next_Follow_Up_At: string; // ISO string or empty
  Notes: string; // Timestamped remark timeline: [DD/MM hh:mm a - TelecallerName]: note
  Last_Called_At: string; // ISO string or empty
  WhatsApp_Shared_Count: number;
  Created_By: string; // "Admin" or TelecallerName
  Updated_At: string;
  Synced_To_Sheet: boolean;
}

export type AndroidCallType = 'OUTGOING' | 'INCOMING' | 'MISSED' | 'REJECTED';

export interface CallLogRecord {
  operationId: string;
  Call_ID: string;
  Lead_ID: string;
  Lead_Name: string;
  Telecaller_ID: string;
  Normalized_Phone: string; // 10 digits
  Call_Type: AndroidCallType;
  Duration_Sec: number;
  Is_Connected: boolean; // Duration >= 15s AND not MISSED/REJECTED
  Timestamp: string; // ISO string
  Sync_Hash: string;
  Synced_To_Sheet: boolean;
}

export interface FollowUpRecord {
  FollowUp_ID: string;
  Lead_ID: string;
  Telecaller_ID: string;
  Scheduled_At: string;
  Status: 'PENDING' | 'COMPLETED';
  Outcome_Stage: PipelineStage;
  Notes: string;
  Reminder_Scheduled_15m: boolean;
  Synced_To_Sheet: boolean;
}

export interface WhatsAppLogRecord {
  operationId: string;
  WA_Log_ID: string;
  Lead_ID: string;
  Lead_Name: string;
  Telecaller_ID: string;
  Project_Template: string;
  Wa_Me_Url: string;
  Timestamp: string;
  Synced_To_Sheet: boolean;
}

export interface ProjectTemplate {
  Template_ID: string;
  Project_Name: string;
  Title: string;
  Message_Body: string;
  Brochure_Url: string;
}

export interface DailyReportRow {
  Date: string; // YYYY-MM-DD
  Telecaller_ID: string;
  Telecaller_Name: string;
  Total_Calls_Attempted: number;
  Connected_Calls: number;
  Not_Connected_Calls: number;
  WhatsApp_Details_Shared: number;
  Total_Calling_Seconds: number;
  Total_Calling_Hours: string; // HH:MM:SS
  Follow_Ups_Completed: number;
  Follow_Ups_Pending: number;
}

export type PendingSyncAction =
  | 'UPSERT_LEAD'
  | 'UPSERT_CALL_LOG'
  | 'UPSERT_WHATSAPP_LOG'
  | 'UPSERT_DAILY_REPORT';

export interface PendingSyncItem {
  operationId: string;
  action: PendingSyncAction;
  summary: string;
  createdAt: string;
  retryCount: number;
}

export interface RoomSyncEvent {
  id: string;
  operationId: string;
  timestamp: string;
  entity: 'Call_Logs' | 'Leads' | 'Follow_Ups' | 'WhatsApp_Logs' | 'Daily_Reports';
  action: string;
  status: 'QUEUED_OFFLINE' | 'SYNCED' | 'IGNORED_NON_CRM';
  detail: string;
}
