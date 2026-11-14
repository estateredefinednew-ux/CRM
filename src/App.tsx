import React, { useMemo, useState } from 'react';
import {
  AndroidCallType,
  CallLogRecord,
  DailyReportRow,
  FollowUpRecord,
  Lead,
  PendingSyncAction,
  PendingSyncItem,
  PipelineStage,
  ProjectTemplate,
  RoomSyncEvent,
  WhatsAppLogRecord,
} from './types/crm';
import {
  appendRemarkTimeline,
  formatDurationHMS,
  getTodayDateStr,
  normalizePhone10,
  SEED_CALL_LOGS,
  SEED_FOLLOW_UPS,
  SEED_LEADS,
  SEED_TEMPLATES,
  SEED_USERS,
  SEED_WHATSAPP_LOGS,
} from './data/seedData';
import JSZip from 'jszip';
import { GOOGLE_APPS_SCRIPT_CODE } from './data/appsScriptCode';
import { ANDROID_SOURCE_FILES } from './data/androidProjectFiles';
import { AndroidSimulator } from './components/AndroidSimulator';
import { BackendConsole } from './components/BackendConsole';
import { AndroidCodeExplorer } from './components/AndroidCodeExplorer';

type WorkspaceSection = 'SIMULATOR' | 'BACKEND' | 'ANDROID_CODE';

