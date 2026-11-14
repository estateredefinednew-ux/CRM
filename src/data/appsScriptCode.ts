export const LIVE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyBalkB4uvyX7UVJRICDMtu6FHuQ99xsapVEYyjXE-DXlxh_jXUD_qcwQ4RwPz21NPqZw/exec';
export const LIVE_API_SECRET_KEY = 'MyEstate2026Key';

export interface SheetTabSchema {
  tabName: string;
  purpose: string;
  accessRule: string;
  columns: { name: string; type: string; example: string; notes: string }[];
}

export const GOOGLE_SHEETS_SCHEMA: SheetTabSchema[] = [
  {
    tabName: 'Users',
    purpose: 'Stores Telecaller and Admin credentials, 4-digit PINs (or SHA-256 hashes), and active status.',
    accessRule: 'ADMIN-only in Sheet. Validated server-side via Apps Script Web App; never exposed to Telecallers.',
    columns: [
      { name: 'UserID', type: 'String (PK)', example: 'USR_101', notes: 'Immutable ID used in Assigned_To' },
      { name: 'Name', type: 'String', example: 'Priya Sharma', notes: 'Display name in Daily_Reports' },
      { name: 'Phone', type: 'String (10-digit)', example: '9876543210', notes: 'Primary login identifier' },
      { name: 'Pin', type: '4-Digit / Hash', example: '1234', notes: '4-digit PIN validated by Apps Script' },
      { name: 'Role', type: 'Enum', example: 'TELECALLER | ADMIN', notes: 'Enforces RBAC on every endpoint' },
      { name: 'Active', type: 'Boolean', example: 'TRUE', notes: 'Allows instant offboarding' },
    ],
  },
  {
    tabName: 'Leads',
    purpose: 'Master real estate lead registry populated by Admin uploads and Telecaller walk-in/referral entries.',
    accessRule: 'TELECALLER receives only rows where Assigned_To == session.userId. ADMIN sees all rows.',
    columns: [
      { name: 'Lead_ID', type: 'String (PK)', example: 'LD_4001', notes: 'Auto-generated UUID/prefix' },
      { name: 'Name', type: 'String', example: 'Ananya Deshmukh', notes: 'Lead full name' },
      { name: 'Phone', type: 'String (10-digit)', example: '9820112233', notes: 'Normalized to last 10 digits' },
      { name: 'Project_Interest', type: 'String', example: 'Skyline Residences', notes: 'Matches Templates.Project_Name' },
      { name: 'Campaign_Source', type: 'String', example: 'Meta Lead Ad', notes: 'Ad campaign / portal / Walk-In' },
      { name: 'Config_Requirement', type: 'String', example: '3 BHK + Study', notes: 'Unit type or plot size' },
      { name: 'Preferred_Location', type: 'String', example: 'Sector 65, Golf Course Ext', notes: 'Target micro-market' },
      { name: 'Budget', type: 'String', example: '₹1.90 Cr', notes: 'Target budget bracket' },
      { name: 'Assigned_To', type: 'String (FK)', example: 'USR_101', notes: 'Telecaller User_ID' },
      { name: 'Status', type: 'Pipeline Enum', example: 'Hot / Interested', notes: '9-stage pipeline enum' },
      { name: 'Next_Follow_Up_At', type: 'yyyy-MM-dd HH:mm', example: '2026-11-14 16:30', notes: 'Required for active follow-up stages' },
      { name: 'Notes', type: 'String', example: 'East-facing 3BHK...', notes: 'Latest disposition notes' },
      { name: 'Created_By', type: 'Enum', example: 'Admin | Telecaller', notes: 'Tracks Admin upload vs manual entry' },
      { name: 'Last_Called_At', type: 'ISO-8601', example: '2026-11-14T10:15:00Z', notes: 'Updated on UPSERT_CALL_LOG' },
      { name: 'WhatsApp_Shared_Count', type: 'Integer', example: '2', notes: 'Incremented atomically on WhatsApp log' },
      { name: 'Updated_At', type: 'ISO-8601', example: '2026-11-14T10:22:00Z', notes: 'Latest local/server sync timestamp' },
    ],
  },
  {
    tabName: 'Call_Logs',
    purpose: 'Stores deduplicated CRM-matched call records synced from Telecaller Android CallLog.Calls.',
    accessRule: 'Write-append via LockService; rejects non-assigned leads and duplicate (phone, startedAt) / operationId.',
    columns: [
      { name: 'Operation_ID', type: 'String (Idempotency)', example: 'OP_CL_9001', notes: 'Echoed in ACK for Room pending_sync removal' },
      { name: 'Call_ID', type: 'String (PK)', example: 'CL_9001', notes: 'Generated row ID' },
      { name: 'Lead_ID', type: 'String (FK)', example: 'LD_4001', notes: 'Matched via 10-digit phone' },
      { name: 'Telecaller_ID', type: 'String (FK)', example: 'USR_101', notes: 'Derived from session token' },
      { name: 'Phone', type: 'String (10-digit)', example: '9820112233', notes: 'Normalized 10 digits' },
      { name: 'Call_Type', type: 'Enum', example: 'OUTGOING | INCOMING | MISSED', notes: 'Mapped from CallLog.Calls.TYPE' },
      { name: 'Started_At', type: 'Epoch Millis', example: '1763115300000', notes: 'Unique with Phone' },
      { name: 'Duration_Sec', type: 'Integer', example: '214', notes: 'Individual call duration in seconds' },
      { name: 'Is_Connected', type: 'Boolean', example: 'TRUE', notes: 'TRUE iff Duration_Sec >= 15 & answered' },
      { name: 'Disposition', type: 'String', example: 'Hot / Interested', notes: 'Post-call stage outcome' },
    ],
  },
  {
    tabName: 'Follow_Ups',
    purpose: 'Audit trail of scheduled and completed follow-ups linked to Post-Call Dispositions.',
    accessRule: 'Telecaller reads/writes own follow-ups; triggers Daily_Reports completed/pending counts.',
    columns: [
      { name: 'FollowUp_ID', type: 'String (PK)', example: 'FU_701', notes: 'Unique follow-up ID' },
      { name: 'Lead_ID', type: 'String (FK)', example: 'LD_4001', notes: 'Target lead' },
      { name: 'Telecaller_ID', type: 'String (FK)', example: 'USR_101', notes: 'Owning telecaller' },
      { name: 'Scheduled_At', type: 'yyyy-MM-dd HH:mm', example: '2026-11-14 16:30', notes: 'Triggers 15-min local alarm' },
      { name: 'Status', type: 'Enum', example: 'PENDING | COMPLETED', notes: 'Updated when disposition saved' },
      { name: 'Outcome_Stage', type: 'Pipeline Enum', example: 'Site Visit Scheduled', notes: 'Stage selected post-call' },
      { name: 'Notes', type: 'String', example: 'Confirm cab pickup', notes: 'Telecaller disposition remark' },
    ],
  },
  {
    tabName: 'WhatsApp_Logs',
    purpose: 'Tracks every one-tap WhatsApp project brochure share initiated from the Android app.',
    accessRule: 'Append-only via UPSERT_WHATSAPP_LOG; increments Lead.WhatsApp_Shared_Count and Daily_Reports.',
    columns: [
      { name: 'Operation_ID', type: 'String (PK)', example: 'OP_WA_301', notes: 'Echoed in ACK for Room pending_sync removal' },
      { name: 'Lead_ID', type: 'String (FK)', example: 'LD_4001', notes: 'Lead receiving brochure' },
      { name: 'Telecaller_ID', type: 'String (FK)', example: 'USR_101', notes: 'Telecaller who tapped Share' },
      { name: 'Template_Name', type: 'String', example: 'Skyline Residences', notes: 'Selected template name' },
      { name: 'Sent_At', type: 'ISO-8601', example: '2026-11-14T10:22:00Z', notes: 'Share event time' },
    ],
  },
  {
    tabName: 'Daily_Reports',
    purpose: 'Aggregated full calendar day (00:00 – 23:59) calling & follow-up performance per telecaller.',
    accessRule: 'Auto-recomputed on UPSERT_CALL_LOG, UPSERT_WHATSAPP_LOG, UPSERT_DAILY_REPORT, and 23:55 trigger.',
    columns: [
      { name: 'Report_Key', type: 'String (PK)', example: '2026-11-14_USR_101', notes: 'Composite Date + Telecaller_ID' },
      { name: 'Date', type: 'YYYY-MM-DD', example: '2026-11-14', notes: 'Company timezone local date' },
      { name: 'Telecaller_ID', type: 'String (FK)', example: 'USR_101', notes: 'Telecaller User_ID' },
      { name: 'Telecaller_Name', type: 'String', example: 'Priya Sharma', notes: 'Telecaller full name' },
      { name: 'Total_Calls_Attempted', type: 'Integer', example: '42', notes: 'All CRM calls 00:00–23:59' },
      { name: 'Connected_Calls', type: 'Integer', example: '28', notes: 'Duration >= 15s & answered' },
      { name: 'Not_Connected_Calls', type: 'Integer', example: '14', notes: 'Duration < 15s or Missed/Rejected' },
      { name: 'WhatsApp_Details_Shared', type: 'Integer', example: '11', notes: 'Count of WhatsApp_Logs today' },
      { name: 'Total_Calling_Seconds', type: 'Integer', example: '5840', notes: 'Sum of Duration_Sec today' },
      { name: 'Total_Calling_Hours', type: 'HH:MM:SS', example: '01:37:20', notes: 'Formatted daily duration' },
      { name: 'Follow_Ups_Completed', type: 'Integer', example: '15', notes: 'Completed today' },
      { name: 'Follow_Ups_Pending', type: 'Integer', example: '6', notes: 'Due today & overdue pending' },
    ],
  },
  {
    tabName: 'Templates',
    purpose: 'Centralized WhatsApp project brochure templates editable by Manager in Google Sheets.',
    accessRule: 'Read-only to Telecallers via bootstrap API; never opens Sheet directly.',
    columns: [
      { name: 'Template_ID', type: 'String (PK)', example: 'TPL_01', notes: 'Template ID' },
      { name: 'Project_Name', type: 'String', example: 'Skyline Residences', notes: 'Project dropdown key' },
      { name: 'Message_Body', type: 'String', example: 'Hello {{Name}}, ...', notes: 'Supports {{Name}} placeholder' },
      { name: 'Brochure_Url', type: 'URL', example: 'https://...', notes: 'PDF link embedded in message' },
    ],
  },
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * RealEstate CRM (com.realestate.crm) — Secured Google Apps Script Web App Backend
 *
 * SYNC PROTOCOL COMPATIBILITY:
 * Matches AppsScriptSyncProtocol.kt:
 *  - Returns { "status": "success", "operationId": "<echoed_op_id>", "message": "OK", ... }
 *  - Supports Google Apps Script 302/303 redirect behavior cleanly.
 *  - Zero Google Sheet access for Telecallers (Sheet stays Private to Owner).
 *
 * Live Deployment:
 *   Web App URL    = "https://script.google.com/macros/s/AKfycbyBalkB4uvyX7UVJRICDMtu6FHuQ99xsapVEYyjXE-DXlxh_jXUD_qcwQ4RwPz21NPqZw/exec"
 *   API_SECRET_KEY = "MyEstate2026Key"
 *   TIMEZONE       = "Asia/Kolkata"
 */

const TABS = {
  USERS: "Users",
  LEADS: "Leads",
  CALL_LOGS: "Call_Logs",
  FOLLOW_UPS: "Follow_Ups",
  WHATSAPP_LOGS: "WhatsApp_Logs",
  DAILY_REPORTS: "Daily_Reports",
  TEMPLATES: "Templates",
};

const CONNECTED_THRESHOLD_SECONDS = 15;
const SESSION_TTL_SECONDS = 6 * 60 * 60;
const DEFAULT_API_SECRET_KEY = "MyEstate2026Key";

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  try {
    const props = PropertiesService.getScriptProperties();
    const expectedApiKey = props.getProperty("API_SECRET_KEY") || DEFAULT_API_SECRET_KEY;
    const body = method === "POST" && e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : {};
    const params = e.parameter || {};

    const apiKey = String(body.apiKey || params.apiKey || "");
    const operationId = String(body.operationId || params.operationId || "");

    if (!constantTimeEquals(apiKey, expectedApiKey)) {
      return jsonResponse({ status: "error", operationId: operationId, message: "INVALID_API_KEY" });
    }

    const action = String(body.action || params.action || "");
    if (action === "LOGIN" || action === "login") {
      return handleLogin(body, operationId);
    }

    const token = String(body.sessionToken || params.sessionToken || "");
    const session = validateSession(token);
    if (!session) {
      return jsonResponse({ status: "error", operationId: operationId, message: "SESSION_EXPIRED" });
    }

    switch (action) {
      case "GET_SYNC_DATA":
      case "BOOTSTRAP":
        return handleGetSyncData(session, operationId);
      case "UPSERT_LEAD":
        return handleUpsertLead(session, body, operationId);
      case "UPSERT_CALL_LOG":
        return handleUpsertCallLog(session, body, operationId);
      case "UPSERT_WHATSAPP_LOG":
        return handleUpsertWhatsAppLog(session, body, operationId);
      case "UPSERT_DAILY_REPORT":
        return handleUpsertDailyReport(session, body, operationId);
      case "GET_MANAGER_DASHBOARD":
        return handleGetManagerDashboard(session, body.date || params.date, operationId);
      default:
        return jsonResponse({ status: "error", operationId: operationId, message: "UNKNOWN_ACTION: " + action });
    }
  } catch (err) {
    return jsonResponse({ status: "error", message: err.message || "INTERNAL_ERROR" });
  }
}

