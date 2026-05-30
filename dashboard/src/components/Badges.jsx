import React from "react";
import clsx from "clsx";

const QUALIFIED_STYLES = {
  yes:   "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  no:    "bg-red-500/15 text-red-400 border border-red-500/30",
  maybe: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
};

const SENTIMENT_STYLES = {
  positive: "bg-emerald-500/15 text-emerald-400",
  neutral:  "bg-slate-500/20 text-slate-400",
  negative: "bg-red-500/15 text-red-400",
};

const STATUS_STYLES = {
  initiated:   "bg-slate-500/20 text-slate-400",
  in_progress: "bg-blue-500/15 text-blue-400",
  completed:   "bg-purple-500/15 text-purple-400",
  analyzed:    "bg-emerald-500/15 text-emerald-400",
};

const TIMELINE_LABELS = {
  asap:            "ASAP",
  "3_to_6_months": "3–6 months",
  "6_to_12_months":"6–12 months",
  just_exploring:  "Just exploring",
};

export function QualifiedBadge({ value }) {
  if (!value) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <span className={clsx("badge", QUALIFIED_STYLES[value] || "bg-slate-700 text-slate-400")}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}

export function SentimentBadge({ value }) {
  if (!value) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <span className={clsx("badge", SENTIMENT_STYLES[value] || "bg-slate-700 text-slate-400")}>
      {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}

export function StatusBadge({ value }) {
  if (!value) return null;
  return (
    <span className={clsx("badge", STATUS_STYLES[value] || "bg-slate-700 text-slate-400")}>
      {value.replace("_", " ")}
    </span>
  );
}

export function TimelineBadge({ value }) {
  if (!value) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <span className="badge bg-slate-700/60 text-slate-300">
      {TIMELINE_LABELS[value] || value}
    </span>
  );
}