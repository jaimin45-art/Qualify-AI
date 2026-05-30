require("dotenv").config();
const express = require("express");
const cors = require("cors");

const callRoutes = require("./routes/calls");
const webhookRoutes = require("./routes/webhooks");
const toolRoutes = require("./routes/tools");
const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  "/webhooks",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

app.use(cors({ origin: process.env.DASHBOARD_URL || "http://localhost:3000" }));
app.use(express.json());

app.use("/calls", callRoutes);
app.use("/tools", toolRoutes);
app.use("/analytics", analyticsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Dialoft AI backend running on port ${PORT}`);
});