/* ============================================================================
 * 1. AUTHENTICATION (Phone / Username + 4-Digit PIN)
 * ==========================================================================*/
function handleLogin(body, operationId) {
  const identifier = String(body.phone || body.identifier || "").trim().toLowerCase();
  const pin = String(body.pin || "").trim();
  if (!identifier || !/^\\d{4}$/.test(pin)) {
    return jsonResponse({ status: "error", operationId: operationId, message: "Phone number and 4-digit PIN required" });
  }

  const users = readSheetAsObjects(TABS.USERS);
  const pinHash = hashPin(pin);
  const phone10 = normalizePhone10(identifier);

  const matched = users.find((u) => {
    if (String(u.Active).toUpperCase() !== "TRUE") return false;
    const phoneMatch = phone10.length === 10 && normalizePhone10(u.Phone) === phone10;
    const userMatch = u.Username && String(u.Username).trim().toLowerCase() === identifier;
    const storedPin = String(u.Pin !== undefined ? u.Pin : (u.Pin_Hash || ""));
    const pinMatch = storedPin === pin || storedPin === pinHash;
    return (phoneMatch || userMatch) && pinMatch;
  });

  if (!matched) {
    return jsonResponse({ status: "error", operationId: operationId, message: "Invalid phone number or PIN" });
  }

  const sessionToken = Utilities.getUuid() + "-" + Utilities.getUuid();
  const user = {
    userId: matched.UserID || matched.User_ID,
    name: matched.Name,
    phone: normalizePhone10(matched.Phone),
    role: String(matched.Role).toUpperCase(),
  };

  CacheService.getScriptCache().put("SESSION_" + sessionToken, JSON.stringify(user), SESSION_TTL_SECONDS);

  return jsonResponse({
    status: "success",
    operationId: operationId,
    message: "OK",
    sessionToken: sessionToken,
    user: user,
  });
}

