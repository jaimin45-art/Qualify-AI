import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCall } from "../lib/api";
import { QualifiedBadge, SentimentBadge, StatusBadge, TimelineBadge } from "../components/Badges";
import { format } from "date-fns";

export default function CallDetail() {
  const { callId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetchCall(callId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [callId]);

  if (loading) return <Loader />;
  if (error)   return <div className="p-8 text-red-400">{error}</div>;
  if (!data)   return <div className="p-8 text-slate-400">Call not found</div>;

  const { call, transcript } = data;
  const fmtDate = (d) => d ? format(new Date(d), "MMM d, yyyy HH:mm") : "—";
  const fmtDur  = (s) => s ? `${Math.floor(s / 60)}m ${s % 60}s` : "—";

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Back */}
      <Link to="/calls" className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1">
        ← All Calls
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{call.owner_name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{call.property_address}</p>
          <p className="text-slate-600 text-xs mt-1 font-mono">{call.call_id}</p>
        </div>
        <StatusBadge value={call.status} />
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetaCard label="Qualified">      <QualifiedBadge value={call.qualified} />    </MetaCard>
        <MetaCard label="Sentiment">      <SentimentBadge value={call.call_sentiment} /></MetaCard>
        <MetaCard label="Timeline">       <TimelineBadge  value={call.sell_timeline} /> </MetaCard>
        <MetaCard label="Duration">       <span className="text-white font-mono text-sm">{fmtDur(call.duration_seconds)}</span></MetaCard>
        <MetaCard label="Follow-up">      <BoolBadge value={call.follow_up_required} /></MetaCard>
        <MetaCard label="Lead Source">    <span className="text-slate-300 text-sm">{call.lead_source || "—"}</span></MetaCard>
        <MetaCard label="Agent">          <span className="text-slate-300 text-sm">{call.agent_name || "—"}</span></MetaCard>
        <MetaCard label="Called">         <span className="text-slate-300 text-sm">{fmtDate(call.created_at)}</span></MetaCard>
      </div>

      {/* Analysis details */}
      {(call.motivation || call.objections || call.call_summary) && (
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Post-Call Analysis</h2>
          {call.call_summary && (
            <Field label="Summary" value={call.call_summary} />
          )}
          {call.motivation && (
            <Field label="Motivation" value={call.motivation} />
          )}
          {call.objections && (
            <Field label="Objections" value={call.objections} />
          )}
        </div>
      )}

      {/* Transcript */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">
          Transcript
          {transcript.length > 0 && (
            <span className="text-slate-600 font-normal ml-2">
              {transcript.length} utterances
            </span>
          )}
        </h2>
        {transcript.length === 0 ? (
          <p className="text-slate-600 text-sm">No transcript available yet.</p>
        ) : (
          <div className="space-y-3">
            {transcript.map((u, i) => (
              <div
                key={i}
                className={`flex gap-3 ${u.role === "agent" ? "" : "flex-row-reverse"}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5
                  ${u.role === "agent" ? "bg-brand-600 text-white" : "bg-slate-700 text-slate-300"}`}>
                  {u.role === "agent" ? "A" : "H"}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed
                    ${u.role === "agent"
                      ? "bg-brand-600/15 text-slate-200 border border-brand-600/20"
                      : "bg-slate-800 text-slate-300"
                    }`}
                >
                  {u.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetaCard({ label, children }) {
  return (
    <div className="card py-3">
      <p className="text-xs text-slate-500 mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-slate-300 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function BoolBadge({ value }) {
  if (value === null || value === undefined) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <span className={`text-sm font-medium ${value ? "text-amber-400" : "text-slate-400"}`}>
      {value ? "Yes" : "No"}
    </span>
  );
}

function Loader() {
  return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-slate-500 text-sm animate-pulse">Loading call…</div>
    </div>
  );
}