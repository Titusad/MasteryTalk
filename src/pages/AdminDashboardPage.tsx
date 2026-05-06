import { SUPABASE_URL, getAuthToken } from "@/services/supabase";
/**
 * ══════════════════════════════════════════════════════════════
 *  MasteryTalk PRO — Admin Dashboard (Internal)
 *
 *  Three sections:
 *  1. Platform KPIs (cards + sessions/day chart)
 *  2. User Table (sortable, with CV status + consent)
 *  3. User Detail (click into: radar, sessions, CV summary)
 * ══════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Activity,
  FileText,
  TrendingUp,
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Shield,
  BarChart3,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  DollarSign,
  Zap,
  AlertTriangle,
  Hash,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { projectId } from "@/../utils/supabase/info";
import { getSupabaseClient } from "@/services/supabase";

/* ─── Types ─── */
interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastSignIn: string;
  sessionsCount: number;
  pillarScores: Record<string, number> | null;
  professionalProficiency: number | null;
  completedLessons: number;
  cvSummary: string | null;
  cvFileName: string | null;
  cvConsentGiven: boolean;
  lastFeedbackAt: string | null;
}

interface AdminKPIs {
  totalUsers: number;
  totalSessions: number;
  activeUsers7d: number;
  avgProficiency: number;
  cvUploads: number;
  cvConsented: number;
  avgPillarScores: Record<string, number>;
  sessionsPerDay: { date: string; count: number }[];
}

interface ApiUsageData {
  totalCost: number;
  totalCalls: number;
  totalTokens: number;
  byService: Record<string, { calls: number; tokens: number; cost: number; chars: number }>;
  byUser: Array<{ userId: string; email: string; calls: number; tokens: number; cost: number }>;
  dailyCosts: Array<{ date: string; cost: number; calls: number }>;
  budgetAlert: { message: string; todayCost: number; budget: number } | null;
}

interface UserDetail {
  user: {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: string;
    lastSignIn: string;
    stats: {
      pillarScores?: Record<string, number>;
      professionalProficiency?: number;
      sessions_count?: number;
      completedLessons?: string[];
    };
    cvSummary: string | null;
    cvFileName: string | null;
    cvConsentGiven: boolean;
    plan: string;
  };
  sessions: Array<{
    id: string;
    scenario: string;
    interlocutor: string;
    scenarioType: string;
    duration: string;
    created_at: string;
    feedback?: { pillarScores?: Record<string, number> } | null;
  }>;
  srCards: Array<{ phrase: string; intervalStep: number; lastScore: number }>;
}

interface AdminDashboardPageProps {
  onBack: () => void;
  getToken?: () => Promise<string>;
}

const BASE = `${SUPABASE_URL}/functions/v1/make-server-08b8658d`;