function validateSession(token) {
  if (!token) return null;
  const raw = CacheService.getScriptCache().get("SESSION_" + token);
  return raw ? JSON.parse(raw) : null;
}

/* ============================================================================
 * 2. GET_SYNC_DATA (Role-Scoped Pull: Leads + Daily_Reports + Active Templates)
 * ==========================================================================*/
function handleGetSyncData(session, operationId) {
  const allLeads = readSheetAsObjects(TABS.LEADS);
  const visibleLeads = session.role === "ADMIN"
    ? allLeads
    : allLeads.filter((l) => String(l.AssignedTo || l.Assigned_To) === session.userId);

  const templates = readSheetAsObjects(TABS.TEMPLATES).filter(
    (t) => t.Active === undefined || String(t.Active).toUpperCase() !== "FALSE"
  );

  const todayStr = getLocalDateStr(new Date());
  const dailyReports = session.role === "ADMIN"
    ? readSheetAsObjects(TABS.DAILY_REPORTS)
    : [recomputeDailyReport(session.userId, todayStr)];

  return jsonResponse({
    status: "success",
    operationId: operationId,
    message: "OK",
    leads: visibleLeads,
    templates: templates,
    dailyReports: dailyReports,
  });
}

/* ============================================================================
 * 3. UPSERT_LEAD (Supports Campaign_Source, Config_Requirement, Preferred_Location)
 * ==========================================================================*/
