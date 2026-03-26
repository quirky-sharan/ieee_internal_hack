import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useQuery } from "@tanstack/react-query";
import { sessionApi } from "../api/endpoints";
import { Brain, Activity, Clock, TrendingUp, ChevronRight, Shield, Zap, Eye } from "lucide-react";
import { format } from "date-fns";

const RISK_COLORS = { low: "var(--risk-low)", medium: "var(--risk-medium)", high: "var(--risk-high)", critical: "var(--risk-critical)" };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: historyData } = useQuery({ queryKey: ["history"], queryFn: () => sessionApi.getHistory().then(r => r.data) });

  const history = historyData || [];
  const lastSession = history[0];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const features = [
    { icon: Brain, title: "Adaptive Interview", desc: "Dynamic clinical questions, not a static form" },
    { icon: Activity, title: "Intensity Detection", desc: "Captures how you write, not just what you write" },
    { icon: Shield, title: "Bayesian Inference", desc: "Calibrated probabilistic risk assessment" },
    { icon: Zap, title: "Speech Input", desc: "Speak your answers naturally via microphone" },
    { icon: Eye, title: "Behavioral Analysis", desc: "Detects hesitation and clinical emphasis passively" },
    { icon: TrendingUp, title: "Temporal Tracking", desc: "Compares visits to detect escalating patterns" },
  ];

  return (
    <div className="page-container">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ marginBottom: "3rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 8 }}>
            {greeting()}, <span style={{ color: "var(--accent-blue-light)", fontWeight: 600 }}>{user?.full_name?.split(" ")[0] || "there"}</span>
          </p>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "1rem" }}>
            Your Health,<br />
            <span style={{ background: "linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Intelligently Assessed
            </span>
          </h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: 500, fontSize: "1.05rem", marginBottom: "2rem", lineHeight: 1.7 }}>
            ClinicalMind interviews you the way a clinician would — conversationally — and extracts clinical signals you didn't know you had.
          </p>
          <motion.button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/interview")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ gap: 10, fontSize: "1rem" }}
          >
            <Brain size={20} /> Start New Assessment
            <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* Stats row */}
        {history.length > 0 && (
          <div className="grid-3" style={{ marginBottom: "2.5rem" }}>
            {[
              { label: "Total Assessments", value: history.length, icon: Activity },
              { label: "Last Risk Tier", value: lastSession?.risk_tier?.toUpperCase() || "—", icon: Shield,
                color: RISK_COLORS[lastSession?.risk_tier] },
              { label: "Last Visit", value: lastSession?.created_at ? format(new Date(lastSession.created_at), "MMM d, yyyy") : "—", icon: Clock },
            ].map((stat, i) => (
              <motion.div key={i} className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <stat.icon size={14} /> {stat.label}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color || "var(--text-primary)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Last session CTA */}
        {lastSession && (
          <motion.div className="card card-glow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ padding: "1.5rem", marginBottom: "2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Last Assessment</div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{lastSession.top_condition || "Assessment completed"}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 2 }}>
                {lastSession.created_at ? format(new Date(lastSession.created_at), "PPP") : ""}
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate(`/result/${lastSession.session_id}`)}>
              View Results <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* Features grid */}
        <div style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-secondary)" }}>
            Platform Capabilities
          </h2>
          <div className="grid-3">
            {features.map((f, i) => (
              <motion.div key={i} className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                style={{ padding: "1.25rem" }}
                whileHover={{ borderColor: "rgba(59,130,246,0.3)", transform: "translateY(-2px)" }}>
                <div style={{ display: "inline-flex", padding: 10, borderRadius: 10, background: "rgba(59,130,246,0.1)", marginBottom: 10 }}>
                  <f.icon size={18} color="var(--accent-blue)" />
                </div>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: "0.95rem" }}>{f.title}</div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: "2.5rem", padding: "1rem 1.25rem", borderRadius: "var(--radius-md)", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          ⚕️ <strong style={{ color: "var(--text-secondary)" }}>Medical Disclaimer:</strong> ClinicalMind is not a medical diagnostic tool and does not replace professional medical advice. All outputs are informational only and based on probabilistic inference. Always consult a qualified healthcare provider.
        </div>
      </motion.div>
    </div>
  );
}
