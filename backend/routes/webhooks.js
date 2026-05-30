const express = require("express");
const { verifyRetellSignature } = require("../middleware/retellAuth");
const supabase = require("../lib/supabase");

const router = express.Router();

router.post("/retell", verifyRetellSignature, async (req, res) => {
  const event = req.body;
  const { event: eventType, call } = event;

  console.log(`📞 Retell webhook: ${eventType} | call_id: ${call?.call_id}`);

  try {
    if (eventType === "call_started") {
      await supabase
        .from("calls")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("call_id", call.call_id);
    }

    if (eventType === "call_ended") {
      await supabase
        .from("calls")
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
          duration_seconds: call.duration_ms ? Math.round(call.duration_ms / 1000) : null,
          disconnection_reason: call.disconnection_reason || null,
        })
        .eq("call_id", call.call_id);

      if (call.transcript_object && Array.isArray(call.transcript_object)) {
        const utterances = call.transcript_object.map((u, idx) => ({
          call_id: call.call_id,
          sequence: idx,
          role: u.role,
          content: u.content,
          words: u.words ? JSON.stringify(u.words) : null,
        }));

        if (utterances.length > 0) {
          await supabase
            .from("transcripts")
            .upsert(utterances, { onConflict: "call_id,sequence" });
        }
      }
    }

    if (eventType === "call_analyzed") {
      const analysis = call.call_analysis || {};
      const custom = analysis.custom_analysis_data || {};

      await supabase
        .from("calls")
        .update({
          status: "analyzed",
          qualified: custom.qualified || null,
          sell_timeline: custom.sell_timeline || null,
          motivation: custom.motivation || null,
          objections: custom.objections || null,
          follow_up_required: custom.follow_up_required ?? null,
          call_sentiment: custom.call_sentiment || analysis.user_sentiment || null,
          call_summary: analysis.call_summary || null,
          agent_sentiment: analysis.agent_sentiment || null,
          analyzed_at: new Date().toISOString(),
        })
        .eq("call_id", call.call_id);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

module.exports = router;