function handleUpsertLead(session, body, operationId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const leadId = String(body.leadId || ("LD_" + Date.now().toString().slice(-6)));
    const name = String(body.name || "").trim();
    const phone = normalizePhone10(body.phone || "");
    const projectInterest = String(body.projectInterest || "").trim();
    const campaignSource = String(body.campaignSource || "Walk-In").trim();
    const configRequirement = String(body.configRequirement || "").trim();
    const preferredLocation = String(body.preferredLocation || "").trim();
    const budget = String(body.budget || "").trim();
    const assignedTo = session.role === "ADMIN" && body.assignedTo ? String(body.assignedTo) : session.userId;
    const status = String(body.status || "New");
    const nextFollowUpAt = String(body.nextFollowUpAt || "").trim();
    const notes = String(body.notes || "").trim();
    const createdBy = String(body.createdBy || (session.role === "ADMIN" ? "Admin" : "Telecaller"));
    const updatedAt = String(body.updatedAt || new Date().toISOString());

    const mandatoryStages = ["Follow-Up", "Ringing / Callback", "Hot / Interested", "Site Visit Scheduled"];
    if (mandatoryStages.indexOf(status) !== -1 && !nextFollowUpAt) {
      return jsonResponse({ status: "error", operationId: operationId, message: "Next follow-up required for " + status });
    }

    const sheet = getSheet(TABS.LEADS);
    const data = sheet.getDataRange().getValues();
    const idx = indexMap(data[0]);

    let existingRow = -1;
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][idx.Lead_ID]) === leadId) {
        if (session.role !== "ADMIN" && String(data[r][idx.Assigned_To]) !== session.userId) {
          return jsonResponse({ status: "error", operationId: operationId, message: "FORBIDDEN" });
        }
        existingRow = r + 1;
        break;
      }
    }

    if (existingRow !== -1) {
      sheet.getRange(existingRow, idx.Status + 1).setValue(status);
      sheet.getRange(existingRow, idx.Next_Follow_Up_At + 1).setValue(nextFollowUpAt);
      sheet.getRange(existingRow, idx.Notes + 1).setValue(notes);
      sheet.getRange(existingRow, idx.Updated_At + 1).setValue(updatedAt);
      if (configRequirement) sheet.getRange(existingRow, idx.Config_Requirement + 1).setValue(configRequirement);
      if (preferredLocation) sheet.getRange(existingRow, idx.Preferred_Location + 1).setValue(preferredLocation);
      if (budget) sheet.getRange(existingRow, idx.Budget + 1).setValue(budget);
    } else {
      sheet.appendRow([
        leadId, name, phone, projectInterest, campaignSource, configRequirement,
        preferredLocation, budget, assignedTo, status, nextFollowUpAt, notes,
        createdBy, "", 0, updatedAt,
      ]);
    }

    completePendingFollowUps(leadId, session.userId, status, notes);
    if (nextFollowUpAt) {
      appendFollowUp(leadId, assignedTo, nextFollowUpAt, "PENDING", status, notes);
    }

    return jsonResponse({
      status: "success",
      operationId: operationId,
      message: "OK",
      leadId: leadId,
    });
  } finally {
    lock.releaseLock();
  }
}

