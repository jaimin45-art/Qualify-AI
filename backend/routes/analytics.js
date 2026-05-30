const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const { data: calls, error } = await supabase
      .from("calls")
      .select("qualified, call_sentiment, sell_timeline, follow_up_required, status, duration_seconds");

    if (error) return res.status(500).json({ error: error.message });

    const total = calls.length;
    const analyzed = calls.filter((c) => c.qualified !== null);

    const qualifiedCount = analyzed.filter((c) => c.qualified === "yes").length;
    const maybeCount = analyzed.filter((c) => c.qualified === "maybe").length;
    const notQualifiedCount = analyzed.filter((c) => c.qualified === "no").length;

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    const timelineCounts = { asap: 0, "3_to_6_months": 0, "6_to_12_months": 0, just_exploring: 0 };

    for (const c of analyzed) {
      if (c.call_sentiment && sentimentCounts[c.call_sentiment] !== undefined)
        sentimentCounts[c.call_sentiment]++;
      if (c.sell_timeline && timelineCounts[c.sell_timeline] !== undefined)
        timelineCounts[c.sell_timeline]++;
    }

    const followUpRequired = calls.filter((c) => c.follow_up_required === true).length;
    const avgDuration =
      calls.filter((c) => c.duration_seconds).reduce((a, c) => a + c.duration_seconds, 0) /
      (calls.filter((c) => c.duration_seconds).length || 1);

    return res.json({
      total_calls: total,
      analyzed_calls: analyzed.length,
      qualified_rate: analyzed.length > 0 ? ((qualifiedCount / analyzed.length) * 100).toFixed(1) : 0,
      qualified: qualifiedCount,
      maybe: maybeCount,
      not_qualified: notQualifiedCount,
      sentiment: sentimentCounts,
      timeline: timelineCounts,
      follow_up_required: followUpRequired,
      avg_duration_seconds: Math.round(avgDuration),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;