function makeAdminFetch(getToken: () => Promise<string>) {
  return async function adminFetch(path: string) {
    const token = await getToken();
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${res.status}: ${err}`);
    }
    return res.json();
  };
}

/* ─── Pillar colors ─── */
const PILLAR_COLORS: Record<string, string> = {
  Grammar: "#0ea5e9",
  Vocabulary: "#6366f1",
  Fluency: "#22c55e",
  Pronunciation: "#f59e0b",
  "Professional Tone": "#ec4899",
  Persuasion: "#14b8a6",
};

/* ─── Sort helper ─── */
type SortKey = "displayName" | "sessionsCount" | "professionalProficiency" | "createdAt";

export function AdminDashboardPage({ onBack, getToken: getTokenProp }: AdminDashboardPageProps) {
  const resolveToken = getTokenProp ?? getAuthToken;
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("sessionsCount");
  const [sortAsc, setSortAsc] = useState(false);
  const [view, setView] = useState<"overview" | "detail">("overview");
  const [apiUsage, setApiUsage] = useState<ApiUsageData | null>(null);
  const [activeTab, setActiveTab] = useState<"platform" | "costs" | "feedback">("platform");
  const [feedbackData, setFeedbackData] = useState<{ byType: Record<string, { up: number; down: number }>; totals: { up: number; down: number }; recentNegative: any[] } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token ONCE — concurrent calls cause Web Lock contention in Supabase client
      const token = await resolveToken();
      const adminFetch = makeAdminFetch(() => Promise.resolve(token));

      const [kpiData, userData, usageData, fbData] = await Promise.all([
        adminFetch("/admin/kpis"),
        adminFetch("/admin/users"),
        adminFetch("/admin/api-usage").catch(() => null),
        adminFetch("/admin/content-feedback").catch(() => null),
      ]);
      setKpis(kpiData);
      setUsers(userData.users || []);
      setApiUsage(usageData);
      setFeedbackData(fbData);
    } catch (err: any) {
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  const handleViewUser = async (userId: string) => {
    setDetailLoading(userId);
    try {
      const token = await resolveToken();
      const detail = await makeAdminFetch(() => Promise.resolve(token))(`/admin/users/${userId}`);
      setSelectedUser(detail);
      setView("detail");
    } catch (err: any) {
      console.error("Failed to load user detail:", err);
      alert(`Failed to load user details: ${err.message || err}`);
    } finally {
      setDetailLoading(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [users, search, sortKey, sortAsc]);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ color: "#94a3b8", marginTop: 16 }}>Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <Shield size={48} color="#ef4444" />
        <p style={{ color: "#ef4444", marginTop: 16, fontSize: 18 }}>{error}</p>
        <button onClick={onBack} style={styles.backBtn}>← Back to Dashboard</button>
      </div>
    );
  }

  /* ─── Detail View ─── */
  if (view === "detail" && selectedUser) {
    const u = selectedUser.user;
    const radarData = u.stats.pillarScores
      ? Object.entries(u.stats.pillarScores).map(([name, value]) => ({ name, value }))
      : [];

    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <button onClick={() => setView("overview")} style={styles.backBtn}>
            <ArrowLeft size={18} /> Back to Users
          </button>
          <h3 style={styles.title}>{u.displayName || u.email}</h3>
        </header>

        <div style={styles.content}>
          {/* User info cards */}
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard}>
              <p style={styles.kpiLabel}>Email</p>
              <p style={styles.kpiValue}>{u.email}</p>
            </div>
            <div style={styles.kpiCard}>
              <p style={styles.kpiLabel}>Plan</p>
              <p style={styles.kpiValue}>{u.plan}</p>
            </div>
            <div style={styles.kpiCard}>
              <p style={styles.kpiLabel}>Sessions</p>
              <p style={styles.kpiValue}>{u.stats.sessions_count || 0}</p>
            </div>
            <div style={styles.kpiCard}>
              <p style={styles.kpiLabel}>Proficiency</p>
              <p style={styles.kpiValue}>{u.stats.professionalProficiency || "—"}</p>
            </div>
            <div style={styles.kpiCard}>
              <p style={styles.kpiLabel}>CV</p>
              <p style={styles.kpiValue}>{u.cvFileName || "No upload"}</p>
            </div>
            <div style={styles.kpiCard}>
              <p style={styles.kpiLabel}>CV Consent</p>
              <p style={styles.kpiValue}>{u.cvConsentGiven ? "Yes" : "No"}</p>
            </div>
          </div>

          {/* Radar chart */}
          {radarData.length > 0 && (
            <div style={styles.chartBox}>
              <h3 style={styles.sectionTitle}>Pillar Scores</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* CV Summary */}
          {u.cvSummary && (
            <div style={styles.chartBox}>
              <h3 style={styles.sectionTitle}>CV Summary</h3>
              <p style={{ color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{u.cvSummary}</p>
            </div>
          )}

          {/* Sessions */}
          <div style={styles.chartBox}>
            <h3 style={styles.sectionTitle}>Session History ({selectedUser.sessions.length})</h3>
            {selectedUser.sessions.length === 0 ? (
              <p style={{ color: "#64748b" }}>No sessions yet</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Scenario</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.sessions.slice(0, 20).map((s, i) => (
                      <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                        <td style={styles.td}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}</td>
                        <td style={styles.td}>{s.scenario?.slice(0, 60) || "—"}</td>
                        <td style={styles.td}>{s.scenarioType || "—"}</td>
                        <td style={styles.td}>{s.duration || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SR Cards */}
          {selectedUser.srCards.length > 0 && (
            <div style={styles.chartBox}>
              <h3 style={styles.sectionTitle}>SR Cards ({selectedUser.srCards.length})</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {selectedUser.srCards.map((card, i) => (
                  <span key={i} style={styles.srTag}>{card.phrase}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─── Overview ─── */
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Shield size={24} color="#6366f1" />
          <h1 style={styles.title}>Admin Dashboard</h1>
        </div>
      </header>

      <div style={styles.content}>
        {/* ── KPI Cards ── */}
        {kpis && (
          <>
            <div style={styles.kpiGrid}>
              <KPICard icon={<Users size={20} />} label="Total Users" value={kpis.totalUsers} color="#6366f1" />
              <KPICard icon={<Activity size={20} />} label="Active (7d)" value={kpis.activeUsers7d} color="#22c55e" />
              <KPICard icon={<BarChart3 size={20} />} label="Total Sessions" value={kpis.totalSessions} color="#0ea5e9" />
              <KPICard icon={<TrendingUp size={20} />} label="Avg Proficiency" value={kpis.avgProficiency} color="#f59e0b" />
              <KPICard icon={<FileText size={20} />} label="CV Uploads" value={kpis.cvUploads} color="#ec4899" />
              <KPICard icon={<CheckCircle2 size={20} />} label="CV Consented" value={kpis.cvConsented} color="#10b981" />
            </div>

            {/* Sessions per day chart */}
            <div style={styles.chartBox}>
              <h3 style={styles.sectionTitle}>Sessions per Day (14d)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={kpis.sessionsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Avg pillar scores */}
            {Object.keys(kpis.avgPillarScores).length > 0 && (
              <div style={styles.chartBox}>
                <h3 style={styles.sectionTitle}>Avg Pillar Scores (All Users)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={Object.entries(kpis.avgPillarScores).map(([name, value]) => ({ name, value }))}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Radar dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ── Tab Selector ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab("platform")}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: activeTab === "platform" ? "1px solid #6366f1" : "1px solid #334155",
              background: activeTab === "platform" ? "rgba(99,102,241,0.15)" : "rgba(30,41,59,0.5)",
              color: activeTab === "platform" ? "#a5b4fc" : "#94a3b8",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Platform
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: activeTab === "feedback" ? "1px solid #22c55e" : "1px solid #334155",
              background: activeTab === "feedback" ? "rgba(34,197,94,0.15)" : "rgba(30,41,59,0.5)",
              color: activeTab === "feedback" ? "#86efac" : "#94a3b8",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Content Feedback
          </button>
          <button
            onClick={() => setActiveTab("costs")}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: activeTab === "costs" ? "1px solid #f59e0b" : "1px solid #334155",
              background: activeTab === "costs" ? "rgba(245,158,11,0.15)" : "rgba(30,41,59,0.5)",
              color: activeTab === "costs" ? "#fbbf24" : "#94a3b8",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            API Costs
          </button>
        </div>

        {/* ── Content Feedback Tab ── */}
        {activeTab === "feedback" && (
          <>
            {!feedbackData ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>No feedback data yet.</p>
            ) : (
              <>
                {/* Totals */}
                <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  {[
                    { label: "Total Thumbs Up", value: feedbackData.totals.up, color: "#22c55e" },
                    { label: "Total Thumbs Down", value: feedbackData.totals.down, color: "#ef4444" },
                    {
                      label: "Satisfaction",
                      value: feedbackData.totals.up + feedbackData.totals.down > 0
                        ? `${Math.round((feedbackData.totals.up / (feedbackData.totals.up + feedbackData.totals.down)) * 100)}%`
                        : "—",
                      color: "#6366f1",
                    },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #334155", borderRadius: 12, padding: "16px 24px", flex: 1 }}>
                      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>{stat.label}</p>
                      <p style={{ color: stat.color, fontSize: 28, fontWeight: 700 }}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* By content type */}
                <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #334155", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                  <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>By Content Type</p>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: "#94a3b8", textAlign: "left" }}>
                        <th style={{ paddingBottom: 8, fontWeight: 500 }}>Type</th>
                        <th style={{ paddingBottom: 8, fontWeight: 500 }}>Thumbs Up</th>
                        <th style={{ paddingBottom: 8, fontWeight: 500 }}>Thumbs Down</th>
                        <th style={{ paddingBottom: 8, fontWeight: 500 }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(feedbackData.byType).map(([type, counts]) => {
                        const total = counts.up + counts.down;
                        const pct = total > 0 ? Math.round((counts.up / total) * 100) : 0;
                        return (
                          <tr key={type} style={{ borderTop: "1px solid #1e293b" }}>
                            <td style={{ padding: "10px 0", color: "#e2e8f0" }}>{type.replace(/_/g, " ")}</td>
                            <td style={{ color: "#22c55e" }}>{counts.up}</td>
                            <td style={{ color: "#ef4444" }}>{counts.down}</td>
                            <td style={{ color: pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Recent negative with comments */}
                {feedbackData.recentNegative.length > 0 && (
                  <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #334155", borderRadius: 12, padding: 20 }}>
                    <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Recent Negative Feedback with Comments</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {feedbackData.recentNegative.map((entry: any, i: number) => (
                        <div key={i} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
                            <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>{(entry.contentType ?? "").replace(/_/g, " ")}</span>
                            <span style={{ color: "#475569", fontSize: 12 }}>{entry.contentId}</span>
                            <span style={{ color: "#475569", fontSize: 12, marginLeft: "auto" }}>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}</span>
                          </div>
                          <p style={{ color: "#e2e8f0", fontSize: 13 }}>"{entry.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── API Costs Tab ── */}
        {activeTab === "costs" && apiUsage && (
          <>
            {/* Budget Alert */}
            {apiUsage.budgetAlert && (
              <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                <AlertTriangle size={20} color="#ef4444" />
                <span style={{ color: "#fca5a5", fontSize: 14, fontWeight: 500 }}>{apiUsage.budgetAlert.message}</span>
              </div>
            )}

            {/* Cost KPI Cards */}
            <div style={styles.kpiGrid}>
              <KPICard icon={<DollarSign size={20} />} label="Total Cost (30d)" value={`$${apiUsage.totalCost.toFixed(2)}`} color="#f59e0b" />
              <KPICard icon={<Zap size={20} />} label="API Calls (30d)" value={apiUsage.totalCalls} color="#6366f1" />
              <KPICard icon={<Hash size={20} />} label="Tokens Used" value={apiUsage.totalTokens > 1000000 ? `${(apiUsage.totalTokens / 1000000).toFixed(1)}M` : apiUsage.totalTokens > 1000 ? `${(apiUsage.totalTokens / 1000).toFixed(1)}K` : apiUsage.totalTokens} color="#0ea5e9" />
              <KPICard icon={<Activity size={20} />} label="$/Session Avg" value={kpis && kpis.totalSessions > 0 ? `$${(apiUsage.totalCost / kpis.totalSessions).toFixed(3)}` : "—"} color="#22c55e" />
            </div>

            {/* Daily Cost Chart */}
            {apiUsage.dailyCosts.length > 0 && (
              <div style={styles.chartBox}>
                <h3 style={styles.sectionTitle}>Daily API Cost (30d)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={apiUsage.dailyCosts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
                      formatter={(value: any) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                    />
                    <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Service Breakdown */}
            <div style={styles.chartBox}>
              <h3 style={styles.sectionTitle}>Service Breakdown</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Service</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Calls</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Tokens</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Chars</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(apiUsage.byService).sort(([,a], [,b]) => b.cost - a.cost).map(([svc, data], i) => (
                      <tr key={svc} style={i % 2 === 0 ? styles.trEven : {}}>
                        <td style={styles.td}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 10px", borderRadius: 6, background: svc.includes("openai") ? "rgba(99,102,241,0.15)" : svc === "whisper" ? "rgba(14,165,233,0.15)" : "rgba(245,158,11,0.15)", color: svc.includes("openai") ? "#a5b4fc" : svc === "whisper" ? "#7dd3fc" : "#fcd34d", fontSize: 12, fontWeight: 600 }}>
                            {svc}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>{data.calls.toLocaleString()}</td>
                        <td style={{ ...styles.td, textAlign: "right" }}>{data.tokens > 1000 ? `${(data.tokens / 1000).toFixed(1)}K` : data.tokens}</td>
                        <td style={{ ...styles.td, textAlign: "right" }}>{data.chars > 0 ? data.chars.toLocaleString() : "—"}</td>
                        <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: "#fbbf24" }}>${data.cost.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Per-User Breakdown */}
            {apiUsage.byUser.length > 0 && (
              <div style={styles.chartBox}>
                <h3 style={styles.sectionTitle}>Cost by User</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>User</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Calls</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Tokens</th>
                        <th style={{ ...styles.th, textAlign: "right" }}>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiUsage.byUser.map((u, i) => (
                        <tr key={u.userId} style={i % 2 === 0 ? styles.trEven : {}}>
                          <td style={{ ...styles.td, fontSize: 12 }}>{u.email}</td>
                          <td style={{ ...styles.td, textAlign: "right" }}>{u.calls}</td>
                          <td style={{ ...styles.td, textAlign: "right" }}>{u.tokens > 1000 ? `${(u.tokens / 1000).toFixed(1)}K` : u.tokens}</td>
                          <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: "#fbbf24" }}>${u.cost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!apiUsage.totalCalls && (
              <div style={{ ...styles.chartBox, textAlign: "center", padding: 48 }}>
                <p style={{ color: "#64748b", fontSize: 16 }}>No API usage data yet. Data will appear after the first user session.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "platform" && (
          <>

        {/* ── Users Table ── */}
        <div style={styles.chartBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={styles.sectionTitle}>
              Users ({filteredUsers.length})
            </h3>
            <div style={styles.searchBox}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <SortTh label="Name" field="displayName" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <th style={styles.th}>Email</th>
                  <SortTh label="Sessions" field="sessionsCount" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <SortTh label="Proficiency" field="professionalProficiency" current={sortKey} asc={sortAsc} onClick={handleSort} />
                  <th style={styles.th}>CV</th>
                  <th style={styles.th}>Consent</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={styles.td}>{u.displayName}</td>
                    <td style={{ ...styles.td, fontSize: 12, color: "#94a3b8" }}>{u.email}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>{u.sessionsCount}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {u.professionalProficiency ? `${u.professionalProficiency}%` : "—"}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {u.cvFileName ? <FileText size={14} color="#22c55e" /> : <XCircle size={14} color="#475569" />}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {u.cvConsentGiven
                        ? <CheckCircle2 size={14} color="#22c55e" />
                        : <XCircle size={14} color="#ef4444" />}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <button
                        onClick={() => handleViewUser(u.id)}
                        disabled={detailLoading === u.id}
                        style={{
                          ...styles.viewBtn,
                          opacity: detailLoading === u.id ? 0.6 : 1,
                        }}
                      >
                        {detailLoading === u.id ? (
                          <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #818cf8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                        ) : (
                          <Eye size={14} />
                        )}
                        {detailLoading === u.id ? "Loading..." : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </> /* end platform tab */
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function KPICard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <motion.div
      style={{ ...styles.kpiCard, borderLeft: `3px solid ${color}` }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, color, marginBottom: 8 }}>
        {icon}
        <span style={styles.kpiLabel}>{label}</span>
      </div>
      <p style={styles.kpiValue}>{value}</p>
    </motion.div>
  );
}

function SortTh({ label, field, current, asc, onClick }: {
  label: string; field: SortKey; current: SortKey; asc: boolean; onClick: (k: SortKey) => void;
}) {
  const active = current === field;
  return (
    <th style={{ ...styles.th, cursor: "pointer", userSelect: "none" }} onClick={() => onClick(field)}>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {active ? (asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
      </span>
    </th>
  );
}

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    color: "#e2e8f0",
  },
  header: {
    padding: "20px 32px",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    alignItems: "center",
    gap: 24,
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(12px)",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    color: "#f1f5f9",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(100, 116, 139, 0.15)",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "8px 14px",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  },
  content: {
    padding: "24px 32px",
    maxWidth: 1400,
    margin: "0 auto",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 20,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: 0,
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 700,
    color: "#f1f5f9",
    margin: 0,
  },
  chartBox: {
    background: "rgba(30, 41, 59, 0.7)",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#e2e8f0",
    margin: "0 0 16px 0",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(15, 23, 42, 0.6)",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "8px 12px",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    fontSize: 13,
    outline: "none",
    width: 200,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  th: {
    textAlign: "left" as const,
    padding: "10px 12px",
    borderBottom: "1px solid #334155",
    color: "#94a3b8",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(51, 65, 85, 0.4)",
    color: "#cbd5e1",
  },
  trEven: {
    background: "rgba(15, 23, 42, 0.3)",
  },
  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    borderRadius: 6,
    padding: "4px 10px",
    color: "#818cf8",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
  },
  srTag: {
    background: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    borderRadius: 6,
    padding: "4px 10px",
    color: "#a5b4fc",
    fontSize: 12,
  },
  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #334155",
    borderTopColor: "#6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
