import { useState } from "react";
import { useAuth, DEMO_USERS } from "../auth/authcontext";

// ─── Quick-fill helper shown during hackathon demo ────────────────────────
const QUICK_LOGINS = [
  { label: "ASHA Worker",  username: "asha_priya",       password: "asha123",   color: "#e8732a", icon: "🏃‍♀️" },
  { label: "Supervisor",   username: "supervisor_ratan",  password: "super123",  color: "#2d7a6e", icon: "👨‍⚕️" },
];

export default function LoginPage() {
  const { login, loginError, setLoginError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [shake,    setShake]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // Simulate a brief network call for realism
    await new Promise((r) => setTimeout(r, 600));
    const ok = login(username, password);
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  }

  function quickFill(u, p) {
    setUsername(u);
    setPassword(p);
    setLoginError("");
  }

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── Left brand panel ── */}
      <div style={S.brand}>
        <div style={S.brandInner}>
          <div style={S.logo}>
            <span style={S.logoText}>HS</span>
          </div>
          <h1 style={S.brandTitle}>HealthSetu<br />NER</h1>
          <p style={S.brandSub}>
            Digital Health Card System for<br />
            Rural Communities of Northeast India
          </p>

          <div style={S.featureList}>
            {[
              ["📴", "Offline-first — works without internet"],
              ["🔄", "Auto-syncs when connectivity returns"],
              ["🤱", "Pregnancy & chronic illness tracking"],
              ["💉", "Full vaccination history per patient"],
            ].map(([icon, text]) => (
              <div key={text} style={S.feature}>
                <span style={S.featureIcon}>{icon}</span>
                <span style={S.featureText}>{text}</span>
              </div>
            ))}
          </div>

          <div style={S.districtBadge}>📍 Dima Hasao District · Assam</div>
        </div>

        {/* decorative circles */}
        <div style={{ ...S.circle, width:320, height:320, top:-80, right:-80, opacity:0.06 }} />
        <div style={{ ...S.circle, width:180, height:180, bottom:60, left:-40, opacity:0.08 }} />
      </div>

      {/* ── Right form panel ── */}
      <div style={S.formPanel}>
        <div style={{ ...S.formCard, ...(shake ? { animation:"shake 0.4s ease" } : {}) }}>
          <h2 style={S.formTitle}>Welcome back</h2>
          <p style={S.formSub}>Sign in to your HealthSetu account</p>

          {/* Quick-login buttons */}
          <div style={S.quickRow}>
            <span style={S.quickLabel}>Quick demo login →</span>
            {QUICK_LOGINS.map((q) => (
              <button
                key={q.username}
                type="button"
                style={{ ...S.quickBtn, borderColor: q.color, color: q.color }}
                onClick={() => quickFill(q.username, q.password)}
              >
                {q.icon} {q.label}
              </button>
            ))}
          </div>

          <div style={S.divider}><span style={S.dividerText}>or enter credentials</span></div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Username</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>👤</span>
                <input
                  style={S.input}
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setLoginError(""); }}
                  placeholder="e.g. asha_priya"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Password</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>🔒</span>
                <input
                  style={S.input}
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  style={S.eyeBtn}
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {loginError && (
              <div style={S.errorBanner}>
                ⚠️ {loginError}
              </div>
            )}

            {/* Submit */}
            <button type="submit" style={S.submitBtn} disabled={loading}>
              {loading
                ? <span style={S.spinner} />
                : "Sign In →"}
            </button>
          </form>

          {/* Credentials hint */}
          <div style={S.hint}>
            <strong>Demo accounts</strong><br />
            ASHA: <code>asha_priya</code> / <code>asha123</code><br />
            Supervisor: <code>supervisor_ratan</code> / <code>super123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@400;500;600&display=swap');

  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%    {transform:translateX(-8px)}
    40%    {transform:translateX(8px)}
    60%    {transform:translateX(-5px)}
    80%    {transform:translateX(5px)}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(16px)}
    to  {opacity:1;transform:translateY(0)}
  }
  @keyframes spin { to{transform:rotate(360deg)} }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; }
