import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Download,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneMissed,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import {
  AndroidCallType,
  CAMPAIGN_FILTERS,
  CampaignFilter,
  CallLogRecord,
  CrmUser,
  DailyReportRow,
  FollowUpRecord,
  Lead,
  MANDATORY_FOLLOWUP_STAGES,
  PIPELINE_STAGES,
  PipelineStage,
  PendingSyncItem,
  ProjectTemplate,
  RoomSyncEvent,
  WhatsAppLogRecord,
} from '../types/crm';
import {
  appendRemarkTimeline,
  getTodayDateStr,
  normalizePhone10,
} from '../data/seedData';

interface AndroidSimulatorProps {
  users: CrmUser[];
  leads: Lead[];
  callLogs: CallLogRecord[];
  followUps: FollowUpRecord[];
  whatsAppLogs: WhatsAppLogRecord[];
  templates: ProjectTemplate[];
  dailyReports: DailyReportRow[];
  pendingSyncs: PendingSyncItem[];
  syncEvents: RoomSyncEvent[];
  isOnline: boolean;
  onToggleOnline: () => void;
  onSyncNow: () => void;
  onAddLead: (
    lead: Omit<
      Lead,
      'Lead_ID' | 'Last_Called_At' | 'WhatsApp_Shared_Count' | 'Synced_To_Sheet' | 'Updated_At'
    >
  ) => void;
  onSaveDisposition: (
    leadId: string,
    stage: PipelineStage,
    nextFollowUpAt: string,
    newRemarkNote: string,
    actorName: string
  ) => void;
  onAppendRemark: (leadId: string, actorName: string, newNote: string) => void;
  onSimulateCall: (telecallerId: string, rawPhone: string, callType: AndroidCallType, durationSec: number) => Lead | null;
  onLogWhatsApp: (telecallerId: string, lead: Lead, template: ProjectTemplate, waUrl: string) => void;
  onReassignLead: (leadId: string, newTelecallerId: string) => void;
}

type QueueTab = "Today's Follow-Ups" | 'Overdue' | 'Site Visits' | 'All Leads';
type PhoneScreen = 'HOME' | 'DETAIL' | 'DAILY_REPORT' | 'MANAGER_DASHBOARD';

