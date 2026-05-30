import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CallsList from "./pages/CallsList";
import CallDetail from "./pages/CallDetail";
import NewCall from "./pages/NewCall";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calls" element={<CallsList />} />
        <Route path="/calls/:callId" element={<CallDetail />} />
        <Route path="/new-call" element={<NewCall />} />
      </Routes>
    </Layout>
  );
}