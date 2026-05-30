const express = require("express");
const axios = require("axios");
const supabase = require("../lib/supabase");

const router = express.Router();

router.post("/outbound", async (req, res) => {
  const { owner_name, property_address, lead_source, to_number } = req.body;

  if (!owner_name || !property_address || !to_number) {
    return res.status(400).json({
      error: "owner_name, property_address, and to_number are required",
    });
  }

  const agent_name = process.env.AGENT_NAME || "Alex";

  try {
    const retellResponse = await axios.post(
      "https://api.retellai.com/v2/create-phone-call",
      {
        from_number: process.env.TWILIO_PHONE_NUMBER,
        to_number: to_number,
        agent_id: process.env.RETELL_AGENT_ID,
        retell_llm_dynamic_variables: {
          owner_name,
          property_address,
          lead_source: lead_source || "our website enquiry form",
          agent_name,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const callData = retellResponse.data;

    const { error } = await supabase
      .from("calls")
      .insert({
        call_id: callData.call_id,
        owner_name,
        property_address,
        lead_source: lead_source || "our website enquiry form",
        agent_name,
        to_number,
        status: "initiated",
        created_at: new Date().toISOString(),
      });

    if (error) console.error("Supabase insert error:", error);

    return res.status(201).json({
      success: true,
      call_id: callData.call_id,
      status: callData.status,
      message: `Outbound call initiated to ${owner_name}`,
    });
  } catch (err) {
    console.error("Retell API error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Failed to initiate call",
      details: err.response?.data || err.message,
    });
  }
});

router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const { data, error, count } = await supabase
    .from("calls")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ calls: data, total: count, limit, offset });
});

router.get("/:call_id", async (req, res) => {
  const { call_id } = req.params;

  const { data: call, error: callError } = await supabase
    .from("calls")
    .select("*")
    .eq("call_id", call_id)
    .single();

  if (callError || !call)
    return res.status(404).json({ error: "Call not found" });

  const { data: transcript } = await supabase
    .from("transcripts")
    .select("*")
    .eq("call_id", call_id)
    .order("sequence", { ascending: true });

  return res.json({ call, transcript: transcript || [] });
});

module.exports = router;