/* ============================================================================
 * 4. UPSERT_CALL_LOG (Idempotent via operationId & (phone, startedAt))
 * ==========================================================================*/
function handleUpsertCallLog(session, body, operationId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const phone10 = normalizePhone10(body.phone || "");
    const startedAt = Number(body.startedAt || Date.now());
    const durationSec = Math.max(0, parseInt(body.durationSec, 10) || 0);
    const callType = String(body.callType || "OUTGOING").toUpperCase();
    const disposition = String(body.disposition || "");

    const myLeads = readSheetAsObjects(TABS.LEADS).filter(
      (l) => session.role === "ADMIN" || String(l.Assigned_To) === session.userId
    );
    const matchedLead = myLeads.find((l) => normalizePhone10(l.Phone) === phone10);
    if (!matchedLead) {
      // Strictly ignore non-CRM personal numbers but ACK operationId so Room queue clears
      return jsonResponse({ status: "success", operationId: operationId, message: "IGNORED_NON_CRM" });
    }

    const existing = readSheetAsObjects(TABS.CALL_LOGS);
    const alreadyExists = existing.some(
      (c) => String(c.Operation_ID) === operationId ||
        (normalizePhone10(c.Phone) === phone10 && Number(c.Started_At) === startedAt)
    );
    if (alreadyExists) {
      return jsonResponse({ status: "success", operationId: operationId, message: "ALREADY_SYNCED" });
    }

    const isConnected = callType !== "MISSED" && callType !== "REJECTED" && durationSec >= CONNECTED_THRESHOLD_SECONDS;
    const callId = String(body.callId || ("CL_" + Utilities.getUuid().slice(0, 8).toUpperCase()));

    getSheet(TABS.CALL_LOGS).appendRow([
      operationId, callId, matchedLead.Lead_ID, session.userId, phone10,
      callType, startedAt, durationSec, isConnected, disposition,
    ]);

    const dateStr = getLocalDateStr(new Date(startedAt));
    const report = recomputeDailyReport(session.userId, dateStr);

    return jsonResponse({ status: "success", operationId: operationId, message: "OK", dailyReport: report });
  } finally {
    lock.releaseLock();
  }
}

