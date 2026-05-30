const express = require("express");
const supabase = require("../lib/supabase");

const router = express.Router();

router.post("/get_property_estimate", async (req, res) => {
  const { call_id, args } = req.body;
  const property_address = args?.property_address || req.body.property_address;

  console.log(`🏠 Property estimate | call_id: ${call_id} | address: ${property_address}`);

  if (!property_address) {
    return res.status(400).json({ error: "property_address is required" });
  }

  const estimate = generateMockEstimate(property_address);

  await supabase.from("tool_calls").insert({
    call_id: call_id || null,
    tool_name: "get_property_estimate",
    property_address,
    response: estimate,
    called_at: new Date().toISOString(),
  });

  return res.json(estimate);
});

function generateMockEstimate(address) {
  const hash = [...address].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seed = hash % 100;

  const baseValue = 380000 + seed * 2800;
  const low = Math.round(baseValue / 1000) * 1000;
  const high = low + 40000 + seed * 200;

  return {
    estimated_value_low: low,
    estimated_value_high: high,
    estimated_value_display: `$${(low / 1000).toFixed(0)}k–$${(high / 1000).toFixed(0)}k`,
    comparable_sales_count: 4 + (seed % 7),
    avg_days_on_market: 18 + (seed % 25),
    price_per_sqft: 195 + seed * 2,
    market_trend: seed > 50 ? "rising" : "stable",
    last_updated: new Date().toISOString().split("T")[0],
    data_source: "Local MLS — last 90 days",
  };
}

module.exports = router;