function toLocalDateTimeInput(iso?: string): string {
  if (!iso) {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function formatShortTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDurationMMSS(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getStatusTone(status: PipelineStage): string {
  switch (status) {
    case 'Booked':
    case 'Hot / Interested':
    case 'Site Visit Scheduled':
    case 'Site Visit Done':
      return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30';
    case 'Lost / Invalid':
      return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
    case 'Ringing / Callback':
    case 'Follow-Up':
    case 'Negotiation':
      return 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30';
    default:
      return 'bg-[#256F73]/10 text-[#256F73] border-[#256F73]/30';
  }
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  users,
  leads,
  callLogs,
  followUps,
  whatsAppLogs,
  templates,
  dailyReports,
  pendingSyncs,
  syncEvents,
  isOnline,
  onToggleOnline,
  onSyncNow,
  onAddLead,
  onSaveDisposition,
  onAppendRemark,
  onSimulateCall,
  onLogWhatsApp,
  onReassignLead,
}) => {
  // Login & session state
  const [activeUser, setActiveUser] = useState<CrmUser | null>(users[0]);
  const [identifierInput, setIdentifierInput] = useState('9876543210');
  const [pinInput, setPinInput] = useState('1234');
  const [loginError, setLoginError] = useState('');

  // Phone navigation state
  const [phoneScreen, setPhoneScreen] = useState<PhoneScreen>('HOME');
  const [queueTab, setQueueTab] = useState<QueueTab>("Today's Follow-Ups");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [detailRemarkInput, setDetailRemarkInput] = useState('');
  const [inspectedTelecallerId, setInspectedTelecallerId] = useState<string | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Bottom sheets inside Android viewport
  const [dispositionLead, setDispositionLead] = useState<Lead | null>(null);
  const [dispStage, setDispStage] = useState<PipelineStage>('Follow-Up');
  const [dispNextFollowUp, setDispNextFollowUp] = useState('');
  const [dispNotes, setDispNotes] = useState('');

  const [whatsAppLead, setWhatsAppLead] = useState<Lead | null>(null);
  const [whatsAppMode, setWhatsAppMode] = useState<'TEMPLATE' | 'CUSTOM'>('TEMPLATE');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.Template_ID || '');
  const [customWaMessage, setCustomWaMessage] = useState('');

  const [showAddLead, setShowAddLead] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProject, setNewProject] = useState(templates[0]?.Project_Name || 'Magarpatta Residents');
  const [newConfig, setNewConfig] = useState('3 BHK');
  const [newLocation, setNewLocation] = useState('Magarpatta / Hadapsar');
  const [newBudget, setNewBudget] = useState('');
  const [newSource, setNewSource] = useState('Magarpatta Residents');
  const [newStatus, setNewStatus] = useState<PipelineStage>('New');
  const [newFollowUp, setNewFollowUp] = useState(toLocalDateTimeInput());
  const [newNotes, setNewNotes] = useState('');

  // Active simulated call overlay inside phone
  const [activeCallBanner, setActiveCallBanner] = useState<{
    lead: Lead;
    statusText: string;
  } | null>(null);

  // Right-side inspector tabs
  const [inspectorTab, setInspectorTab] = useState<'CALL_SIM' | 'ROOM_CACHE' | 'REMINDERS'>('CALL_SIM');
  const [customCallPhone, setCustomCallPhone] = useState('9811199999');
  const [customCallDuration, setCustomCallDuration] = useState(45);
  const [customCallType, setCustomCallType] = useState<AndroidCallType>('OUTGOING');

  const todayYmd = getTodayDateStr();

  const triggerManualSyncInPhone = () => {
    if (!isOnline) {
      setSyncToast(`Offline: ${pendingSyncs.length} updates waiting in Room`);
      setTimeout(() => setSyncToast(null), 2000);
      return;
    }
    const count = pendingSyncs.length;
    onSyncNow();
    setSyncToast(count > 0 ? `Synced ${count} queued items` : 'All Room records up to date');
    setTimeout(() => setSyncToast(null), 2000);
  };

  const handleExportManagerCsv = () => {
    const header = [
      'Date',
      'Telecaller_ID',
      'Telecaller_Name',
      'TotalCalls',
      'ConnectedCalls',
      'NotConnectedCalls',
      'WhatsAppSharedCount',
      'TotalCallingSeconds',
      'TotalCallingHoursHHMMSS',
      'FollowUpsCompleted',
      'FollowUpsPending',
    ].join(',');
    const rows = dailyReports.map((r) =>
      [
        r.Date,
        r.Telecaller_ID,
        `"${r.Telecaller_Name.replace(/"/g, '""')}"`,
        r.Total_Calls_Attempted,
        r.Connected_Calls,
        r.Not_Connected_Calls,
        r.WhatsApp_Details_Shared,
        r.Total_Calling_Seconds,
        r.Total_Calling_Hours,
        r.Follow_Ups_Completed,
        r.Follow_Ups_Pending,
      ].join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_calling_report_${todayYmd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idNorm = identifierInput.trim().toLowerCase();
    const phone10 = normalizePhone10(idNorm);
    const matched = users.find(
      (u) =>
        u.Active &&
        (u.Username.toLowerCase() === idNorm || (phone10.length === 10 && u.Phone === phone10)) &&
        u.Pin === pinInput.trim()
    );
    if (!matched) {
      setLoginError('Invalid Phone/Username or 4-digit PIN.');
      return;
    }
    setLoginError('');
    setActiveUser(matched);
    setPhoneScreen(matched.Role === 'ADMIN' ? 'MANAGER_DASHBOARD' : 'HOME');
    setSelectedLeadId(null);
    setInspectedTelecallerId(null);
  };

  const quickLoginAs = (user: CrmUser) => {
    setIdentifierInput(user.Phone);
    setPinInput(user.Pin);
    setLoginError('');
    setActiveUser(user);
    setPhoneScreen(user.Role === 'ADMIN' ? 'MANAGER_DASHBOARD' : 'HOME');
    setSelectedLeadId(null);
    setInspectedTelecallerId(null);
    setDispositionLead(null);
    setWhatsAppLead(null);
    setShowAddLead(false);
  };

  // Role-scoped leads: Telecaller sees ONLY their own Assigned_To leads
  const myLeads = useMemo(() => {
    if (!activeUser) return [];
    if (activeUser.Role === 'ADMIN') return leads;
    return leads.filter((l) => l.Assigned_To === activeUser.User_ID);
  }, [activeUser, leads]);

  const filteredQueueLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return myLeads.filter((lead) => {
      if (selectedCampaign !== 'All' && lead.Campaign_Source !== selectedCampaign) {
        return false;
      }
      if (q) {
        const match =
          lead.Name.toLowerCase().includes(q) ||
          lead.Phone.includes(q) ||
          lead.Preferred_Location.toLowerCase().includes(q) ||
          lead.Campaign_Source.toLowerCase().includes(q) ||
          lead.Project_Interest.toLowerCase().includes(q);
        if (!match) return false;
      }
      const fuDate = lead.Next_Follow_Up_At ? lead.Next_Follow_Up_At.slice(0, 10) : '';
      switch (queueTab) {
        case "Today's Follow-Ups":
          return fuDate === todayYmd && lead.Status !== 'Booked' && lead.Status !== 'Lost / Invalid';
        case 'Overdue':
          return (
            Boolean(fuDate) &&
            fuDate < todayYmd &&
            lead.Status !== 'Booked' &&
            lead.Status !== 'Lost / Invalid'
          );
        case 'Site Visits':
          return lead.Status === 'Site Visit Scheduled' || lead.Status === 'Site Visit Done';
        case 'All Leads':
        default:
          return true;
      }
    });
  }, [myLeads, queueTab, selectedCampaign, searchQuery, todayYmd]);

  const selectedLead = useMemo(
    () => myLeads.find((l) => l.Lead_ID === selectedLeadId) || null,
    [myLeads, selectedLeadId]
  );

  const openDispositionSheet = (lead: Lead) => {
    setDispositionLead(lead);
    setDispStage(lead.Status);
    setDispNextFollowUp(toLocalDateTimeInput(lead.Next_Follow_Up_At));
    setDispNotes('');
  };

  const openWhatsAppPicker = (lead: Lead) => {
    setWhatsAppLead(lead);
    setWhatsAppMode('TEMPLATE');
    const match = templates.find(
      (t) => t.Project_Name === lead.Project_Interest || t.Project_Name === lead.Campaign_Source
    );
    setSelectedTemplateId(match?.Template_ID || templates[0]?.Template_ID || '');
    setCustomWaMessage(
      `Hi ${lead.Name}, following up regarding ${lead.Config_Requirement} in ${lead.Preferred_Location}. Let me know a convenient time to share floor plans.`
    );
  };

  const triggerLeadCallFlow = (lead: Lead, durationSec: number, callType: AndroidCallType) => {
    if (!activeUser) return;
    setActiveCallBanner({
      lead,
      statusText:
        callType === 'MISSED'
          ? 'Missed call logged (0s)'
          : `Call ended · ${durationSec}s (${durationSec >= 15 ? 'Connected' : 'Not Connected'})`,
    });

    const matched = onSimulateCall(activeUser.User_ID, lead.Phone, callType, durationSec);
    setTimeout(() => {
      setActiveCallBanner(null);
      if (matched) {
        openDispositionSheet(matched);
      }
    }, 650);
  };

  const myDailyReport = useMemo(() => {
    if (!activeUser) return null;
    return dailyReports.find((r) => r.Telecaller_ID === activeUser.User_ID) || null;
  }, [activeUser, dailyReports]);

  const myCallsToday = useMemo(() => {
    if (!activeUser) return [];
    return callLogs.filter(
      (c) => c.Telecaller_ID === activeUser.User_ID && c.Timestamp.slice(0, 10) === todayYmd
    );
  }, [activeUser, callLogs, todayYmd]);

  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.Template_ID === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const resolvedWaBody = useMemo(() => {
    if (!whatsAppLead) return '';
    if (whatsAppMode === 'CUSTOM') return customWaMessage;
    return activeTemplate
      ? activeTemplate.Message_Body.replace(/\{\{Name\}\}/g, whatsAppLead.Name)
      : '';
  }, [whatsAppLead, whatsAppMode, customWaMessage, activeTemplate]);

  const generatedWaMeUrl = useMemo(() => {
    if (!whatsAppLead) return '';
    const phone10 = normalizePhone10(whatsAppLead.Phone);
    return `https://wa.me/91${phone10}?text=${encodeURIComponent(resolvedWaBody)}`;
  }, [whatsAppLead, resolvedWaBody]);

  const requiresFollowUp = MANDATORY_FOLLOWUP_STAGES.includes(dispStage);
  const isDispositionValid = !requiresFollowUp || dispNextFollowUp.trim().length > 0;
  const addLeadRequiresFollowUp = MANDATORY_FOLLOWUP_STAGES.includes(newStatus);
  const isAddLeadValid =
    newName.trim().length > 0 &&
    normalizePhone10(newPhone).length === 10 &&
    (!addLeadRequiresFollowUp || newFollowUp.trim().length > 0);

  const pendingSyncCount =
    leads.filter((l) => !l.Synced_To_Sheet).length +
    callLogs.filter((c) => !c.Synced_To_Sheet).length +
    whatsAppLogs.filter((w) => !w.Synced_To_Sheet).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[410px_1fr] gap-6 items-start">
      {/* LEFT COLUMN: Interactive Android Material 3 Device Viewport */}
      <div className="flex flex-col items-center">
        {/* Quick Role Switcher above Phone */}
        <div className="w-full max-w-[390px] mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-500">Quick Sign-In</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {users.map((u) => {
              const isSelected = activeUser?.User_ID === u.User_ID;
              return (
                <button
                  key={u.User_ID}
                  type="button"
                  onClick={() => quickLoginAs(u)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {u.Name.split(' ')[0]} · {u.Role === 'ADMIN' ? 'Admin' : 'Caller'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Android Device Shell */}
        <div className="w-full max-w-[390px] h-[760px] bg-slate-900 rounded-[36px] p-2.5 shadow-xl border border-slate-800 flex flex-col">
          {/* Android Status Bar */}
          <div className="h-7 px-5 flex items-center justify-between text-[11px] font-medium text-slate-200 shrink-0">
            <span className="tabular-nums">14:17</span>
            <div className="w-16 h-3.5 bg-slate-950 rounded-full" />
            <div className="flex items-center gap-2 tabular-nums">
              {isOnline ? (
                <span className="text-emerald-400">5G</span>
              ) : (
                <span className="text-amber-400">Offline</span>
              )}
              <span>94%</span>
            </div>
          </div>

          {/* Android App Viewport */}
          <div className="relative flex-1 bg-white rounded-[26px] overflow-hidden flex flex-col">
            {!activeUser ? (
              /* LOGIN SCREEN */
              <div className="flex-1 p-6 flex flex-col justify-center bg-slate-50">
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">PropPulse CRM</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in with registered mobile or username and 4-digit PIN.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number or Username
                    </label>
                    <input
                      type="text"
                      value={identifierInput}
                      onChange={(e) => setIdentifierInput(e.target.value)}
                      placeholder="9876543210 or priya.sharma"
                      className="w-full h-11 px-3 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      4-Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full h-11 px-3 text-sm font-mono tracking-widest bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  {loginError && (
                    <p className="text-xs text-red-600 font-medium">{loginError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors"
                  >
                    Sign In
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">Demo Accounts (PIN):</p>
                  <p className="tabular-nums">Telecaller: 9876543210 / 1234 (Priya)</p>
                  <p className="tabular-nums">Telecaller: 9876543211 / 5678 (Rohan)</p>
                  <p className="tabular-nums">Admin: 9999999999 / 0000 (Vikram)</p>
                </div>
              </div>
            ) : phoneScreen === 'MANAGER_DASHBOARD' && activeUser.Role === 'ADMIN' ? (
              /* MANAGER DASHBOARD SCREEN (ADMIN ONLY) */
              <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA]">
                <div className="px-3.5 py-3 bg-white border-b border-[#D9E1E8] flex items-center justify-between gap-2 shrink-0">
                  <div className="min-w-0 flex items-center gap-1.5">
                    {inspectedTelecallerId && (
                      <button
                        type="button"
                        onClick={() => setInspectedTelecallerId(null)}
                        className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#14263D] shrink-0"
                        aria-label="Back to team summary"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#14263D] truncate">
                        {inspectedTelecallerId
                          ? users.find((u) => u.User_ID === inspectedTelecallerId)?.Name ||
                            'Telecaller Drill-Down'
                          : 'Manager Dashboard'}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {inspectedTelecallerId
                          ? `Daily Calls & Overdue · ${todayYmd}`
                          : `${activeUser.Name} · Sheet Owner`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleExportManagerCsv}
                      className="h-7 px-2 rounded-lg bg-[#256F73] hover:bg-[#1e5c5f] text-white text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoneScreen('HOME')}
                      className="text-[11px] font-semibold text-[#256F73] hover:underline px-1.5 py-1 whitespace-nowrap"
                    >
                      Leads
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveUser(null)}
                      className="text-[11px] font-medium text-slate-500 hover:text-[#14263D] px-1 py-1"
                    >
                      Out
                    </button>
                  </div>
                </div>

                {inspectedTelecallerId ? (
                  /* TELECALLER DRILL-DOWN VIEW */
                  (() => {
                    const tcCalls = callLogs.filter(
                      (c) =>
                        c.Telecaller_ID === inspectedTelecallerId &&
                        c.Timestamp.slice(0, 10) === todayYmd
                    );
                    const tcOverdue = leads.filter((l) => {
                      const fuDate = l.Next_Follow_Up_At ? l.Next_Follow_Up_At.slice(0, 10) : '';
                      return (
                        l.Assigned_To === inspectedTelecallerId &&
                        Boolean(fuDate) &&
                        fuDate < todayYmd &&
                        l.Status !== 'Booked' &&
                        l.Status !== 'Lost / Invalid'
                      );
                    });
                    return (
                      <div className="flex-1 overflow-y-auto thin-scrollbar p-3.5 space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-[#14263D] mb-1.5 px-0.5">
                            Today&apos;s Synced Calls ({tcCalls.length})
                          </h4>
                          <div className="bg-white border border-[#D9E1E8] rounded-2xl divide-y divide-slate-100">
                            {tcCalls.length === 0 ? (
                              <p className="p-3.5 text-xs text-slate-500 text-center">
                                No CRM calls recorded today.
                              </p>
                            ) : (
                              tcCalls.map((c) => (
                                <div
                                  key={c.Call_ID}
                                  className="px-3.5 py-2.5 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#14263D] truncate">
                                      {c.Lead_Name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 tabular-nums">
                                      {c.Call_Type} · {formatShortTime(c.Timestamp)}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-mono font-bold text-[#14263D] tabular-nums">
                                      {formatDurationMMSS(c.Duration_Sec)}
                                    </p>
                                    <span
                                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                        c.Is_Connected
                                          ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                                          : 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30'
                                      }`}
                                    >
                                      {c.Is_Connected ? 'Connected' : 'Not Connected'}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-[#EF4444] mb-1.5 px-0.5">
                            Overdue Follow-Ups ({tcOverdue.length})
                          </h4>
                          <div className="bg-white border border-[#D9E1E8] rounded-2xl divide-y divide-slate-100">
                            {tcOverdue.length === 0 ? (
                              <p className="p-3.5 text-xs text-slate-500 text-center">
                                Zero overdue follow-ups.
                              </p>
                            ) : (
                              tcOverdue.map((lead) => (
                                <button
                                  key={lead.Lead_ID}
                                  type="button"
                                  onClick={() => {
                                    setSelectedLeadId(lead.Lead_ID);
                                    setPhoneScreen('DETAIL');
                                  }}
                                  className="w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#14263D] truncate">
                                      {lead.Name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                      {lead.Campaign_Source} · {lead.Status}
                                    </p>
                                  </div>
                                  <span className="text-[11px] font-medium text-[#EF4444] tabular-nums shrink-0">
                                    Due {formatShortTime(lead.Next_Follow_Up_At)}
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  /* TEAM SUMMARY LIST */
                  <div className="flex-1 overflow-y-auto thin-scrollbar p-3.5 space-y-3">
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-[#14263D]">
                          Team Calling Summary · {todayYmd}
                        </p>
                        <button
                          type="button"
                          onClick={triggerManualSyncInPhone}
                          className="text-[11px] font-semibold text-[#256F73] flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Sync ({pendingSyncs.length})
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#F5F7FA] rounded-xl p-2">
                          <div className="text-base font-bold text-[#14263D] tabular-nums">
                            {dailyReports.reduce((s, r) => s + r.Total_Calls_Attempted, 0)}
                          </div>
                          <div className="text-[10px] text-slate-500">Total Calls</div>
                        </div>
                        <div className="bg-[#10B981]/10 rounded-xl p-2">
                          <div className="text-base font-bold text-[#10B981] tabular-nums">
                            {dailyReports.reduce((s, r) => s + r.Connected_Calls, 0)}
                          </div>
                          <div className="text-[10px] text-[#10B981]">Connected</div>
                        </div>
                        <div className="bg-[#D69E48]/15 rounded-xl p-2">
                          <div className="text-base font-bold text-[#9A6B1E] tabular-nums">
                            {dailyReports.reduce((s, r) => s + r.WhatsApp_Details_Shared, 0)}
                          </div>
                          <div className="text-[10px] text-[#9A6B1E]">WhatsApp</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] font-medium text-slate-500 px-0.5">
                      Tap a telecaller to inspect calls &amp; overdue queue:
                    </p>

                    {dailyReports.map((rep) => (
                      <button
                        key={rep.Telecaller_ID}
                        type="button"
                        onClick={() => setInspectedTelecallerId(rep.Telecaller_ID)}
                        className="w-full text-left bg-white border border-[#D9E1E8] hover:border-[#256F73] rounded-2xl p-3.5 space-y-2 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#14263D]">
                            {rep.Telecaller_Name}
                          </span>
                          <span className="text-xs font-mono font-semibold text-[#256F73] tabular-nums flex items-center gap-1">
                            {rep.Total_Calling_Hours}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-600 tabular-nums">
                          <span>Total Calls: {rep.Total_Calls_Attempted}</span>
                          <span className="text-[#10B981] font-medium">
                            Connected (&ge;15s): {rep.Connected_Calls}
                          </span>
                          <span className="text-[#D97706]">
                            Not Connected: {rep.Not_Connected_Calls}
                          </span>
                          <span>WhatsApp Shared: {rep.WhatsApp_Details_Shared}</span>
                          <span>FU Completed: {rep.Follow_Ups_Completed}</span>
                          <span className="text-[#EF4444]">
                            FU Pending: {rep.Follow_Ups_Pending}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : phoneScreen === 'DAILY_REPORT' ? (
              /* TELECALLER MY DAILY REPORT (12:00 AM - 11:59 PM) */
              <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA]">
                <div className="px-3 py-3 bg-white border-b border-[#D9E1E8] flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPhoneScreen('HOME')}
                    className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#14263D]"
                    aria-label="Back to leads"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#14263D] truncate">
                      My Daily Report
                    </h3>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {todayYmd} · 12:00 AM – 11:59 PM
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={triggerManualSyncInPhone}
                    className="h-7 px-2 rounded-lg border border-[#D9E1E8] text-[11px] font-semibold text-[#256F73] flex items-center gap-1 shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Sync ({pendingSyncs.length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto thin-scrollbar p-3.5 space-y-3">
                  {/* Live 6-KPI Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3">
                      <p className="text-[11px] text-slate-500">Total Calls</p>
                      <p className="text-lg font-bold text-[#14263D] tabular-nums mt-0.5">
                        {myDailyReport?.Total_Calls_Attempted || 0}
                      </p>
                    </div>
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3">
                      <p className="text-[11px] text-slate-500">Calling Hours</p>
                      <p className="text-lg font-bold font-mono text-[#D69E48] tabular-nums mt-0.5">
                        {myDailyReport?.Total_Calling_Hours || '00:00:00'}
                      </p>
                    </div>
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3">
                      <p className="text-[11px] text-[#10B981]">Connected (&ge;15s)</p>
                      <p className="text-lg font-bold text-[#10B981] tabular-nums mt-0.5">
                        {myDailyReport?.Connected_Calls || 0}
                      </p>
                    </div>
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3">
                      <p className="text-[11px] text-[#D97706]">Not Connected</p>
                      <p className="text-lg font-bold text-[#D97706] tabular-nums mt-0.5">
                        {myDailyReport?.Not_Connected_Calls || 0}
                      </p>
                    </div>
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3">
                      <p className="text-[11px] text-slate-500">WhatsApp Shared</p>
                      <p className="text-lg font-bold text-[#256F73] tabular-nums mt-0.5">
                        {myDailyReport?.WhatsApp_Details_Shared || 0}
                      </p>
                    </div>
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3">
                      <p className="text-[11px] text-slate-500">FU Done / Pending</p>
                      <p className="text-lg font-bold text-[#14263D] tabular-nums mt-0.5">
                        {myDailyReport?.Follow_Ups_Completed || 0} /{' '}
                        {myDailyReport?.Follow_Ups_Pending || 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-[#14263D] mb-2 px-0.5">
                      Today&apos;s Synced CRM Calls ({myCallsToday.length})
                    </h4>
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl divide-y divide-slate-100">
                      {myCallsToday.length === 0 ? (
                        <p className="p-4 text-xs text-slate-500 text-center">
                          No CRM calls recorded today yet.
                        </p>
                      ) : (
                        myCallsToday.map((c) => (
                          <div key={c.Call_ID} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#14263D] truncate">
                                {c.Lead_Name}
                              </p>
                              <p className="text-[11px] text-slate-500 tabular-nums">
                                {c.Call_Type} · {formatShortTime(c.Timestamp)}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-mono font-bold text-[#14263D] tabular-nums">
                                {formatDurationMMSS(c.Duration_Sec)}
                              </p>
                              <span
                                className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                  c.Is_Connected
                                    ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                                    : 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30'
                                }`}
                              >
                                {c.Is_Connected ? 'Connected' : 'Not Connected'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : phoneScreen === 'DETAIL' && selectedLead ? (
              /* LEAD DETAIL & TIMESTAMPED REMARK HISTORY SCREEN */
              <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA]">
                <div className="px-3 py-3 bg-white border-b border-[#D9E1E8] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => setPhoneScreen('HOME')}
                      className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#14263D]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#14263D] truncate">
                        {selectedLead.Name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        +91 {selectedLead.Phone}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDispositionSheet(selectedLead)}
                    className="text-xs font-semibold text-[#256F73] px-2.5 py-1.5 rounded-lg hover:bg-[#256F73]/10 whitespace-nowrap"
                  >
                    Update Stage
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto thin-scrollbar p-3.5 space-y-3">
                  <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Stage</span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getStatusTone(
                          selectedLead.Status
                        )}`}
                      >
                        {selectedLead.Status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Campaign</span>
                      <span className="font-semibold text-[#14263D]">{selectedLead.Campaign_Source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Config / Location</span>
                      <span className="font-medium text-[#14263D]">
                        {selectedLead.Config_Requirement} · {selectedLead.Preferred_Location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Budget / Created By</span>
                      <span className="font-medium text-[#14263D]">
                        {selectedLead.Budget} · {selectedLead.Created_By}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Follow-Up</span>
                      <span className="font-medium text-[#14263D] tabular-nums">
                        {formatShortTime(selectedLead.Next_Follow_Up_At)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Called / WA Sent</span>
                      <span className="font-medium text-[#14263D] tabular-nums">
                        {selectedLead.Last_Called_At ? formatShortTime(selectedLead.Last_Called_At) : 'Not called'} ·{' '}
                        {selectedLead.WhatsApp_Shared_Count}
                      </span>
                    </div>
                  </div>

                  {/* Quick Call & WhatsApp Actions */}
                  <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3.5 space-y-2">
                    <p className="text-xs font-semibold text-[#14263D]">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => triggerLeadCallFlow(selectedLead, 48, 'OUTGOING')}
                        className="h-10 rounded-xl bg-[#256F73] hover:bg-[#1e5c5f] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call (48s Conn.)
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerLeadCallFlow(selectedLead, 9, 'OUTGOING')}
                        className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#14263D] text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <PhoneMissed className="w-3.5 h-3.5" />
                        Call (9s No Ans)
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => openWhatsAppPicker(selectedLead)}
                      className="w-full h-10 rounded-xl border border-[#256F73] text-[#256F73] hover:bg-[#256F73]/5 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Send on WhatsApp ({selectedLead.WhatsApp_Shared_Count})
                    </button>
                  </div>

                  {/* Timestamped Remark History & Append Box */}
                  <div className="bg-white border border-[#D9E1E8] rounded-2xl p-3.5 space-y-2.5">
                    <h4 className="text-xs font-semibold text-[#14263D]">
                      Remark History (Append-Only)
                    </h4>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={detailRemarkInput}
                        onChange={(e) => setDetailRemarkInput(e.target.value)}
                        placeholder="Add remark (auto-stamped)..."
                        className="flex-1 h-9 px-2.5 text-xs bg-[#F5F7FA] border border-[#D9E1E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#256F73]"
                      />
                      <button
                        type="button"
                        disabled={!detailRemarkInput.trim()}
                        onClick={() => {
                          onAppendRemark(selectedLead.Lead_ID, activeUser.Name, detailRemarkInput);
                          setDetailRemarkInput('');
                        }}
                        className="h-9 px-3 rounded-xl bg-[#256F73] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold shrink-0"
                      >
                        Append
                      </button>
                    </div>
                    <div className="bg-[#F5F7FA] border border-[#D9E1E8] rounded-xl p-2.5 text-[11px] text-[#14263D] whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto thin-scrollbar">
                      {selectedLead.Notes || 'No remarks recorded yet.'}
                    </div>
                  </div>

                  {/* Call History for Lead */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#14263D] mb-1.5 px-0.5">
                      CRM Call History
                    </h4>
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl divide-y divide-slate-100">
                      {callLogs.filter((c) => c.Lead_ID === selectedLead.Lead_ID).length === 0 ? (
                        <p className="p-3 text-xs text-slate-500">No calls logged for this lead.</p>
                      ) : (
                        callLogs
                          .filter((c) => c.Lead_ID === selectedLead.Lead_ID)
                          .map((c) => (
                            <div key={c.Call_ID} className="px-3 py-2 flex justify-between text-xs">
                              <span className="text-slate-700">
                                {c.Call_Type} · {formatShortTime(c.Timestamp)}
                              </span>
                              <span
                                className={`font-mono font-semibold tabular-nums ${
                                  c.Is_Connected ? 'text-[#10B981]' : 'text-[#D97706]'
                                }`}
                              >
                                {formatDurationMMSS(c.Duration_Sec)}
                              </span>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* TELECALLER HOME SCREEN (4 QUEUE TABS + CAMPAIGN CHIPS + SEARCH + SYNC NOW + FAB) */
              <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F7FA]">
                {/* Top App Bar */}
                <div className="px-3.5 py-2.5 bg-white border-b border-[#D9E1E8] flex items-center justify-between gap-2 shrink-0">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#14263D] truncate">
                      {activeUser.Name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {activeUser.Role === 'ADMIN' ? 'Admin View' : 'Telecaller · Sheet Restricted'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={triggerManualSyncInPhone}
                      className={`h-7 px-2 rounded-lg border text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap ${
                        pendingSyncs.length > 0
                          ? 'bg-[#D97706]/10 border-[#D97706]/30 text-[#D97706]'
                          : 'bg-white border-[#D9E1E8] text-[#256F73]'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sync ({pendingSyncs.length})
                    </button>
                    {activeUser.Role === 'ADMIN' ? (
                      <button
                        type="button"
                        onClick={() => setPhoneScreen('MANAGER_DASHBOARD')}
                        className="px-2 py-1 text-xs font-semibold text-[#256F73] hover:bg-[#256F73]/10 rounded-lg whitespace-nowrap"
                      >
                        Dashboard
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPhoneScreen('DAILY_REPORT')}
                        className="px-2 py-1 text-xs font-semibold text-[#256F73] hover:bg-[#256F73]/10 rounded-lg whitespace-nowrap"
                      >
                        Report
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveUser(null)}
                      className="px-1.5 py-1 text-xs font-medium text-slate-500 hover:text-[#14263D]"
                    >
                      Out
                    </button>
                  </div>
                </div>

                {/* Search + Queue Tabs + Campaign Filter Chip Bar */}
                <div className="px-3.5 pt-2.5 pb-2 bg-white border-b border-[#D9E1E8] shrink-0 space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, phone, location, campaign..."
                      className="w-full h-9 pl-8 pr-3 text-xs bg-[#F5F7FA] border border-[#D9E1E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#256F73]"
                    />
                  </div>

                  {/* 4 Queue Tabs */}
                  <div className="flex gap-1 overflow-x-auto thin-scrollbar pb-0.5">
                    {(
                      [
                        "Today's Follow-Ups",
                        'Overdue',
                        'Site Visits',
                        'All Leads',
                      ] as QueueTab[]
                    ).map((tab) => {
                      const active = queueTab === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setQueueTab(tab)}
                          className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                            active
                              ? 'bg-[#256F73] text-white'
                              : 'bg-[#F5F7FA] text-slate-600 hover:text-[#14263D]'
                          }`}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  {/* Campaign Filter Chip Bar */}
                  <div className="flex gap-1.5 overflow-x-auto thin-scrollbar pb-0.5">
                    {CAMPAIGN_FILTERS.map((camp) => {
                      const active = selectedCampaign === camp;
                      return (
                        <button
                          key={camp}
                          type="button"
                          onClick={() => setSelectedCampaign(camp)}
                          className={`px-2.5 py-1 text-[10px] font-semibold rounded-md border whitespace-nowrap shrink-0 transition-colors ${
                            active
                              ? 'bg-[#14263D] border-[#14263D] text-white'
                              : 'bg-white border-[#D9E1E8] text-slate-600 hover:border-[#256F73]'
                          }`}
                        >
                          {camp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lead Cards List (CrmLeadCard) */}
                <div className="flex-1 overflow-y-auto thin-scrollbar p-3 space-y-2.5 pb-20">
                  {filteredQueueLeads.length === 0 ? (
                    <div className="bg-white border border-[#D9E1E8] rounded-2xl p-6 text-center space-y-2">
                      <p className="text-xs font-medium text-[#14263D]">
                        No leads in {queueTab}
                        {selectedCampaign !== 'All' ? ` (${selectedCampaign})` : ''}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setQueueTab('All Leads');
                          setSelectedCampaign('All');
                        }}
                        className="text-xs font-semibold text-[#256F73] hover:underline"
                      >
                        Reset Filters &amp; View All Leads
                      </button>
                    </div>
                  ) : (
                    filteredQueueLeads.map((lead) => (
                      <div
                        key={lead.Lead_ID}
                        className="bg-white border border-[#D9E1E8] rounded-2xl p-3.5 space-y-2"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLeadId(lead.Lead_ID);
                            setPhoneScreen('DETAIL');
                          }}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-sm font-bold text-[#14263D] block truncate">
                                {lead.Name}
                              </span>
                              <span className="text-[10px] font-semibold text-[#D69E48] uppercase tracking-wide">
                                {lead.Campaign_Source}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${getStatusTone(
                                lead.Status
                              )}`}
                            >
                              {lead.Status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#46566A] mt-1 truncate">
                            {lead.Config_Requirement} · {lead.Preferred_Location} · {lead.Budget}
                          </p>
                          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 mt-1.5 tabular-nums">
                            <span>
                              Last Called:{' '}
                              {lead.Last_Called_At ? formatShortTime(lead.Last_Called_At) : 'Not called'}
                            </span>
                            {lead.Next_Follow_Up_At && (
                              <span className="flex items-center gap-1 text-[#256F73] font-medium">
                                <Clock className="w-3 h-3" />
                                {formatShortTime(lead.Next_Follow_Up_At)}
                              </span>
                            )}
                          </div>
                        </button>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => triggerLeadCallFlow(lead, 42, 'OUTGOING')}
                            className="h-9 rounded-xl bg-[#256F73] hover:bg-[#1e5c5f] text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call
                          </button>
                          <button
                            type="button"
                            onClick={() => openWhatsAppPicker(lead)}
                            className="h-9 rounded-xl border border-[#D9E1E8] hover:bg-[#F5F7FA] text-[#14263D] text-xs font-semibold flex items-center justify-center gap-1.5 tabular-nums"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#10B981]" />
                            WhatsApp ({lead.WhatsApp_Shared_Count})
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Floating Add Lead Button */}
                <button
                  type="button"
                  onClick={() => setShowAddLead(true)}
                  className="absolute bottom-4 right-4 h-11 px-4 rounded-2xl bg-[#14263D] hover:bg-[#0f1d30] text-white text-xs font-semibold shadow-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Lead
                </button>
              </div>
            )}

            {/* SYNC STATUS TOAST INSIDE PHONE */}
            {syncToast && (
              <div className="absolute inset-x-3 top-14 z-30 bg-[#14263D] text-white rounded-xl px-3 py-2 shadow-lg text-xs font-medium text-center">
                {syncToast}
              </div>
            )}

            {/* ACTIVE CALL TOAST BANNER */}
            {activeCallBanner && (
              <div className="absolute inset-x-3 top-3 z-30 bg-slate-900 text-white rounded-2xl p-3 shadow-lg flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">{activeCallBanner.lead.Name}</p>
                  <p className="text-[11px] text-slate-300">{activeCallBanner.statusText}</p>
                </div>
              </div>
            )}

            {/* POST-CALL DISPOSITION BOTTOM SHEET */}
            {dispositionLead && (
              <div className="absolute inset-0 z-40 bg-black/50 flex flex-col justify-end">
                <div className="bg-white rounded-t-3xl p-4 max-h-[88%] overflow-y-auto thin-scrollbar space-y-3">
                  <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1" />
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Post-Call Disposition
                      </h4>
                      <p className="text-xs text-slate-500">
                        {dispositionLead.Name} · {dispositionLead.Project_Interest}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDispositionLead(null)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Pipeline Stage
                    </label>
                    <select
                      value={dispStage}
                      onChange={(e) => setDispStage(e.target.value as PipelineStage)}
                      className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      {PIPELINE_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Next Follow-Up Date &amp; Time{' '}
                      {requiresFollowUp ? '(Mandatory)' : '(Optional)'}
                    </label>
                    <input
                      type="datetime-local"
                      value={dispNextFollowUp}
                      onChange={(e) => setDispNextFollowUp(e.target.value)}
                      className={`w-full h-10 px-3 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 ${
                        requiresFollowUp && !dispNextFollowUp
                          ? 'border-red-400 focus:ring-red-500'
                          : 'border-slate-300 focus:ring-emerald-600'
                      }`}
                    />
                    {requiresFollowUp && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        Schedules local notification 15 minutes before due time.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#14263D] mb-1">
                      Add New Remark (Appended to Timeline)
                    </label>
                    <textarea
                      rows={2}
                      value={dispNotes}
                      onChange={(e) => setDispNotes(e.target.value)}
                      placeholder="Key discussion points, budget feedback..."
                      className="w-full p-2.5 text-xs bg-white border border-[#D9E1E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#256F73]"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Stamped as [DD/MM hh:mm a - {activeUser?.Name}]: note
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openWhatsAppPicker(dispositionLead)}
                      className="h-10 rounded-xl border border-[#256F73] text-[#256F73] text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Send WhatsApp
                    </button>
                    <button
                      type="button"
                      disabled={!isDispositionValid || !activeUser}
                      onClick={() => {
                        if (!activeUser) return;
                        const iso = dispNextFollowUp
                          ? new Date(dispNextFollowUp).toISOString()
                          : '';
                        onSaveDisposition(
                          dispositionLead.Lead_ID,
                          dispStage,
                          iso,
                          dispNotes,
                          activeUser.Name
                        );
                        setDispositionLead(null);
                      }}
                      className="h-10 rounded-xl bg-[#256F73] disabled:bg-slate-300 text-white text-xs font-semibold"
                    >
                      Save &amp; Schedule
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ONE-TAP WHATSAPP SHARE BOTTOM SHEET (TEMPLATES + CUSTOM MESSAGE) */}
            {whatsAppLead && activeUser && (
              <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end">
                <div className="bg-white rounded-t-3xl p-4 max-h-[88%] overflow-y-auto thin-scrollbar space-y-3">
                  <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1" />
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#14263D]">
                        Send Project Details on WhatsApp
                      </h4>
                      <p className="text-xs text-slate-500">
                        To: {whatsAppLead.Name} (+91 {normalizePhone10(whatsAppLead.Phone)})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWhatsAppLead(null)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mode Switcher: Project Templates vs Custom Message */}
                  <div className="grid grid-cols-2 gap-1.5 bg-[#F5F7FA] p-1 rounded-xl border border-[#D9E1E8]">
                    <button
                      type="button"
                      onClick={() => setWhatsAppMode('TEMPLATE')}
                      className={`h-8 text-xs font-semibold rounded-lg transition-colors ${
                        whatsAppMode === 'TEMPLATE'
                          ? 'bg-white text-[#14263D] shadow-sm'
                          : 'text-slate-500 hover:text-[#14263D]'
                      }`}
                    >
                      Project Templates
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhatsAppMode('CUSTOM')}
                      className={`h-8 text-xs font-semibold rounded-lg transition-colors ${
                        whatsAppMode === 'CUSTOM'
                          ? 'bg-white text-[#14263D] shadow-sm'
                          : 'text-slate-500 hover:text-[#14263D]'
                      }`}
                    >
                      Custom Message
                    </button>
                  </div>

                  {whatsAppMode === 'TEMPLATE' ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#14263D] mb-1">
                          Select Project Template
                        </label>
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          className="w-full h-10 px-3 text-xs bg-white border border-[#D9E1E8] rounded-xl"
                        >
                          {templates.map((t) => (
                            <option key={t.Template_ID} value={t.Template_ID}>
                              {t.Project_Name} — {t.Title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {activeTemplate && (
                        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-3 text-[11px] text-[#14263D] whitespace-pre-wrap leading-relaxed">
                          {resolvedWaBody}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#14263D] mb-1">
                        Custom WhatsApp Message
                      </label>
                      <textarea
                        rows={4}
                        value={customWaMessage}
                        onChange={(e) => setCustomWaMessage(e.target.value)}
                        placeholder="Type your custom follow-up message..."
                        className="w-full p-2.5 text-xs bg-white border border-[#D9E1E8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#256F73]"
                      />
                    </div>
                  )}

                  <div className="bg-[#F5F7FA] border border-[#D9E1E8] rounded-xl p-2 text-[10px] font-mono text-slate-600 break-all">
                    {generatedWaMeUrl.slice(0, 110)}...
                  </div>

                  <button
                    type="button"
                    disabled={!resolvedWaBody.trim()}
                    onClick={() => {
                      const tplPayload: ProjectTemplate =
                        whatsAppMode === 'CUSTOM'
                          ? {
                              Template_ID: 'TPL_CUSTOM',
                              Project_Name: 'Custom Message',
                              Title: 'Custom Message',
                              Message_Body: customWaMessage,
                              Brochure_Url: '',
                            }
                          : activeTemplate;
                      if (tplPayload) {
                        onLogWhatsApp(
                          activeUser.User_ID,
                          whatsAppLead,
                          tplPayload,
                          generatedWaMeUrl
                        );
                      }
                      setWhatsAppLead(null);
                    }}
                    className="w-full h-11 rounded-xl bg-[#256F73] hover:bg-[#1e5c5f] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Log WhatsApp Share &amp; Launch wa.me
                  </button>
                </div>
              </div>
            )}

            {/* ADD WALK-IN / REFERRAL LEAD BOTTOM SHEET */}
            {showAddLead && activeUser && (
              <div className="absolute inset-0 z-40 bg-black/50 flex flex-col justify-end">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!isAddLeadValid) return;
                    const createdByLabel =
                      activeUser.Role === 'ADMIN' ? 'Admin' : activeUser.Name;
                    onAddLead({
                      Name: newName.trim(),
                      Phone: normalizePhone10(newPhone),
                      Project_Interest: newProject,
                      Campaign_Source: newSource,
                      Config_Requirement: newConfig.trim() || '3 BHK',
                      Preferred_Location: newLocation.trim() || 'Magarpatta / Hadapsar',
                      Budget: newBudget || '₹1.25 Cr',
                      Assigned_To: activeUser.User_ID,
                      Status: newStatus,
                      Next_Follow_Up_At: newFollowUp ? new Date(newFollowUp).toISOString() : '',
                      Notes: newNotes.trim()
                        ? appendRemarkTimeline('', activeUser.Name, newNotes)
                        : '',
                      Created_By: createdByLabel,
                    });
                    setNewName('');
                    setNewPhone('');
                    setNewBudget('');
                    setNewStatus('New');
                    setNewNotes('');
                    setShowAddLead(false);
                  }}
                  className="bg-white rounded-t-3xl p-4 max-h-[88%] overflow-y-auto thin-scrollbar space-y-2.5"
                >
                  <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1" />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#14263D]">
                      Add Walk-In / Referral Lead
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddLead(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    required
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Lead Full Name"
                    className="w-full h-9 px-3 text-xs border border-[#D9E1E8] rounded-xl"
                  />
                  <input
                    required
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="10-Digit Mobile Number"
                    className="w-full h-9 px-3 text-xs font-mono border border-[#D9E1E8] rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      className="h-9 px-2.5 text-xs border border-[#D9E1E8] rounded-xl bg-white"
                    >
                      {templates.map((t) => (
                        <option key={t.Template_ID} value={t.Project_Name}>
                          {t.Project_Name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="h-9 px-2.5 text-xs border border-[#D9E1E8] rounded-xl bg-white"
                    >
                      <option value="Magarpatta Residents">Magarpatta Residents</option>
                      <option value="Burgundy">Burgundy</option>
                      <option value="Godrej">Godrej</option>
                      <option value="Kharadi Kohinoor">Kharadi Kohinoor</option>
                      <option value="Prospects">Prospects</option>
                      <option value="Walk-In">Walk-In</option>
                      <option value="Referral">Referral</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newConfig}
                      onChange={(e) => setNewConfig(e.target.value)}
                      placeholder="Config (e.g., 3 BHK)"
                      className="h-9 px-3 text-xs border border-[#D9E1E8] rounded-xl"
                    />
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Preferred Location"
                      className="h-9 px-3 text-xs border border-[#D9E1E8] rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      placeholder="Budget (e.g., ₹1.60 Cr)"
                      className="h-9 px-3 text-xs border border-[#D9E1E8] rounded-xl"
                    />
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as PipelineStage)}
                      className="h-9 px-2.5 text-xs border border-[#D9E1E8] rounded-xl bg-white"
                    >
                      {PIPELINE_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Next Follow-Up Date &amp; Time{' '}
                      {addLeadRequiresFollowUp ? '(Mandatory for this stage)' : '(Optional)'}
                    </label>
                    <input
                      type="datetime-local"
                      value={newFollowUp}
                      onChange={(e) => setNewFollowUp(e.target.value)}
                      className={`w-full h-9 px-3 text-xs border rounded-xl ${
                        addLeadRequiresFollowUp && !newFollowUp
                          ? 'border-[#EF4444]'
                          : 'border-[#D9E1E8]'
                      }`}
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Initial remark (auto-stamped)..."
                    className="w-full p-2.5 text-xs border border-[#D9E1E8] rounded-xl"
                  />
                  <button
                    type="submit"
                    disabled={!isAddLeadValid}
                    className="w-full h-10 rounded-xl bg-[#256F73] hover:bg-[#1e5c5f] disabled:bg-slate-300 text-white text-xs font-semibold"
                  >
                    Save Lead (Created_By = {activeUser.Role === 'ADMIN' ? 'Admin' : activeUser.Name})
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Synchronized Room DB, CallLogSyncWorker Simulator & Manager Controls */}
      <div className="space-y-5 min-w-0">
        {/* Network & Sync Control Strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900">
              Offline-First Room Database &amp; Apps Script Sync
            </h3>
            <p className="text-xs text-slate-500">
              {isOnline
                ? 'Device Online · WorkManager auto-syncing to Google Apps Script Web App'
                : `Device Offline · ${pendingSyncCount} local mutations queued safely in Room`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleOnline}
              className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                isOnline
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline Mode'}
            </button>
            <button
              type="button"
              onClick={onSyncNow}
              disabled={!isOnline || pendingSyncCount === 0}
              className="h-9 px-3.5 rounded-xl bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Flush Sync ({pendingSyncCount})
            </button>
          </div>
        </div>

        {/* Inspector Segmented Tabs */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-4 pt-3 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1 pb-3">
              {[
                { id: 'CALL_SIM', label: 'CallLogSyncWorker Tester' },
                { id: 'ROOM_CACHE', label: 'Daily Reports & Sync Stream' },
                { id: 'REMINDERS', label: '15-Min Follow-Up Alarms' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setInspectorTab(t.id as typeof inspectorTab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    inspectorTab === t.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {inspectorTab === 'CALL_SIM' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Simulated CallLog.Calls.NUMBER
                    </label>
                    <input
                      type="text"
                      value={customCallPhone}
                      onChange={(e) => setCustomCallPhone(e.target.value)}
                      placeholder="+91 9820112233 or personal 9811199999"
                      className="w-full h-9 px-3 text-xs font-mono border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Type &amp; Duration (sec)
                    </label>
                    <div className="flex gap-1.5">
                      <select
                        value={customCallType}
                        onChange={(e) => setCustomCallType(e.target.value as AndroidCallType)}
                        className="h-9 px-2 text-xs border border-slate-300 rounded-xl bg-white flex-1"
                      >
                        <option value="OUTGOING">OUT</option>
                        <option value="INCOMING">IN</option>
                        <option value="MISSED">MISSED</option>
                        <option value="REJECTED">REJECT</option>
                      </select>
                      <input
                        type="number"
                        min={0}
                        value={customCallDuration}
                        onChange={(e) => setCustomCallDuration(Number(e.target.value))}
                        className="w-16 h-9 px-2 text-xs font-mono border border-slate-300 rounded-xl tabular-nums"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const callerId =
                        activeUser?.Role === 'TELECALLER' ? activeUser.User_ID : 'USR_101';
                      const matched = onSimulateCall(
                        callerId,
                        customCallPhone,
                        customCallType,
                        customCallType === 'MISSED' || customCallType === 'REJECTED'
                          ? 0
                          : customCallDuration
                      );
                      if (matched) openDispositionSheet(matched);
                    }}
                    className="h-9 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap"
                  >
                    Run CallLogSyncWorker
                  </button>
                </div>

                {/* Preset Test Cases */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500">Quick Scenarios:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCallPhone('+91 98201-12233');
                      setCustomCallType('OUTGOING');
                      setCustomCallDuration(65);
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                  >
                    CRM Connected (65s)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCallPhone('09845001122');
                      setCustomCallType('OUTGOING');
                      setCustomCallDuration(8);
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                  >
                    CRM Not Connected (8s &lt; 15s)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomCallPhone('9811199999');
                      setCustomCallType('INCOMING');
                      setCustomCallDuration(180);
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                  >
                    Personal Number (Ignored)
                  </button>
                </div>

                {/* Room pending_sync Queue + Sync Event Log Table */}
                {pendingSyncs.length > 0 && (
                  <div className="border border-amber-200 bg-amber-50/40 rounded-xl overflow-hidden">
                    <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200 text-xs font-semibold text-amber-900">
                      Room pending_sync Queue ({pendingSyncs.length} awaiting operationId ACK)
                    </div>
                    <div className="divide-y divide-amber-100 max-h-40 overflow-y-auto thin-scrollbar">
                      {pendingSyncs.map((item) => (
                        <div key={item.operationId} className="px-3.5 py-2 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <span className="font-mono font-semibold text-slate-900">{item.action}</span>
                            <span className="text-slate-400 mx-1.5">·</span>
                            <span className="text-slate-700 truncate">{item.summary}</span>
                          </div>
                          <span className="font-mono text-[11px] text-amber-800 shrink-0 tabular-nums">
                            {item.operationId} (retry: {item.retryCount})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sync Event Log Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 text-xs font-semibold text-slate-700">
                    AppsScriptSyncProtocol &amp; Worker Activity
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto thin-scrollbar">
                    {syncEvents.slice(0, 8).map((ev) => (
                      <div key={ev.id} className="px-3.5 py-2.5 flex items-start justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{ev.entity}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-700">{ev.action}</span>
                            <span className="text-slate-400">·</span>
                            <span className="font-mono text-[10px] text-slate-500">{ev.operationId}</span>
                          </div>
                          <p className="text-slate-500 mt-0.5 truncate">{ev.detail}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-[11px] font-semibold ${
                              ev.status === 'SYNCED'
                                ? 'text-emerald-700'
                                : ev.status === 'QUEUED_OFFLINE'
                                  ? 'text-amber-700'
                                  : 'text-slate-500'
                            }`}
                          >
                            {ev.status === 'SYNCED'
                              ? 'ACK Verified'
                              : ev.status === 'QUEUED_OFFLINE'
                                ? 'Queued in Room'
                                : 'Ignored (Non-CRM)'}
                          </span>
                          <div className="text-[10px] text-slate-400 tabular-nums">
                            {formatShortTime(ev.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {inspectorTab === 'ROOM_CACHE' && (
              <div className="space-y-4">
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Telecaller</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Attempted</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Connected (&ge;15s)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Not Conn.</th>
                        <th className="py-2.5 px-3 font-semibold text-right">WhatsApp</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Calling Hours</th>
                        <th className="py-2.5 px-3 font-semibold text-right">FU Done / Pend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 tabular-nums">
                      {dailyReports.map((r) => (
                        <tr key={r.Telecaller_ID} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {r.Telecaller_Name}
                          </td>
                          <td className="py-2.5 px-3 text-right">{r.Total_Calls_Attempted}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                            {r.Connected_Calls}
                          </td>
                          <td className="py-2.5 px-3 text-right text-amber-700">
                            {r.Not_Connected_Calls}
                          </td>
                          <td className="py-2.5 px-3 text-right">{r.WhatsApp_Details_Shared}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold">
                            {r.Total_Calling_Hours}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {r.Follow_Ups_Completed} / {r.Follow_Ups_Pending}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Admin Lead Reassignment Matrix */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Master Leads Tab Preview ({leads.length} rows)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Telecallers only sync rows matching Assigned_To
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto thin-scrollbar">
                    {leads.map((l) => (
                      <div key={l.Lead_ID} className="px-3.5 py-2 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900">{l.Name}</span>
                          <span className="text-slate-400 mx-1.5">·</span>
                          <span className="font-mono text-slate-600 tabular-nums">{l.Phone}</span>
                          <span className="text-slate-400 mx-1.5">·</span>
                          <span className="text-slate-600">{l.Status}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={l.Assigned_To}
                            onChange={(e) => onReassignLead(l.Lead_ID, e.target.value)}
                            className="h-7 px-2 text-[11px] border border-slate-200 rounded-lg bg-white"
                          >
                            {users
                              .filter((u) => u.Role === 'TELECALLER')
                              .map((tc) => (
                                <option key={tc.User_ID} value={tc.User_ID}>
                                  {tc.Name}
                                </option>
                              ))}
                          </select>
                          <span
                            className={`text-[10px] font-medium ${
                              l.Synced_To_Sheet ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {l.Synced_To_Sheet ? 'Synced' : 'Local'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {inspectorTab === 'REMINDERS' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Every follow-up scheduled via Post-Call Disposition or Add Lead triggers an{' '}
                  <code className="font-mono text-slate-900 bg-slate-100 px-1 py-0.5 rounded">
                    AlarmManager
                  </code>{' '}
                  notification 15 minutes prior to <code className="font-mono">Next_Follow_Up_At</code>.
                </p>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto thin-scrollbar">
                  {followUps.map((fu) => {
                    const lead = leads.find((l) => l.Lead_ID === fu.Lead_ID);
                    const dueMs = new Date(fu.Scheduled_At).getTime();
                    const alarmIso = !Number.isNaN(dueMs)
                      ? new Date(dueMs - 15 * 60 * 1000).toISOString()
                      : '';
                    return (
                      <div key={fu.FollowUp_ID} className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {lead?.Name || fu.Lead_ID} · {fu.Outcome_Stage}
                          </p>
                          <p className="text-slate-500 truncate">{fu.Notes || 'Scheduled follow-up'}</p>
                        </div>
                        <div className="text-right shrink-0 tabular-nums">
                          <p className="font-medium text-slate-900">
                            Due: {formatShortTime(fu.Scheduled_At)}
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            {fu.Status === 'COMPLETED'
                              ? 'Completed'
                              : `Alert @ ${formatShortTime(alarmIso)}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
