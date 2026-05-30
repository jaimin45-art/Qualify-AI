import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { triggerOutboundCall } from "../lib/api";

const LEAD_SOURCES = [
  "our website enquiry form",
  "Zillow lead",
  "Realtor.com enquiry",
  "Facebook lead ad",
  "direct referral",
  "open house sign-in",
  "other",
];

export default function NewCall() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    owner_name:       "",
    property_address: "",
    lead_source:      LEAD_SOURCES[0],
    to_number:        "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await triggerOutboundCall(form);
      setSuccess(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 max-w-xl">
        <div className="card border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-white font-semibold">Call Initiated!</h2>
          </div>
          <p className="text-slate-400 text-sm mb-1">
            <span className="text-white">{form.owner_name}</span> is being called now.
          </p>
          <p className="text-slate-500 text-xs font-mono mb-4">
            Call ID: {success.call_id}
          </p>
          <div className="flex gap-3">
            <button
              className="btn-primary text-sm"
              onClick={() => navigate(`/calls/${success.call_id}`)}
            >
              View Call →
            </button>
            <button
              className="btn-secondary text-sm"
              onClick={() => { setSuccess(null); setForm({ owner_name: "", property_address: "", lead_source: LEAD_SOURCES[0], to_number: "" }); }}
            >
              New Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Trigger Outbound Call</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Initiate a new AI-powered lead qualification call
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Owner name */}
        <div>
          <label className="label">Homeowner First Name *</label>
          <input
            className="input"
            placeholder="e.g. Sarah"
            value={form.owner_name}
            onChange={(e) => set("owner_name", e.target.value)}
            required
          />
        </div>

        {/* Property */}
        <div>
          <label className="label">Property Address *</label>
          <input
            className="input"
            placeholder="e.g. 142 Maple Street, Austin TX 78701"
            value={form.property_address}
            onChange={(e) => set("property_address", e.target.value)}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="label">Phone Number (E.164) *</label>
          <input
            className="input"
            placeholder="+1XXXXXXXXXX"
            value={form.to_number}
            onChange={(e) => set("to_number", e.target.value)}
            required
          />
          <p className="text-xs text-slate-600 mt-1.5">
            ⚠️ Twilio free trial: only verified numbers can be called.
          </p>
        </div>

        {/* Lead source */}
        <div>
          <label className="label">Lead Source</label>
          <select
            className="input"
            value={form.lead_source}
            onChange={(e) => set("lead_source", e.target.value)}
          >
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Initiating call…" : "📞 Start Call"}
        </button>
      </form>

      {/* Info box */}
      <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <p className="text-xs text-slate-500 leading-relaxed">
          This triggers a live outbound call through Retell AI + Twilio. The AI agent
          will introduce itself, confirm interest in selling, ask qualifying questions,
          pull a property estimate, and schedule a follow-up if the lead is qualified.
        </p>
      </div>
    </div>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}