`;

const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Nunito', sans-serif",
    background: "#f4efe6",
  },

  // ── Left panel ──
  brand: {
    flex: "0 0 42%",
    background: "linear-gradient(155deg, #162d20 0%, #1e4a30 60%, #2a5240 100%)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
  },
  brandInner: {
    position: "relative",
    zIndex: 1,
    animation: "fadeUp 0.6s ease both",
  },
  logo: {
    width: 56, height: 56,
    background: "#e8732a",
    borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0 8px 24px rgba(232,115,42,0.4)",
  },
  logoText: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 800, fontSize: 22, color: "white",
  },
  brandTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 42, fontWeight: 800,
    color: "white", lineHeight: 1.1,
    marginBottom: 16,
    letterSpacing: "-1px",
  },
  brandSub: {
    fontSize: 15, color: "rgba(255,255,255,0.65)",
    lineHeight: 1.6, marginBottom: 36,
    maxWidth: 280,
  },
  featureList: { marginBottom: 40 },
  feature: {
    display: "flex", alignItems: "flex-start", gap: 12,
    marginBottom: 14,
  },
  featureIcon: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  featureText: { fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 },
  districtBadge: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 16px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)",
    fontSize: 13, color: "rgba(255,255,255,0.7)",
    fontWeight: 600,
  },
  circle: {
    position: "absolute",
    borderRadius: "50%",
    background: "white",
  },

  // ── Right form ──
  formPanel: {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px",
  },
  formCard: {
    width: "100%", maxWidth: 420,
    animation: "fadeUp 0.5s ease 0.1s both",
  },
  formTitle: {
    fontFamily: "'Sora', sans-serif",
    fontSize: 28, fontWeight: 800,
    color: "#1a2b22", marginBottom: 6,
  },
  formSub: { fontSize: 14, color: "#7a9186", marginBottom: 28 },

  // quick buttons
  quickRow: {
    display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
    marginBottom: 20,
  },
  quickLabel: { fontSize: 12, color: "#7a9186", fontWeight: 600, width: "100%" },
  quickBtn: {
    padding: "7px 14px", borderRadius: 8,
    background: "white", border: "1.5px solid",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: "'Sora', sans-serif",
    transition: "all 0.15s",
  },

  divider: {
    display: "flex", alignItems: "center",
    marginBottom: 24,
  },
  dividerText: {
    fontSize: 12, color: "#adb9b4", fontWeight: 600,
    padding: "0 12px",
    background: "#f4efe6",
    position: "relative",
    "&::before": { content: '""', flex: 1, height: 1, background: "#ddd5c8" },
  },

  fieldGroup: { marginBottom: 16 },
  label: {
    display: "block", fontSize: 12, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.7px",
    color: "#7a9186", marginBottom: 6,
  },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
    fontSize: 16, pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 40px 12px 40px",
    borderRadius: 10, border: "1.5px solid #ddd5c8",
    background: "white", fontFamily: "'Nunito', sans-serif",
    fontSize: 15, color: "#1a2b22", outline: "none",
    transition: "border-color 0.15s",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", fontSize: 16,
  },

  errorBanner: {
    background: "#ffebee", border: "1.5px solid #ffcdd2",
    borderRadius: 10, padding: "10px 14px",
    fontSize: 13, color: "#c62828", marginBottom: 16,
    fontWeight: 600,
  },

  submitBtn: {
    width: "100%", padding: "14px",
    background: "#e8732a", color: "white",
    border: "none", borderRadius: 12,
    fontFamily: "'Sora', sans-serif",
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    transition: "all 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginTop: 8,
    boxShadow: "0 4px 16px rgba(232,115,42,0.35)",
  },
  spinner: {
    width: 20, height: 20,
    border: "3px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },

  hint: {
    marginTop: 28, padding: "14px 16px",
    background: "#f0ece6", borderRadius: 10,
    fontSize: 12, color: "#7a9186", lineHeight: 1.8,
  },
};