import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCalls } from "../lib/api";
import { QualifiedBadge, SentimentBadge, StatusBadge, TimelineBadge } from "../components/Badges";
import { formatDistanceToNow } from "date-fns";

export default function CallsList() {
  const [calls, setCalls]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setLoading(true);
    fetchCalls(PAGE_SIZE, page * PAGE_SIZE)
      .then((d) => {
        setCalls(d.calls || []);
        setTotal(d.total || 0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">All Calls</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {total} total call{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link to="/new-call" className="btn-primary text-sm">
          + New Call
        </Link>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm animate-pulse">Loading calls…</div>
        ) : error ? (
          <div className="p-8 text-red-400">{error}</div>
        ) : calls.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 text-sm">No calls yet.</p>
            <Link to="/new-call" className="text-brand-400 text-sm hover:underline mt-2 inline-block">
              Trigger your first call →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-800 bg-slate-900/50">
                  <th className="px-5 py-3 font-medium">Owner</th>
                  <th className="px-5 py-3 font-medium">Property</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Qualified</th>
                  <th className="px-5 py-3 font-medium">Timeline</th>
                  <th className="px-5 py-3 font-medium">Sentiment</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((c) => (
                  <tr
                    key={c.call_id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        to={`/calls/${c.call_id}`}
                        className="text-brand-400 hover:text-brand-300 font-medium"
                      >
                        {c.owner_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-400 max-w-[200px] truncate">
                      {c.property_address}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge value={c.status} />
                    </td>
                    <td className="px-5 py-3">
                      <QualifiedBadge value={c.qualified} />
                    </td>
                    <td className="px-5 py-3">
                      <TimelineBadge value={c.sell_timeline} />
                    </td>
                    <td className="px-5 py-3">
                      <SentimentBadge value={c.call_sentiment} />
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">
                      {c.duration_seconds ? `${Math.floor(c.duration_seconds / 60)}m ${c.duration_seconds % 60}s` : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {c.created_at
                        ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-center">
          <button
            className="btn-secondary text-sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Prev
          </button>
          <span className="text-slate-400 text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn-secondary text-sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}