/* ============================================================================
 * 5. UPSERT_WHATSAPP_LOG
 * ==========================================================================*/
function handleUpsertWhatsAppLog(session, body, operationId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const leadId = String(body.leadId || "");
    const templateName = String(body.templateName || "");
    const sentAt = String(body.sentAt || new Date().toISOString());

    const leadSheet = getSheet(TABS.LEADS);
    const data = leadSheet.getDataRange().getValues();
    const idx = indexMap(data[0]);
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][idx.Lead_ID]) === leadId) {
        const nextCount = (parseInt(data[r][idx.WhatsApp_Shared_Count], 10) || 0) + 1;
        leadSheet.getRange(r + 1, idx.WhatsApp_Shared_Count + 1).setValue(nextCount);
        break;
      }
    }

    getSheet(TABS.WHATSAPP_LOGS).appendRow([operationId, leadId, session.userId, templateName, sentAt]);
    const report = recomputeDailyReport(session.userId, getLocalDateStr(new Date(sentAt)));

    return jsonResponse({ status: "success", operationId: operationId, message: "OK", dailyReport: report });
  } finally {
    lock.releaseLock();
  }
}

/* ============================================================================
 * 6. DAILY REPORTS (00:00 AM - 23:59 PM) & MANAGER DASHBOARD
 * ==========================================================================*/
function handleUpsertDailyReport(session, body, operationId) {
  const dateStr = String(body.date || getLocalDateStr(new Date()));
  const report = recomputeDailyReport(session.userId, dateStr);
  return jsonResponse({ status: "success", operationId: operationId, message: "OK", dailyReport: report });
}

function handleGetManagerDashboard(session, dateParam, operationId) {
  if (session.role !== "ADMIN") {
    return jsonResponse({ status: "error", operationId: operationId, message: "ADMIN_REQUIRED" });
  }
  const dateStr = dateParam || getLocalDateStr(new Date());
  const telecallers = readSheetAsObjects(TABS.USERS).filter(
    (u) => String(u.Role).toUpperCase() === "TELECALLER" && String(u.Active).toUpperCase() === "TRUE"
  );
  const reports = telecallers.map((t) => recomputeDailyReport(t.UserID || t.User_ID, dateStr));
  return jsonResponse({ status: "success", operationId: operationId, message: "OK", date: dateStr, reports: reports });
}

