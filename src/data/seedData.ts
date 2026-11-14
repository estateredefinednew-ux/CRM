import {
  CallLogRecord,
  CrmUser,
  FollowUpRecord,
  Lead,
  ProjectTemplate,
  WhatsAppLogRecord,
} from '../types/crm';

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isoTodayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function isoOffsetDays(days: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function formatDurationHMS(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

export function normalizePhone10(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Formats timestamped note line: [DD/MM hh:mm a - TelecallerName]: note
 */
export function formatTimestampedRemark(telecallerName: string, note: string, date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  const hh = String(hours).padStart(2, '0');
  return `[${dd}/${mm} ${hh}:${minutes} ${ampm} - ${telecallerName}]: ${note.trim()}`;
}

export function appendRemarkTimeline(existingNotes: string, telecallerName: string, newNote: string): string {
  const trimmed = newNote.trim();
  if (!trimmed) return existingNotes;
  const line = formatTimestampedRemark(telecallerName, trimmed);
  return existingNotes.trim() ? `${line}\n${existingNotes.trim()}` : line;
}

export const SEED_USERS: CrmUser[] = [
  {
    User_ID: 'USR_101',
    Name: 'Priya Sharma',
    Phone: '9876543210',
    Username: 'priya.sharma',
    Pin: '1234',
    Role: 'TELECALLER',
    Active: true,
  },
  {
    User_ID: 'USR_102',
    Name: 'Rohan Verma',
    Phone: '9876543211',
    Username: 'rohan.verma',
    Pin: '5678',
    Role: 'TELECALLER',
    Active: true,
  },
  {
    User_ID: 'USR_001',
    Name: 'Vikram Mehta',
    Phone: '9999999999',
    Username: 'vikram.admin',
    Pin: '0000',
    Role: 'ADMIN',
    Active: true,
  },
];

export const SEED_TEMPLATES: ProjectTemplate[] = [
  {
    Template_ID: 'TPL_01',
    Project_Name: 'Magarpatta Residents',
    Title: 'Magarpatta Township — 3 & 4 BHK Residences',
    Message_Body:
      'Hello {{Name}}, thank you for speaking with us regarding *Magarpatta Residences (3 & 4 BHK)*. Floor plans, RERA details & payment schedule are below:\n\nPossession: Dec 2027\nStarting ₹1.85 Cr\nBrochure: https://prop.example.com/magarpatta-brochure.pdf\n\nReply to book a guided site visit this weekend.',
    Brochure_Url: 'https://prop.example.com/magarpatta-brochure.pdf',
  },
  {
    Template_ID: 'TPL_02',
    Project_Name: 'Burgundy',
    Title: 'Burgundy Luxury Towers — Mundhwa / KP Annexe',
    Message_Body:
      'Hi {{Name}}, sharing the *Burgundy Luxury Residences* e-brochure as discussed:\n\n3.5 & 4.5 BHK Deck Homes\nPrivate Lift Lobby & Clubhouse\nStarting ₹2.40 Cr\nBrochure: https://prop.example.com/burgundy-deck.pdf',
    Brochure_Url: 'https://prop.example.com/burgundy-deck.pdf',
  },
  {
    Template_ID: 'TPL_03',
    Project_Name: 'Godrej',
    Title: 'Godrej Emerald Waters — Kharadi-Manjri',
    Message_Body:
      'Greetings {{Name}}, here are the project details for *Godrej Properties Pune*:\n\n2 & 3 BHK Riverfront Homes\nStarting ₹1.12 Cr\nBrochure & Cost Sheet: https://prop.example.com/godrej-pune.pdf',
    Brochure_Url: 'https://prop.example.com/godrej-pune.pdf',
  },
  {
    Template_ID: 'TPL_04',
    Project_Name: 'Kharadi Kohinoor',
    Title: 'Kohinoor Kaleido / Viva — Upper Kharadi',
    Message_Body:
      'Hello {{Name}}, sharing floor plans for *Kharadi Kohinoor*:\n\n2 & 3 BHK Smart Layouts near EON IT Park\nStarting ₹96 Lakhs\nBrochure: https://prop.example.com/kharadi-kohinoor.pdf',
    Brochure_Url: 'https://prop.example.com/kharadi-kohinoor.pdf',
  },
];

export const SEED_LEADS: Lead[] = [
  {
    Lead_ID: 'LD_4001',
    Name: 'Ananya Deshmukh',
    Phone: '9820112233',
    Project_Interest: 'Magarpatta Residents',
    Campaign_Source: 'Magarpatta Residents',
    Config_Requirement: '3 BHK + Study',
    Preferred_Location: 'Hadapsar / Magarpatta',
    Budget: '₹1.90 Cr',
    Assigned_To: 'USR_101',
    Status: 'Hot / Interested',
    Next_Follow_Up_At: isoTodayAt(16, 30),
    Notes:
      '[14/11 10:18 am - Priya Sharma]: Confirmed East-facing preference above 12th floor. Spouse visiting Saturday.\n[12/11 04:10 pm - Priya Sharma]: Initial discovery call completed. Shared 3BHK layout.',
    Last_Called_At: isoTodayAt(10, 15),
    WhatsApp_Shared_Count: 1,
    Created_By: 'Admin',
    Updated_At: isoTodayAt(10, 22),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4002',
    Name: 'Karanveer Singh',
    Phone: '9811445566',
    Project_Interest: 'Burgundy',
    Campaign_Source: 'Burgundy',
    Config_Requirement: '4 BHK Deck',
    Preferred_Location: 'Mundhwa / KP Annexe',
    Budget: '₹2.65 Cr',
    Assigned_To: 'USR_101',
    Status: 'Site Visit Scheduled',
    Next_Follow_Up_At: isoTodayAt(17, 45),
    Notes:
      '[14/11 11:24 am - Priya Sharma]: Confirmed pickup cab for Sunday 11:00 AM near Koregaon Park.',
    Last_Called_At: isoTodayAt(11, 20),
    WhatsApp_Shared_Count: 2,
    Created_By: 'Admin',
    Updated_At: isoTodayAt(11, 25),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4003',
    Name: 'Meera Krishnan',
    Phone: '9900778899',
    Project_Interest: 'Godrej',
    Campaign_Source: 'Godrej',
    Config_Requirement: '3 BHK Riverview',
    Preferred_Location: 'Kharadi-Manjri',
    Budget: '₹1.35 Cr',
    Assigned_To: 'USR_101',
    Status: 'Follow-Up',
    Next_Follow_Up_At: isoOffsetDays(-1, 14, 0),
    Notes:
      '[12/11 04:15 pm - Priya Sharma]: Requested revised 20:80 payment plan sheet before committing.',
    Last_Called_At: isoOffsetDays(-2, 16, 10),
    WhatsApp_Shared_Count: 1,
    Created_By: 'Admin',
    Updated_At: isoOffsetDays(-2, 16, 15),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4004',
    Name: 'Siddharth Malhotra',
    Phone: '9845001122',
    Project_Interest: 'Kharadi Kohinoor',
    Campaign_Source: 'Kharadi Kohinoor',
    Config_Requirement: '2 BHK Smart',
    Preferred_Location: 'Upper Kharadi',
    Budget: '₹92 Lakhs',
    Assigned_To: 'USR_101',
    Status: 'Ringing / Callback',
    Next_Follow_Up_At: isoOffsetDays(-1, 11, 30),
    Notes: '[14/11 09:46 am - Priya Sharma]: Phone rang twice, no answer. Try post lunch.',
    Last_Called_At: isoTodayAt(9, 45),
    WhatsApp_Shared_Count: 0,
    Created_By: 'Admin',
    Updated_At: isoTodayAt(9, 46),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4005',
    Name: 'Devika Nair',
    Phone: '9765432109',
    Project_Interest: 'Prospects',
    Campaign_Source: 'Prospects',
    Config_Requirement: '3 BHK',
    Preferred_Location: 'Magarpatta / Amanora',
    Budget: '₹1.55 Cr',
    Assigned_To: 'USR_101',
    Status: 'New',
    Next_Follow_Up_At: isoTodayAt(18, 15),
    Notes: '[14/11 09:05 am - Priya Sharma]: Walk-in referral from existing Magarpatta resident.',
    Last_Called_At: '',
    WhatsApp_Shared_Count: 0,
    Created_By: 'Priya Sharma',
    Updated_At: isoTodayAt(9, 0),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4006',
    Name: 'Rajeshwar Kulkarni',
    Phone: '9822334455',
    Project_Interest: 'Magarpatta Residents',
    Campaign_Source: 'Magarpatta Residents',
    Config_Requirement: '4 BHK Corner',
    Preferred_Location: 'Magarpatta City',
    Budget: '₹2.30 Cr',
    Assigned_To: 'USR_101',
    Status: 'Negotiation',
    Next_Follow_Up_At: isoOffsetDays(1, 11, 0),
    Notes:
      '[14/11 12:44 pm - Priya Sharma]: Site visit done. Asking for ₹300/sqft floor-rise waiver on Tower B 1402.',
    Last_Called_At: isoTodayAt(12, 40),
    WhatsApp_Shared_Count: 3,
    Created_By: 'Admin',
    Updated_At: isoTodayAt(12, 45),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4007',
    Name: 'Nikhil Bansal',
    Phone: '9899887766',
    Project_Interest: 'Kharadi Kohinoor',
    Campaign_Source: 'Kharadi Kohinoor',
    Config_Requirement: '3 BHK Premium',
    Preferred_Location: 'Kharadi',
    Budget: '₹1.28 Cr',
    Assigned_To: 'USR_101',
    Status: 'Booked',
    Next_Follow_Up_At: '',
    Notes: '[13/11 03:20 pm - Priya Sharma]: Token ₹5L received via RTGS. Unit K-804 allotted.',
    Last_Called_At: isoOffsetDays(-1, 15, 0),
    WhatsApp_Shared_Count: 2,
    Created_By: 'Admin',
    Updated_At: isoOffsetDays(-1, 15, 30),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4008',
    Name: 'Prashant Tiwari',
    Phone: '9833221100',
    Project_Interest: 'Burgundy',
    Campaign_Source: 'Burgundy',
    Config_Requirement: '3.5 BHK Luxury',
    Preferred_Location: 'Mundhwa',
    Budget: '₹2.45 Cr',
    Assigned_To: 'USR_102',
    Status: 'Site Visit Scheduled',
    Next_Follow_Up_At: isoTodayAt(15, 0),
    Notes: '[14/11 10:55 am - Rohan Verma]: Visiting experience center at 4 PM with parents.',
    Last_Called_At: isoTodayAt(10, 50),
    WhatsApp_Shared_Count: 1,
    Created_By: 'Admin',
    Updated_At: isoTodayAt(10, 55),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4009',
    Name: 'Shruti Chatterjee',
    Phone: '9871234560',
    Project_Interest: 'Godrej',
    Campaign_Source: 'Godrej',
    Config_Requirement: '2 BHK Garden',
    Preferred_Location: 'Kharadi-Manjri',
    Budget: '₹98 Lakhs',
    Assigned_To: 'USR_102',
    Status: 'Follow-Up',
    Next_Follow_Up_At: isoOffsetDays(-1, 17, 0),
    Notes: '[14/11 11:08 am - Rohan Verma]: Comparing corner unit vs park-facing inventory.',
    Last_Called_At: isoTodayAt(11, 5),
    WhatsApp_Shared_Count: 1,
    Created_By: 'Admin',
    Updated_At: isoTodayAt(11, 10),
    Synced_To_Sheet: true,
  },
  {
    Lead_ID: 'LD_4010',
    Name: 'Arvind Kapoor',
    Phone: '9810998877',
    Project_Interest: 'Prospects',
    Campaign_Source: 'Prospects',
    Config_Requirement: '3 BHK',
    Preferred_Location: 'Kharadi',
    Budget: '₹1.20 Cr',
    Assigned_To: 'USR_102',
    Status: 'Site Visit Done',
    Next_Follow_Up_At: isoTodayAt(19, 0),
    Notes:
      '[14/11 01:20 pm - Rohan Verma]: Liked sample flat frontage. Checking bank loan pre-approval.',
    Last_Called_At: isoTodayAt(13, 15),
    WhatsApp_Shared_Count: 2,
    Created_By: 'Rohan Verma',
    Updated_At: isoTodayAt(13, 20),
    Synced_To_Sheet: true,
  },
];

export const SEED_CALL_LOGS: CallLogRecord[] = [
  {
    operationId: 'OP_CL_9001',
    Call_ID: 'CL_9001',
    Lead_ID: 'LD_4001',
    Lead_Name: 'Ananya Deshmukh',
    Telecaller_ID: 'USR_101',
    Normalized_Phone: '9820112233',
    Call_Type: 'OUTGOING',
    Duration_Sec: 214,
    Is_Connected: true,
    Timestamp: isoTodayAt(10, 15),
    Sync_Hash: 'USR_101_9820112233_1015',
    Synced_To_Sheet: true,
  },
  {
    operationId: 'OP_CL_9002',
    Call_ID: 'CL_9002',
    Lead_ID: 'LD_4002',
    Lead_Name: 'Karanveer Singh',
    Telecaller_ID: 'USR_101',
    Normalized_Phone: '9811445566',
    Call_Type: 'OUTGOING',
    Duration_Sec: 168,
    Is_Connected: true,
    Timestamp: isoTodayAt(11, 20),
    Sync_Hash: 'USR_101_9811445566_1120',
    Synced_To_Sheet: true,
  },
  {
    operationId: 'OP_CL_9003',
    Call_ID: 'CL_9003',
    Lead_ID: 'LD_4004',
    Lead_Name: 'Siddharth Malhotra',
    Telecaller_ID: 'USR_101',
    Normalized_Phone: '9845001122',
    Call_Type: 'OUTGOING',
    Duration_Sec: 8,
    Is_Connected: false,
    Timestamp: isoTodayAt(9, 45),
    Sync_Hash: 'USR_101_9845001122_0945',
    Synced_To_Sheet: true,
  },
  {
    operationId: 'OP_CL_9004',
    Call_ID: 'CL_9004',
    Lead_ID: 'LD_4006',
    Lead_Name: 'Rajeshwar Kulkarni',
    Telecaller_ID: 'USR_101',
    Normalized_Phone: '9822334455',
    Call_Type: 'INCOMING',
    Duration_Sec: 342,
    Is_Connected: true,
    Timestamp: isoTodayAt(12, 40),
    Sync_Hash: 'USR_101_9822334455_1240',
    Synced_To_Sheet: true,
  },
  {
    operationId: 'OP_CL_9005',
    Call_ID: 'CL_9005',
    Lead_ID: 'LD_4008',
    Lead_Name: 'Prashant Tiwari',
    Telecaller_ID: 'USR_102',
    Normalized_Phone: '9833221100',
    Call_Type: 'OUTGOING',
    Duration_Sec: 195,
    Is_Connected: true,
    Timestamp: isoTodayAt(10, 50),
    Sync_Hash: 'USR_102_9833221100_1050',
    Synced_To_Sheet: true,
  },
  {
    operationId: 'OP_CL_9006',
    Call_ID: 'CL_9006',
    Lead_ID: 'LD_4009',
    Lead_Name: 'Shruti Chatterjee',
    Telecaller_ID: 'USR_102',
    Normalized_Phone: '9871234560',
    Call_Type: 'MISSED',
    Duration_Sec: 0,
    Is_Connected: false,
    Timestamp: isoTodayAt(11, 5),
    Sync_Hash: 'USR_102_9871234560_1105',
    Synced_To_Sheet: true,
  },
  {
    operationId: 'OP_CL_9007',
    Call_ID: 'CL_9007',
    Lead_ID: 'LD_4010',
    Lead_Name: 'Arvind Kapoor',
    Telecaller_ID: 'USR_102',
    Normalized_Phone: '9810998877',
    Call_Type: 'OUTGOING',
    Duration_Sec: 264,
    Is_Connected: true,
    Timestamp: isoTodayAt(13, 15),
    Sync_Hash: 'USR_102_9810998877_1315',
    Synced_To_Sheet: true,
  },
];

export const SEED_FOLLOW_UPS: FollowUpRecord[] = [
  {
    FollowUp_ID: 'FU_701',
    Lead_ID: 'LD_4001',
    Telecaller_ID: 'USR_101',
    Scheduled_At: isoTodayAt(10, 15),
    Status: 'COMPLETED',
    Outcome_Stage: 'Hot / Interested',
    Notes: 'Confirmed weekend visit; shared brochure.',
    Reminder_Scheduled_15m: true,
    Synced_To_Sheet: true,
  },
  {
    FollowUp_ID: 'FU_702',
    Lead_ID: 'LD_4001',
    Telecaller_ID: 'USR_101',
    Scheduled_At: isoTodayAt(16, 30),
    Status: 'PENDING',
    Outcome_Stage: 'Hot / Interested',
    Notes: 'Confirm cab pickup time for Saturday site visit.',
    Reminder_Scheduled_15m: true,
    Synced_To_Sheet: true,
  },
  {
    FollowUp_ID: 'FU_703',
    Lead_ID: 'LD_4002',
    Telecaller_ID: 'USR_101',
    Scheduled_At: isoTodayAt(17, 45),
    Status: 'PENDING',
    Outcome_Stage: 'Site Visit Scheduled',
    Notes: 'Send site location pin.',
    Reminder_Scheduled_15m: true,
    Synced_To_Sheet: true,
  },
  {
    FollowUp_ID: 'FU_704',
    Lead_ID: 'LD_4003',
    Telecaller_ID: 'USR_101',
    Scheduled_At: isoOffsetDays(-1, 14, 0),
    Status: 'PENDING',
    Outcome_Stage: 'Follow-Up',
    Notes: 'Overdue payment plan follow-up.',
    Reminder_Scheduled_15m: true,
    Synced_To_Sheet: true,
  },
  {
    FollowUp_ID: 'FU_705',
    Lead_ID: 'LD_4008',
    Telecaller_ID: 'USR_102',
    Scheduled_At: isoTodayAt(15, 0),
    Status: 'PENDING',
    Outcome_Stage: 'Site Visit Scheduled',
    Notes: 'Confirm 4 PM experience center arrival.',
    Reminder_Scheduled_15m: true,
    Synced_To_Sheet: true,
  },
];

export const SEED_WHATSAPP_LOGS: WhatsAppLogRecord[] = [
  {
    operationId: 'OP_WA_301',
    WA_Log_ID: 'WA_301',
    Lead_ID: 'LD_4001',
    Lead_Name: 'Ananya Deshmukh',
    Telecaller_ID: 'USR_101',
    Project_Template: 'Magarpatta Residents',
    Wa_Me_Url: 'https://wa.me/919820112233?text=Hello%20Ananya...',
    Timestamp: isoTodayAt(10, 22),
    Synced_To_Sheet: true,
  },
  {
    operationId: 'OP_WA_302',
    WA_Log_ID: 'WA_302',
    Lead_ID: 'LD_4002',
    Lead_Name: 'Karanveer Singh',
    Telecaller_ID: 'USR_101',
    Project_Template: 'Burgundy',
    Wa_Me_Url: 'https://wa.me/919811445566?text=Hi%20Karanveer...',
    Timestamp: isoTodayAt(11, 25),
    Synced_To_Sheet: true,
  },
  {
    operationId: 'OP_WA_303',
    WA_Log_ID: 'WA_303',
    Lead_ID: 'LD_4010',
    Lead_Name: 'Arvind Kapoor',
    Telecaller_ID: 'USR_102',
    Project_Template: 'Kharadi Kohinoor',
    Wa_Me_Url: 'https://wa.me/919810998877?text=Greetings%20Arvind...',
    Timestamp: isoTodayAt(13, 20),
    Synced_To_Sheet: true,
  },
];
