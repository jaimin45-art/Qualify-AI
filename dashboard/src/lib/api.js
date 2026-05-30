import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const fetchCalls = (limit = 50, offset = 0) =>
  api.get(`/calls?limit=${limit}&offset=${offset}`).then((r) => r.data);

export const fetchCall = (callId) =>
  api.get(`/calls/${callId}`).then((r) => r.data);

export const triggerOutboundCall = (data) =>
  api.post("/calls/outbound", data).then((r) => r.data);

export const fetchAnalytics = () =>
  api.get("/analytics/summary").then((r) => r.data);

export default api;