function recomputeDailyReport(telecallerId, dateStr) {
  const userObj = readSheetAsObjects(TABS.USERS).find((u) => String(u.UserID || u.User_ID) === telecallerId);
  const telecallerName = userObj ? userObj.Name : telecallerId;

  const calls = readSheetAsObjects(TABS.CALL_LOGS).filter(
    (c) => String(c.Telecaller_ID) === telecallerId &&
      getLocalDateStr(new Date(Number(c.Started_At))) === dateStr
  );

  const totalAttempted = calls.length;
  const connected = calls.filter((c) => String(c.Is_Connected).toUpperCase() === "TRUE").length;
  const notConnected = totalAttempted - connected;
  const totalSec = calls.reduce((s, c) => s + (parseInt(c.Duration_Sec, 10) || 0), 0);

  const waLogs = readSheetAsObjects(TABS.WHATSAPP_LOGS).filter(
    (w) => String(w.Telecaller_ID) === telecallerId &&
      getLocalDateStr(new Date(w.Sent_At)) === dateStr
  );

  const followUps = readSheetAsObjects(TABS.FOLLOW_UPS).filter((f) => String(f.Telecaller_ID) === telecallerId);
  const completed = followUps.filter((f) => f.Status === "COMPLETED" && String(f.Scheduled_At).slice(0, 10) === dateStr).length;
  const pending = followUps.filter((f) => f.Status === "PENDING" && String(f.Scheduled_At).slice(0, 10) <= dateStr).length;

  const row = {
    Report_Key: dateStr + "_" + telecallerId,
    Date: dateStr,
    Telecaller_ID: telecallerId,
    Telecaller_Name: telecallerName,
    Total_Calls_Attempted: totalAttempted,
    Connected_Calls: connected,
    Not_Connected_Calls: notConnected,
    WhatsApp_Details_Shared: waLogs.length,
    Total_Calling_Seconds: totalSec,
    Total_Calling_Hours: formatHMS(totalSec),
    Follow_Ups_Completed: completed,
    Follow_Ups_Pending: pending,
  };
  upsertDailyReportRow(row);
  return row;
}

/* ============================================================================
 * HELPERS
 * ==========================================================================*/
function getSheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }

function readSheetAsObjects(tabName) {
  const sheet = getSheet(tabName);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
}

function indexMap(headers) {
  const map = {};
  headers.forEach((h, i) => (map[h] = i));
  return map;
}

function normalizePhone10(raw) {
  const digits = String(raw || "").replace(/\\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function getLocalDateStr(dateObj) {
  const tz = PropertiesService.getScriptProperties().getProperty("TIMEZONE") || "Asia/Kolkata";
  return Utilities.formatDate(dateObj, tz, "yyyy-MM-dd");
}

function formatHMS(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function hashPin(pin) {
  const salt = PropertiesService.getScriptProperties().getProperty("PIN_SALT") || "proppulse_salt";
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ":" + pin);
  return digest.map((b) => ("0" + (b & 0xff).toString(16)).slice(-2)).join("");
}

function constantTimeEquals(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function appendFollowUp(leadId, telecallerId, scheduledAt, status, stage, notes) {
  getSheet(TABS.FOLLOW_UPS).appendRow([
    "FU_" + Utilities.getUuid().slice(0, 8).toUpperCase(),
    leadId, telecallerId, scheduledAt, status, stage, notes,
  ]);
}

function completePendingFollowUps(leadId, telecallerId, stage, notes) {
  const sheet = getSheet(TABS.FOLLOW_UPS);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return;
  const idx = indexMap(data[0]);
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idx.Lead_ID]) === leadId && String(data[r][idx.Telecaller_ID]) === telecallerId && String(data[r][idx.Status]) === "PENDING") {
      sheet.getRange(r + 1, idx.Status + 1).setValue("COMPLETED");
      sheet.getRange(r + 1, idx.Outcome_Stage + 1).setValue(stage);
      if (notes) sheet.getRange(r + 1, idx.Notes + 1).setValue(notes);
    }
  }
}

function upsertDailyReportRow(report) {
  const sheet = getSheet(TABS.DAILY_REPORTS);
  const data = sheet.getDataRange().getValues();
  const arr = [
    report.Report_Key, report.Date, report.Telecaller_ID, report.Telecaller_Name,
    report.Total_Calls_Attempted, report.Connected_Calls, report.Not_Connected_Calls,
    report.WhatsApp_Details_Shared, report.Total_Calling_Seconds, report.Total_Calling_Hours,
    report.Follow_Ups_Completed, report.Follow_Ups_Pending,
  ];
  if (data.length >= 2) {
    const idx = indexMap(data[0]);
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][idx.Report_Key]) === report.Report_Key) {
        sheet.getRange(r + 1, 1, 1, arr.length).setValues([arr]);
        return;
      }
    }
  }
  sheet.appendRow(arr);
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
`;
