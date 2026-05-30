import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { fetchAnalytics, fetchCalls } from "../lib/api";

const COLORS = {
  yes:   "#10b981",
  maybe: "#f59e0b",
  no:    "#ef4444",
  positive: "#10b981",
  neutral:  "#64748b",
  negative: "#ef4444",
};

export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [calls, setCalls]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    Promise.all([fetchAnalytics(), fetchCalls(5)])
      .then(([s, c]) => {
        setStats(s);
        setCalls(c.calls || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-slate-500 text-sm animate-pulse">Loading analytics…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-400">
        Error loading analytics: {error}
      </div>
    );
  }

  const qualifiedData = stats
    ? [
        { name: "Qualified", value: stats.qualified, key: "yes" },
        { name: "Maybe",     value: stats.maybe,     key: "maybe" },
        { name: "No",        value: stats.not_qualified, key: "no" },
      ].filter((d) => d.value > 0)
    : [];

  const sentimentData = stats
    ? [
        { name: "Positive", value: stats.sentiment?.positive || 0 },
        { name: "Neutral",  value: stats.sentiment?.neutral  || 0 },
        { name: "Negative", value: stats.sentiment?.negative || 0 },
      ]
    : [];

  const timelineData = stats
    ? [
        { name: "ASAP",         value: stats.timeline?.asap            || 0 },
        { name: "3–6 mo",       value: stats.timeline?.["3_to_6_months"] || 0 },
        { name: "6–12 mo",      value: stats.timeline?.["6_to_12_months"] || 0 },
        { name: "Exploring",    value: stats.timeline?.just_exploring   || 0 },
      ]
    : [];

  const fmtDuration = (s) => {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-0.5">Real estate lead qualification overview</p>
        </div>
        <Link to="/new-call" className="btn-primary text-sm">
          + New Call
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Calls"     value={stats?.total_calls ?? 0} />
        <StatCard
          label="Qualification Rate"
          value={`${stats?.qualified_rate ?? 0}%`}
          accent="text-emerald-400"
        />
        <StatCard label="Follow-ups Due"  value={stats?.follow_up_required ?? 0} accent="text-amber-400" />
        <StatCard label="Avg Duration"    value={fmtDuration(stats?.avg_duration_seconds)} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Qualified pie */}
        <div className="card">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Qualification Breakdown</h2>
          {qualifiedData.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={qualifiedData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {qualifiedData.map((d) => (
                    <Cell key={d.key} fill={COLORS[d.key]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sentiment */}
        <div className="card">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Call Sentiment</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sentimentData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {sentimentData.map((d) => (
                  <Cell key={d.name} fill={COLORS[d.name.toLowerCase()] || "#6366f1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline */}
        <div className="card">
          <h2 className="text-sm font-medium text-slate-300 mb-4">Sell Timeline</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timelineData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent calls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-300">Recent Calls</h2>
          <Link to="/calls" className="text-xs text-brand-400 hover:text-brand-300">
            View all →
          </Link>
        </div>
        <RecentCalls calls={calls} />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="card">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accent || "text-white"}`}>{value}</p>
    </div>
  );
}

function Empty() {
  return <p className="text-slate-600 text-sm text-center py-8">No data yet</p>;
}

function RecentCalls({ calls }) {
  if (!calls.length) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
            <th className="pb-2 font-medium">Owner</th>
            <th className="pb-2 font-medium">Property</th>
            <th className="pb-2 font-medium">Qualified</th>
            <th className="pb-2 font-medium">Timeline</th>
            <th className="pb-2 font-medium">Sentiment</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((c) => (
            <tr key={c.call_id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td className="py-2.5 font-medium">
                <Link to={`/calls/${c.call_id}`} className="text-brand-400 hover:underline">
                  {c.owner_name}
                </Link>
              </td>
              <td className="py-2.5 text-slate-400 truncate max-w-[200px]">{c.property_address}</td>
              <td className="py-2.5">
                <QBadge v={c.qualified} />
              </td>
              <td className="py-2.5 text-slate-400 text-xs">{fmtTimeline(c.sell_timeline)}</td>
              <td className="py-2.5">
                <SBadge v={c.call_sentiment} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Q_COLORS = { yes: "text-emerald-400", no: "text-red-400", maybe: "text-amber-400" };
function QBadge({ v }) {
  if (!v) return <span className="text-slate-600">—</span>;
  return <span className={`font-medium ${Q_COLORS[v] || "text-slate-400"}`}>{v}</span>;
}
function SBadge({ v }) {
  if (!v) return <span className="text-slate-600">—</span>;
  const c = { positive: "text-emerald-400", negative: "text-red-400", neutral: "text-slate-400" };
  return <span className={c[v] || "text-slate-400"}>{v}</span>;
}
function fmtTimeline(t) {
  const m = { asap: "ASAP", "3_to_6_months": "3–6 mo", "6_to_12_months": "6–12 mo", just_exploring: "Exploring" };
  return m[t] || t || "—";
}