export default function App() {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('SIMULATOR');
  const [isOnline, setIsOnline] = useState(true);
  const [isBundlingZip, setIsBundlingZip] = useState(false);

  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [callLogs, setCallLogs] = useState<CallLogRecord[]>(SEED_CALL_LOGS);
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(SEED_FOLLOW_UPS);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLogRecord[]>(SEED_WHATSAPP_LOGS);
  const [pendingSyncs, setPendingSyncs] = useState<PendingSyncItem[]>([]);
  const [syncEvents, setSyncEvents] = useState<RoomSyncEvent[]>([
    {
      id: 'EV_1',
      operationId: 'OP_BOOT_001',
      timestamp: new Date().toISOString(),
      entity: 'Daily_Reports',
      action: '00:00–23:59 Rollup Synced',
      status: 'SYNCED',
      detail: 'Aggregated daily metrics across Priya Sharma and Rohan Verma via AppsScriptSyncProtocol.',
    },
  ]);

  const todayYmd = getTodayDateStr();

  // Continuously compute 00:00 AM - 23:59 PM Daily Reports per telecaller
  const dailyReports: DailyReportRow[] = useMemo(() => {
    const telecallers = SEED_USERS.filter((u) => u.Role === 'TELECALLER');
    return telecallers.map((tc) => {
      const tcCallsToday = callLogs.filter(
        (c) => c.Telecaller_ID === tc.User_ID && c.Timestamp.slice(0, 10) === todayYmd
      );
      const totalAttempted = tcCallsToday.length;
      const connected = tcCallsToday.filter((c) => c.Is_Connected).length;
      const notConnected = totalAttempted - connected;
      const totalSeconds = tcCallsToday.reduce((sum, c) => sum + c.Duration_Sec, 0);

      const waToday = whatsAppLogs.filter(
        (w) => w.Telecaller_ID === tc.User_ID && w.Timestamp.slice(0, 10) === todayYmd
      ).length;

      const tcFollowUps = followUps.filter((f) => f.Telecaller_ID === tc.User_ID);
      const fuCompleted = tcFollowUps.filter(
        (f) => f.Status === 'COMPLETED' && f.Scheduled_At.slice(0, 10) === todayYmd
      ).length;
      const fuPending = tcFollowUps.filter(
        (f) => f.Status === 'PENDING' && f.Scheduled_At.slice(0, 10) <= todayYmd
      ).length;

      return {
        Date: todayYmd,
        Telecaller_ID: tc.User_ID,
        Telecaller_Name: tc.Name,
        Total_Calls_Attempted: totalAttempted,
        Connected_Calls: connected,
        Not_Connected_Calls: notConnected,
        WhatsApp_Details_Shared: waToday,
        Total_Calling_Seconds: totalSeconds,
        Total_Calling_Hours: formatDurationHMS(totalSeconds),
        Follow_Ups_Completed: fuCompleted,
        Follow_Ups_Pending: fuPending,
      };
    });
  }, [callLogs, whatsAppLogs, followUps, todayYmd]);

  const pushEvent = (
    entity: RoomSyncEvent['entity'],
    action: string,
    status: RoomSyncEvent['status'],
    detail: string,
    operationId = `OP_${Date.now().toString().slice(-6)}`
  ) => {
    setSyncEvents((prev) => [
      {
        id: `EV_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        operationId,
        timestamp: new Date().toISOString(),
        entity,
        action,
        status,
        detail,
      },
      ...prev,
    ]);
  };

  const enqueueOrAckSync = (
    operationId: string,
    action: PendingSyncAction,
    summary: string
  ) => {
    if (!isOnline) {
      setPendingSyncs((prev) => [
        ...prev,
        {
          operationId,
          action,
          summary,
          createdAt: new Date().toISOString(),
          retryCount: 0,
        },
      ]);
    }
  };

  const handleToggleOnline = () => {
    const nextOnline = !isOnline;
    setIsOnline(nextOnline);
    if (nextOnline) {
      const flushedCount = pendingSyncs.length;
      setPendingSyncs([]);
      setLeads((prev) => prev.map((l) => ({ ...l, Synced_To_Sheet: true })));
      setCallLogs((prev) => prev.map((c) => ({ ...c, Synced_To_Sheet: true })));
      setFollowUps((prev) => prev.map((f) => ({ ...f, Synced_To_Sheet: true })));
      setWhatsAppLogs((prev) => prev.map((w) => ({ ...w, Synced_To_Sheet: true })));
      pushEvent(
        'Daily_Reports',
        `WorkManager Reconnect Flush (${flushedCount} ops)`,
        'SYNCED',
        'Verified operationId ACKs via AppsScriptSyncProtocol & cleared pending_sync.',
        `OP_FLUSH_${Date.now().toString().slice(-5)}`
      );
    }
  };

  const handleSyncNow = () => {
    if (!isOnline) return;
    const flushedCount = pendingSyncs.length;
    setPendingSyncs([]);
    setLeads((prev) => prev.map((l) => ({ ...l, Synced_To_Sheet: true })));
    setCallLogs((prev) => prev.map((c) => ({ ...c, Synced_To_Sheet: true })));
    setFollowUps((prev) => prev.map((f) => ({ ...f, Synced_To_Sheet: true })));
    setWhatsAppLogs((prev) => prev.map((w) => ({ ...w, Synced_To_Sheet: true })));
    pushEvent(
      'Daily_Reports',
      `Manual Sync Completed (${flushedCount} ops)`,
      'SYNCED',
      'All pending_sync items acknowledged by Google Apps Script.',
      `OP_SYNC_${Date.now().toString().slice(-5)}`
    );
  };

  const handleAddLead = (
    newLeadInput: Omit<
      Lead,
      'Lead_ID' | 'Last_Called_At' | 'WhatsApp_Shared_Count' | 'Synced_To_Sheet' | 'Updated_At'
    >
  ) => {
    const leadId = `LD_${Math.floor(5000 + Math.random() * 4999)}`;
    const opId = `OP_LEAD_${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();
    const newLead: Lead = {
      ...newLeadInput,
      Lead_ID: leadId,
      Last_Called_At: '',
      WhatsApp_Shared_Count: 0,
      Updated_At: nowIso,
      Synced_To_Sheet: isOnline,
    };
    setLeads((prev) => [newLead, ...prev]);

    if (newLead.Next_Follow_Up_At) {
      setFollowUps((prev) => [
        {
          FollowUp_ID: `FU_${Date.now().toString().slice(-4)}`,
          Lead_ID: leadId,
          Telecaller_ID: newLead.Assigned_To,
          Scheduled_At: newLead.Next_Follow_Up_At,
          Status: 'PENDING',
          Outcome_Stage: newLead.Status,
          Notes: newLead.Notes || 'Initial follow-up scheduled',
          Reminder_Scheduled_15m: true,
          Synced_To_Sheet: isOnline,
        },
        ...prev,
      ]);
    }

    enqueueOrAckSync(opId, 'UPSERT_LEAD', `${newLead.Name} (${newLead.Config_Requirement})`);
    pushEvent(
      'Leads',
      `Created (${newLead.Created_By})`,
      isOnline ? 'SYNCED' : 'QUEUED_OFFLINE',
      `${newLead.Name} · ${newLead.Config_Requirement} · ${newLead.Preferred_Location}`,
      opId
    );
  };

  const handleSaveDisposition = (
    leadId: string,
    stage: PipelineStage,
    nextFollowUpAt: string,
    newRemarkNote: string,
    actorName: string
  ) => {
    const target = leads.find((l) => l.Lead_ID === leadId);
    if (!target) return;
    const opId = `OP_DISP_${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();
    const updatedTimeline = appendRemarkTimeline(target.Notes, actorName, newRemarkNote);

    setLeads((prev) =>
      prev.map((l) =>
        l.Lead_ID === leadId
          ? {
              ...l,
              Status: stage,
              Next_Follow_Up_At: nextFollowUpAt,
              Notes: updatedTimeline,
              Updated_At: nowIso,
              Synced_To_Sheet: isOnline,
            }
          : l
      )
    );

    setFollowUps((prev) => {
      const updated = prev.map((f) =>
        f.Lead_ID === leadId && f.Status === 'PENDING'
          ? {
              ...f,
              Status: 'COMPLETED' as const,
              Outcome_Stage: stage,
              Notes: newRemarkNote.trim() || f.Notes,
              Synced_To_Sheet: isOnline,
            }
          : f
      );
      if (nextFollowUpAt) {
        updated.unshift({
          FollowUp_ID: `FU_${Date.now().toString().slice(-5)}`,
          Lead_ID: leadId,
          Telecaller_ID: target.Assigned_To,
          Scheduled_At: nextFollowUpAt,
          Status: 'PENDING',
          Outcome_Stage: stage,
          Notes: newRemarkNote.trim() || `Follow-up for ${stage}`,
          Reminder_Scheduled_15m: true,
          Synced_To_Sheet: isOnline,
        });
      }
      return updated;
    });

    enqueueOrAckSync(opId, 'UPSERT_LEAD', `${target.Name} -> ${stage}`);
    pushEvent(
      'Follow_Ups',
      `Disposition: ${stage}`,
      isOnline ? 'SYNCED' : 'QUEUED_OFFLINE',
      `${target.Name} · ${nextFollowUpAt ? '15-min alarm scheduled' : 'No follow-up required'}`,
      opId
    );
  };

  const handleAppendRemark = (leadId: string, actorName: string, newNote: string) => {
    const trimmed = newNote.trim();
    if (!trimmed) return;
    const target = leads.find((l) => l.Lead_ID === leadId);
    if (!target) return;

    const opId = `OP_NOTE_${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();
    const updatedTimeline = appendRemarkTimeline(target.Notes, actorName, trimmed);

    setLeads((prev) =>
      prev.map((l) =>
        l.Lead_ID === leadId
          ? {
              ...l,
              Notes: updatedTimeline,
              Updated_At: nowIso,
              Synced_To_Sheet: isOnline,
            }
          : l
      )
    );

    enqueueOrAckSync(opId, 'UPSERT_LEAD', `Remark added for ${target.Name}`);
    pushEvent(
      'Leads',
      `Remark Appended (${actorName})`,
      isOnline ? 'SYNCED' : 'QUEUED_OFFLINE',
      `${target.Name}: "${trimmed.slice(0, 48)}${trimmed.length > 48 ? '...' : ''}"`,
      opId
    );
  };

  const handleSimulateCall = (
    telecallerId: string,
    rawPhone: string,
    callType: AndroidCallType,
    durationSec: number
  ): Lead | null => {
    const phone10 = normalizePhone10(rawPhone);
    const matchedLead = leads.find(
      (l) => l.Assigned_To === telecallerId && normalizePhone10(l.Phone) === phone10
    );

    if (!matchedLead) {
      pushEvent(
        'Call_Logs',
        `Filtered Out (${phone10 || rawPhone})`,
        'IGNORED_NON_CRM',
        'Number does not match any assigned CRM lead. Personal call ignored.'
      );
      return null;
    }

    const nowIso = new Date().toISOString();
    const isUnanswered = callType === 'MISSED' || callType === 'REJECTED';
    const isConnected = !isUnanswered && durationSec >= 15;
    const syncHash = `${telecallerId}_${phone10}_${Date.now()}`;
    const opId = `OP_CL_${Date.now().toString().slice(-6)}`;

    const newCall: CallLogRecord = {
      operationId: opId,
      Call_ID: `CL_${Date.now().toString().slice(-5)}`,
      Lead_ID: matchedLead.Lead_ID,
      Lead_Name: matchedLead.Name,
      Telecaller_ID: telecallerId,
      Normalized_Phone: phone10,
      Call_Type: callType,
      Duration_Sec: isUnanswered ? 0 : durationSec,
      Is_Connected: isConnected,
      Timestamp: nowIso,
      Sync_Hash: syncHash,
      Synced_To_Sheet: isOnline,
    };

    setCallLogs((prev) => [newCall, ...prev]);
    setLeads((prev) =>
      prev.map((l) =>
        l.Lead_ID === matchedLead.Lead_ID
          ? { ...l, Last_Called_At: nowIso, Updated_At: nowIso }
          : l
      )
    );

    enqueueOrAckSync(opId, 'UPSERT_CALL_LOG', `${matchedLead.Name} (${newCall.Duration_Sec}s)`);
    pushEvent(
      'Call_Logs',
      `${callType} · ${newCall.Duration_Sec}s (${isConnected ? 'Connected >=15s' : 'Not Connected'})`,
      isOnline ? 'SYNCED' : 'QUEUED_OFFLINE',
      `Matched CRM Lead: ${matchedLead.Name} (${phone10})`,
      opId
    );

    return matchedLead;
  };

  const handleLogWhatsApp = (
    telecallerId: string,
    lead: Lead,
    template: ProjectTemplate,
    waUrl: string
  ) => {
    const nowIso = new Date().toISOString();
    const opId = `OP_WA_${Date.now().toString().slice(-6)}`;
    setWhatsAppLogs((prev) => [
      {
        operationId: opId,
        WA_Log_ID: `WA_${Date.now().toString().slice(-5)}`,
        Lead_ID: lead.Lead_ID,
        Lead_Name: lead.Name,
        Telecaller_ID: telecallerId,
        Project_Template: template.Project_Name,
        Wa_Me_Url: waUrl,
        Timestamp: nowIso,
        Synced_To_Sheet: isOnline,
      },
      ...prev,
    ]);

    setLeads((prev) =>
      prev.map((l) =>
        l.Lead_ID === lead.Lead_ID
          ? {
              ...l,
              WhatsApp_Shared_Count: l.WhatsApp_Shared_Count + 1,
              Updated_At: nowIso,
              Synced_To_Sheet: isOnline,
            }
          : l
      )
    );

    enqueueOrAckSync(opId, 'UPSERT_WHATSAPP_LOG', `${lead.Name} · ${template.Project_Name}`);
    pushEvent(
      'WhatsApp_Logs',
      `Shared ${template.Project_Name}`,
      isOnline ? 'SYNCED' : 'QUEUED_OFFLINE',
      `wa.me/91${normalizePhone10(lead.Phone)} logged for ${lead.Name}`,
      opId
    );
  };

  const handleReassignLead = (leadId: string, newTelecallerId: string) => {
    const opId = `OP_REASSIGN_${Date.now().toString().slice(-5)}`;
    setLeads((prev) =>
      prev.map((l) =>
        l.Lead_ID === leadId
          ? {
              ...l,
              Assigned_To: newTelecallerId,
              Updated_At: new Date().toISOString(),
              Synced_To_Sheet: isOnline,
            }
          : l
      )
    );
    const tcName = SEED_USERS.find((u) => u.User_ID === newTelecallerId)?.Name || newTelecallerId;
    enqueueOrAckSync(opId, 'UPSERT_LEAD', `Reassign ${leadId} -> ${tcName}`);
    pushEvent('Leads', 'Reassigned Lead', isOnline ? 'SYNCED' : 'QUEUED_OFFLINE', `${leadId} -> ${tcName}`, opId);
  };

  const handleDownloadCodeGs = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAndroidZip = async () => {
    if (isBundlingZip) return;
    setIsBundlingZip(true);
    try {
      const zip = new JSZip();
      for (const file of ANDROID_SOURCE_FILES) {
        zip.file(file.path, file.code);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'RealEstateCRM-Android.zip';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsBundlingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* 3-Zone Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <span className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display">
            PropPulse CRM
          </span>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="flex items-center gap-6 overflow-x-auto">
            {[
              { id: 'SIMULATOR', label: 'Android Simulator' },
              { id: 'BACKEND', label: 'Sheets & Apps Script' },
              { id: 'ANDROID_CODE', label: 'Kotlin & Compose Code' },
            ].map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as WorkspaceSection)}
                  className={`py-2 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? 'border-emerald-700 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Export Actions */}
          <div className="shrink-0 hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAndroidZip}
              disabled={isBundlingZip}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#256F73] hover:bg-[#1e5c5f] disabled:opacity-70 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              {isBundlingZip ? 'Bundling ZIP...' : 'Download Android Project (.zip)'}
            </button>
            <button
              type="button"
              onClick={handleDownloadCodeGs}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#14263D] hover:bg-[#0f1d30] rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Download Code.gs
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-6 space-y-6">
        {/* Compact Workspace Context Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1 max-w-3xl">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Native Android Real Estate Telecaller &amp; Manager CRM
            </h1>
            <p className="text-xs text-slate-600">
              Kotlin + Jetpack Compose (Material 3) · Room Offline-First · WorkManager CallLog Sync (&ge;15s Connected Rule) · Secured Google Apps Script API
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-600 tabular-nums shrink-0">
            <span>{leads.length} Active Leads</span>
            <span aria-hidden="true">·</span>
            <span>{callLogs.length} CRM Calls Logged</span>
            <span aria-hidden="true">·</span>
            <span>{whatsAppLogs.length} WhatsApp Shares</span>
          </div>
        </div>

        {activeSection === 'SIMULATOR' && (
          <AndroidSimulator
            users={SEED_USERS}
            leads={leads}
            callLogs={callLogs}
            followUps={followUps}
            whatsAppLogs={whatsAppLogs}
            templates={SEED_TEMPLATES}
            dailyReports={dailyReports}
            pendingSyncs={pendingSyncs}
            syncEvents={syncEvents}
            isOnline={isOnline}
            onToggleOnline={handleToggleOnline}
            onSyncNow={handleSyncNow}
            onAddLead={handleAddLead}
            onSaveDisposition={handleSaveDisposition}
            onAppendRemark={handleAppendRemark}
            onSimulateCall={handleSimulateCall}
            onLogWhatsApp={handleLogWhatsApp}
            onReassignLead={handleReassignLead}
          />
        )}

        {activeSection === 'BACKEND' && <BackendConsole />}

        {activeSection === 'ANDROID_CODE' && <AndroidCodeExplorer />}
      </main>
    </div>
  );
}
