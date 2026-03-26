import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { sessionApi } from "../api/endpoints";
import {
  Shield, AlertTriangle, CheckCircle, XCircle,
  TrendingUp, TrendingDown, Minus, Download, RotateCcw,
  Activity, MessageSquare, ChevronRight
} from "lucide-react";

const RISK_CONFIG = {
  low:      { color: "var(--risk-low)",      bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)",  icon: CheckCircle,   label: "LOW RISK" },
  medium:   { color: "var(--risk-medium)",   bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.25)",   icon: AlertTriangle, label: "MEDIUM RISK" },
  high:     { color: "var(--risk-high)",     bg: "rgba(249,115,22,0.08)",   border: "rgba(249,115,22,0.25)",   icon: AlertTriangle, label: "HIGH RISK" },
  critical: { color: "var(--risk-critical)", bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.25)",    icon: XCircle,       label: "CRITICAL" },
};

const TRAJECTORY_CONFIG = {
  stable:    { icon: Minus,         color: "var(--risk-low)",    cls: "badge-stable",    label: "STABLE" },
  worsening: { icon: TrendingDown,  color: "var(--risk-critical)",cls: "badge-worsening", label: "WORSENING" },
  improving: { icon: TrendingUp,    color: "var(--accent-blue)", cls: "badge-improving", label: "IMPROVING" },
  new_onset: { icon: Activity,      color: "var(--risk-medium)", cls: "badge-medium",    label: "NEW ONSET" },
};

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["result", sessionId],
    queryFn: () => sessionApi.getResult(sessionId).then((r) => r.data),
  });

  if (isLoading) return (
    <div className="page-center" style={{ flexDirection: "column", gap: 16 }}>
      <div className="spinner spinner-lg" />
      <p style={{ color: "var(--text-secondary)" }}>Running clinical inference…</p>
    </div>
  );

  if (error) return (
    <div className="page-center">
      <div style={{ textAlign: "center", color: "#f87171" }}>Failed to load results. <button className="btn btn-secondary btn-sm" onClick={() => navigate("/dashboard")}>Go Home</button></div>
    </div>
  );

  const risk = RISK_CONFIG[data?.risk_tier] || RISK_CONFIG.medium;
  const RiskIcon = risk.icon;
  const traj = data?.trajectory_label ? TRAJECTORY_CONFIG[data.trajectory_label] : null;
  const TrajIcon = traj?.icon;

  return (
    <div className="page-container" style={{ maxWidth: 780 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Risk tier hero */}
        <motion.div className="card" initial={{ scale: 0.97 }} animate={{ scale: 1 }}
          style={{ padding: "2rem", marginBottom: "1.5rem", textAlign: "center",
            background: risk.bg, borderColor: risk.border }}>
          <RiskIcon size={48} color={risk.color} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.15em", fontWeight: 700, color: risk.color, marginBottom: 8 }}>
            RISK ASSESSMENT
          </div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "2.5rem", fontWeight: 900, color: risk.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {risk.label}
          </div>
          <div style={{ marginTop: 12, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Confidence: <strong style={{ color: "var(--text-primary)" }}>{((data?.risk_score || 0.5) * 100).toFixed(0)}%</strong>
          </div>

          {traj && (
            <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className={`badge ${traj.cls}`}>
                <TrajIcon size={11} /> {traj.label}
              </span>
              {data.trajectory_score != null && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  escalation score: {(data.trajectory_score * 100).toFixed(0)}%
                </span>
              )}
            </div>
          )}
        </motion.div>

        <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
          {/* Top conditions */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
              <Activity size={13} /> Differential Diagnosis
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(data?.top_conditions || []).map((cond, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{cond.name}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--accent-blue-light)" }}>
                      {((cond.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <motion.div className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(cond.confidence || 0) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.15 }}
                      style={{ background: i === 0 ? "linear-gradient(90deg, var(--accent-blue), var(--accent-cyan))" : "rgba(255,255,255,0.2)" }}
                    />
                  </div>
                  {cond.icd10 && (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>ICD-10: {cond.icd10}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning & action */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ padding: "1.5rem", flex: 1 }}>
              <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
                <Shield size={13} /> Recommended Action
              </h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "var(--text-primary)", fontWeight: 500 }}>
                {data?.recommended_action}
              </p>
            </div>

            {(data?.behavioral_flags || []).length > 0 && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <MessageSquare size={13} /> Behavioral Signals
                </h3>
                <ul style={{ display: "flex", flexDirection: "column", gap: 6, listStyle: "none" }}>
                  {data.behavioral_flags.map((flag, i) => (
                    <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-secondary)", paddingLeft: 14, position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 5, height: 5, borderRadius: "50%", background: "var(--accent-cyan)", display: "block" }} />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Reasoning chain */}
        {(data?.reasoning_chain || []).length > 0 && (
          <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "1rem" }}>
              Clinical Reasoning
            </h3>
            <ol style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 20 }}>
              {data.reasoning_chain.map((step, i) => (
                <li key={i} style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate("/interview")} style={{ gap: 8 }}>
            <RotateCcw size={16} /> New Assessment
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/history")} style={{ gap: 8 }}>
            <Activity size={16} /> View History
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", borderRadius: "var(--radius-md)", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          ⚕️ This output is informational only, based on probabilistic inference from symptom datasets. It does not constitute medical advice. Always consult a qualified healthcare provider for medical decisions.
        </div>
      </motion.div>
    </div>
  );
}
